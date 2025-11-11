"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

interface ToastProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  duration?: number
  onClose?: () => void
}

export default function Toast({ type, message, duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    const base = "border-l-4 p-4 rounded-lg shadow-lg"
    switch (type) {
      case "success":
        return `${base} bg-green-50 border-green-500`
      case "error":
        return `${base} bg-red-50 border-red-500`
      case "warning":
        return `${base} bg-yellow-50 border-yellow-500`
      default:
        return `${base} bg-blue-50 border-blue-500`
    }
  }

  if (!visible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={getStyles()}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setVisible(false)
                setTimeout(() => onClose?.(), 300)
              }}
              className="inline-flex text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook para usar toast
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    message: string
  }>>([])

  const addToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return {
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message),
    warning: (message: string) => addToast("warning", message),
    info: (message: string) => addToast("info", message),
    ToastContainer
  }
}