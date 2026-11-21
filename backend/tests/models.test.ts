/// <reference path="../types/declarations.d.ts" />
import test from "node:test";
import assert from "node:assert/strict";
import Lead from "../models/Lead";
import User from "../models/User";
import bcrypt from "bcryptjs";

test("Model Validation: Lead schema validates required fields and email formats", () => {
  // Missing required fields
  const emptyLead = new Lead({});
  const validationError = emptyLead.validateSync();
  assert.ok(validationError, "Validation must fail when required fields are missing");
  assert.ok(validationError.errors.name, "Name must be required");
  assert.ok(validationError.errors.email, "Email must be required");
  assert.ok(validationError.errors.phone, "Phone must be required");
  assert.ok(validationError.errors.company, "Company must be required");

  // Valid lead with modern TLD email (.info, .online)
  const validLead = new Lead({
    name: "Pawan Kumar",
    email: "contact@pawankumar.info",
    phone: "+1 (555) 123-4567",
    company: "Acme Global Corp",
    status: "Qualified",
    notes: "High intent prospective enterprise client.",
  });
  const validResult = validLead.validateSync();
  assert.equal(validResult, undefined, "Lead with .info modern TLD must validate cleanly");

  // Invalid email format rejection
  const invalidEmailLead = new Lead({
    name: "Invalid User",
    email: "not-an-email",
    phone: "1234567890",
    company: "Test Co",
  });
  const invalidEmailResult = invalidEmailLead.validateSync();
  assert.ok(invalidEmailResult?.errors.email, "Invalid email format must be rejected");

  // Invalid phone rejection
  const invalidPhoneLead = new Lead({
    name: "Invalid Phone User",
    email: "valid@example.com",
    phone: "abc",
    company: "Test Co",
  });
  const invalidPhoneResult = invalidPhoneLead.validateSync();
  assert.ok(invalidPhoneResult?.errors.phone, "Invalid phone must be rejected");

  // Invalid status rejection
  const invalidStatusLead = new Lead({
    name: "Invalid Status User",
    email: "status@example.com",
    phone: "1234567890",
    company: "Test Co",
    status: "UnknownStatus" as any,
  });
  const invalidStatusResult = invalidStatusLead.validateSync();
  assert.ok(invalidStatusResult?.errors.status, "Invalid status must be rejected");
});

test("Model Transformation: Lead toJSON transforms _id and id properly and strips __v", () => {
  const lead = new Lead({
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "9876543210",
    company: "Innovate Ltd",
    status: "New",
  });

  const json: any = lead.toJSON();
  assert.ok(json.id, "JSON must contain 'id'");
  assert.ok(json._id, "JSON must contain '_id'");
  assert.equal(json.id, json._id, "'id' and '_id' must match as string");
  assert.equal(json.__v, undefined, "'__v' must be stripped from JSON");
});

test("Model Validation & Hook: User schema validates roles, strips password in toJSON", async () => {
  const user = new User({
    name: "Security Lead",
    email: "sec@pawankumar.info",
    password: "Password123!",
    role: "manager",
  });

  const validation = user.validateSync();
  assert.equal(validation, undefined, "Valid user document must pass validation");

  // Test toJSON security: password and __v stripped, id and _id preserved
  const json: any = user.toJSON();
  assert.equal(json.password, undefined, "Password must never be exposed in toJSON");
  assert.equal(json.__v, undefined, "__v must be stripped");
  assert.ok(json.id && json._id, "Both id and _id must be present");

  // Test comparePassword functionality
  const hashedPassword = await bcrypt.hash("Password123!", 10);
  user.password = hashedPassword;
  const isMatch = await user.comparePassword("Password123!");
  assert.ok(isMatch, "comparePassword must succeed with correct password");
  const isMismatch = await user.comparePassword("WrongPassword");
  assert.ok(!isMismatch, "comparePassword must fail with wrong password");
});
