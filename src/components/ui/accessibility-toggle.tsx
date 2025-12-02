"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default function AccessibilityToggle() {
  const [largeMode, setLargeMode] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false
      return localStorage.getItem('largeMode') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      if (largeMode) document.documentElement.classList.add('large-mode')
      else document.documentElement.classList.remove('large-mode')
    } catch {}
  }, [largeMode])

  const toggle = () => {
    const next = !largeMode
    setLargeMode(next)
    try {
      localStorage.setItem('largeMode', next ? 'true' : 'false')
      if (next) document.documentElement.classList.add('large-mode')
      else document.documentElement.classList.remove('large-mode')
    } catch {}
  }

  return (
    <Button
      variant={largeMode ? 'default' : 'secondary'}
      size={'sm'}
      className="h-10"
      onClick={toggle}
      aria-pressed={largeMode}
      title={largeMode ? 'Modo grande activado' : 'Activar modo grande'}
    >
      <Eye className="w-4 h-4 mr-2" />
      {largeMode ? 'Modo Grande' : 'Texto Grande'}
    </Button>
  )
}

export { AccessibilityToggle }
