"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'VENDEDOR'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Solo admins pueden acceder
  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">🚫 Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los administradores pueden crear usuarios
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Usuario ${data.user.name} creado exitosamente`)
        setFormData({
          email: '',
          name: '',
          password: '',
          role: 'VENDEDOR'
        })
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error de conexión`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card>
          <CardHeader>
            <CardTitle>👤 Crear Nuevo Usuario</CardTitle>
            <CardDescription>
              Solo administradores pueden crear usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">📧 Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full text-base"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">👤 Nombre Completo</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full text-base"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">🔐 Contraseña</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                  className="w-full text-base"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">🎯 Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="VENDEDOR">💵 Vendedor</option>
                  <option value="COBRADOR">💳 Cobrador</option>
                  <option value="ADMIN">👨‍💼 Administrador</option>
                </select>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full text-base h-12"
              >
                {loading ? "⏳ Creando usuario..." : "✅ Crear Usuario"}
              </Button>
            </form>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.includes('✅') 
                  ? 'bg-accent/10 text-accent' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                <p className="text-base font-medium">{message}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}