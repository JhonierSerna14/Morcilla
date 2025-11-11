"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Users, Phone, MapPin, DollarSign } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
  totalDebt: number
  totalPaid: number
  sales: any[]
  collections: any[]
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showOnlyWithDebt, setShowOnlyWithDebt] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Form states
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    fetchCustomers()
  }, [search, showOnlyWithDebt])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (showOnlyWithDebt) params.append("onlyWithDebt", "true")
      
      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCustomer.name.trim()) {
      alert("❌ El nombre del cliente es obligatorio")
      return
    }

    if (newCustomer.name.trim().length < 2) {
      alert("❌ El nombre debe tener al menos 2 caracteres")
      return
    }

    // Validar teléfono si se proporciona
    if (newCustomer.phone && newCustomer.phone.length > 0 && newCustomer.phone.length < 7) {
      alert("❌ El teléfono debe tener al menos 7 dígitos")
      return
    }

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      })

      if (response.ok) {
        alert(`✅ ¡Cliente creado exitosamente!\n\nNombre: ${newCustomer.name.trim()}`)
        
        setNewCustomer({ name: "", phone: "", address: "" })
        setShowCreateForm(false)
        fetchCustomers()
      } else {
        const error = await response.json()
        alert(`❌ Error al crear cliente:\n${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error creating customer:", error)
      alert("❌ Error de conexión. Verifica tu internet y vuelve a intentar.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-gray-600">
                Gestiona la información de tus clientes
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant={showOnlyWithDebt ? "default" : "outline"}
            onClick={() => setShowOnlyWithDebt(!showOnlyWithDebt)}
            size="lg"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {showOnlyWithDebt ? "Ver Todos" : "Solo Deudores"}
          </Button>
        </div>

        {/* Create Customer Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nuevo Cliente</CardTitle>
              <CardDescription>
                Ingresa la información del nuevo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre *
                    </label>
                    <Input
                      placeholder="Nombre del cliente"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Teléfono (opcional)
                    </label>
                    <Input
                      placeholder="Número de teléfono"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Dirección (opcional)
                    </label>
                    <Input
                      placeholder="Dirección"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, address: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewCustomer({ name: "", phone: "", address: "" })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Cliente</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Customers List */}
        {customers.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search || showOnlyWithDebt ? "No se encontraron clientes" : "No hay clientes registrados"}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {search || showOnlyWithDebt 
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Crea tu primer cliente para comenzar a registrar ventas"
                }
              </p>
              {!search && !showOnlyWithDebt && (
                <Button onClick={() => setShowCreateForm(true)} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <div className="space-y-1 text-sm text-gray-600">
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {customer.address}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        Number(customer.totalDebt) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${Number(customer.totalDebt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Debe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${Number(customer.totalPaid).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Pagado</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ventas:</span>
                      <span className="font-medium">{customer.sales.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cobros:</span>
                      <span className="font-medium">{customer.collections.length}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push(`/customers/detail?id=${customer.id}`)}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}