"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/declarations.d.ts" />
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const Lead_1 = __importDefault(require("../models/Lead"));
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
(0, node_test_1.default)("Model Validation: Lead schema validates required fields and email formats", () => {
    // Missing required fields
    const emptyLead = new Lead_1.default({});
    const validationError = emptyLead.validateSync();
    strict_1.default.ok(validationError, "Validation must fail when required fields are missing");
    strict_1.default.ok(validationError.errors.name, "Name must be required");
    strict_1.default.ok(validationError.errors.email, "Email must be required");
    strict_1.default.ok(validationError.errors.phone, "Phone must be required");
    strict_1.default.ok(validationError.errors.company, "Company must be required");
    // Valid lead with modern TLD email (.info, .online)
    const validLead = new Lead_1.default({
        name: "Pawan Kumar",
        email: "contact@pawankumar.info",
        phone: "+1 (555) 123-4567",
        company: "Acme Global Corp",
        status: "Qualified",
        notes: "High intent prospective enterprise client.",
    });
    const validResult = validLead.validateSync();
    strict_1.default.equal(validResult, undefined, "Lead with .info modern TLD must validate cleanly");
    // Invalid email format rejection
    const invalidEmailLead = new Lead_1.default({
        name: "Invalid User",
        email: "not-an-email",
        phone: "1234567890",
        company: "Test Co",
    });
    const invalidEmailResult = invalidEmailLead.validateSync();
    strict_1.default.ok(invalidEmailResult?.errors.email, "Invalid email format must be rejected");
    // Invalid phone rejection
    const invalidPhoneLead = new Lead_1.default({
        name: "Invalid Phone User",
        email: "valid@example.com",
        phone: "abc",
        company: "Test Co",
    });
    const invalidPhoneResult = invalidPhoneLead.validateSync();
    strict_1.default.ok(invalidPhoneResult?.errors.phone, "Invalid phone must be rejected");
    // Invalid status rejection
    const invalidStatusLead = new Lead_1.default({
        name: "Invalid Status User",
        email: "status@example.com",
        phone: "1234567890",
        company: "Test Co",
        status: "UnknownStatus",
    });
    const invalidStatusResult = invalidStatusLead.validateSync();
    strict_1.default.ok(invalidStatusResult?.errors.status, "Invalid status must be rejected");
});
(0, node_test_1.default)("Model Transformation: Lead toJSON transforms _id and id properly and strips __v", () => {
    const lead = new Lead_1.default({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "9876543210",
        company: "Innovate Ltd",
        status: "New",
    });
    const json = lead.toJSON();
    strict_1.default.ok(json.id, "JSON must contain 'id'");
    strict_1.default.ok(json._id, "JSON must contain '_id'");
    strict_1.default.equal(json.id, json._id, "'id' and '_id' must match as string");
    strict_1.default.equal(json.__v, undefined, "'__v' must be stripped from JSON");
});
(0, node_test_1.default)("Model Validation & Hook: User schema validates roles, strips password in toJSON", async () => {
    const user = new User_1.default({
        name: "Security Lead",
        email: "sec@pawankumar.info",
        password: "Password123!",
        role: "manager",
    });
    const validation = user.validateSync();
    strict_1.default.equal(validation, undefined, "Valid user document must pass validation");
    // Test toJSON security: password and __v stripped, id and _id preserved
    const json = user.toJSON();
    strict_1.default.equal(json.password, undefined, "Password must never be exposed in toJSON");
    strict_1.default.equal(json.__v, undefined, "__v must be stripped");
    strict_1.default.ok(json.id && json._id, "Both id and _id must be present");
    // Test comparePassword functionality
    const hashedPassword = await bcryptjs_1.default.hash("Password123!", 10);
    user.password = hashedPassword;
    const isMatch = await user.comparePassword("Password123!");
    strict_1.default.ok(isMatch, "comparePassword must succeed with correct password");
    const isMismatch = await user.comparePassword("WrongPassword");
    strict_1.default.ok(!isMismatch, "comparePassword must fail with wrong password");
});
//# sourceMappingURL=models.test.js.map