"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ThemeToggle from "@/components/ui/theme-toggle"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log('Iniciando sesión...', { email, from })
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: from,
      })

      console.log('Resultado del login:', result)

      if (result?.error) {
        console.error('Error de autenticación:', result.error)
        setError("Email o contraseña incorrectos")
      } else if (result?.ok) {
        console.log('Login exitoso, redirigiendo...', result)
        // Esperar un poco más para que se establezca la sesión
        setTimeout(() => {
          // Forzar navegación completa para refrescar el estado
          window.location.replace(result?.url || from)
        }, 200)
      } else {
        console.log('Resultado inesperado:', result)
        setError("Error inesperado al iniciar sesión")
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error)
      setError("Error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-3">
            <img src="/marranito.svg" alt="Marranito" className="w-10 h-10" />
            <CardTitle className="text-2xl font-bold text-foreground">Gestión Familiar Morcilla</CardTitle>
          </div>
          <CardDescription className="text-center text-base mt-1">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-semibold text-foreground">
                📧 Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-semibold text-foreground">
                🔐 Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              disabled={loading}
            >
              {loading ? "⏳ Iniciando sesión..." : "✅ Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}