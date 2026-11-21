/// <reference path="../types/declarations.d.ts" />
import test from "node:test";
import assert from "node:assert/strict";
import { errorHandler, notFound } from "../middleware/errorHandler";
import { authorizeRoles, optionalAuthenticateUser } from "../middleware/authMiddleware";

test("Middleware: errorHandler formats Mongoose ValidationError cleanly", () => {
  const fakeError = {
    name: "ValidationError",
    errors: {
      name: { message: "Name is required" },
      email: { message: "Email is invalid" },
    },
  };

  let responseStatus = 0;
  let responseData: any = null;

  const res: any = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  };

  errorHandler(fakeError, {} as any, res, (() => {}) as any);

  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("Name is required"));
  assert.ok(responseData.error.includes("Email is invalid"));
});

test("Middleware: errorHandler formats Duplicate Key (11000) error", () => {
  const fakeError = {
    code: 11000,
    keyPattern: { email: 1 },
  };

  let responseStatus = 0;
  let responseData: any = null;

  const res: any = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  };

  errorHandler(fakeError, {} as any, res, (() => {}) as any);

  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("email already exists"));
});

test("Middleware: notFound handler produces standard 404 response", () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    method: "POST",
    originalUrl: "/api/nonexistent-route",
  };

  const res: any = {
    status(code: number) {
      responseStatus = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  };

  notFound(req, res);

  assert.equal(responseStatus, 404);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("Route not found: [POST] /api/nonexistent-route"));
});

test("Middleware: authorizeRoles validates user role hierarchy", () => {
  const adminOnlyMiddleware = authorizeRoles("admin");

  // Case 1: Unauthorized agent trying to access admin
  let deniedStatus = 0;
  let deniedData: any = null;
  const agentReq: any = {
    user: { id: "1", role: "agent" },
  };
  const agentRes: any = {
    status(code: number) {
      deniedStatus = code;
      return this;
    },
    json(data: any) {
      deniedData = data;
      return this;
    },
  };

  adminOnlyMiddleware(agentReq, agentRes, (() => {}) as any);
  assert.equal(deniedStatus, 403, "Agent must receive 403 Forbidden");
  assert.ok(deniedData.error.includes("Forbidden"));

  // Case 2: Authorized admin accessing admin
  let nextCalled = false;
  const adminReq: any = {
    user: { id: "2", role: "admin" },
  };

  adminOnlyMiddleware(adminReq, {} as any, () => {
    nextCalled = true;
  });
  assert.ok(nextCalled, "next() must be called for authorized role");
});

test("Middleware: optionalAuthenticateUser allows unauthenticated request without token", async () => {
  const req: any = {
    headers: {},
  };

  let nextCalled = false;
  await optionalAuthenticateUser(req, {} as any, () => {
    nextCalled = true;
  });

  assert.ok(nextCalled, "optional auth must pass through when no Authorization header is present");
  assert.equal(req.user, undefined);
});

