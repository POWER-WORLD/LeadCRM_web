export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost"

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  notes: string
  createdAt: string
}
