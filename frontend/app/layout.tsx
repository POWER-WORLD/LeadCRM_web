import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LeadCRM - Lead Management System",
  description: "Streamline your sales process with comprehensive lead tracking and management",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
