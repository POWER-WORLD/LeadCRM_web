"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import type { LeadStatus, LEAD_STATUSES } from "@/types/lead"
import Breadcrumb from "@/components/breadcrumb"

interface FormState {
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  notes: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: string
  notes?: string
  general?: string
}

export default function NewLeadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    notes: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters long"
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com)"
    }

    // Phone validation
    const phoneRegex = /^(\+?[0-9]{1,4}[\s-]?)?(\(?[0-9]{1,4}\)?[\s-]?)?[0-9\s-]{6,15}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (e.g. +1 555-0199 or 555-1234)"
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required"
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = "Lead status is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await apiClient.createLead({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      })

      if (response.success) {
        setShowSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          status: "New",
          notes: "",
        })

        setTimeout(() => {
          router.push("/leads")
        }, 1500)
      } else {
        const errorMsg = response.error || "Failed to create lead"
        if (errorMsg.toLowerCase().includes("email")) {
          setErrors({ email: errorMsg })
        } else {
          setErrors({ general: errorMsg })
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected connection error"
      setErrors({ general: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
    }
  }

  return (
    <>
      <Breadcrumb />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="max-w-2xl mx-auto mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Add New Lead
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Capture prospect details to register them in the sales pipeline
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Success Notification */}
            {showSuccess && (
              <div
                role="status"
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 shadow-sm animate-in fade-in"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">Lead Created Successfully!</p>
                  <p className="text-xs text-emerald-700">Redirecting to lead directory...</p>
                </div>
              </div>
            )}

            {/* General Error Notice */}
            {errors.general && (
              <div
                role="alert"
                className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 shadow-sm"
              >
                <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Lead Details & Contact Information
                </h2>
                <p className="text-xs text-blue-100 mt-1">Fields marked with an asterisk (*) are required</p>
              </div>

              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.name ? "border-rose-400 focus:border-rose-500 bg-rose-50/20" : "border-gray-200"
                      }`}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      placeholder="e.g. john@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.email ? "border-rose-400 focus:border-rose-500 bg-rose-50/20" : "border-gray-200"
                      }`}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      placeholder="e.g. +1 555-0123"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.phone ? "border-rose-400 focus:border-rose-500 bg-rose-50/20" : "border-gray-200"
                      }`}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.company}
                      aria-describedby={errors.company ? "company-error" : undefined}
                      placeholder="e.g. Acme Corporation"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.company ? "border-rose-400 focus:border-rose-500 bg-rose-50/20" : "border-gray-200"
                      }`}
                    />
                    {errors.company && (
                      <p id="company-error" className="text-xs font-medium text-rose-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.company}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                      Initial Lead Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value as LeadStatus)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="New">New (Fresh prospect)</option>
                      <option value="Contacted">Contacted (Outreach initiated)</option>
                      <option value="Qualified">Qualified (Fit confirmed)</option>
                      <option value="Converted">Converted (Deal closed)</option>
                      <option value="Lost">Lost (Opportunity closed)</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                      Notes & Context <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Add details on source, requirements, or conversation summaries..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  {/* Submit and Cancel Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving Lead...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Save & Register Lead</span>
                        </>
                      )}
                    </button>
                    <Link
                      href="/leads"
                      className="flex-1 text-center border border-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
