import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

const MobileFormField = React.forwardRef<HTMLDivElement, MobileFormFieldProps>(
  ({ className, label, required, error, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        <label className="block text-base font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {error && (
          <p className="text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}
      </div>
    )
  }
)
MobileFormField.displayName = "MobileFormField"

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileInput.displayName = "MobileInput"

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const MobileSelect = React.forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none touch-manipulation",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
MobileSelect.displayName = "MobileSelect"

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const MobileTextarea = React.forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y touch-manipulation",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileTextarea.displayName = "MobileTextarea"

// Componente contenedor para formularios móviles
interface MobileFormContainerProps extends React.HTMLAttributes<HTMLFormElement> {
  title?: string
  subtitle?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
}

const MobileFormContainer = React.forwardRef<HTMLFormElement, MobileFormContainerProps>(
  ({ className, title, subtitle, children, onSubmit, ...props }, ref) => {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-md mx-auto">
          {(title || subtitle) && (
            <div className="mb-8 text-center">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <form
              className={cn("p-6 space-y-6", className)}
              onSubmit={onSubmit}
              ref={ref}
              {...props}
            >
              {children}
            </form>
          </div>
        </div>
      </div>
    )
  }
)
MobileFormContainer.displayName = "MobileFormContainer"

export { MobileFormField, MobileInput, MobileSelect, MobileTextarea, MobileFormContainer }