import Link from "next/link"
import { apiClient } from "@/lib/api"
import Breadcrumb from "@/components/breadcrumb"
import type { Lead, LeadStats } from "@/types/lead"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let stats: LeadStats = {
    total: 0,
    statusCounts: {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Converted: 0,
      Lost: 0,
    },
    conversionRate: 0,
  }

  let recentLeads: Lead[] = []
  let fetchError: string | null = null

  try {
    const [statsResponse, leadsResponse] = await Promise.all([
      apiClient.getLeadStats(),
      apiClient.getLeads({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
    ])

    if (statsResponse.success && statsResponse.data) {
      stats = statsResponse.data
    } else if (statsResponse.error) {
      fetchError = statsResponse.error
    }

    if (leadsResponse.success && leadsResponse.data) {
      recentLeads = leadsResponse.data.leads || []
    } else if (leadsResponse.error && !fetchError) {
      fetchError = leadsResponse.error
    }
  } catch (error: unknown) {
    fetchError = error instanceof Error ? error.message : "Unable to reach lead services"
  }

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-3 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Real-time Pipeline Management
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Welcome to <span className="text-blue-600">LeadCRM</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Track prospects, analyze sales conversions, and manage customer relationships across your sales pipeline with ease.
            </p>
          </section>

          {/* Service Banner if Backend Connection Warning */}
          {fetchError && (
            <div
              role="alert"
              className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold">Backend Live Status Notice</p>
                  <p className="text-amber-700">{fetchError}</p>
                </div>
              </div>
              <a
                href="https://lead-crm-web-backend.vercel.app/health"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors whitespace-nowrap"
              >
                Inspect Health Endpoint
              </a>
            </div>
          )}

          {/* Pipeline Stats Grid */}
          <section aria-labelledby="metrics-heading" className="mb-12">
            <h2 id="metrics-heading" className="sr-only">
              Pipeline Metrics Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Leads */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Leads</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900">{stats.total}</div>
                <p className="text-xs text-gray-500 mt-1">Total prospects tracked in CRM</p>
              </div>

              {/* New Leads */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">New Leads</span>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600">{stats.statusCounts.New || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Fresh leads awaiting contact</p>
              </div>

              {/* Converted */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Converted</span>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-black text-purple-600">{stats.statusCounts.Converted || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Successfully closed customers</p>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Conversion Rate</span>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600">{stats.conversionRate}%</div>
                <p className="text-xs text-gray-500 mt-1">Lead-to-customer success ratio</p>
              </div>
            </div>
          </section>

          {/* Quick Action Navigation */}
          <section aria-labelledby="actions-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <h2 id="actions-heading" className="sr-only">
              Quick Actions
            </h2>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Create New Lead</h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Capture fresh inquiries, assign initial lifecycle stage, and add notes to jumpstart communication.
                </p>
              </div>
              <Link
                href="/leads/new"
                className="inline-block text-center bg-white text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Add Lead Entry
              </Link>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Manage All Leads</h3>
                <p className="text-purple-100 text-sm mb-6 leading-relaxed">
                  Filter by status, search by contact name or email, perform edits, and update statuses in real-time.
                </p>
              </div>
              <Link
                href="/leads"
                className="inline-block text-center bg-white text-purple-700 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
              >
                Open Lead Directory
              </Link>
            </div>
          </section>

          {/* Recent Activity List */}
          <section aria-labelledby="activity-heading" className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 id="activity-heading" className="text-xl font-bold text-gray-900">
                  Recent Lead Activity
                </h2>
                <p className="text-sm text-gray-500">Most recently added and updated leads</p>
              </div>
              <Link
                href="/leads"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <span>View all {stats.total} leads</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="p-6">
              {recentLeads.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">No Leads Found</h3>
                  <p className="text-sm text-gray-500 mb-4">Start your sales pipeline by adding your first lead entry.</p>
                  <Link
                    href="/leads/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Lead
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead._id || lead.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                          {lead.company && <p className="text-xs text-gray-400 font-medium">{lead.company}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            lead.status === "Converted"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : lead.status === "Lost"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : lead.status === "New"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : lead.status === "Contacted"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-purple-100 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {lead.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
