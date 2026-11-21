import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, getCurrentUser } from "../controllers/authController";
import { authenticateUser } from "../middleware/authMiddleware";

const router: Router = Router();

// Stricter rate limiter for authentication routes to mitigate brute-force attempts
const authLimiter = rateLimit({
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
router.post("/register", authLimiter, registerUser);

// POST /api/auth/login - Authenticate existing user and obtain JWT
router.post("/login", authLimiter, loginUser);

// GET /api/auth/me - Retrieve current authenticated user profile
router.get("/me", authenticateUser, getCurrentUser);

export default router;

