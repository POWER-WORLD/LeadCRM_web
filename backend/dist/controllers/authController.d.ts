import type { Response } from "express";
import type { AuthenticatedRequest } from "../types";
/**
 * Register a new user
 * POST /api/auth/register
 */
export declare const registerUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * Login user with email & password
 * POST /api/auth/login
 */
export declare const loginUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map