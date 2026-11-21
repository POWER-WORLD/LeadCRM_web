"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const connection_1 = __importDefault(require("./db/connection"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sanitizeMiddleware_1 = require("./middleware/sanitizeMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable trust proxy for Vercel and reverse proxies (enables correct IP resolution for rate limiting)
app.set("trust proxy", 1);
// Establish database connection with asynchronous error handling
(0, connection_1.default)().catch((err) => {
    console.error("[Database] Initial connection error:", err.message);
});
// Configure CORS allowed origins whitelist
const defaultOrigins = [
    "https://lead-crm-web.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];
const envFrontendUrl = process.env.FRONTEND_URL;
const envAllowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...(envFrontendUrl ? [envFrontendUrl] : []), ...envAllowedOrigins]))
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser callers (curl, server-to-server, health checks)
        if (!origin) {
            return callback(null, true);
        }
        const normalizedOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some((allowed) => allowed === normalizedOrigin);
        if (isAllowed) {
            callback(null, true);
        }
        else {
            // SEC-002: Safely pass false instead of throwing uncaught Error to prevent 500 crash
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
    maxAge: 86400, // 24 hours preflight cache
};
// Global CORS handler
app.use((0, cors_1.default)(corsOptions));
// SEC-001: Preflight handler must enforce the exact same restricted corsOptions
app.options("*", (0, cors_1.default)(corsOptions));
// Security HTTP headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", ...allowedOrigins],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// Global API rate limiting
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many requests from this IP address. Please try again after 15 minutes.",
    },
});
app.use(globalLimiter);
// Request body parsing with safe DOS-preventing payload limits
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
// NoSQL Injection sanitization middleware
app.use(sanitizeMiddleware_1.mongoSanitizeMiddleware);
// Root route - API metadata and status
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        service: "Lead Management CRM API",
        version: "1.0.0",
        status: "healthy",
        documentation: "/health",
        endpoints: {
            health: "/health",
            auth: "/api/auth",
            leads: "/api/leads",
            stats: "/api/leads/stats",
        },
        links: {
            frontend: process.env.FRONTEND_URL || "https://leadcrm101.vercel.app/",
            backend: process.env.BACKEND_URL || "https://leadcrm-backend101.onrender.com/",
            authorPortfolio: "https://pawankumar.info/",
            github: "https://github.com/POWER-WORLD",
        },
    });
});
// Health check endpoint with database connectivity state
app.get("/health", (_req, res) => {
    const dbStatusMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };
    const dbState = mongoose_1.default.connection.readyState;
    const isDbHealthy = dbState === 1;
    res.status(isDbHealthy ? 200 : 503).json({
        success: isDbHealthy,
        status: isDbHealthy ? "UP" : "DEGRADED",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: {
            status: dbStatusMap[dbState] || "unknown",
            readyState: dbState,
        },
        environment: process.env.NODE_ENV || "development",
    });
});
// Ensure database is connected for all API requests (essential for Vercel serverless cold starts)
app.use(async (_req, _res, next) => {
    try {
        await (0, connection_1.default)();
        next();
    }
    catch (error) {
        console.error("[Database Connection Middleware Error]:", error);
        next(error);
    }
});
// Application API routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/leads", leadRoutes_1.default);
// Catch-all 404 handler
app.use(errorHandler_1.notFound);
// Centralized error handling
app.use(errorHandler_1.errorHandler);
// Start listening on all network interfaces (0.0.0.0) for Render Web Services and local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const portNumber = Number(PORT) || 5000;
    app.listen(portNumber, "0.0.0.0", () => {
        console.log(`[LeadCRM Backend] Server running on 0.0.0.0:${portNumber} (Port: ${portNumber})`);
    });
}
exports.default = app;
//# sourceMappingURL=start.js.map