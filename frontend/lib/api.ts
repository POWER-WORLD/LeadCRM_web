import type {
  ApiResponse,
  Lead,
  LeadQuery,
  LeadResponse,
  LeadStats,
  LeadStatus,
} from "@/types/lead"

export type { ApiResponse, Lead, LeadQuery, LeadResponse, LeadStats, LeadStatus }

/**
 * Resolves the standardized Backend API base URL.
 * Priority: NEXT_PUBLIC_API_URL > NEXT_PUBLIC_BACKEND_URL > Production Default.
 * Ensures the trailing path ends with /api for backend REST endpoints.
 */
export function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL
  const fallback = "https://leadcrm-backend101.onrender.com/api"

  if (!envUrl || envUrl.trim() === "") {
    return fallback
  }

  const trimmed = envUrl.trim().replace(/\/+$/, "")
  if (!trimmed.endsWith("/api")) {
    return `${trimmed}/api`
  }

  return trimmed
}

export class ApiClient {
  private get baseUrl(): string {
    return resolveApiBaseUrl()
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    const url = `${this.baseUrl}${cleanEndpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      const contentType = response.headers.get("content-type") || ""

      let responseData: any = null
      if (contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        const text = await response.text()
        responseData = { message: text }
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.error ||
          responseData?.message ||
          `Request failed with status ${response.status} (${response.statusText})`
        return {
          success: false,
          error: errorMessage,
        }
      }

      // If backend returns standard { success: true, data: ... }
      if (responseData && typeof responseData === "object" && "success" in responseData) {
        return responseData as ApiResponse<T>
      }

      // Wrap raw successful data into standard ApiResponse
      return {
        success: true,
        data: responseData as T,
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error. Please verify backend availability."
      console.error(`[ApiClient Error] ${options.method || "GET"} ${url}:`, message)

      return {
        success: false,
        error: `API Request Failed: ${message}`,
      }
    }
  }

  async getLeads(query: LeadQuery = {}): Promise<ApiResponse<LeadResponse>> {
    const searchParams = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/leads${queryString ? `?${queryString}` : ""}`

    return this.request<LeadResponse>(endpoint, { method: "GET" })
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    if (!id || !id.trim()) {
      return { success: false, error: "Lead ID is required" }
    }
    return this.request<Lead>(`/leads/${encodeURIComponent(id.trim())}`, { method: "GET" })
  }

  async createLead(lead: Omit<Lead, "_id" | "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Lead>> {
    return this.request<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(lead),
    })
  }

  async updateLead(
    id: string,
    lead: Partial<Omit<Lead, "_id" | "id" | "createdAt" | "updatedAt">>,
  ): Promise<ApiResponse<Lead>> {
    if (!id || !id.trim()) {
      return { success: false, error: "Lead ID is required for update" }
    }
    return this.request<Lead>(`/leads/${encodeURIComponent(id.trim())}`, {
      method: "PUT",
      body: JSON.stringify(lead),
    })
  }

  async deleteLead(id: string): Promise<ApiResponse<null>> {
    if (!id || !id.trim()) {
      return { success: false, error: "Lead ID is required for deletion" }
    }
    return this.request<null>(`/leads/${encodeURIComponent(id.trim())}`, {
      method: "DELETE",
    })
  }

  async getLeadStats(): Promise<ApiResponse<LeadStats>> {
    return this.request<LeadStats>("/leads/stats", { method: "GET" })
  }

  async getHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    // Health is served at root /health on backend
    const healthUrl = this.baseUrl.replace(/\/api$/, "/health")
    try {
      const response = await fetch(healthUrl)
      const data = await response.json()
      return { success: response.ok, data }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Service unreachable"
      return { success: false, error: message }
    }
  }
}

export const apiClient = new ApiClient()
