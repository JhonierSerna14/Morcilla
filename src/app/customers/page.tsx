"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Users, Phone, MapPin, DollarSign, AlertCircle } from "lucide-react"

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

function CustomersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showOnlyWithDebt, setShowOnlyWithDebt] = useState(searchParams.get('onlyWithDebt') === 'true')
  const [showOnlyPaid, setShowOnlyPaid] = useState(searchParams.get('onlyPaid') === 'true')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Refs
  const customersListRef = useRef<HTMLDivElement | null>(null)

  // Form states
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    fetchCustomers()
  }, [search, showOnlyWithDebt, showOnlyPaid])

  // Scroll to customers list when opened from dashboard with onlyWithDebt filter
  useEffect(() => {
    if (showOnlyWithDebt) {
      // Allow time for list to render
      setTimeout(() => {
        customersListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [showOnlyWithDebt, customers])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (showOnlyWithDebt) params.append("onlyWithDebt", "true")
      if (showOnlyPaid) params.append("onlyPaid", "true")
      
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      {/* Header */}
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5 gap-4 flex-col sm:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-foreground">👥 Clientes</h1>
              <p className="text-muted-foreground text-base mt-1">
                Gestiona la información de tus clientes
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} size="lg" className="text-base whitespace-nowrap">
              ➕ Nuevo Cliente
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="🔍 Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 text-base"
            />
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(showOnlyWithDebt || showOnlyPaid) && (
          <div className="mb-6 flex items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center text-primary font-medium">
              <AlertCircle className="w-5 h-5 mr-2" />
              {showOnlyWithDebt ? "Mostrando solo clientes con deuda" : "Mostrando solo clientes al día"}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowOnlyWithDebt(false)
                setShowOnlyPaid(false)
                router.replace('/customers')
              }}
              className="text-primary hover:text-primary/80"
            >
              Ver todos los clientes
            </Button>
          </div>
        )}

        {/* Create Customer Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">👤 Nuevo Cliente</CardTitle>
              <CardDescription>
                Ingresa la información del nuevo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base font-semibold text-foreground mb-2">
                      👤 Nombre *
                    </label>
                    <Input
                      placeholder="Nombre del cliente"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-foreground mb-2">
                      📞 Teléfono (opcional)
                    </label>
                    <Input
                      placeholder="Número de teléfono"
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, phone: e.target.value })
                      }
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-foreground mb-2">
                      🏠 Dirección (opcional)
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
          <Card className="border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {search || showOnlyWithDebt ? "🔍 No se encontraron clientes" : "👥 No hay clientes registrados"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {search || showOnlyWithDebt 
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Crea tu primer cliente para comenzar a registrar ventas"
                }
              </p>
              {!search && !showOnlyWithDebt && (
                <Button onClick={() => setShowCreateForm(true)} size="lg" className="text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  ➕ Crear Primer Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div ref={customersListRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">👤 {customer.name}</CardTitle>
                  <div className="space-y-1 text-sm text-muted-foreground">
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
                        Number(customer.totalDebt) > 0 ? 'text-destructive' : 'text-accent'
                      }`}>
                        ${Number(customer.totalDebt).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">💰 Debe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${Number(customer.totalPaid).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">✅ Pagado</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">🛒 Ventas:</span>
                      <span className="font-medium text-foreground">{customer.sales.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">💳 Cobros:</span>
                      <span className="font-medium text-foreground">{customer.collections.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full text-base" 
                      size="sm"
                      onClick={() => router.push(`/customers/detail?id=${customer.id}`)}
                    >
                      👁️ Ver Detalle
                    </Button>

                    {showOnlyWithDebt && Number(customer.totalDebt) > 0 && (
                      <Button
                        className="w-full text-base"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const params = new URLSearchParams({
                            customerId: customer.id,
                            customerName: customer.name,
                            amount: Math.floor(Number(customer.totalDebt)).toString()
                          })
                          router.push(`/collections?${params.toString()}`)
                        }}
                      >
                        💸 Cobrar
                      </Button>
                    )}
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

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base">Cargando...</p>
        </div>
      </div>
    }>
      <CustomersContent />
    </Suspense>
  )
}
