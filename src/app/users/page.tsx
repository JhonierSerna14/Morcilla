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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Solo los administradores pueden gestionar usuarios</p>
          <Button onClick={() => router.push("/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">
              Crear y administrar usuarios del sistema
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Crear Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Crear Nuevo Usuario
              </CardTitle>
              <CardDescription>
                Registra un nuevo vendedor, cobrador o administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre completo *
                  </label>
                  <Input
                    placeholder="Ej: Juan Pérez"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="juan@correo.com"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rol *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="COBRADOR">Cobrador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  size="lg"
                  className="w-full"
                >
                  {saving ? "Creando usuario..." : "Crear Usuario"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Usuarios Registrados ({users.length})
              </CardTitle>
              <CardDescription>
                Administra los usuarios existentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border ${
                      user.active
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          user.active ? "text-gray-900" : "text-gray-500"
                        }`}>
                          {user.name}
                        </h3>
                        <p className={`text-sm ${
                          user.active ? "text-gray-600" : "text-gray-400"
                        }`}>
                          {user.email}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "VENDEDOR"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {user.role}
                          </span>
                          <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                            user.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Creado: {new Date(user.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button
                          onClick={() => toggleUserStatus(user.id, user.active)}
                          variant={user.active ? "outline" : "default"}
                          size="sm"
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
                              <X className="w-4 h-4 mr-1" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Activar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay usuarios registrados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}