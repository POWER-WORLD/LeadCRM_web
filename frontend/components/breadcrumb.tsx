"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }]

    if (pathSegments.length === 0) {
      return [{ label: "Dashboard" }]
    }

    let currentPath = ""
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`

      let label = segment.charAt(0).toUpperCase() + segment.slice(1)

      if (segment === "leads" && pathSegments[index + 1] === "new") {
        return
      }

      if (segment === "new" && pathSegments[index - 1] === "leads") {
        label = "Add New Lead"
      } else if (segment === "leads") {
        label = "Leads Directory"
      }

      if (index === pathSegments.length - 1) {
        breadcrumbs.push({ label })
      } else {
        breadcrumbs.push({ label, href: currentPath })
      }
    })

    return breadcrumbs
  }

  const breadcrumbItems = items || generateBreadcrumbs()

  return (
    <nav aria-label="Breadcrumb" className="bg-white/80 backdrop-blur-xs border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <ol className="flex items-center space-x-2 text-xs font-medium text-gray-500">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1
            return (
              <li key={index} className="flex items-center" aria-current={isLast ? "page" : undefined}>
                {index > 0 && (
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 mx-1.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {item.href && !isLast ? (
                  <Link href={item.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-semibold">{item.label}</span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
