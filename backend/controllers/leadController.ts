import type { Request, Response } from "express";
import mongoose from "mongoose";
import Lead from "../models/Lead";
import { escapeRegex } from "../middleware/sanitizeMiddleware";
import {
  ALLOWED_LEAD_STATUSES,
  ALLOWED_SORT_FIELDS,
  type ApiResponse,
  type LeadQuery,
  type LeadResponse,
  type LeadStatus,
  type LeadWithId,
  type LeadStatsResponse,
} from "../types";

const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s().-]{7,25}$/;

/**
 * GET /api/leads
 * Get leads with pagination, search, status filter, and safe sorting.
 */
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as LeadQuery;

    // Numerical pagination boundaries
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const pageNum = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limitNum = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 10;
    const skip = (pageNum - 1) * limitNum;

    // Build MongoDB query
    const query: Record<string, any> = {};

    // Search query with ReDoS sanitization (SEC-003 fix)
    if (typeof search === "string" && search.trim().length > 0) {
      const sanitizedSearch = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: "i" } },
        { email: { $regex: sanitizedSearch, $options: "i" } },
        { company: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    // Status filtering
    if (typeof status === "string" && status !== "all" && status.trim().length > 0) {
      const trimmedStatus = status.trim() as LeadStatus;
      if (ALLOWED_LEAD_STATUSES.includes(trimmedStatus)) {
        query.status = trimmedStatus;
      } else {
        res.status(400).json({
          success: false,
          error: `Invalid status filter. Allowed values: ${ALLOWED_LEAD_STATUSES.join(", ")} or 'all'`,
        });
        return;
      }
    }

    // Safe Sort Configuration - whitelist check (SEC-004 fix)
    const sortField = typeof sortBy === "string" && ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortConfig: Record<string, 1 | -1> = { [sortField]: sortDirection };

    // Execute queries in parallel
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sortConfig).skip(skip).limit(limitNum).lean(),
      Lead.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    // Transform leads ensuring both id and _id are available
    const transformedLeads: LeadWithId[] = leads.map((lead: any) => ({
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

    const response: ApiResponse<LeadResponse> = {
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
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching leads",
    });
  }
};

/**
 * POST /api/leads
 * Create a new lead with comprehensive validation.
 */
export const createLead = async (req: Request, res: Response): Promise<void> => {
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

    const leadStatus: LeadStatus =
      status && ALLOWED_LEAD_STATUSES.includes(status) ? status : "New";

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingLead = await Lead.findOne({ email: normalizedEmail });
    if (existingLead) {
      res.status(400).json({
        success: false,
        error: "A lead with this email address already exists",
      });
      return;
    }

    // Safely format notes avoiding null/undefined trim error
    const formattedNotes = typeof notes === "string" ? notes.trim() : "";

    const lead = new Lead({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      company: company.trim(),
      status: leadStatus,
      notes: formattedNotes,
    });

    const savedLead = await lead.save();
    const leadJson = savedLead.toJSON() as Record<string, any>;

    const response: ApiResponse<LeadWithId> = {
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
  } catch (error: any) {
    console.error("Error creating lead:", error);

    if (error.name === "ValidationError" && error.errors) {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
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

/**
 * GET /api/leads/:id
 * Retrieve a single lead by its unique identifier.
 */
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid lead ID format",
      });
      return;
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      res.status(404).json({
        success: false,
        error: "Lead not found",
      });
      return;
    }

    const leadJson = lead.toJSON() as Record<string, any>;

    const response: ApiResponse<LeadWithId> = {
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
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching lead",
    });
  }
};

/**
 * PUT /api/leads/:id
 * Update an existing lead.
 */
export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status, notes } = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid lead ID format",
      });
      return;
    }

    const existingLead = await Lead.findById(id);
    if (!existingLead) {
      res.status(404).json({
        success: false,
        error: "Lead not found",
      });
      return;
    }

    const updateFields: Record<string, any> = {};

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
        const duplicateLead = await Lead.findOne({
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
      if (!ALLOWED_LEAD_STATUSES.includes(status)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Allowed values: ${ALLOWED_LEAD_STATUSES.join(", ")}`,
        });
        return;
      }
      updateFields.status = status;
    }

    // Safely handle notes to prevent TypeError on null/number (BUG FIX)
    if (notes !== undefined) {
      updateFields.notes = typeof notes === "string" ? notes.trim() : "";
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updateFields, {
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

    const leadJson = updatedLead.toJSON() as Record<string, any>;

    const response: ApiResponse<LeadWithId> = {
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
  } catch (error: any) {
    console.error("Error updating lead:", error);

    if (error.name === "ValidationError" && error.errors) {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
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

/**
 * DELETE /api/leads/:id
 * Delete a lead by its unique identifier.
 */
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid lead ID format",
      });
      return;
    }

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      res.status(404).json({
        success: false,
        error: "Lead not found",
      });
      return;
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "Lead deleted successfully",
      data: null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while deleting lead",
    });
  }
};

/**
 * GET /api/leads/stats
 * Get lead counts and analytics across statuses.
 */
export const getLeadStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Run aggregation and count concurrently for optimal performance
    const [stats, total] = await Promise.all([
      Lead.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Lead.countDocuments(),
    ]);

    const statusCounts: Record<LeadStatus, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Converted: 0,
      Lost: 0,
    };

    stats.forEach((stat: { _id: string; count: number }) => {
      if (stat._id in statusCounts) {
        statusCounts[stat._id as LeadStatus] = stat.count;
      }
    });

    const conversionRate = total > 0 ? Math.round((statusCounts.Converted / total) * 100) : 0;

    const response: ApiResponse<LeadStatsResponse> = {
      success: true,
      data: {
        total,
        statusCounts,
        conversionRate,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching lead statistics:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching lead statistics",
    });
  }
};
