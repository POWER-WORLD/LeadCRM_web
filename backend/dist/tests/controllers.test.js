"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/declarations.d.ts" />
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const leadController_1 = require("../controllers/leadController");
const authController_1 = require("../controllers/authController");
(0, node_test_1.default)("Controller: createLead validates missing fields", async () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        body: {
            name: "", // Invalid empty name
            email: "valid@example.com",
            phone: "1234567890",
            company: "Company",
        },
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
    await (0, leadController_1.createLead)(req, res);
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("Name is required"));
});
(0, node_test_1.default)("Controller: getLeadById rejects invalid ObjectId", async () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        params: { id: "invalid-mongo-id-123" },
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
    await (0, leadController_1.getLeadById)(req, res);
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("Invalid lead ID format"));
});
(0, node_test_1.default)("Controller: updateLead rejects invalid ObjectId and handles null notes safely", async () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        params: { id: "not-an-objectid" },
        body: {
            notes: null, // Test edge case bug fix for notes.trim()
        },
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
    await (0, leadController_1.updateLead)(req, res);
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("Invalid lead ID format"));
});
(0, node_test_1.default)("Controller: deleteLead rejects invalid ObjectId", async () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        params: { id: "malformed_id" },
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
    await (0, leadController_1.deleteLead)(req, res);
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("Invalid lead ID format"));
});
(0, node_test_1.default)("Controller: registerUser validates email and password length", async () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        body: {
            name: "Admin User",
            email: "bademail",
            password: "123", // Too short
        },
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
    await (0, authController_1.registerUser)(req, res);
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("email"));
});
(0, node_test_1.default)("Controller: loginUser validates email and password presence", async () => {
    let responseStatus = 0;
    let responseData = null;
    const req = {
        body: {},
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
    await (0, authController_1.loginUser)(req, res);
    strict_1.default.equal(responseStatus, 400);
    strict_1.default.equal(responseData.success, false);
    strict_1.default.ok(responseData.error.includes("provide both email and password"));
});
//# sourceMappingURL=controllers.test.js.map