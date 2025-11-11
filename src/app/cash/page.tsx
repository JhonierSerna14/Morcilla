"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowUpDown, Plus, Minus, DollarSign, CreditCard, Users } from "lucide-react"

interface CashBalance {
  efectivo: number
  nequi: number
  total: number
}

interface CashMovement {
  id: string
  movementType: string
  amount: number
  paymentMethod: string
  description: string
  movementDate: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function CashPage() {
  const { data: session } = useSession()
  const [balance, setBalance] = useState<CashBalance>({ efectivo: 0, nequi: 0, total: 0 })
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("balance")

  // Movement form
  const [movementForm, setMovementForm] = useState({
    movementType: "INCOME",
    amount: "",
    paymentMethod: "EFECTIVO",
    description: ""
  })

  // Transfer form
  const [transferForm, setTransferForm] = useState({
    toUserId: "",
    amount: "",
    paymentMethod: "EFECTIVO",
    concept: "",
    notes: ""
  })

  useEffect(() => {
    Promise.all([
      fetchCashData(),
      fetchUsers()
    ]).finally(() => setLoading(false))
  }, [])

  const fetchCashData = async () => {
    try {
      const response = await fetch("/api/cash")
      const data = await response.json()
      setBalance(data.balance)
      setMovements(data.movements)
    } catch (error) {
      console.error("Error fetching cash data:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/transfers", { method: "OPTIONS" })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(movementForm.amount)
    if (!amount || amount <= 0) {
      alert("Ingresa un monto válido")
      return
    }

    if (!movementForm.description.trim()) {
      alert("Ingresa una descripción")
      return
    }

    try {
      const response = await fetch("/api/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movementType: movementForm.movementType,
          amount,
          paymentMethod: movementForm.paymentMethod,
          description: movementForm.description.trim()
        })
      })

      if (response.ok) {
        setMovementForm({
          movementType: "INCOME",
          amount: "",
          paymentMethod: "EFECTIVO",
          description: ""
        })
        fetchCashData()
        alert("Movimiento registrado exitosamente")
      } else {
        const error = await response.json()
        alert(error.error || "Error al registrar movimiento")
      }
    } catch (error) {
      console.error("Error creating movement:", error)
      alert("Error al registrar movimiento")
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(transferForm.amount)
    if (!amount || amount <= 0) {
      alert("Ingresa un monto válido")
      return
    }

    if (!transferForm.toUserId) {
      alert("Selecciona un usuario destino")
      return
    }

    if (!transferForm.concept.trim()) {
      alert("Ingresa el concepto de la transferencia")
      return
    }

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: transferForm.toUserId,
          amount,
          paymentMethod: transferForm.paymentMethod,
          concept: transferForm.concept.trim(),
          notes: transferForm.notes.trim() || null
        })
      })

      if (response.ok) {
        setTransferForm({
          toUserId: "",
          amount: "",
          paymentMethod: "EFECTIVO",
          concept: "",
          notes: ""
        })
        fetchCashData()
        alert("Transferencia realizada exitosamente")
      } else {
        const error = await response.json()
        alert(error.error || "Error al realizar transferencia")
      }
    } catch (error) {
      console.error("Error creating transfer:", error)
      alert("Error al realizar transferencia")
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Mi Caja</h1>
            <p className="text-gray-600">
              {session?.user?.name} - Gestiona tu dinero
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Efectivo</p>
                  <p className="text-3xl font-bold">${balance.efectivo.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Nequi</p>
                  <p className="text-3xl font-bold">${balance.nequi.toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total</p>
                  <p className="text-3xl font-bold">${balance.total.toLocaleString()}</p>
                </div>
                <Wallet className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 bg-white p-1 rounded-lg shadow-sm">
            <button
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "balance" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("balance")}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Balance y Movimientos
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "movements" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("movements")}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Registrar Movimiento
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "transfer" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("transfer")}
            >
              <ArrowUpDown className="w-4 h-4 inline mr-2" />
              Transferir Dinero
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "balance" && (
          <Card>
            <CardHeader>
              <CardTitle>Últimos Movimientos</CardTitle>
              <CardDescription>
                Historial de tus movimientos de caja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay movimientos registrados
                  </p>
                ) : (
                  movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-4 ${
                          movement.movementType === "INCOME" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}>
                          {movement.movementType === "INCOME" ? (
                            <Plus className="w-4 h-4" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{movement.description}</p>
                          <p className="text-sm text-gray-500">
                            {movement.paymentMethod} • {new Date(movement.movementDate).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        movement.movementType === "INCOME" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {movement.movementType === "INCOME" ? "+" : "-"}
                        ${Number(movement.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "movements" && (
          <Card>
            <CardHeader>
              <CardTitle>Registrar Movimiento de Caja</CardTitle>
              <CardDescription>
                Registra ingresos o egresos en tu caja personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMovementSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo de movimiento *
                    </label>
                    <select
                      value={movementForm.movementType}
                      onChange={(e) =>
                        setMovementForm({ ...movementForm, movementType: e.target.value })
                      }
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="INCOME">Ingreso (+)</option>
                      <option value="EXPENSE">Egreso (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Método de pago *
                    </label>
                    <select
                      value={movementForm.paymentMethod}
                      onChange={(e) =>
                        setMovementForm({ ...movementForm, paymentMethod: e.target.value })
                      }
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="NEQUI">Nequi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monto *
                    </label>
                    <Input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="0"
                      value={movementForm.amount}
                      onChange={(e) =>
                        setMovementForm({ ...movementForm, amount: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descripción *
                    </label>
                    <Input
                      placeholder="Describe el concepto..."
                      value={movementForm.description}
                      onChange={(e) =>
                        setMovementForm({ ...movementForm, description: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setMovementForm({
                        movementType: "INCOME",
                        amount: "",
                        paymentMethod: "EFECTIVO",
                        description: ""
                      })
                    }
                  >
                    Limpiar
                  </Button>
                  <Button type="submit">Registrar Movimiento</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "transfer" && (
          <Card>
            <CardHeader>
              <CardTitle>Transferir Dinero</CardTitle>
              <CardDescription>
                Transfiere dinero a otro usuario del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Usuario destino *
                    </label>
                    <select
                      value={transferForm.toUserId}
                      onChange={(e) =>
                        setTransferForm({ ...transferForm, toUserId: e.target.value })
                      }
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecciona un usuario...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Método de pago *
                    </label>
                    <select
                      value={transferForm.paymentMethod}
                      onChange={(e) =>
                        setTransferForm({ ...transferForm, paymentMethod: e.target.value })
                      }
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="NEQUI">Nequi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monto *
                    </label>
                    <Input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="0"
                      value={transferForm.amount}
                      onChange={(e) =>
                        setTransferForm({ ...transferForm, amount: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Concepto *
                    </label>
                    <Input
                      placeholder="Motivo de la transferencia..."
                      value={transferForm.concept}
                      onChange={(e) =>
                        setTransferForm({ ...transferForm, concept: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Notas (opcional)
                    </label>
                    <Input
                      placeholder="Información adicional..."
                      value={transferForm.notes}
                      onChange={(e) =>
                        setTransferForm({ ...transferForm, notes: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setTransferForm({
                        toUserId: "",
                        amount: "",
                        paymentMethod: "EFECTIVO",
                        concept: "",
                        notes: ""
                      })
                    }
                  >
                    Limpiar
                  </Button>
                  <Button type="submit">Realizar Transferencia</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}