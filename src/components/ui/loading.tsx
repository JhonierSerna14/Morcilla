import { Scale } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = "md", 
  message = "Cargando...",
  fullScreen = true 
}: LoadingSpinnerProps) {
  const getSizes = () => {
    switch (size) {
      case "sm":
        return { spinner: "h-8 w-8", text: "text-sm" }
      case "lg":
        return { spinner: "h-16 w-16", text: "text-lg" }
      default:
        return { spinner: "h-12 w-12", text: "text-base" }
    }
  }

  const sizes = getSizes()
  
  const spinner = (
    <div className="text-center">
      <div className="relative">
        {/* Spinner principal */}
        <div className={`${sizes.spinner} border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4`}></div>
        
        {/* Icono de morcilla en el centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Scale className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      <p className={`${sizes.text} text-muted-foreground font-medium`}>{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}

// Loading específico para botones
export function ButtonLoading({ message = "Procesando..." }: { message?: string }) {
  return (
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
      {message}
    </div>
  )
}

// Loading para cards
export function CardLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}