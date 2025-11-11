"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, DollarSign, Plus, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone?: string
  totalDebt: number
  totalPaid: number
}

interface Collection {
  id: string
  amount: number
  paymentMethod: string
  collectionDate: string
  notes?: string
  customer: {
    id: string
    name: string
  }
  batch?: {
    name: string
  }
}

interface ActiveBatch {
  id: string
  name: string
  number: number
}

export default function CollectionsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeBatch, setActiveBatch] = useState<ActiveBatch | null>(null)
  const [searchCustomer, setSearchCustomer] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form states
  const [collectionForm, setCollectionForm] = useState({
    amount: "",
    paymentMethod: "EFECTIVO",
    notes: ""
  })

  useEffect(() => {
    Promise.all([
      fetchCustomersWithDebt(),
      fetchActiveBatch(),
      fetchCollections()
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (searchCustomer.trim()) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchCustomer))
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers([])
    }
  }, [searchCustomer, customers])

  const fetchCustomersWithDebt = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      const customersWithDebt = data.filter((c: Customer) => c.totalDebt > 0)
      setCustomers(customersWithDebt)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchActiveBatch = async () => {
    try {
      const response = await fetch("/api/batches/active")
      const data = await response.json()
      setActiveBatch(data.activeBatch)
    } catch (error) {
      console.error("Error fetching active batch:", error)
    }
  }

  const fetchCollections = async () => {
    try {
      const response = await fetch("/api/collections")
      const data = await response.json()
      setCollections(data)
    } catch (error) {
      console.error("Error fetching collections:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      alert("⚠️ Primero debes buscar y seleccionar un cliente")
      return
    }

    if (selectedCustomer.totalDebt === 0) {
      alert("ℹ️ Este cliente no tiene deudas pendientes")
      return
    }

    const amount = parseFloat(collectionForm.amount)

    if (!amount || amount <= 0) {
      alert("❌ Por favor ingresa un monto válido (mayor a 0)")
      return
    }

    if (amount > selectedCustomer.totalDebt) {
      alert(`❌ El monto no puede ser mayor a la deuda del cliente\n\n` +
            `Deuda actual: $${selectedCustomer.totalDebt.toLocaleString()}\n` +
            `Monto ingresado: $${amount.toLocaleString()}`)
      return
    }

    // Confirmación para pagos grandes
    if (amount > 500000) {
      const confirm = window.confirm(`⚠️ Estás registrando un cobro de $${amount.toLocaleString()}. ¿Estás seguro?`)
      if (!confirm) return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          amount: amount,
          paymentMethod: collectionForm.paymentMethod,
          batchId: activeBatch?.id || null,
          notes: collectionForm.notes,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)

        // Mostrar mensaje de éxito detallado
        const remainingDebt = selectedCustomer.totalDebt - amount
        alert(`✅ ¡Cobro registrado exitosamente!\n\n` +
              `Cliente: ${selectedCustomer.name}\n` +
              `Monto cobrado: $${amount.toLocaleString()}\n` +
              `Método: ${collectionForm.paymentMethod}\n` +
              `${remainingDebt > 0 ? `Deuda restante: $${remainingDebt.toLocaleString()}` : '🎉 Cliente al día!'}`)

        // Reset form
        setCollectionForm({
          amount: "",
          paymentMethod: "EFECTIVO",
          notes: ""
        })
        setSelectedCustomer(null)
        setSearchCustomer("")

        // Refresh data
        fetchCustomersWithDebt()
        fetchCollections()
      } else {
        const error = await response.json()
        alert(`❌ Error al registrar el cobro:\n${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error de conexión. Verifica tu internet y vuelve a intentar.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Cobrar Deudas</h1>
            <p className="text-gray-600">
              Registra los pagos de clientes que compraron a crédito
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center justify-center py-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">¡Cobro registrado exitosamente!</span>
            </CardContent>
          </Card>
        )}

        {/* Registro de Cobro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Registrar Cobro
            </CardTitle>
            <CardDescription>
              {activeBatch 
                ? `Tanda activa: ${activeBatch.name}` 
                : "No hay tanda activa"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buscar Cliente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Cliente con Deuda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Lista de clientes filtrados */}
              {filteredCustomers.length > 0 && (
                <div className="border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setSearchCustomer(customer.name)
                        setFilteredCustomers([])
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">
                            ${customer.totalDebt.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Debe</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-blue-900">{selectedCustomer.name}</h3>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      ${selectedCustomer.totalDebt.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Deuda Total</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Monto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto a Cobrar</label>
                <Input
                  type="number"
                  placeholder="Ej: 25000"
                  value={collectionForm.amount}
                  onChange={(e) => setCollectionForm({...collectionForm, amount: e.target.value})}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Pago</label>
                <select
                  value={collectionForm.paymentMethod}
                  onChange={(e) => setCollectionForm({...collectionForm, paymentMethod: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="NEQUI">📱 Nequi</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                </select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (Opcional)</label>
                <Input
                  placeholder="Información adicional..."
                  value={collectionForm.notes}
                  onChange={(e) => setCollectionForm({...collectionForm, notes: e.target.value})}
                />
              </div>

              <Button 
                type="submit" 
                disabled={!selectedCustomer || saving}
                className="w-full py-6 text-lg"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Registrar Cobro
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resumen de Clientes con Deuda */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes con Deudas Pendientes</CardTitle>
            <CardDescription>
              {customers.length} clientes deben un total de ${customers.reduce((sum, c) => sum + c.totalDebt, 0).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">¡Excelente! No hay deudas pendientes</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {customers.slice(0, 10).map((customer) => (
                  <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      {customer.phone && (
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        ${customer.totalDebt.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {customers.length > 10 && (
                  <div className="text-center text-gray-500 text-sm py-2">
                    Y {customers.length - 10} clientes más...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Cobros Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Cobros Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay cobros registrados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {collections.slice(0, 5).map((collection) => (
                  <div key={collection.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium">{collection.customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(collection.collectionDate).toLocaleDateString('es-CO')} - {collection.paymentMethod}
                      </div>
                      {collection.batch && (
                        <div className="text-xs text-blue-600">{collection.batch.name}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        +${collection.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}