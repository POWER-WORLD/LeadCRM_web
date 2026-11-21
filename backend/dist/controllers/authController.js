"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const getJwtSecret = () => {
    return process.env.JWT_SECRET || "leadcrm_production_secret_key_change_in_env_2026";
};
const getJwtExpiresIn = () => {
    return process.env.JWT_EXPIRES_IN || "7d";
};
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * Register a new user
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Field presence validation
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
                error: "Please provide a valid email address",
            });
            return;
        }
        if (!password || typeof password !== "string" || password.length < 8) {
            res.status(400).json({
                success: false,
                error: "Password is required and must be at least 8 characters long",
            });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Check duplicate email
        const existingUser = await User_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: "A user with this email address is already registered",
            });
            return;
        }
        // Role validation
        const validRoles = ["admin", "manager", "agent"];
        const assignedRole = role && validRoles.includes(role) ? role : "agent";
        const user = new User_1.default({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: assignedRole,
            isActive: true,
        });
        const savedUser = await user.save();
        const payload = {
            userId: savedUser._id.toString(),
            email: savedUser.email,
            role: savedUser.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
            expiresIn: getJwtExpiresIn(),
        });
        const userObject = savedUser.toJSON();
        const response = {
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: userObject.id,
                    _id: userObject._id,
                    name: userObject.name,
                    email: userObject.email,
                    role: userObject.role,
                    isActive: userObject.isActive,
                    createdAt: userObject.createdAt,
                    updatedAt: userObject.updatedAt,
                },
                token,
            },
        };
        res.status(201).json(response);
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: "A user with this email address is already registered",
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Internal server error during registration",
        });
    }
};
exports.registerUser = registerUser;
/**
 * Login user with email & password
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: "Please provide both email and password",
            });
            return;
        }
        const normalizedEmail = String(email).toLowerCase().trim();
        // Explicitly select password field as it is select: false
        const user = await User_1.default.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                error: "Invalid email or password",
            });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                error: "Account has been deactivated. Please contact support.",
            });
            return;
        }
        const isMatch = await user.comparePassword(String(password));
        if (!isMatch) {
            res.status(401).json({
                success: false,
                error: "Invalid email or password",
            });
            return;
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
            expiresIn: getJwtExpiresIn(),
        });
        const userObject = user.toJSON();
        const response = {
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: userObject.id,
                    _id: userObject._id,
                    name: userObject.name,
                    email: userObject.email,
                    role: userObject.role,
                    isActive: userObject.isActive,
                    createdAt: userObject.createdAt,
                    updatedAt: userObject.updatedAt,
                },
                token,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error during login",
        });
    }
};
exports.loginUser = loginUser;
/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: "Not authenticated",
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: req.user,
    });
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=authController.js.map