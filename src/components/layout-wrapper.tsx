"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import MobileNavigation, { DesktopNavigation } from "@/components/navigation"

const publicPaths = ["/", "/login", "/register"]

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const isPublicPath = publicPaths.includes(pathname)
  const shouldShowNavigation = session && !isPublicPath

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavigation && <DesktopNavigation />}
      
      <main className={shouldShowNavigation ? "pb-20 lg:pb-0" : ""}>
        {children}
      </main>
      
      {shouldShowNavigation && <MobileNavigation />}
    </div>
  )
}