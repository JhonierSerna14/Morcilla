"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calculator, DollarSign, Scale, AlertCircle } from "lucide-react"
import { formatBatchName } from "@/lib/batch-utils"

interface Customer {
  id: string
  name: string
  phone?: string
  totalDebt: number
}

interface ActiveBatch {
  id: string
  name: string
  number: number
  productionDate: string
}

export default function SalesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [activeBatch, setActiveBatch] = useState<ActiveBatch | null>(null)
  const [searchCustomer, setSearchCustomer] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [saleForm, setSaleForm] = useState({
    pounds: "",
    pricePerPound: "11000", // Precio por defecto
    paymentMethod: "EFECTIVO",
    paymentStatus: "PAID",
    notes: ""
  })

  useEffect(() => {
    Promise.all([
      fetchCustomers(),
      fetchActiveBatch()
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

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
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

  const calculateTotal = () => {
    const pounds = parseFloat(saleForm.pounds) || 0
    const pricePerPound = parseFloat(saleForm.pricePerPound) || 0
    return pounds * pricePerPound
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones con mensajes más amigables
    if (!selectedCustomer) {
      alert("⚠️ Primero debes buscar y seleccionar un cliente")
      return
    }

    if (!activeBatch) {
      alert("❌ No hay tanda activa. Ve al Dashboard y crea una nueva tanda antes de registrar ventas.")
      return
    }

    const pounds = parseInt(saleForm.pounds)
    const pricePerPound = parseFloat(saleForm.pricePerPound)

    if (!pounds || pounds <= 0 || !Number.isInteger(pounds)) {
      alert("❌ Por favor ingresa una cantidad de libras válida (números enteros: 1, 2, 3...)")
      return
    }

    if (pounds > 50) {
      const confirm = window.confirm("⚠️ Estás registrando más de 50 libras. ¿Estás seguro?")
      if (!confirm) return
    }

    // Validar método de pago si es pago inmediato
    if (saleForm.paymentStatus === "PAID" && !saleForm.paymentMethod) {
      alert("❌ Debes seleccionar cómo pagó el cliente")
      return
    }

    if (!pricePerPound || pricePerPound <= 0) {
      alert("❌ Por favor ingresa un precio por libra válido (mayor a 0)")
      return
    }

    if (pricePerPound < 5000) {
      const confirm = window.confirm("⚠️ El precio por libra parece muy bajo. ¿Estás seguro?")
      if (!confirm) return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          pounds,
          pricePerPound,
          paymentMethod: saleForm.paymentMethod,
          paymentStatus: saleForm.paymentStatus,
          notes: saleForm.notes || null,
        }),
      })

      if (response.ok) {
        // Mostrar mensaje de éxito más detallado
        const total = pounds * pricePerPound
        alert(`✅ ¡Venta registrada exitosamente!\n\n` +
              `Cliente: ${selectedCustomer.name}\n` +
              `Cantidad: ${pounds} libras\n` +
              `Total: $${total.toLocaleString()}\n` +
              `Estado: ${saleForm.paymentStatus === 'PAID' ? 'Pagado' : 'A crédito'}`)
        
        // Reset form
        setSaleForm({
          pounds: "",
          pricePerPound: "11000",
          paymentMethod: "EFECTIVO",
          paymentStatus: "PAID",
          notes: ""
        })
        setSelectedCustomer(null)
        setSearchCustomer("")
        
        // Refresh customers to update debt totals
        fetchCustomers()
      } else {
        const error = await response.json()
        alert(`❌ Error al registrar la venta:\n${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error creating sale:", error)
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

  if (!activeBatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tanda activa
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Debes crear una tanda de producción antes de registrar ventas
            </p>
            <Button onClick={() => window.location.href = "/dashboard"}>
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Nueva Venta</h1>
            <p className="text-gray-600">
              Tanda Activa: <span className="font-semibold">{formatBatchName(activeBatch)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Venta de Morcilla</CardTitle>
            <CardDescription>
              Completa la información de la venta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cliente *
                </label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border">
                    <div>
                      <div className="font-medium">{selectedCustomer.name}</div>
                      {selectedCustomer.phone && (
                        <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                      )}
                      <div className="text-sm">
                        Deuda actual: <span className={`font-semibold ${
                          Number(selectedCustomer.totalDebt) > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${Number(selectedCustomer.totalDebt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setSearchCustomer("")
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar cliente por nombre o teléfono..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="pl-10 h-12"
                    />
                    {filteredCustomers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setSearchCustomer("")
                            }}
                          >
                            <div className="font-medium">{customer.name}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-600">{customer.phone}</div>
                            )}
                            <div className="text-sm">
                              Deuda: <span className={`font-semibold ${
                                Number(customer.totalDebt) > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ${Number(customer.totalDebt).toLocaleString()}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sale Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cantidad (libras) *
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="1"
                      value={saleForm.pounds}
                      onChange={(e) => {
                        // Solo permitir números enteros
                        const value = e.target.value.replace(/\D/g, '')
                        setSaleForm({ ...saleForm, pounds: value })
                      }}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Solo libras enteras (1, 2, 3...)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio por libra *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="11000"
                      value={saleForm.pricePerPound}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, pricePerPound: e.target.value })
                      }
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estado del pago *
                </label>
                <select
                  value={saleForm.paymentStatus}
                  onChange={(e) => {
                    setSaleForm({ 
                      ...saleForm, 
                      paymentStatus: e.target.value,
                      // Reset payment method cuando cambia el status
                      paymentMethod: e.target.value === "PAID" ? "EFECTIVO" : ""
                    })
                  }}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="PAID">Pagado (inmediato)</option>
                  <option value="PENDING">A crédito</option>
                </select>
              </div>

              {/* Payment Method - Solo mostrar si es pago inmediato */}
              {saleForm.paymentStatus === "PAID" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ¿Cómo pagó? *
                  </label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, paymentMethod: e.target.value })
                    }
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="NEQUI">Nequi</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notas (opcional)
                </label>
                <Input
                  placeholder="Observaciones adicionales..."
                  value={saleForm.notes}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, notes: e.target.value })
                  }
                  className="h-12"
                />
              </div>

              {/* Total Calculator */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-lg font-medium">Total:</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${calculateTotal().toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !selectedCustomer}
                  size="lg"
                >
                  {saving ? "Guardando..." : "Registrar Venta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}