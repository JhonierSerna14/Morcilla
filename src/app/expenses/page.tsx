"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Plus, Calendar, CheckCircle, DollarSign, FileText, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/batch-utils"

interface Expense {
  id: string
  amount: number
  concept: string
  description?: string
  expenseDate: string
  user: {
    id: string
    name: string
  }
}

interface UserBalance {
  totalCash: number
  totalNequi: number
  grandTotal: number
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    concept: "",
    description: "",
    expenseDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    Promise.all([fetchExpenses(), fetchBalance()]).finally(() => setLoading(false))
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses")
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/cash/balance")
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(expenseForm.amount)

    if (!amount || amount <= 0) {
      alert("❌ Por favor ingresa un monto válido (mayor a 0)")
      return
    }

    if (!expenseForm.concept.trim()) {
      alert("❌ El concepto del gasto es obligatorio")
      return
    }

    if (expenseForm.concept.trim().length < 3) {
      alert("❌ El concepto debe tener al menos 3 caracteres")
      return
    }

    // Validar que tenga suficiente dinero en efectivo
    if (!balance) {
      alert("❌ No se pudo cargar tu saldo actual")
      return
    }

    if (amount > balance.totalCash) {
      alert(`❌ No tienes suficiente dinero en efectivo para este gasto.\nDisponible: ${formatCurrency(balance.totalCash)}\nRequerido: ${formatCurrency(amount)}`)
      return
    }

    // Confirmación para gastos grandes
    if (amount > 200000) {
      const confirm = window.confirm(`⚠️ Estás registrando un gasto de $${amount.toLocaleString()}. ¿Estás seguro?`)
      if (!confirm) return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          concept: expenseForm.concept.trim(),
          description: expenseForm.description.trim() || null,
          expenseDate: expenseForm.expenseDate,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)

        // Mostrar mensaje de éxito
        alert(`✅ ¡Gasto registrado exitosamente!\n\n` +
              `Concepto: ${expenseForm.concept.trim()}\n` +
              `Monto: $${amount.toLocaleString()}\n` +
              `Fecha: ${new Date(expenseForm.expenseDate).toLocaleDateString()}`)

        // Reset form
        setExpenseForm({
          amount: "",
          concept: "",
          description: "",
          expenseDate: new Date().toISOString().split('T')[0]
        })

        // Refresh data
        fetchExpenses()
        fetchBalance()
      } else {
        const error = await response.json()
        alert(`❌ Error al registrar el gasto:\n${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error de conexión. Verifica tu internet y vuelve a intentar.")
    } finally {
      setSaving(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

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
            <h1 className="text-2xl font-bold text-gray-900">Registro de Gastos</h1>
            <p className="text-gray-600">
              Registra todos los gastos y egresos del negocio
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
              <span className="text-green-800 font-medium">¡Gasto registrado exitosamente!</span>
            </CardContent>
          </Card>
        )}

        {/* Resumen de Gastos */}
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Gastos Totales</CardTitle>
            <CardDescription className="text-red-100">
              {expenses.length} gastos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              ${totalExpenses.toLocaleString()}
            </div>
            <div className="text-red-100">
              Total en egresos del negocio
            </div>
          </CardContent>
        </Card>

        {/* Registro de Gasto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Registrar Nuevo Gasto
            </CardTitle>
            <CardDescription>
              Ingresa los detalles del gasto o egreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Balance Display */}
            {balance && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  Mi Saldo Disponible para Gastos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-blue-600">Efectivo Disponible</p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(balance.totalCash)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-600">Total en Caja</p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(balance.grandTotal)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2 text-center">
                  Los gastos se descuentan del efectivo disponible
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Monto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Monto del Gasto *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    placeholder="Ej: 50000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    min="0"
                    step="1000"
                    required
                    className="pl-10 py-3 text-lg"
                  />
                </div>
              </div>

              {/* Concepto */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Concepto del Gasto *
                </label>
                <select
                  value={expenseForm.concept}
                  onChange={(e) => setExpenseForm({...expenseForm, concept: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  required
                >
                  <option value="">Selecciona el concepto...</option>
                  <option value="Materia Prima">🥩 Materia Prima</option>
                  <option value="Transporte">🚛 Transporte</option>
                  <option value="Gas">⛽ Gas</option>
                  <option value="Servicios Públicos">💡 Servicios Públicos</option>
                  <option value="Empaques">📦 Empaques</option>
                  <option value="Herramientas">🔧 Herramientas</option>
                  <option value="Mantenimiento">⚙️ Mantenimiento</option>
                  <option value="Alimentación">🍽️ Alimentación</option>
                  <option value="Otros">📝 Otros</option>
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Descripción Detallada
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    placeholder="Describe el gasto en detalle..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    rows={3}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fecha del Gasto
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({...expenseForm, expenseDate: e.target.value})}
                    required
                    className="pl-10 py-3"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={saving}
                className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Registrar Gasto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Historial de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos Recientes</CardTitle>
            <CardDescription>
              Últimos gastos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay gastos registrados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-900">{expense.concept}</h3>
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Gasto
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mb-1">{expense.description}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(expense.expenseDate).toLocaleDateString('es-CO')}
                        <span className="mx-2">•</span>
                        <span>Por: {expense.user.name}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-red-600 text-lg">
                        -${expense.amount.toLocaleString()}
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