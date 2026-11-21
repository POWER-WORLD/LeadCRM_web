"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/declarations.d.ts" />
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const sanitizeMiddleware_1 = require("../middleware/sanitizeMiddleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
(0, node_test_1.default)("Security: escapeRegex escapes all regex special characters to prevent ReDoS", () => {
    const dangerousPattern = ".*+?^${}()|[]\\test";
    const escaped = (0, sanitizeMiddleware_1.escapeRegex)(dangerousPattern);
    // Characters should be escaped with backslash
    strict_1.default.equal(escaped, "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test");
    // Regex constructor should match literal string safely without throwing or wildcard matching
    const regex = new RegExp(escaped);
    strict_1.default.ok(regex.test(".*+?^${}()|[]\\test"));
    strict_1.default.ok(!regex.test("arbitrary string that would match dot-star"));
});
(0, node_test_1.default)("Security: mongoSanitizeMiddleware strips NoSQL operator keys ($ and .)", () => {
    const req = {
        body: {
            username: "admin",
            $gt: "",
            "nested.field": "danger",
            safeNested: {
                $where: "malicious code",
                validKey: "value",
            },
        },
        query: {
            status: {
                $ne: null,
            },
            search: "validSearch",
        },
        params: {
            id: "validId",
            "$badParam": "drop",
        },
    };
    let nextCalled = false;
    (0, sanitizeMiddleware_1.mongoSanitizeMiddleware)(req, {}, () => {
        nextCalled = true;
    });
    strict_1.default.ok(nextCalled, "next() must be called");
    strict_1.default.equal(req.body.$gt, undefined, "$gt must be stripped");
    strict_1.default.equal(req.body["nested.field"], undefined, "dotted key must be stripped");
    strict_1.default.equal(req.body.safeNested.$where, undefined, "nested $where must be stripped");
    strict_1.default.equal(req.body.safeNested.validKey, "value", "safe nested key must remain");
    strict_1.default.equal(req.query.status.$ne, undefined, "query operator must be stripped");
    strict_1.default.equal(req.query.search, "validSearch", "safe query parameter must remain");
});
(0, node_test_1.default)("Security: Password hashing and verification via bcryptjs", async () => {
    const plainPassword = "SuperSecretPassword123!";
    const hash = await bcryptjs_1.default.hash(plainPassword, 10);
    strict_1.default.notEqual(hash, plainPassword);
    strict_1.default.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
    const isMatch = await bcryptjs_1.default.compare(plainPassword, hash);
    strict_1.default.ok(isMatch, "Correct password must match hash");
    const isWrongMatch = await bcryptjs_1.default.compare("WrongPassword", hash);
    strict_1.default.ok(!isWrongMatch, "Incorrect password must not match hash");
});
(0, node_test_1.default)("Security: JWT generation, payload integrity, and expiration verification", () => {
    const secret = "test_jwt_secret_key_1234567890";
    const payload = { userId: "user123", email: "test@example.com", role: "admin" };
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "1h" });
    strict_1.default.ok(typeof token === "string" && token.length > 20);
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    strict_1.default.equal(decoded.userId, "user123");
    strict_1.default.equal(decoded.email, "test@example.com");
    strict_1.default.equal(decoded.role, "admin");
    // Invalid secret rejection
    strict_1.default.throws(() => {
        jsonwebtoken_1.default.verify(token, "wrong_secret");
    });
});
//# sourceMappingURL=security.test.js.map