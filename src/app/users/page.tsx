"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Users, Check, X, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VENDEDOR"
  })

  useEffect(() => {
    // Verificar que el usuario es admin
    if (session && session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchUsers().finally(() => setLoading(false))
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userForm.name.trim()) {
      alert("❌ El nombre es obligatorio")
      return
    }

    if (!userForm.email.trim()) {
      alert("❌ El email es obligatorio")
      return
    }

    if (!userForm.password.trim() || userForm.password.length < 6) {
      alert("❌ La contraseña debe tener al menos 6 caracteres")
      return
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userForm.email)) {
      alert("❌ Por favor ingresa un email válido")
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.toLowerCase().trim(),
          password: userForm.password,
          role: userForm.role,
        }),
      })

      if (response.ok) {
        alert(`✅ ¡Usuario creado exitosamente!\n\n` +
              `Nombre: ${userForm.name.trim()}\n` +
              `Email: ${userForm.email.toLowerCase().trim()}\n` +
              `Rol: ${userForm.role}\n\n` +
              `El usuario ya puede iniciar sesión con su email y contraseña.`)

        // Reset form
        setUserForm({
          name: "",
          email: "",
          password: "",
          role: "VENDEDOR"
        })

        // Refresh users list
        fetchUsers()
      } else {
        const error = await response.json()
        if (error.error === "El email ya está registrado") {
          alert("❌ Este email ya está registrado. Por favor usa otro email.")
        } else {
          alert(`❌ Error al crear el usuario:\n${error.error || "Error desconocido"}`)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error de conexión. Verifica tu internet y vuelve a intentar.")
    } finally {
      setSaving(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "activar"
    const confirm = window.confirm(`¿Estás seguro de que deseas ${action} este usuario?`)
    
    if (!confirm) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !currentStatus
        }),
      })

      if (response.ok) {
        alert(`✅ Usuario ${action}do exitosamente`)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`❌ Error al ${action} el usuario:\n${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error de conexión. Verifica tu internet y vuelve a intentar.")
    }
  }

  if (session && session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground text-base mb-6">Solo los administradores pueden gestionar usuarios</p>
          <Button onClick={() => router.push("/dashboard")} size="lg" className="text-base">
            ⬅️ Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      {/* Header */}
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5">
            <h1 className="text-3xl font-bold text-foreground">👥 Gestión de Usuarios</h1>
            <p className="text-muted-foreground text-base mt-1">
              Crear y administrar usuarios del sistema
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Crear Usuario */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserPlus className="w-6 h-6 mr-3 text-primary" />
                ✏️ Crear Nuevo Usuario
              </CardTitle>
              <CardDescription className="text-base">
                Registra un nuevo vendedor, cobrador o administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    👤 Nombre completo *
                  </label>
                  <Input
                    placeholder="Ej: Juan Pérez"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    className="text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    📧 Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="juan@correo.com"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    className="text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    🔑 Contraseña *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      className="text-base pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    👔 Rol *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    className="w-full px-4 py-3 h-12 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base bg-background text-foreground"
                    required
                  >
                    <option value="VENDEDOR">🛒 Vendedor</option>
                    <option value="COBRADOR">📱 Cobrador</option>
                    <option value="ADMIN">🔐 Administrador</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  size="lg"
                  className="w-full text-base"
                >
                  {saving ? "⏳ Creando usuario..." : "➕ Crear Usuario"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Usuarios */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="w-6 h-6 mr-3 text-primary" />
                📋 Usuarios Registrados ({users.length})
              </CardTitle>
              <CardDescription className="text-base">
                Administra los usuarios existentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-5 rounded-lg border-2 transition-all ${
                      user.active
                        ? "bg-card border-border hover:bg-muted"
                        : "bg-muted border-border opacity-75"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-base ${
                          user.active ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {user.name}
                        </h3>
                        <p className={`text-sm ${
                          user.active ? "text-muted-foreground" : "text-muted-foreground/60"
                        }`}>
                          📧 {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-secondary/20 text-secondary"
                              : user.role === "VENDEDOR"
                              ? "bg-primary/20 text-primary"
                              : "bg-accent/20 text-accent"
                          }`}>
                            {user.role === "ADMIN" ? "🔐" : user.role === "VENDEDOR" ? "🛒" : "📱"} {user.role}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            user.active
                              ? "bg-accent/20 text-accent"
                              : "bg-destructive/20 text-destructive"
                          }`}>
                            {user.active ? "✅ Activo" : "❌ Inactivo"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          📅 Creado: {new Date(user.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div className="ml-2">
                        <Button
                          onClick={() => toggleUserStatus(user.id, user.active)}
                          variant={user.active ? "outline" : "default"}
                          size="lg"
                          className="text-base"
                          disabled={user.id === session?.user?.id}
                          title={
                            user.id === session?.user?.id
                              ? "No puedes desactivarte a ti mismo"
                              : user.active
                              ? "Desactivar usuario"
                              : "Activar usuario"
                          }
                        >
                          {user.active ? (
                            <>
                              <X className="w-5 h-5 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Activar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">👤</div>
                    <p className="text-muted-foreground text-base">
                      No hay usuarios registrados aún
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}