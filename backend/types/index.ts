export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost"

export interface Lead {
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  notes: string
  createdAt?: Date
  updatedAt?: Date
}

export interface LeadQuery {
  page?: number
  limit?: number
  search?: string
  status?: LeadStatus | "all"
  sortBy?: "name" | "email" | "company" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface LeadResponse {
  leads: LeadWithId[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LeadWithId extends Lead {
  _id: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
