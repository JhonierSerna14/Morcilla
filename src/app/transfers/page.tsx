"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'

// Transfer page now redirects to /cash

export default function TransfersPage() {
  // Esta página fue consolidada en /cash (Movimientos).
  // Para evitar duplicar interfaces, redirigimos al usuario a /cash.
  const router = useRouter()
  useEffect(() => { router.replace('/cash') }, [router])
  return null
}
