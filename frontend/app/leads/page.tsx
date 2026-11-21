import { Suspense } from "react"
import LeadsClient from "./leads-client"
import Breadcrumb from "@/components/breadcrumb"
import Loading from "./loading"

export const metadata = {
  title: "Leads Directory",
  description: "Browse, search, filter, and manage your CRM leads.",
}

export default function LeadsPage() {
  return (
    <>
      <Breadcrumb />
      <Suspense fallback={<Loading />}>
        <LeadsClient />
      </Suspense>
    </>
  )
}
