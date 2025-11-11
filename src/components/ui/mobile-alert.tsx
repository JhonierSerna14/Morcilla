
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"

type AlertType = "success" | "error" | "warning" | "info"

interface MobileAlertProps {
  type: AlertType
  title: string
  message?: string
  onClose?: () => void
  autoClose?: number // milisegundos
}

const alertStyles = {
  success: {
    container: "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600 dark:text-green-400"
  },
  error: {
    container: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400"
  },
  warning: {
    container: "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    icon: AlertTriangle,
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  info: {
    container: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400"
  }
}

export function MobileAlert({ type, title, message, onClose, autoClose }: MobileAlertProps) {
  const [visible, setVisible] = useState(true)
  const style = alertStyles[type]
  const IconComponent = style.icon

  // Auto close
  if (autoClose && visible) {
    setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, autoClose)
  }

  if (!visible) return null

  return (
    <div className={cn(
      "fixed top-4 left-4 right-4 z-50 p-4 rounded-xl border-2 shadow-lg animate-in slide-in-from-top-2",
      style.container
    )}>
      <div className="flex items-start">
        <IconComponent className={cn("w-6 h-6 mr-3 mt-0.5 flex-shrink-0", style.iconColor)} />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold mb-1">{title}</h3>
          {message && (
            <p className="text-sm opacity-90">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => {
              setVisible(false)
              onClose()
            }}
            className="ml-2 flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// Hook para manejar alertas
export function useMobileAlert() {
  const [alerts, setAlerts] = useState<Array<MobileAlertProps & { id: string }>>([])

  const showAlert = (alert: Omit<MobileAlertProps, 'onClose'>) => {
    const id = Date.now().toString()
    const newAlert = {
      ...alert,
      id,
      onClose: () => removeAlert(id)
    }
    
    setAlerts(prev => [...prev, newAlert])
    
    // Auto remove después de 5 segundos si no se especifica autoClose
    if (!alert.autoClose) {
      setTimeout(() => removeAlert(id), 5000)
    }
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const showSuccess = (title: string, message?: string) => {
    showAlert({ type: 'success', title, message })
  }

  const showError = (title: string, message?: string) => {
    showAlert({ type: 'error', title, message })
  }

  const showWarning = (title: string, message?: string) => {
    showAlert({ type: 'warning', title, message })
  }

  const showInfo = (title: string, message?: string) => {
    showAlert({ type: 'info', title, message })
  }

  const AlertContainer = () => (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {alerts.map(alert => (
          <MobileAlert key={alert.id} {...alert} />
        ))}
      </div>
    </div>
  )

  return {
    showSuccess,
    showError, 
    showWarning,
    showInfo,
    AlertContainer
  }
}

// Función para mostrar confirmaciones nativas mejoradas
export function showConfirm(
  title: string, 
  message: string, 
  options?: {
    confirmText?: string
    cancelText?: string
    type?: 'warning' | 'danger'
  }
): boolean {
  const { confirmText = 'Sí', cancelText = 'No', type = 'warning' } = options || {}
  
  const emoji = type === 'danger' ? '🚨' : '⚠️'
  const fullMessage = `${emoji} ${title}\n\n${message}\n\n¿Continuar?`
  
  return confirm(fullMessage)
}

// Función para mostrar alertas nativas mejoradas  
export function showNativeAlert(
  title: string,
  message?: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) {
  const emojis = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  const fullMessage = message 
    ? `${emojis[type]} ${title}\n\n${message}`
    : `${emojis[type]} ${title}`
    
  alert(fullMessage)
}