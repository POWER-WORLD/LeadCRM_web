"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import type { Lead, LeadQuery, LeadResponse, LeadStatus, LeadSortField, SortOrder } from "@/types/lead"

function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => clearTimeout(handler)
  }, [value, delayMs])

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

  // View Details Modal State
  const [viewingLead, setViewingLead] = useState<Lead | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  // Edit Modal State
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

  // Delete Confirmation State
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Current Query Params
  const currentPage = Number(searchParams.get("page")) || 1
  const currentLimit = Number(searchParams.get("limit")) || 10
  const currentSearch = searchParams.get("search") || ""
  const currentStatus = (searchParams.get("status") as LeadStatus | "all") || "all"
  const currentSortBy = (searchParams.get("sortBy") as LeadSortField) || "createdAt"
  const currentSortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc"

  // Local Search Input
  const [searchInput, setSearchInput] = useState(currentSearch)
  const debouncedSearch = useDebounce(searchInput, 400)

  // Handle Escape Key for Modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewingLead) setViewingLead(null)
        if (editingLead && !isUpdating) setEditingLead(null)
        if (deletingLead && !isDeleting) setDeletingLead(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [viewingLead, editingLead, deletingLead, isUpdating, isDeleting])

  const handleCopyId = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all" || (key === "page" && value === 1)) {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      router.push(`/leads?${params.toString()}`)
    },
    [searchParams, router],
  )

  const fetchLeads = useCallback(
    async (isSearchingQuery = false) => {
      try {
        if (isSearchingQuery) {
          setSearching(true)
        } else {
          setLoading(true)
        }
        setError(null)

        const query: LeadQuery = {
          page: currentPage,
          limit: currentLimit,
          search: currentSearch,
          status: currentStatus,
          sortBy: currentSortBy,
          sortOrder: currentSortOrder,
        }

        const response = await apiClient.getLeads(query)

        if (response.success && response.data) {
          setLeadsData(response.data)
        } else {
          setError(response.error || "Unable to retrieve leads from server")
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load leads"
        setError(message)
      } finally {
        setLoading(false)
        setSearching(false)
      }
    },
    [currentPage, currentLimit, currentSearch, currentStatus, currentSortBy, currentSortOrder],
  )

  // Sync debounced search to URL params
  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateSearchParams({ search: debouncedSearch, page: 1 })
    }
  }, [debouncedSearch, currentSearch, updateSearchParams])

  // Sync URL search back to input if navigated
  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  // Fetch leads on query change
  useEffect(() => {
    const isSearchingQuery = searchInput !== currentSearch
    fetchLeads(isSearchingQuery)
  }, [currentPage, currentLimit, currentSearch, currentStatus, currentSortBy, currentSortOrder, fetchLeads])

  const getStatusBadgeStyle = (status: LeadStatus) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Contacted":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Qualified":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Converted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Lost":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleSortToggle = (field: LeadSortField) => {
    const nextOrder: SortOrder = currentSortBy === field && currentSortOrder === "asc" ? "desc" : "asc"
    updateSearchParams({ sortBy: field, sortOrder: nextOrder, page: 1 })
  }

  // Edit Handlers
  const openEditModal = (lead: Lead) => {
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

  const handleEditFieldChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateEditForm = (): boolean => {
    const errs: Record<string, string> = {}
    if (!editFormData.name.trim()) errs.name = "Full name is required"
    else if (editFormData.name.trim().length < 2) errs.name = "Name must be at least 2 characters"

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!editFormData.email.trim()) errs.email = "Email address is required"
    else if (!emailRegex.test(editFormData.email.trim())) errs.email = "Valid email is required"

    if (!editFormData.phone.trim()) errs.phone = "Phone number is required"
    if (!editFormData.company.trim()) errs.company = "Company name is required"

    setEditErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submitEdit = async () => {
    const targetLeadId = editingLead?._id || editingLead?.id
    if (!targetLeadId || !validateEditForm()) return

    setIsUpdating(true)
    try {
      const response = await apiClient.updateLead(targetLeadId, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        phone: editFormData.phone.trim(),
        company: editFormData.company.trim(),
        status: editFormData.status,
        notes: editFormData.notes.trim(),
      })

      if (response.success) {
        setEditingLead(null)
        fetchLeads()
      } else {
        setEditErrors({ general: response.error || "Failed to update lead details" })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update request failed"
      setEditErrors({ general: msg })
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete Handlers
  const confirmDelete = async () => {
    const targetLeadId = deletingLead?._id || deletingLead?.id
    if (!targetLeadId) return

    setIsDeleting(true)
    try {
      const response = await apiClient.deleteLead(targetLeadId)
      if (response.success) {
        setDeletingLead(null)
        fetchLeads()
      } else {
        alert(response.error || "Failed to delete lead")
      }
    } catch (err) {
      console.error("Error deleting lead:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Lead Management Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Search, filter, edit, and progress leads throughout your sales pipeline
            </p>
          </div>
          <Link
            href="/leads/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Lead</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search name, email, company..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search leads"
                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              {searching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={currentStatus}
                onChange={(e) => updateSearchParams({ status: e.target.value as LeadStatus | "all", page: 1 })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Per Page Limit */}
            <div>
              <label htmlFor="limit-select" className="sr-only">
                Items per page
              </label>
              <select
                id="limit-select"
                value={currentLimit}
                onChange={(e) => updateSearchParams({ limit: Number(e.target.value), page: 1 })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={6}>6 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {/* Sorting Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSortToggle("name")}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                  currentSortBy === "name"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                aria-label={`Sort by name ${currentSortBy === "name" && currentSortOrder === "asc" ? "descending" : "ascending"}`}
              >
                <span>Name</span>
                {currentSortBy === "name" && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${currentSortOrder === "asc" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSortToggle("createdAt")}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                  currentSortBy === "createdAt"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                aria-label={`Sort by date ${currentSortBy === "createdAt" && currentSortOrder === "asc" ? "descending" : "ascending"}`}
              >
                <span>Date</span>
                {currentSortBy === "createdAt" && (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${currentSortOrder === "asc" ? "rotate-180" : ""}`}
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

        {/* Error Banner */}
        {error && (
          <div role="alert" className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchLeads()}
              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && !leadsData ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center" aria-live="polite">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-600">Loading leads...</p>
          </div>
        ) : !leadsData || leadsData.leads.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Leads Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {currentSearch || currentStatus !== "all"
                ? "No leads matched your specific search criteria or filter."
                : "Your CRM pipeline is currently empty. Add your first prospect to get started."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(currentSearch || currentStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("")
                    updateSearchParams({ search: "", status: "all", page: 1 })
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
              <Link
                href="/leads/new"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add New Lead
              </Link>
            </div>
          </div>
        ) : (
          /* Leads List */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header info */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Showing {leadsData.leads.length} of {leadsData.total} leads
              </span>
              {leadsData.totalPages > 1 && (
                <span className="text-xs font-medium text-gray-500">
                  Page {leadsData.page} of {leadsData.totalPages}
                </span>
              )}
            </div>

            {/* List Items */}
            <div className="divide-y divide-gray-100">
              {leadsData.leads.map((lead) => {
                const leadKey = lead._id || lead.id || lead.email
                return (
                  <div
                    key={leadKey}
                    className="p-5 sm:p-6 hover:bg-gray-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Lead Profile Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{lead.name}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                              lead.status,
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{lead.email}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-0.5">
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {lead.phone}
                            </span>
                          )}
                          {lead.company && (
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {lead.company}
                            </span>
                          )}
                          <span className="text-gray-400">
                            Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                        {lead.notes && (
                          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mt-2 max-w-xl border border-gray-100">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingLead(lead)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                        aria-label={`View full details of ${lead.name}`}
                        title="View Lead Information"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(lead)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        aria-label={`Edit ${lead.name}`}
                        title="Edit Lead"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingLead(lead)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                        aria-label={`Delete ${lead.name}`}
                        title="Delete Lead"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {leadsData.totalPages > 1 && (
              <div className="p-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateSearchParams({ page: currentPage - 1 })}
                  className="px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous Page
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: leadsData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => updateSearchParams({ page: pageNum })}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pageNum === currentPage ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= leadsData.totalPages}
                  onClick={() => updateSearchParams({ page: currentPage + 1 })}
                  className="px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Lead Details Modal */}
        {viewingLead && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-dialog-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setViewingLead(null)
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden my-8">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-xl text-white shadow-inner">
                    {viewingLead.name ? viewingLead.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 id="view-dialog-title" className="text-xl font-bold text-white tracking-tight">
                        {viewingLead.name}
                      </h2>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-xs"
                      >
                        {viewingLead.status}
                      </span>
                    </div>
                    <p className="text-xs text-blue-100 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{viewingLead.company}</span>
                      <span>•</span>
                      <span>Registered Prospect Information</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingLead(null)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Close details dialog"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[calc(85vh-140px)] overflow-y-auto">
                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lead ID */}
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Lead Identifier</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-gray-800 break-all select-all">
                        {viewingLead._id || viewingLead.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyId(String(viewingLead._id || viewingLead.id))}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors shrink-0"
                        title="Copy Lead ID"
                      >
                        {copiedId ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Pipeline Status</span>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(viewingLead.status)}`}>
                        {viewingLead.status}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Email Address</span>
                    <a
                      href={`mailto:${viewingLead.email}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 break-all"
                    >
                      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{viewingLead.email}</span>
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Phone Number</span>
                    {viewingLead.phone ? (
                      <a
                        href={`tel:${viewingLead.phone}`}
                        className="text-sm font-semibold text-gray-800 hover:text-blue-600 flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{viewingLead.phone}</span>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not provided</span>
                    )}
                  </div>

                  {/* Company */}
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Company Affiliation</span>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{viewingLead.company}</span>
                    </p>
                  </div>

                  {/* Created & Updated Timestamps */}
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Timestamps</span>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>
                        <span className="font-medium text-gray-700">Created: </span>
                        {viewingLead.createdAt ? new Date(viewingLead.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Updated: </span>
                        {viewingLead.updatedAt ? new Date(viewingLead.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes & Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">Prospect Notes & Communication History</span>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[90px]">
                    {viewingLead.notes && viewingLead.notes.trim() ? (
                      viewingLead.notes
                    ) : (
                      <span className="text-gray-400 italic">No additional notes or communication history recorded for this lead.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  LeadCRM Record Details
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetLead = viewingLead
                      setViewingLead(null)
                      openEditModal(targetLead)
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Lead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingLead(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal Dialog */}
        {editingLead && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dialog-title"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl flex items-center justify-between">
                <h2 id="edit-dialog-title" className="text-base font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Lead Details
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg"
                  aria-label="Close dialog"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {editErrors.general && (
                  <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                    {editErrors.general}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleEditFieldChange("name", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  {editErrors.name && <p className="text-xs text-rose-600">{editErrors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditFieldChange("email", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  {editErrors.email && <p className="text-xs text-rose-600">{editErrors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditFieldChange("phone", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  {editErrors.phone && <p className="text-xs text-rose-600">{editErrors.phone}</p>}
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Company *</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) => handleEditFieldChange("company", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  {editErrors.company && <p className="text-xs text-rose-600">{editErrors.company}</p>}
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Lead Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => handleEditFieldChange("status", e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
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
                  <label className="block text-xs font-semibold text-gray-700">Notes & History</label>
                  <textarea
                    rows={3}
                    value={editFormData.notes}
                    onChange={(e) => handleEditFieldChange("notes", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={submitEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
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
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 id="delete-dialog-title" className="text-lg font-bold text-gray-900 mb-1">
                Confirm Lead Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete <strong>{deletingLead.name}</strong> ({deletingLead.email})? This action will permanently remove the lead from your pipeline.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Lead"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingLead(null)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
