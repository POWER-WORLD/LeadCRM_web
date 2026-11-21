"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/declarations.d.ts" />
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const errorHandler_1 = require("../middleware/errorHandler");
const authMiddleware_1 = require("../middleware/authMiddleware");
(0, node_test_1.default)("Middleware: errorHandler formats Mongoose ValidationError cleanly", () => {
    const fakeError = {
        name: "ValidationError",
        errors: {
            name: { message: "Name is required" },
            email: { message: "Email is invalid" },
        },
    };
    let responseStatus = 0;
    let responseData = null;
    const res = {
        status(code) {
            responseStatus = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
        },
    };
    (0, errorHandler_1.errorHandler)(fakeError, {}, res, (() => { }));
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("Name is required"));
    strict_1.default.ok(responseData.error.includes("Email is invalid"));
});
(0, node_test_1.default)("Middleware: errorHandler formats Duplicate Key (11000) error", () => {
    const fakeError = {
        code: 11000,
        keyPattern: { email: 1 },
    };
    let responseStatus = 0;
    let responseData = null;
    const res = {
        status(code) {
            responseStatus = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
        },
    };
    (0, errorHandler_1.errorHandler)(fakeError, {}, res, (() => { }));
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("email already exists"));
});
(0, node_test_1.default)("Middleware: notFound handler produces standard 404 response", () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        method: "POST",
        originalUrl: "/api/nonexistent-route",
    };
    const res = {
        status(code) {
            responseStatus = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
        },
    };
    (0, errorHandler_1.notFound)(req, res);
    strict_1.default.equal(responseStatus, 404);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("Route not found: [POST] /api/nonexistent-route"));
});
(0, node_test_1.default)("Middleware: authorizeRoles validates user role hierarchy", () => {
    const adminOnlyMiddleware = (0, authMiddleware_1.authorizeRoles)("admin");
    // Case 1: Unauthorized agent trying to access admin
    let deniedStatus = 0;
    let deniedData = null;
    const agentReq = {
        user: { id: "1", role: "agent" },
    };
    const agentRes = {
        status(code) {
            deniedStatus = code;
            return this;
        },
        json(data) {
            deniedData = data;
            return this;
        },
    };
    adminOnlyMiddleware(agentReq, agentRes, (() => { }));
    strict_1.default.equal(deniedStatus, 403, "Agent must receive 403 Forbidden");
    strict_1.default.ok(deniedData.error.includes("Forbidden"));
    // Case 2: Authorized admin accessing admin
    let nextCalled = false;
    const adminReq = {
        user: { id: "2", role: "admin" },
    };
    adminOnlyMiddleware(adminReq, {}, () => {
        nextCalled = true;
    });
    strict_1.default.ok(nextCalled, "next() must be called for authorized role");
});
(0, node_test_1.default)("Middleware: optionalAuthenticateUser allows unauthenticated request without token", async () => {
    const req = {
        headers: {},
    };
    let nextCalled = false;
    await (0, authMiddleware_1.optionalAuthenticateUser)(req, {}, () => {
        nextCalled = true;
    });
    strict_1.default.ok(nextCalled, "optional auth must pass through when no Authorization header is present");
    strict_1.default.equal(req.user, undefined);
});
//# sourceMappingURL=middleware.test.js.map