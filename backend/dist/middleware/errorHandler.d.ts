import type { Request, Response, NextFunction } from "express";
/**
 * Global application error handling middleware.
 * Formats errors uniformly, avoids leaking internal stack traces in production.
 */
export declare const errorHandler: (err: any, _req: Request, res: Response, _next: NextFunction) => void;
/**
 * 404 Route Not Found middleware.
 */
export declare const notFound: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map