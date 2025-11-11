"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, DollarSign, Wallet } from "lucide-react"
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

  const [transferForm, setTransferForm] = useState({
    toUserId: "",
    amount: "",
    paymentMethod: "EFECTIVO",
    concept: "",
    notes: ""
  })

  useEffect(() => {
    Promise.all([fetchUsers(), fetchBalance()]).finally(() => setLoading(false))
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Transferencias</h1>
          <p className="text-gray-600">Transfiere dinero entre usuarios del sistema</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpDown className="w-5 h-5 mr-2" />
              Transferir Dinero a Otro Usuario
            </CardTitle>
            <CardDescription>
              Registra cuando entregas dinero a otro vendedor o cobrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Balance Display */}
            {balance && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Mi Saldo Actual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-blue-600">Efectivo</p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(balance.totalCash)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-600">Nequi</p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(balance.totalNequi)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Usuario destino *</label>
                  <select
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar usuario...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Monto *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      step="1000"
                      min="1000"
                      placeholder="50000"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de dinero *</label>
                  <select
                    value={transferForm.paymentMethod}
                    onChange={(e) => setTransferForm({ ...transferForm, paymentMethod: e.target.value })}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="NEQUI">Nequi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Concepto *</label>
                  <Input
                    placeholder="Ej: Entrega de cobros del día"
                    value={transferForm.concept}
                    onChange={(e) => setTransferForm({ ...transferForm, concept: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas adicionales</label>
                <Input
                  placeholder="Información adicional (opcional)"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} size="lg">
                  {saving ? "Registrando..." : "Transferir Dinero"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
