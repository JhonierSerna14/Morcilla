import { Suspense } from "react"
import CollectionsClient from "@/components/collections-client"

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <CollectionsClient />
    </Suspense>
  )
}
