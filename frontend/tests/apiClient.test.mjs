import test from "node:test"
import assert from "node:assert/strict"

// Mock process.env test cases for URL resolution
function resolveApiBaseUrl(envUrl) {
  const fallback = "https://lead-crm-web-backend.vercel.app/api"
  if (!envUrl || envUrl.trim() === "") {
    return fallback
  }
  const trimmed = envUrl.trim().replace(/\/+$/, "")
  if (!trimmed.endsWith("/api")) {
    return `${trimmed}/api`
  }
  return trimmed
}

test("API Base URL Resolution - Default Fallback", () => {
  const url = resolveApiBaseUrl(undefined)
  assert.equal(url, "https://lead-crm-web-backend.vercel.app/api")
})

test("API Base URL Resolution - Empty string fallback", () => {
  const url = resolveApiBaseUrl("   ")
  assert.equal(url, "https://lead-crm-web-backend.vercel.app/api")
})

test("API Base URL Resolution - URL without /api appends /api", () => {
  const url = resolveApiBaseUrl("https://lead-crm-web-backend.vercel.app")
  assert.equal(url, "https://lead-crm-web-backend.vercel.app/api")
})

test("API Base URL Resolution - URL with trailing slash strips slash and appends /api", () => {
  const url = resolveApiBaseUrl("https://lead-crm-web-backend.vercel.app/")
  assert.equal(url, "https://lead-crm-web-backend.vercel.app/api")
})

test("API Base URL Resolution - Localhost URL preserved with /api", () => {
  const url = resolveApiBaseUrl("http://localhost:5000/api")
  assert.equal(url, "http://localhost:5000/api")
})

test("API Base URL Resolution - Localhost URL without /api gets /api appended", () => {
  const url = resolveApiBaseUrl("http://localhost:5000")
  assert.equal(url, "http://localhost:5000/api")
})
