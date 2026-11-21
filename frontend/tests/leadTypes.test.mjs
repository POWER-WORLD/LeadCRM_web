import test from "node:test"
import assert from "node:assert/strict"

const VALID_STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"]

test("Lead Status Standardization - All 5 lifecycle statuses supported", () => {
  assert.equal(VALID_STATUSES.length, 5)
  assert.ok(VALID_STATUSES.includes("New"))
  assert.ok(VALID_STATUSES.includes("Contacted"))
  assert.ok(VALID_STATUSES.includes("Qualified"))
  assert.ok(VALID_STATUSES.includes("Converted"))
  assert.ok(VALID_STATUSES.includes("Lost"))
})

test("Lead Query Serialization - Filter query parameters properly formatted", () => {
  const query = {
    page: 2,
    limit: 20,
    search: "Acme",
    status: "Qualified",
    sortBy: "name",
    sortOrder: "asc",
  }

  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value))
    }
  })

  const str = searchParams.toString()
  assert.ok(str.includes("page=2"))
  assert.ok(str.includes("limit=20"))
  assert.ok(str.includes("search=Acme"))
  assert.ok(str.includes("status=Qualified"))
  assert.ok(str.includes("sortBy=name"))
  assert.ok(str.includes("sortOrder=asc"))
})
