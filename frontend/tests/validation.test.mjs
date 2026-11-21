import test from "node:test"
import assert from "node:assert/strict"

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^(\+?[0-9]{1,4}[\s-]?)?(\(?[0-9]{1,4}\)?[\s-]?)?[0-9\s-]{6,15}$/

test("Lead Validation - Valid Emails", () => {
  const validEmails = [
    "user@example.com",
    "pawan.kumar@pawankumar.info",
    "contact+test@company.co.uk",
    "lead_123@sub.domain.org",
  ]
  for (const email of validEmails) {
    assert.ok(EMAIL_REGEX.test(email), `Expected ${email} to be valid`)
  }
})

test("Lead Validation - Invalid Emails", () => {
  const invalidEmails = [
    "",
    "user@",
    "@domain.com",
    "user@domain",
    "user space@domain.com",
  ]
  for (const email of invalidEmails) {
    assert.ok(!EMAIL_REGEX.test(email), `Expected ${email} to be invalid`)
  }
})

test("Lead Validation - Valid Phone Numbers", () => {
  const validPhones = [
    "+1 555-0199",
    "+91 9876543210",
    "(555) 123-4567",
    "5551234567",
    "+44 20 7946 0958",
  ]
  for (const phone of validPhones) {
    assert.ok(PHONE_REGEX.test(phone), `Expected ${phone} to be valid`)
  }
})

test("Lead Validation - Invalid Phone Numbers", () => {
  const invalidPhones = [
    "",
    "abc",
    "12",
    "phone-number-here",
  ]
  for (const phone of invalidPhones) {
    assert.ok(!PHONE_REGEX.test(phone), `Expected ${phone} to be invalid`)
  }
})
