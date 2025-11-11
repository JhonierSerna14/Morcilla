"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Scale, DollarSign, Clock, Users, LogOut, Eye, UserCheck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { formatBatchName, formatDateForDisplay, formatCurrency } from "@/lib/batch-utils"

interface BatchMetrics {
  totalPounds: number
  totalRevenue: number
  paidAmount: number
  pendingAmount: number
  salesCount: number
}

interface ActiveBatch {
  id: string
  name: string
  number: number
  productionDate: string
  status: string
}

interface BatchDetails {
  totalSales: number
  totalCustomers: number
  debtorsCount: number
  paidCustomersCount: number
  cashHolders: {
    userId: string
    userName: string
    totalCash: number
    totalNequi: number
  }[]
  recentDebtors: {
    customerId: string
    customerName: string
    totalDebt: number
    lastSaleDate: string
  }[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeBatch, setActiveBatch] = useState<ActiveBatch | null>(null)
  const [metrics, setMetrics] = useState<BatchMetrics | null>(null)
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveBatch()
  }, [])

  const fetchActiveBatch = async () => {
    try {
      const response = await fetch('/api/batches/active')
      const data = await response.json()
      setActiveBatch(data.activeBatch)
      setMetrics(data.metrics)
      setBatchDetails(data.details) // Usar los detalles de la misma llamada
    } catch (error) {
      console.error('Error fetching active batch:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewBatch = async () => {
    try {
      const response = await fetch('/api/batches/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productionDate: new Date().toISOString(),
        }),
      })
      
      if (response.ok) {
        fetchActiveBatch()
      }
    } catch (error) {
      console.error('Error creating new batch:', error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header móvil optimizado */}
      <div className="gradient-primary text-white lg:hidden">
        <div className="px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">
              ¡Hola, {session?.user?.name?.split(' ')[0] || 'Usuario'}! 👋
            </h1>
            <p className="text-blue-100 text-sm opacity-90">{session?.user?.role}</p>
          </div>
        </div>
      </div>

      {/* Header desktop */}
      <div className="hidden lg:block bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard Principal
              </h1>
              <p className="text-muted-foreground">
                Bienvenido, {session?.user?.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/sales">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Venta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Tanda Activa */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold text-foreground">Tanda Activa</h2>
            <Button 
              onClick={createNewBatch} 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto py-3 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Tanda
            </Button>
          </div>

          {activeBatch && metrics && batchDetails ? (
            <div className="space-y-4 mb-6">
              <Card className="gradient-primary text-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl lg:text-2xl">{formatBatchName(activeBatch)}</CardTitle>
                  <CardDescription className="text-blue-100 opacity-90">
                    {formatDateForDisplay(activeBatch.productionDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl lg:text-3xl font-bold">{metrics.totalPounds}</div>
                      <div className="text-xs lg:text-sm opacity-90">Libras Vendidas</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl lg:text-3xl font-bold">
                        ${metrics.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs lg:text-sm opacity-90">Ingresos Totales</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl lg:text-3xl font-bold">
                        ${metrics.paidAmount.toLocaleString()}
                      </div>
                      <div className="text-xs lg:text-sm opacity-90">Cobrado</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-2xl lg:text-3xl font-bold">
                        ${metrics.pendingAmount.toLocaleString()}
                      </div>
                      <div className="text-xs lg:text-sm opacity-90">Por Cobrar</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Link href={`/batches/${activeBatch.id}`}>
                      <Button variant="secondary" size="lg" className="bg-white/90 text-blue-700 hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles Completos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Información detallada de clientes */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <Users className="w-5 h-5 mr-2" />
                      Resumen de Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="font-medium text-green-700 dark:text-green-300">Clientes que han pagado</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{batchDetails.paidCustomersCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                        <span className="font-medium text-amber-700 dark:text-amber-300">Clientes que deben</span>
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{batchDetails.debtorsCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Total de clientes</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{batchDetails.totalCustomers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Dinero en Poder de Usuarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batchDetails.cashHolders.length > 0 ? (
                        batchDetails.cashHolders.map((holder) => (
                          <div key={holder.userId} className="p-3 bg-muted rounded-lg">
                            <div className="font-medium text-foreground">{holder.userName}</div>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-muted-foreground">Efectivo: ${holder.totalCash.toLocaleString()}</span>
                              <span className="text-sm text-muted-foreground">Nequi: ${holder.totalNequi.toLocaleString()}</span>
                            </div>
                            <div className="text-right mt-1">
                              <span className="font-bold text-primary">
                                Total: ${(holder.totalCash + holder.totalNequi).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No hay dinero registrado aún</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clientes que deben */}
              {batchDetails.recentDebtors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <AlertCircle className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                      Top 5 Clientes con Deuda Pendiente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batchDetails.recentDebtors.map((debtor) => (
                        <div key={debtor.customerId} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div>
                            <div className="font-medium text-foreground">{debtor.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              Última venta: {new Date(debtor.lastSaleDate).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-600 dark:text-amber-400">
                              ${debtor.totalDebt.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : activeBatch && metrics ? (
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl lg:text-2xl">{activeBatch.name}</CardTitle>
                <CardDescription className="text-blue-100">
                  Iniciada: {new Date(activeBatch.productionDate).toLocaleDateString('es-CO')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="text-center bg-blue-600/30 rounded-lg p-3">
                    <div className="text-2xl lg:text-3xl font-bold">{metrics.totalPounds}</div>
                    <div className="text-xs lg:text-sm text-blue-100">Libras Vendidas</div>
                  </div>
                  <div className="text-center bg-blue-600/30 rounded-lg p-3">
                    <div className="text-2xl lg:text-3xl font-bold">
                      ${metrics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs lg:text-sm text-blue-100">Ingresos Totales</div>
                  </div>
                  <div className="text-center bg-blue-600/30 rounded-lg p-3">
                    <div className="text-2xl lg:text-3xl font-bold">
                      ${metrics.paidAmount.toLocaleString()}
                    </div>
                    <div className="text-xs lg:text-sm text-blue-100">Cobrado</div>
                  </div>
                  <div className="text-center bg-blue-600/30 rounded-lg p-3">
                    <div className="text-2xl lg:text-3xl font-bold">
                      ${metrics.pendingAmount.toLocaleString()}
                    </div>
                    <div className="text-xs lg:text-sm text-blue-100">Por Cobrar</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scale className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay tanda activa
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crea una nueva tanda para empezar a registrar ventas
                </p>
                <Button onClick={createNewBatch} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Tanda
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/sales">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent">
              <CardContent className="flex items-center p-6">
                <div className="bg-green-100 dark:bg-green-950/50 p-3 rounded-full mr-4">
                  <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Nueva Venta</div>
                  <div className="text-sm text-muted-foreground">Registrar venta</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/collections">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent">
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-100 dark:bg-blue-950/50 p-3 rounded-full mr-4">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Cobrar</div>
                  <div className="text-sm text-muted-foreground">Registrar cobro</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent">
              <CardContent className="flex items-center p-6">
                <div className="bg-purple-100 dark:bg-purple-950/50 p-3 rounded-full mr-4">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Clientes</div>
                  <div className="text-sm text-muted-foreground">Gestionar clientes</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cash">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent">
              <CardContent className="flex items-center p-6">
                <div className="bg-orange-100 dark:bg-orange-950/50 p-3 rounded-full mr-4">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Mi Caja</div>
                  <div className="text-sm text-muted-foreground">Gestionar dinero</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}