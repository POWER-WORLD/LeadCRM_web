"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiClient, type LeadStatus, type LeadResponse, type Lead } from "@/lib/api"

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface EditFormData {
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  notes: string
}

export default function LeadsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [leadsData, setLeadsData] = useState<LeadResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit modal state
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    notes: "",
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete confirmation state
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Local search state for immediate UI updates
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")

  // Get current params
  const currentPage = Number(searchParams.get("page")) || 1
  const currentLimit = Number(searchParams.get("limit")) || 10
  const currentSearch = searchParams.get("search") || ""
  const currentStatus = (searchParams.get("status") as LeadStatus | "all") || "all"
  const currentSortBy = (searchParams.get("sortBy") as "name" | "email" | "company" | "createdAt") || "createdAt"
  const currentSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc"

  // Debounce the search input
  const debouncedSearchInput = useDebounce(searchInput, 500)

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === "all" || (key === "page" && value === 1)) {
          params.delete(key)
        } else {
          params.set(key, value.toString())
        }
      })

      router.push(`/leads?${params.toString()}`)
    },
    [searchParams, router],
  )

  const fetchLeads = useCallback(
    async (isSearching = false) => {
      try {
        if (isSearching) {
          setSearching(true)
        } else {
          setLoading(true)
        }
        setError(null)

        const response = await apiClient.getLeads({
          page: currentPage,
          limit: currentLimit,
          search: currentSearch,
          status: currentStatus,
          sortBy: currentSortBy,
          sortOrder: currentSortOrder,
        })

        if (response.success && response.data) {
          setLeadsData(response.data)
        } else {
          setError(response.error || "Failed to fetch leads")
        }
      } catch (err) {
        setError("Failed to fetch leads")
        console.error("Error fetching leads:", err)
      } finally {
        setLoading(false)
        setSearching(false)
      }
    },
    [currentPage, currentLimit, currentSearch, currentStatus, currentSortBy, currentSortOrder],
  )

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchInput !== currentSearch) {
      updateSearchParams({ search: debouncedSearchInput, page: 1 })
    }
  }, [debouncedSearchInput, currentSearch, updateSearchParams])

  // Effect for fetching leads
  useEffect(() => {
    const isSearching = searchInput !== currentSearch
    fetchLeads(isSearching)
  }, [currentPage, currentLimit, currentSearch, currentStatus, currentSortBy, currentSortOrder, fetchLeads])

  // Sync search input with URL params when navigating
  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Contacted":
        return "bg-yellow-100 text-yellow-800"
      case "Qualified":
        return "bg-purple-100 text-purple-800"
      case "Converted":
        return "bg-green-100 text-green-800"
      case "Lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleStatusFilter = (status: LeadStatus | "all") => {
    updateSearchParams({ status, page: 1 })
  }

  const handleLimitChange = (limit: number) => {
    updateSearchParams({ limit, page: 1 })
  }

  const handleSort = (sortBy: "name" | "email" | "company" | "createdAt") => {
    const newSortOrder = currentSortBy === sortBy && currentSortOrder === "asc" ? "desc" : "asc"
    updateSearchParams({ sortBy, sortOrder: newSortOrder })
  }

  const handlePageChange = (page: number) => {
    updateSearchParams({ page })
  }

  // Edit handlers
  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead)
    setEditFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      status: lead.status,
      notes: lead.notes || "",
    })
    setEditErrors({})
  }

  const handleEditInputChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!editFormData.name.trim()) newErrors.name = "Name is required"
    else if (editFormData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!editFormData.email.trim()) newErrors.email = "Email is required"
    else if (!emailRegex.test(editFormData.email)) newErrors.email = "Please enter a valid email"

    if (!editFormData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!editFormData.company.trim()) newErrors.company = "Company name is required"

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditSubmit = async () => {
    if (!editingLead || !validateEditForm()) return

    setIsUpdating(true)
    try {
      const response = await apiClient.updateLead(editingLead._id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        company: editFormData.company.trim(),
        status: editFormData.status,
        notes: editFormData.notes.trim(),
      })

      if (response.success) {
        setEditingLead(null)
        fetchLeads()
      } else {
        setEditErrors({ email: response.error || "Failed to update lead" })
      }
    } catch (err: any) {
      setEditErrors({ email: err.message || "Failed to update lead" })
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete handlers
  const handleDeleteClick = (lead: Lead) => {
    setDeletingLead(lead)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingLead) return

    setIsDeleting(true)
    try {
      const response = await apiClient.deleteLead(deletingLead._id)
      if (response.success) {
        setDeletingLead(null)
        fetchLeads()
      }
    } catch (err) {
      console.error("Error deleting lead:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading && !leadsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !leadsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
            <p className="text-gray-600">Manage and track all your leads in one place</p>
          </div>
          <Link href="/leads/new">
            <button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add New Lead
            </button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-lg rounded-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters &amp; Search
              {searching && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or company..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              <select
                value={currentStatus}
                onChange={(e) => handleStatusFilter(e.target.value as LeadStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>

              <select
                value={currentLimit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={6}>6 per page</option>
                <option value={10}>10 per page</option>
                <option value={18}>18 per page</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSort("name")}
                  className={`flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 ${
                    currentSortBy === "name" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  Name
                  {currentSortBy === "name" && (
                    <svg
                      className={`h-4 w-4 ${currentSortOrder === "asc" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleSort("createdAt")}
                  className={`flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 ${
                    currentSortBy === "createdAt" ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  Date
                  {currentSortBy === "createdAt" && (
                    <svg
                      className={`h-4 w-4 ${currentSortOrder === "asc" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {leadsData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {(["New", "Contacted", "Qualified", "Converted", "Lost"] as LeadStatus[]).map((status) => {
              const count = leadsData.leads.filter((lead) => lead.status === status).length
              return (
                <div key={status} className="bg-white shadow-md rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{status}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Leads List */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {leadsData ? `${leadsData.leads.length} of ${leadsData.total}` : "0 of 0"} Leads
                {searching && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
              </h2>
              {leadsData && leadsData.totalPages > 1 && (
                <div className="text-sm text-gray-600">
                  Page {leadsData.page} of {leadsData.totalPages}
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {!leadsData || leadsData.leads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600 mb-4">
                  {currentSearch || currentStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first lead"}
                </p>
                <Link href="/leads/new">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Add Your First Lead
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className={`space-y-4 ${searching ? "opacity-75" : ""}`}>
                  {leadsData.leads.map((lead) => (
                    <div
                      key={lead._id}
                      className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{lead.email}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              {lead.phone && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                              {lead.company && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  <span>{lead.company}</span>
                                </div>
                              )}
                            </div>
                            {lead.notes && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{lead.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(lead)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit lead"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(lead)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete lead"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {leadsData.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {Array.from({ length: leadsData.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            page === currentPage
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= leadsData.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Lead
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {editErrors.name && <p className="text-red-600 text-sm">{editErrors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {editErrors.email && <p className="text-red-600 text-sm">{editErrors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editErrors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {editErrors.phone && <p className="text-red-600 text-sm">{editErrors.phone}</p>}
              </div>

              {/* Company */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                <input
                  type="text"
                  value={editFormData.company}
                  onChange={(e) => handleEditInputChange("company", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editErrors.company ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {editErrors.company && <p className="text-red-600 text-sm">{editErrors.company}</p>}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Lead Status *</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => handleEditInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => handleEditInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditSubmit}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={() => setEditingLead(null)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Lead</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{deletingLead.name}</strong> ({deletingLead.email})? This will permanently remove the lead from your database.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Lead"
                  )}
                </button>
                <button
                  onClick={() => setDeletingLead(null)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
