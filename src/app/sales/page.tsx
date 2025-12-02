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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!activeBatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay tanda activa
            </h3>
            <p className="text-muted-foreground text-center mb-6 text-base">
              Debes crear una tanda de producción antes de registrar ventas
            </p>
            <Button onClick={() => window.location.href = "/dashboard"} size="lg" className="text-base">
              ➡️ Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      {/* Header */}
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5">
            <h1 className="text-3xl font-bold text-foreground">🛒 Nueva Venta</h1>
            <p className="text-muted-foreground text-base mt-1">
              Tanda Activa: <span className="font-semibold text-foreground">📦 {formatBatchName(activeBatch)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">📋 Registrar Venta de Morcilla</CardTitle>
            <CardDescription className="text-base">
              Completa la información de la venta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  👤 Cliente *
                </label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-5 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <div>
                      <div className="font-semibold text-base text-foreground">{selectedCustomer.name}</div>
                      {selectedCustomer.phone && (
                        <div className="text-sm text-muted-foreground mt-1">📱 {selectedCustomer.phone}</div>
                      )}
                      <div className="text-sm text-muted-foreground mt-2">
                        ⏳ Deuda: <span className={`font-semibold ${
                          Number(selectedCustomer.totalDebt) > 0 ? 'text-destructive' : 'text-accent'
                        }`}>
                          ${Number(selectedCustomer.totalDebt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setSearchCustomer("")
                      }}
                      className="text-base"
                    >
                      🔄 Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="🔍 Buscar cliente por nombre o teléfono..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="pl-12 text-base"
                      aria-label="Buscar cliente por nombre o teléfono"
                      aria-expanded={filteredCustomers.length > 0}
                    />
                    {filteredCustomers.length > 0 && (
                      <div
                        role="listbox"
                        aria-label="Resultados de búsqueda de clientes"
                        className="w-full mt-2 border-2 border-border rounded-lg bg-background shadow-sm max-h-60 overflow-auto"
                      >
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            role="option"
                            aria-selected={selectedCustomer?.id === customer.id}
                            className="w-full text-left px-5 py-4 hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setSearchCustomer("")
                            }}
                          >
                            <div className="font-semibold text-base text-foreground">{customer.name}</div>
                            {customer.phone && (
                              <div className="text-sm text-muted-foreground mt-1">📱 {customer.phone}</div>
                            )}
                            <div className="text-sm text-muted-foreground mt-2">
                              ⏳ Deuda: <span className={`font-semibold ${
                                Number(customer.totalDebt) > 0 ? 'text-destructive' : 'text-accent'
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
                  <label className="block text-base font-semibold text-foreground mb-2">
                    ⚖️ Cantidad (libras) *
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                      className="pl-12 text-base"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">📌 Solo libras enteras (1, 2, 3...)</p>
                </div>

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    💵 Precio por libra *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="11000"
                      value={saleForm.pricePerPound}
                      onChange={(e) =>
                        setSaleForm({ ...saleForm, pricePerPound: e.target.value })
                      }
                      className="pl-12 text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  📋 Estado del pago *
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
                  className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="PAID">✅ Pagado (inmediato)</option>
                  <option value="PENDING">⏳ A crédito</option>
                </select>
              </div>

              {/* Payment Method - Solo mostrar si es pago inmediato */}
              {saleForm.paymentStatus === "PAID" && (
                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">
                    💳 ¿Cómo pagó? *
                  </label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, paymentMethod: e.target.value })
                    }
                    className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="NEQUI">📱 Nequi</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  📝 Notas (opcional)
                </label>
                <textarea
                  placeholder="Ej: Cliente pidió que le deje 1 libra para la próxima tanda..."
                  value={saleForm.notes}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, notes: e.target.value })
                  }
                  className="w-full h-24 px-4 py-2 border-2 border-border rounded-lg bg-background text-foreground text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              {/* Total Calculator */}
              {saleForm.pounds && saleForm.pricePerPound && (
                <div className="bg-primary/10 rounded-lg p-6 border-2 border-primary/30">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-muted-foreground">⚖️ Libras:</span>
                      <span className="text-lg font-semibold text-foreground">{saleForm.pounds} lb</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-muted-foreground">💵 Precio/lb:</span>
                      <span className="text-lg font-semibold text-foreground">
                        ${parseInt(saleForm.pricePerPound).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-primary/20 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-foreground">💰 Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="text-base h-12"
                >
                  ❌ Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !selectedCustomer}
                  className="text-base h-12 px-8"
                >
                  {saving ? "⏳ Guardando..." : "✅ Registrar Venta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}