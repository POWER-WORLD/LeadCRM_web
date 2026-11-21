/**
 * Global Lead Types & Interfaces
 * Follows Global Naming Standardization for LeadCRM
 */

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost"

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Converted",
  "Lost",
] as const

export interface Lead {
  _id: string
  id?: string
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface LeadResponse {
  leads: Lead[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LeadStats {
  total: number
  statusCounts: Record<LeadStatus, number>
  conversionRate: number
}

export type LeadSortField = "name" | "email" | "company" | "createdAt"
export type SortOrder = "asc" | "desc"

export interface LeadQuery {
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus | "all"
  sortBy?: LeadSortField
  sortOrder?: SortOrder
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  notes: string
}
