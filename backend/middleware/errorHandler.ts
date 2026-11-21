import type { Request, Response, NextFunction } from "express";

/**
 * Global application error handling middleware.
 * Formats errors uniformly, avoids leaking internal stack traces in production.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log unexpected errors internally
  if (process.env.NODE_ENV !== "test") {
    console.error("Express Error Caught:", err);
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors).map((e: any) => e.message || "Invalid input");
    res.status(400).json({
      success: false,
      error: messages.join("; "),
      ...(isDevelopment && { details: err.errors }),
    });
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    const field = keys.length > 0 ? keys.join(", ") : "field";
    res.status(400).json({
      success: false,
      error: `A record with this ${field} already exists.`,
    });
    return;
  }

  // Mongoose invalid ObjectId cast error
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      error: `Invalid resource identifier format for field '${err.path}'.`,
    });
    return;
  }

  // Body parser syntax error (malformed JSON)
  if (err instanceof SyntaxError && "status" in err && (err as any).status === 400 && "body" in err) {
    res.status(400).json({
      success: false,
      error: "Malformed JSON payload in request body.",
    });
    return;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid authentication token.",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Authentication token has expired.",
    });
    return;
  }

  // Custom status code if provided
  const statusCode = typeof err.statusCode === "number" && err.statusCode >= 400 ? err.statusCode : 500;
  const message = statusCode === 500 && !isDevelopment ? "Internal server error" : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 Route Not Found middleware.
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route not found: [${req.method}] ${req.originalUrl}`,
  });
};
