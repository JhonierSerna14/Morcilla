"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ActiveBatchRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const fetchActiveAndRedirect = async () => {
      try {
        const res = await fetch('/api/batches/active')
        if (res.ok) {
          const data = await res.json()
          if (data.activeBatch?.id) {
            router.replace(`/batches/${data.activeBatch.id}`)
            return
          }
        }
        // Si no hay tanda activa o error, ir al listado de tandas
        router.replace('/batches')
      } catch (error) {
        router.replace('/batches')
      }
    }

    fetchActiveAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirigiendo a la tanda activa...</p>
      </div>
    </div>
  )
}
