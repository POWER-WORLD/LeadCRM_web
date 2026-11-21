import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import type { AuthenticatedRequest, JwtUserPayload, UserRole } from "../types";

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "leadcrm_production_secret_key_change_in_env_2026";
};

/**
 * Strict authentication middleware.
 * Verifies JWT Bearer token and attaches active user to request.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const decoded = jwt.verify(token, getJwtSecret()) as JwtUserPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: "Invalid or malformed token payload.",
      });
      return;
    }

    const user = await User.findById(decoded.userId);

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
  } catch (error: any) {
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

/**
 * Optional authentication middleware.
 * If Bearer token is provided, validates and attaches user; otherwise allows request to proceed.
 */
export const optionalAuthenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  return authenticateUser(req, res, next);
};

/**
 * Role-based authorization middleware factory.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

