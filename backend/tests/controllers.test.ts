/// <reference path="../types/declarations.d.ts" />
import test from "node:test";
import assert from "node:assert/strict";
import { createLead, getLeadById, updateLead, deleteLead } from "../controllers/leadController";
import { registerUser, loginUser } from "../controllers/authController";

test("Controller: createLead validates missing fields", async () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    body: {
      name: "", // Invalid empty name
      email: "valid@example.com",
      phone: "1234567890",
      company: "Company",
    },
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

  await createLead(req, res);
  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("Name is required"));
});

test("Controller: getLeadById rejects invalid ObjectId", async () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    params: { id: "invalid-mongo-id-123" },
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

  await getLeadById(req, res);
  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("Invalid lead ID format"));
});

test("Controller: updateLead rejects invalid ObjectId and handles null notes safely", async () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    params: { id: "not-an-objectid" },
    body: {
      notes: null, // Test edge case bug fix for notes.trim()
    },
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

  await updateLead(req, res);
  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("Invalid lead ID format"));
});

test("Controller: deleteLead rejects invalid ObjectId", async () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    params: { id: "malformed_id" },
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

  await deleteLead(req, res);
  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("Invalid lead ID format"));
});

test("Controller: registerUser validates email and password length", async () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    body: {
      name: "Admin User",
      email: "bademail",
      password: "123", // Too short
    },
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

  await registerUser(req, res);
  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("email"));
});

test("Controller: loginUser validates email and password presence", async () => {
  let responseStatus = 0;
  let responseData: any = null;

  const req: any = {
    body: {},
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

  await loginUser(req, res);
  assert.equal(responseStatus, 400);
  assert.equal(responseData.success, false);
  assert.ok(responseData.error.includes("provide both email and password"));
});

