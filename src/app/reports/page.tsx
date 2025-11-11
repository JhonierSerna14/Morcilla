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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reportes...</p>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
                <p className="text-gray-600">
                  Información completa del negocio y métricas comparativas
                </p>
              </div>
              <Button onClick={exportReport} className="mt-4 sm:mt-0">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros de Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Fin</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setFilters({startDate: "", endDate: "", batchId: ""})}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white p-1 rounded-lg shadow-sm">
            {[
              { id: "financial", label: "Resumen Financiero", icon: DollarSign },
              { id: "customers", label: "Clientes", icon: Users },
              { id: "users", label: "Usuarios", icon: FileText },
              { id: "batches", label: "Tandas", icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? "bg-blue-500 text-white" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
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
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-xl">{formatBatchName(financialSummary.activeBatch)}</CardTitle>
                  <CardDescription className="text-blue-100">Tanda Activa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {financialSummary.activeBatch.totalPounds} lbs
                      </div>
                      <div className="text-blue-100">Libras Vendidas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        ${financialSummary.activeBatch.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-blue-100">Ingresos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Métricas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Scale className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">{financialSummary.totals.sales.pounds}</div>
                    <div className="text-sm text-gray-600">Total Libras</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <DollarSign className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      ${financialSummary.totals.sales.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Ventas Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <TrendingUp className="w-8 h-8 text-red-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      ${financialSummary.totals.expenses.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Gastos Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Users className="w-8 h-8 text-orange-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">{financialSummary.customersWithDebt}</div>
                    <div className="text-sm text-gray-600">Clientes con Deuda</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance General */}
            <Card>
              <CardHeader>
                <CardTitle>Balance General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-600">INGRESOS</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Ventas ({financialSummary.totals.sales.count})</span>
                        <span className="font-medium">
                          ${financialSummary.totals.sales.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cobros ({financialSummary.totals.collections.count})</span>
                        <span className="font-medium">
                          ${financialSummary.totals.collections.amount.toLocaleString()}
                        </span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-green-600">
                        <span>Total Ingresos</span>
                        <span>
                          ${(financialSummary.totals.sales.amount + financialSummary.totals.collections.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-red-600">EGRESOS Y PENDIENTES</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gastos ({financialSummary.totals.expenses.count})</span>
                        <span className="font-medium">
                          ${financialSummary.totals.expenses.amount.toLocaleString()}
                        </span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-red-600">
                        <span>Total Egresos</span>
                        <span>
                          ${financialSummary.totals.expenses.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Utilidad Neta Aproximada:</span>
                    <span className={
                      (financialSummary.totals.sales.amount + financialSummary.totals.collections.amount - 
                       financialSummary.totals.expenses.amount) >= 0
                        ? "text-green-600" : "text-red-600"
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
          <Card>
            <CardHeader>
              <CardTitle>Clientes con Deudas Pendientes</CardTitle>
              <CardDescription>
                {customersWithDebt.length} clientes con deudas por ${customersWithDebt.reduce((sum, c) => sum + c.totalDebt, 0).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customersWithDebt.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">¡Excelente! No hay deudas pendientes</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {customersWithDebt.map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          Ha pagado: ${customer.totalPaid.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          ${customer.totalDebt.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Debe</div>
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
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hay datos de usuarios</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCash.map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold">{user.name}</h3>
                          <span className="text-sm text-gray-500">{user.role}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">💵 Efectivo:</span>
                            <span className="font-medium">
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
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hay tandas para comparar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Tanda</th>
                        <th className="text-center p-3">Estado</th>
                        <th className="text-center p-3">Libras</th>
                        <th className="text-center p-3">Ventas</th>
                        <th className="text-center p-3">Ingresos</th>
                        <th className="text-center p-3">Precio/Lb</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchComparison.map((batch) => (
                        <tr key={batch.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{formatBatchName(batch)}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(batch.productionDate).toLocaleDateString('es-CO')}
                              </div>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              batch.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status === 'ACTIVE' ? 'Activa' : 'Cerrada'}
                            </span>
                          </td>
                          <td className="text-center p-3 font-medium">
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