import type { Request, Response, NextFunction } from "express";
/**
 * Escapes special characters from a string to prevent Regular Expression Denial of Service (ReDoS)
 * or regex injection when building dynamic MongoDB queries.
 */
export declare const escapeRegex: (text: string) => string;
/**
 * Express middleware to sanitize incoming request body, query parameters, and URL parameters.
 */
export declare const mongoSanitizeMiddleware: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=sanitizeMiddleware.d.ts.map