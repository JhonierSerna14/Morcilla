"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ClipboardList, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Scale,
  FileText,
  BarChart3
} from "lucide-react"
import { formatBatchName, formatCurrency } from "@/lib/batch-utils"

interface FinancialSummary {
  activeBatch?: {
    name: string
    productionDate: string
    totalPounds: number
    totalRevenue: number
  }
  totals: {
    sales: {
      amount: number
      pounds: number
      count: number
    }
    collections: {
      amount: number
      count: number
    }
    expenses: {
      amount: number
      count: number
    }
  }
  customersWithDebt: number
}

interface CustomerWithDebt {
  id: string
  name: string
  phone?: string
  totalDebt: number
  totalPaid: number
  sales: Array<{
    batch: { name: string }
  }>
}

interface UserCash {
  id: string
  name: string
  role: string
  cashSummary: {
    efectivo: number
    nequi: number
    transferencia: number
  }
}

interface BatchComparison {
  id: string
  name: string
  number: number
  status: string
  productionDate: string
  totalPounds: number
  totalRevenue: number
  salesCount: number
  averagePricePerPound: number
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("financial")
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [customersWithDebt, setCustomersWithDebt] = useState<CustomerWithDebt[]>([])
  const [userCash, setUserCash] = useState<UserCash[]>([])
  const [batchComparison, setBatchComparison] = useState<BatchComparison[]>([])

  // Filtros
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    batchId: ""
  })

  useEffect(() => {
    fetchFinancialSummary()
  }, [filters])

  useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomersWithDebt()
    } else if (activeTab === "users") {
      fetchUserCash()
    } else if (activeTab === "batches") {
      fetchBatchComparison()
    }
  }, [activeTab])

  const fetchFinancialSummary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: "financial-summary",
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.batchId && { batchId: filters.batchId })
      })
      
      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()
      setFinancialSummary(data)
    } catch (error) {
      console.error("Error fetching financial summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomersWithDebt = async () => {
    try {
      const response = await fetch("/api/reports?type=customers-with-debt")
      const data = await response.json()
      setCustomersWithDebt(data)
    } catch (error) {
      console.error("Error fetching customers with debt:", error)
    }
  }

  const fetchUserCash = async () => {
    try {
      const response = await fetch("/api/reports?type=user-cash-summary")
      const data = await response.json()
      setUserCash(data)
    } catch (error) {
      console.error("Error fetching user cash:", error)
    }
  }

  const fetchBatchComparison = async () => {
    try {
      const response = await fetch("/api/reports?type=batch-comparison")
      const data = await response.json()
      setBatchComparison(data)
    } catch (error) {
      console.error("Error fetching batch comparison:", error)
    }
  }

  const exportReport = () => {
    alert("Funcionalidad de exportación en desarrollo")
  }

  if (loading && activeTab === "financial") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base">Generando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      {/* Header */}
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">📊 Reportes y Análisis</h1>
                <p className="text-muted-foreground text-base mt-1">
                  Información completa del negocio y métricas comparativas
                </p>
              </div>
              <Button onClick={exportReport} size="lg" className="text-base">
                <Download className="w-5 h-5 mr-2" />
                📥 Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Filter className="w-5 h-5 mr-3 text-primary" />
              📅 Filtros de Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">Fecha Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="pl-12 text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">Fecha Fin</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="pl-12 text-base"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setFilters({startDate: "", endDate: "", batchId: ""})}
                  variant="outline"
                  className="w-full text-base"
                  size="lg"
                >
                  🔄 Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-card p-2 rounded-lg shadow-sm border-2 border-border">
            {[
              { id: "financial", label: "Resumen Financiero", icon: "💰" },
              { id: "customers", label: "Clientes", icon: "👥" },
              { id: "users", label: "Usuarios", icon: "📋" },
              { id: "batches", label: "Tandas", icon: "📊" }
            ].map((tab) => {
              return (
                <button
                  key={tab.id}
                  className={`py-4 px-4 rounded-md text-base font-semibold transition-all ${
                    activeTab === tab.id 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Resumen Financiero */}
        {activeTab === "financial" && financialSummary && (
          <div className="space-y-6">
            {/* Tanda Activa */}
            {financialSummary.activeBatch && (
              <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">📦 {formatBatchName(financialSummary.activeBatch)}</CardTitle>
                  <CardDescription className="text-base text-primary/80">⏳ Tanda Activa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-primary/10 p-5 rounded-lg border border-primary/30">
                      <div className="text-3xl font-bold text-primary">
                        {financialSummary.activeBatch.totalPounds} lbs
                      </div>
                      <div className="text-muted-foreground text-base font-semibold mt-1">⚖️ Libras Vendidas</div>
                    </div>
                    <div className="bg-accent/10 p-5 rounded-lg border border-accent/30">
                      <div className="text-3xl font-bold text-accent">
                        ${financialSummary.activeBatch.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-base font-semibold mt-1">💰 Ingresos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Métricas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">⚖️</div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{financialSummary.totals.sales.pounds}</div>
                    <div className="text-sm text-muted-foreground">Total Libras</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      ${financialSummary.totals.sales.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Ventas Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">📉</div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">
                      ${financialSummary.totals.expenses.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Gastos Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">👥</div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{financialSummary.customersWithDebt}</div>
                    <div className="text-sm text-muted-foreground">Con Deuda</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance General */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">📊 Balance General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 bg-accent/10 p-5 rounded-lg border-2 border-accent/30">
                    <h3 className="font-semibold text-lg text-accent">💰 INGRESOS</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ventas ({financialSummary.totals.sales.count})</span>
                        <span className="font-semibold text-foreground">
                          ${financialSummary.totals.sales.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cobros ({financialSummary.totals.collections.count})</span>
                        <span className="font-semibold text-foreground">
                          ${financialSummary.totals.collections.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t-2 border-accent/30 pt-3"></div>
                      <div className="flex justify-between font-bold text-accent text-lg">
                        <span>Total Ingresos</span>
                        <span>
                          ${(financialSummary.totals.sales.amount + financialSummary.totals.collections.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-destructive/10 p-5 rounded-lg border-2 border-destructive/30">
                    <h3 className="font-semibold text-lg text-destructive">📉 EGRESOS Y PENDIENTES</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gastos ({financialSummary.totals.expenses.count})</span>
                        <span className="font-semibold text-foreground">
                          ${financialSummary.totals.expenses.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t-2 border-destructive/30 pt-3"></div>
                      <div className="flex justify-between font-bold text-destructive text-lg">
                        <span>Total Egresos</span>
                        <span>
                          ${financialSummary.totals.expenses.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-border">
                  <div className="flex justify-between items-center text-2xl font-bold gap-4">
                    <span className="text-foreground">📊 Utilidad Neta Aproximada:</span>
                    <span className={
                      (financialSummary.totals.sales.amount + financialSummary.totals.collections.amount - 
                       financialSummary.totals.expenses.amount) >= 0
                        ? "text-accent" : "text-destructive"
                    }>
                      ${((financialSummary.totals.sales.amount + financialSummary.totals.collections.amount) - 
                         financialSummary.totals.expenses.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clientes con Deuda */}
        {activeTab === "customers" && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">👥 Clientes con Deudas Pendientes</CardTitle>
              <CardDescription className="text-base">
                {customersWithDebt.length} clientes con deudas por ${customersWithDebt.reduce((sum, c) => sum + c.totalDebt, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customersWithDebt.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-base text-muted-foreground">¡Excelente! No hay deudas pendientes</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customersWithDebt.map((customer) => (
                    <div key={customer.id} className="flex justify-between items-start p-5 border-2 border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-semibold text-base text-foreground">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-muted-foreground">📱 {customer.phone}</div>
                        )}
                        <div className="text-sm text-muted-foreground mt-2">
                          ✅ Pagado: ${customer.totalPaid.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-destructive text-lg">
                          ${customer.totalDebt.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">⏳ Debe</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resumen por Usuario */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Dinero por Usuario</CardTitle>
              <CardDescription>
                Resumen del dinero que maneja cada usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userCash.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay datos de usuarios</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCash.map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-foreground">{user.name}</h3>
                          <span className="text-sm text-muted-foreground">{user.role}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-foreground">💵 Efectivo:</span>
                            <span className="font-medium text-foreground">
                              ${user.cashSummary.efectivo.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">📱 Nequi:</span>
                            <span className="font-medium">
                              ${user.cashSummary.nequi.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">🏦 Transfer:</span>
                            <span className="font-medium">
                              ${user.cashSummary.transferencia.toLocaleString()}
                            </span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>
                              ${(user.cashSummary.efectivo + user.cashSummary.nequi + user.cashSummary.transferencia).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparación de Tandas */}
        {activeTab === "batches" && (
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Tandas</CardTitle>
              <CardDescription>
                Rendimiento de las últimas tandas de producción
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batchComparison.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay tandas para comparar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b bg-primary/10">
                        <th className="text-left p-3 text-foreground font-semibold">Tanda</th>
                        <th className="text-center p-3 text-foreground font-semibold">Estado</th>
                        <th className="text-center p-3 text-foreground font-semibold">Libras</th>
                        <th className="text-center p-3 text-foreground font-semibold">Ventas</th>
                        <th className="text-center p-3 text-foreground font-semibold">Ingresos</th>
                        <th className="text-center p-3 text-foreground font-semibold">Precio/Lb</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchComparison.map((batch) => (
                        <tr key={batch.id} className="border-b hover:bg-primary/5 transition">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-foreground">{formatBatchName(batch)}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(batch.productionDate).toLocaleDateString('es-CO')}
                              </div>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'ACTIVE' 
                                ? 'bg-accent/20 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {batch.status === 'ACTIVE' ? '✅ Activa' : '❌ Cerrada'}
                            </span>
                          </td>
                          <td className="text-center p-3 font-medium text-foreground">
                            {batch.totalPounds}
                          </td>
                          <td className="text-center p-3">
                            {batch.salesCount}
                          </td>
                          <td className="text-center p-3 font-medium">
                            ${batch.totalRevenue.toLocaleString()}
                          </td>
                          <td className="text-center p-3">
                            ${Math.round(batch.averagePricePerPound).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}