"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Stricter rate limiter for authentication routes to mitigate brute-force attempts
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many authentication attempts. Please try again after 15 minutes.",
    },
});
// POST /api/auth/register - Register new user account
router.post("/register", authLimiter, authController_1.registerUser);
// POST /api/auth/login - Authenticate existing user and obtain JWT
router.post("/login", authLimiter, authController_1.loginUser);
// GET /api/auth/me - Retrieve current authenticated user profile
router.get("/me", authMiddleware_1.authenticateUser, authController_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map