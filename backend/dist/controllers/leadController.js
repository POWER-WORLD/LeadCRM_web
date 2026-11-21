"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeadStats = exports.deleteLead = exports.updateLead = exports.getLeadById = exports.createLead = exports.getLeads = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Lead_1 = __importDefault(require("../models/Lead"));
const sanitizeMiddleware_1 = require("../middleware/sanitizeMiddleware");
const types_1 = require("../types");
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s().-]{7,25}$/;
/**
 * GET /api/leads
 * Get leads with pagination, search, status filter, and safe sorting.
 */
const getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", status = "all", sortBy = "createdAt", sortOrder = "desc", } = req.query;
        // Numerical pagination boundaries
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const pageNum = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const limitNum = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 10;
        const skip = (pageNum - 1) * limitNum;
        // Build MongoDB query
        const query = {};
        // Search query with ReDoS sanitization (SEC-003 fix)
        if (typeof search === "string" && search.trim().length > 0) {
            const sanitizedSearch = (0, sanitizeMiddleware_1.escapeRegex)(search.trim());
            query.$or = [
                { name: { $regex: sanitizedSearch, $options: "i" } },
                { email: { $regex: sanitizedSearch, $options: "i" } },
                { company: { $regex: sanitizedSearch, $options: "i" } },
            ];
        }
        // Status filtering
        if (typeof status === "string" && status !== "all" && status.trim().length > 0) {
            const trimmedStatus = status.trim();
            if (types_1.ALLOWED_LEAD_STATUSES.includes(trimmedStatus)) {
                query.status = trimmedStatus;
            }
            else {
                res.status(400).json({
                    success: false,
                    error: `Invalid status filter. Allowed values: ${types_1.ALLOWED_LEAD_STATUSES.join(", ")} or 'all'`,
                });
                return;
            }
        }
        // Safe Sort Configuration - whitelist check (SEC-004 fix)
        const sortField = typeof sortBy === "string" && types_1.ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
        const sortDirection = sortOrder === "asc" ? 1 : -1;
        const sortConfig = { [sortField]: sortDirection };
        // Execute queries in parallel
        const [leads, total] = await Promise.all([
            Lead_1.default.find(query).sort(sortConfig).skip(skip).limit(limitNum).lean(),
            Lead_1.default.countDocuments(query),
        ]);
        const totalPages = Math.ceil(total / limitNum) || 1;
        // Transform leads ensuring both id and _id are available
        const transformedLeads = leads.map((lead) => ({
            id: lead._id.toString(),
            _id: lead._id.toString(),
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: lead.status,
            notes: lead.notes || "",
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
        }));
        const response = {
            success: true,
            data: {
                leads: transformedLeads,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error while fetching leads",
        });
    }
};
exports.getLeads = getLeads;
/**
 * POST /api/leads
 * Create a new lead with comprehensive validation.
 */
const createLead = async (req, res) => {
    try {
        const { name, email, phone, company, status, notes } = req.body;
        // Validation checks
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            res.status(400).json({
                success: false,
                error: "Name is required and must be at least 2 characters long",
            });
            return;
        }
        if (!email || typeof email !== "string" || !RFC_EMAIL_REGEX.test(email.trim())) {
            res.status(400).json({
                success: false,
                error: "Please enter a valid email address",
            });
            return;
        }
        if (!phone || typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
            res.status(400).json({
                success: false,
                error: "Please enter a valid phone number (7-25 digits, optional '+' and formatting)",
            });
            return;
        }
        if (!company || typeof company !== "string" || company.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: "Company name is required",
            });
            return;
        }
        const leadStatus = status && types_1.ALLOWED_LEAD_STATUSES.includes(status) ? status : "New";
        const normalizedEmail = email.toLowerCase().trim();
        // Check duplicate email
        const existingLead = await Lead_1.default.findOne({ email: normalizedEmail });
        if (existingLead) {
            res.status(400).json({
                success: false,
                error: "A lead with this email address already exists",
            });
            return;
        }
        // Safely format notes avoiding null/undefined trim error
        const formattedNotes = typeof notes === "string" ? notes.trim() : "";
        const lead = new Lead_1.default({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            company: company.trim(),
            status: leadStatus,
            notes: formattedNotes,
        });
        const savedLead = await lead.save();
        const leadJson = savedLead.toJSON();
        const response = {
            success: true,
            message: "Lead created successfully",
            data: {
                id: leadJson.id,
                _id: leadJson._id,
                name: leadJson.name,
                email: leadJson.email,
                phone: leadJson.phone,
                company: leadJson.company,
                status: leadJson.status,
                notes: leadJson.notes,
                createdAt: leadJson.createdAt,
                updatedAt: leadJson.updatedAt,
            },
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Error creating lead:", error);
        if (error.name === "ValidationError" && error.errors) {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                error: validationErrors.join(", "),
            });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: "A lead with this email address already exists",
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Internal server error while creating lead",
        });
    }
};
exports.createLead = createLead;
/**
 * GET /api/leads/:id
 * Retrieve a single lead by its unique identifier.
 */
const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                error: "Invalid lead ID format",
            });
            return;
        }
        const lead = await Lead_1.default.findById(id);
        if (!lead) {
            res.status(404).json({
                success: false,
                error: "Lead not found",
            });
            return;
        }
        const leadJson = lead.toJSON();
        const response = {
            success: true,
            data: {
                id: leadJson.id,
                _id: leadJson._id,
                name: leadJson.name,
                email: leadJson.email,
                phone: leadJson.phone,
                company: leadJson.company,
                status: leadJson.status,
                notes: leadJson.notes,
                createdAt: leadJson.createdAt,
                updatedAt: leadJson.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error fetching lead by ID:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error while fetching lead",
        });
    }
};
exports.getLeadById = getLeadById;
/**
 * PUT /api/leads/:id
 * Update an existing lead.
 */
const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, company, status, notes } = req.body;
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                error: "Invalid lead ID format",
            });
            return;
        }
        const existingLead = await Lead_1.default.findById(id);
        if (!existingLead) {
            res.status(404).json({
                success: false,
                error: "Lead not found",
            });
            return;
        }
        const updateFields = {};
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 2) {
                res.status(400).json({
                    success: false,
                    error: "Name must be at least 2 characters long",
                });
                return;
            }
            updateFields.name = name.trim();
        }
        if (email !== undefined) {
            const normalizedEmail = String(email).toLowerCase().trim();
            if (!RFC_EMAIL_REGEX.test(normalizedEmail)) {
                res.status(400).json({
                    success: false,
                    error: "Please enter a valid email address",
                });
                return;
            }
            // Check duplicate email against other records
            if (normalizedEmail !== existingLead.email) {
                const duplicateLead = await Lead_1.default.findOne({
                    email: normalizedEmail,
                    _id: { $ne: id },
                });
                if (duplicateLead) {
                    res.status(400).json({
                        success: false,
                        error: "A lead with this email address already exists",
                    });
                    return;
                }
            }
            updateFields.email = normalizedEmail;
        }
        if (phone !== undefined) {
            const trimmedPhone = String(phone).trim();
            if (!PHONE_REGEX.test(trimmedPhone)) {
                res.status(400).json({
                    success: false,
                    error: "Please enter a valid phone number (7-25 digits)",
                });
                return;
            }
            updateFields.phone = trimmedPhone;
        }
        if (company !== undefined) {
            const trimmedCompany = String(company).trim();
            if (trimmedCompany.length === 0) {
                res.status(400).json({
                    success: false,
                    error: "Company name cannot be empty",
                });
                return;
            }
            updateFields.company = trimmedCompany;
        }
        if (status !== undefined) {
            if (!types_1.ALLOWED_LEAD_STATUSES.includes(status)) {
                res.status(400).json({
                    success: false,
                    error: `Invalid status. Allowed values: ${types_1.ALLOWED_LEAD_STATUSES.join(", ")}`,
                });
                return;
            }
            updateFields.status = status;
        }
        // Safely handle notes to prevent TypeError on null/number (BUG FIX)
        if (notes !== undefined) {
            updateFields.notes = typeof notes === "string" ? notes.trim() : "";
        }
        const updatedLead = await Lead_1.default.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true,
        });
        if (!updatedLead) {
            res.status(404).json({
                success: false,
                error: "Lead not found",
            });
            return;
        }
        const leadJson = updatedLead.toJSON();
        const response = {
            success: true,
            message: "Lead updated successfully",
            data: {
                id: leadJson.id,
                _id: leadJson._id,
                name: leadJson.name,
                email: leadJson.email,
                phone: leadJson.phone,
                company: leadJson.company,
                status: leadJson.status,
                notes: leadJson.notes,
                createdAt: leadJson.createdAt,
                updatedAt: leadJson.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error updating lead:", error);
        if (error.name === "ValidationError" && error.errors) {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                error: validationErrors.join(", "),
            });
            return;
        }
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: "A lead with this email address already exists",
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Internal server error while updating lead",
        });
    }
};
exports.updateLead = updateLead;
/**
 * DELETE /api/leads/:id
 * Delete a lead by its unique identifier.
 */
const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                error: "Invalid lead ID format",
            });
            return;
        }
        const lead = await Lead_1.default.findByIdAndDelete(id);
        if (!lead) {
            res.status(404).json({
                success: false,
                error: "Lead not found",
            });
            return;
        }
        const response = {
            success: true,
            message: "Lead deleted successfully",
            data: null,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error deleting lead:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error while deleting lead",
        });
    }
};
exports.deleteLead = deleteLead;
/**
 * GET /api/leads/stats
 * Get lead counts and analytics across statuses.
 */
const getLeadStats = async (_req, res) => {
    try {
        // Run aggregation and count concurrently for optimal performance
        const [stats, total] = await Promise.all([
            Lead_1.default.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Lead_1.default.countDocuments(),
        ]);
        const statusCounts = {
            New: 0,
            Contacted: 0,
            Qualified: 0,
            Converted: 0,
            Lost: 0,
        };
        stats.forEach((stat) => {
            if (stat._id in statusCounts) {
                statusCounts[stat._id] = stat.count;
            }
        });
        const conversionRate = total > 0 ? Math.round((statusCounts.Converted / total) * 100) : 0;
        const response = {
            success: true,
            data: {
                total,
                statusCounts,
                conversionRate,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error fetching lead statistics:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error while fetching lead statistics",
        });
    }
};
exports.getLeadStats = getLeadStats;
//# sourceMappingURL=leadController.js.map