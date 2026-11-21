"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoSanitizeMiddleware = exports.escapeRegex = void 0;
/**
 * Escapes special characters from a string to prevent Regular Expression Denial of Service (ReDoS)
 * or regex injection when building dynamic MongoDB queries.
 */
const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
exports.escapeRegex = escapeRegex;
/**
 * Recursively cleans an object by removing or sanitizing keys that begin with '$' or contain '.'
 * to protect against MongoDB NoSQL Injection attacks.
 */
const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
    }
    const cleanObj = {};
    for (const [key, value] of Object.entries(obj)) {
        // Drop keys starting with '$' or containing '.'
        if (key.startsWith("$") || key.includes(".")) {
            continue;
        }
        cleanObj[key] = sanitizeObject(value);
    }
    return cleanObj;
};
/**
 * Express middleware to sanitize incoming request body, query parameters, and URL parameters.
 */
const mongoSanitizeMiddleware = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
        req.params = sanitizeObject(req.params);
    }
    next();
};
exports.mongoSanitizeMiddleware = mongoSanitizeMiddleware;
//# sourceMappingURL=sanitizeMiddleware.js.map