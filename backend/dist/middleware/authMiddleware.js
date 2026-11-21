"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.optionalAuthenticateUser = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const getJwtSecret = () => {
    return process.env.JWT_SECRET || "leadcrm_production_secret_key_change_in_env_2026";
};
/**
 * Strict authentication middleware.
 * Verifies JWT Bearer token and attaches active user to request.
 */
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Authentication required. Please provide a valid Bearer token.",
            });
            return;
        }
        const token = authHeader.split(" ")[1]?.trim();
        if (!token) {
            res.status(401).json({
                success: false,
                error: "Malformed authorization token.",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (!decoded || !decoded.userId) {
            res.status(401).json({
                success: false,
                error: "Invalid or malformed token payload.",
            });
            return;
        }
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                error: "User associated with this token no longer exists.",
            });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                error: "Account has been deactivated. Please contact an administrator.",
            });
            return;
        }
        req.user = {
            id: user._id.toString(),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                success: false,
                error: "Token has expired. Please log in again.",
            });
            return;
        }
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({
                success: false,
                error: "Invalid token signature or token corrupted.",
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Authentication error occurred.",
        });
    }
};
exports.authenticateUser = authenticateUser;
/**
 * Optional authentication middleware.
 * If Bearer token is provided, validates and attaches user; otherwise allows request to proceed.
 */
const optionalAuthenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }
    return (0, exports.authenticateUser)(req, res, next);
};
exports.optionalAuthenticateUser = optionalAuthenticateUser;
/**
 * Role-based authorization middleware factory.
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Authentication required before role verification.",
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(", ")}]`,
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=authMiddleware.js.map