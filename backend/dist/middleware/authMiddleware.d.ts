import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, UserRole } from "../types";
/**
 * Strict authentication middleware.
 * Verifies JWT Bearer token and attaches active user to request.
 */
export declare const authenticateUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication middleware.
 * If Bearer token is provided, validates and attaches user; otherwise allows request to proceed.
 */
export declare const optionalAuthenticateUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Role-based authorization middleware factory.
 */
export declare const authorizeRoles: (...allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map