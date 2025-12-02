"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/batch-utils"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UserBalance {
  totalCash: number
  totalNequi: number
  grandTotal: number
}

export default function CashPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [movements, setMovements] = useState<any[]>([])

  const [transferForm, setTransferForm] = useState({
    toUserId: "",
    amount: "",
    paymentMethod: "EFECTIVO",
    concept: "",
    notes: ""
  })

  useEffect(() => {
    Promise.all([fetchUsers(), fetchBalance(), fetchMovements()]).finally(() => setLoading(false))
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((user: User) => user.id !== session?.user?.id))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/cash/balance")
      if (response.ok) {
        const data = await response.json()
        setBalance({
          totalCash: data.totalCash,
          totalNequi: data.totalNequi,
          grandTotal: data.grandTotal
        })
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const fetchMovements = async () => {
    try {
      const response = await fetch('/api/cash/movements')
      if (response.ok) {
        const data = await response.json()
        setMovements(data.movements || [])
      }
    } catch (error) {
      console.error('Error fetching movements:', error)
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(transferForm.amount)
    if (!amount || amount <= 0) {
      alert("❌ Por favor ingresa un monto válido (mayor a 0)")
      return
    }

    if (!transferForm.toUserId) {
      alert("❌ Por favor selecciona un usuario para transferir")
      return
    }

    // Validar que tenga suficiente dinero
    if (!balance) {
      alert("❌ No se pudo cargar tu saldo actual")
      return
    }

    const availableAmount = transferForm.paymentMethod === "EFECTIVO" ? balance.totalCash : balance.totalNequi
    if (amount > availableAmount) {
      alert(`❌ No tienes suficiente dinero. Disponible en ${transferForm.paymentMethod === "EFECTIVO" ? "efectivo" : "Nequi"}: ${formatCurrency(availableAmount)}`)
      return
    }

    if (!transferForm.concept.trim()) {
      alert("❌ Por favor ingresa el concepto de la transferencia")
      return
    }

    if (!transferForm.concept.trim()) {
      alert(" El concepto de la transferencia es obligatorio")
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: transferForm.toUserId,
          amount: amount,
          paymentMethod: transferForm.paymentMethod,
          concept: transferForm.concept.trim(),
          notes: transferForm.notes.trim() || null,
        }),
      })

      if (response.ok) {
        const toUser = users.find(u => u.id === transferForm.toUserId)
        alert(` Transferencia registrada: $${amount.toLocaleString()} para ${toUser?.name}`)
        setTransferForm({ toUserId: "", amount: "", paymentMethod: "EFECTIVO", concept: "", notes: "" })
      } else {
        const error = await response.json()
        alert(` Error: ${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      alert(" Error de conexión")
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

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-3xl font-bold text-foreground">📜 Movimientos</h1>
          <p className="text-muted-foreground text-base mt-1">Ver movimientos, transferencias, cobros y gastos</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ArrowUpDown className="w-6 h-6 mr-3 text-primary" />
              Transferir Dinero
            </CardTitle>
            <CardDescription className="text-base">
              Registra cuando entregas dinero a otro vendedor o cobrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Balance Display */}
            {balance && (
              <div className="mb-6 p-5 bg-primary/10 border-2 border-primary/30 rounded-lg">
                <h3 className="text-base font-semibold text-foreground mb-3">💰 Mi Saldo Actual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-background/50 p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">💵 Efectivo</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(balance.totalCash)}
                    </p>
                  </div>
                  <div className="text-center bg-background/50 p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">📱 Nequi</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(balance.totalNequi)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">👤 Usuario destino *</label>
                  <select
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                    className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-3 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    <option value="">Seleccionar usuario...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">💰 Monto *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      step="1000"
                      min="1000"
                      placeholder="50000"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      className="pl-12 text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">💵 Tipo de dinero *</label>
                  <select
                    value={transferForm.paymentMethod}
                    onChange={(e) => setTransferForm({ ...transferForm, paymentMethod: e.target.value })}
                    className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-3 focus:ring-primary/50 focus:border-primary"
                    required
                  >
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="NEQUI">📱 Nequi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-foreground mb-2">📝 Concepto *</label>
                  <Input
                    placeholder="Ej: Entrega de cobros"
                    value={transferForm.concept}
                    onChange={(e) => setTransferForm({ ...transferForm, concept: e.target.value })}
                    className="text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">📌 Notas adicionales</label>
                <Input
                  placeholder="Información adicional (opcional)"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="text-base"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving} size="lg" className="text-base">
                  {saving ? "Registrando..." : "💾 Transferir Dinero"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Movimientos */}
        <div className="mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">📜 Movimientos</CardTitle>
              <CardDescription>Ventas, cobros, transferencias y movimientos manuales</CardDescription>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <p className="text-muted-foreground">No hay movimientos</p>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => (
                      <div key={m.id} className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {m.type === 'SALE' && '📝'}
                            {m.type === 'COLLECTION' && '💸'}
                            {m.type === 'TRANSFER_SENT' && '↘️'}
                            {m.type === 'TRANSFER_RECEIVED' && '↗️'}
                            {m.type === 'MOVEMENT_EXPENSE' && '➖'}
                            {m.type === 'MOVEMENT_INCOME' && '➕'}
                          </div>
                          <div>
                            <div className="font-medium">{m.description}</div>
                            <div className="text-sm text-muted-foreground">{new Date(m.date).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${m.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {m.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(m.amount))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
