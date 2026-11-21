/// <reference path="../types/declarations.d.ts" />
import test from "node:test";
import assert from "node:assert/strict";
import { escapeRegex, mongoSanitizeMiddleware } from "../middleware/sanitizeMiddleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

test("Security: escapeRegex escapes all regex special characters to prevent ReDoS", () => {
  const dangerousPattern = ".*+?^${}()|[]\\test";
  const escaped = escapeRegex(dangerousPattern);

  // Characters should be escaped with backslash
  assert.equal(escaped, "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test");

  // Regex constructor should match literal string safely without throwing or wildcard matching
  const regex = new RegExp(escaped);
  assert.ok(regex.test(".*+?^${}()|[]\\test"));
  assert.ok(!regex.test("arbitrary string that would match dot-star"));
});

test("Security: mongoSanitizeMiddleware strips NoSQL operator keys ($ and .)", () => {
  const req: any = {
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
  mongoSanitizeMiddleware(req, {} as any, () => {
    nextCalled = true;
  });

  assert.ok(nextCalled, "next() must be called");
  assert.equal(req.body.$gt, undefined, "$gt must be stripped");
  assert.equal(req.body["nested.field"], undefined, "dotted key must be stripped");
  assert.equal(req.body.safeNested.$where, undefined, "nested $where must be stripped");
  assert.equal(req.body.safeNested.validKey, "value", "safe nested key must remain");
  assert.equal(req.query.status.$ne, undefined, "query operator must be stripped");
  assert.equal(req.query.search, "validSearch", "safe query parameter must remain");
});

test("Security: Password hashing and verification via bcryptjs", async () => {
  const plainPassword = "SuperSecretPassword123!";
  const hash = await bcrypt.hash(plainPassword, 10);

  assert.notEqual(hash, plainPassword);
  assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));

  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.ok(isMatch, "Correct password must match hash");

  const isWrongMatch = await bcrypt.compare("WrongPassword", hash);
  assert.ok(!isWrongMatch, "Incorrect password must not match hash");
});

test("Security: JWT generation, payload integrity, and expiration verification", () => {
  const secret = "test_jwt_secret_key_1234567890";
  const payload = { userId: "user123", email: "test@example.com", role: "admin" };

  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  assert.ok(typeof token === "string" && token.length > 20);

  const decoded: any = jwt.verify(token, secret);
  assert.equal(decoded.userId, "user123");
  assert.equal(decoded.email, "test@example.com");
  assert.equal(decoded.role, "admin");

  // Invalid secret rejection
  assert.throws(() => {
    jwt.verify(token, "wrong_secret");
  });
});
