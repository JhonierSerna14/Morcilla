"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

export default function ActiveBatchBanner() {
  const [activeBatch, setActiveBatch] = useState<{ id: string, name: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchActive = async () => {
      try {
        const res = await fetch('/api/batches/active')
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && data.activeBatch) {
          setActiveBatch({
            id: data.activeBatch.id,
            name: data.activeBatch.name
          })
        }
      } catch (e) {
        // ignore
      }
    }
    fetchActive()
    return () => { isMounted = false }
  }, [])

  if (!activeBatch) return null

  return (
    <div className="w-full bg-accent text-accent-foreground text-sm p-3 text-center">
      <Link href={`/batches/${activeBatch.id}`} className="underline font-semibold">
        Tanda activa: {activeBatch.name}
      </Link>
    </div>
  )
}

export { ActiveBatchBanner }
