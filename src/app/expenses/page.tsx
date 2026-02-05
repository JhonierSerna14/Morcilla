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

  // Helper: format numeric string with thousands separator (puntos)
  const formatWithThousands = (raw: string) => {
    const digits = (raw || "").toString().replace(/\D/g, "")
    if (!digits) return ""
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

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
      {/* Header */}
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5">
            <h1 className="text-3xl font-bold text-foreground">📊 Registro de Gastos</h1>
            <p className="text-muted-foreground text-base mt-1">
              Registra todos los gastos y egresos del negocio
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Success Message */}
        {success && (
          <Card className="border-2 border-accent bg-accent/10">
            <CardContent className="flex items-center justify-center py-5">
              <CheckCircle className="w-6 h-6 text-accent mr-3" />
              <span className="text-accent font-semibold text-base">✅ ¡Gasto registrado exitosamente!</span>
            </CardContent>
          </Card>
        )}

        {/* Resumen de Gastos */}
        <Card className="bg-gradient-to-r from-destructive/20 to-destructive/10 border-2 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">💰 Total de Gastos</CardTitle>
            <CardDescription className="text-base text-destructive/80">
              {expenses.length} gastos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2 text-destructive">
              ${totalExpenses.toLocaleString()}
            </div>
            <div className="text-destructive/70 text-base">
              Total en egresos del negocio
            </div>
          </CardContent>
        </Card>

        {/* Registro de Gasto */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="w-6 h-6 mr-3 text-primary" />
              Registrar Nuevo Gasto
            </CardTitle>
            <CardDescription className="text-base">
              Ingresa los detalles del gasto o egreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Balance Display */}
            {balance && (
              <div className="mb-6 p-5 bg-primary/10 border-2 border-primary/30 rounded-lg">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  💳 Mi Saldo Disponible para Gastos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-background/50 p-3 rounded border border-border">
                    <p className="text-sm text-muted-foreground">Efectivo Disponible</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(balance.totalCash)}
                    </p>
                  </div>
                  <div className="text-center bg-background/50 p-3 rounded border border-border">
                    <p className="text-sm text-muted-foreground">Total en Caja</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(balance.grandTotal)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Los gastos se descuentan del efectivo disponible
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Monto */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  💰 Monto del Gasto *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Ej: 50.000"
                    value={formatWithThousands(expenseForm.amount)}
                    onChange={(e) => {
                      // Guardar solo dígitos internamente, mostrar con puntos
                      const digits = e.target.value.replace(/\D/g, '')
                      setExpenseForm({...expenseForm, amount: digits})
                    }}
                    inputMode="numeric"
                    required
                    className="pl-12 text-base"
                  />
                </div>
              </div>

              {/* Concepto */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  📝 Concepto del Gasto *
                </label>
                <select
                  value={expenseForm.concept}
                  onChange={(e) => setExpenseForm({...expenseForm, concept: e.target.value})}
                  className="w-full px-4 py-3 h-12 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base bg-background text-foreground"
                  required
                >
                  <option value="">Selecciona el concepto...</option>
                  <option value="Retiro Ganancias">💰 Retiro Ganancias</option>
                  <option value="Materia Prima">🥩 Materia Prima</option>
                  <option value="Gasolina">⛽ Gasolina</option>
                  <option value="Empaques">📦 Empaques</option>
                  <option value="Herramientas">🔧 Herramientas</option>
                  <option value="Otros">📝 Otros</option>
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  🗒️ Descripción Adicional
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-muted-foreground w-5 h-5" />
                  <textarea
                    placeholder="Información adicional sobre el gasto..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    rows={3}
                    className="w-full pl-12 p-4 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  📅 Fecha del Gasto
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({...expenseForm, expenseDate: e.target.value})}
                    required
                    className="pl-12 text-base"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={saving}
                size="lg"
                className="w-full text-base"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    💾 Registrar Gasto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Historial de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">📋 Gastos Recientes</CardTitle>
            <CardDescription className="text-base">
              Últimos gastos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-base text-muted-foreground">No hay gastos registrados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-start p-4 border-2 border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-base text-foreground">{expense.concept}</h3>
                        <span className="ml-3 text-xs bg-destructive/20 text-destructive px-3 py-1 rounded-full font-medium">
                          🔴 Gasto
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mb-2">{expense.description}</p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(expense.expenseDate).toLocaleDateString('es-CO')}
                        <span className="mx-2">•</span>
                        <span>👤 {expense.user.name}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-destructive text-lg">
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