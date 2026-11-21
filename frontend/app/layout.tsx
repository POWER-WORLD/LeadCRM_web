import type React from "react"
import type { Metadata, Viewport } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import "@/styles/globals.css"

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://lead-crm-web.vercel.app"),
  title: {
    default: "LeadCRM - Modern Full-Stack Lead Management System",
    template: "%s | LeadCRM",
  },
  description:
    "Production-ready Lead Management CRM with real-time tracking, conversion analytics, advanced filtering, and pipeline management.",
  keywords: [
    "Lead Management",
    "CRM",
    "Sales Pipeline",
    "Customer Management",
    "Next.js CRM",
    "Full Stack CRM",
  ],
  authors: [{ name: "Pawan Kumar", url: "https://pawankumar.info/" }],
  creator: "Pawan Kumar",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://leadcrm101.vercel.app/",
    title: "LeadCRM - Modern Full-Stack Lead Management System",
    description:
      "Streamline customer acquisition and track conversions effortlessly with the LeadCRM management platform.",
    siteName: "LeadCRM",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadCRM - Modern Full-Stack Lead Management System",
    description: "Streamline customer acquisition and track conversions effortlessly.",
    creator: "@pawankumar",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md m-2"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
