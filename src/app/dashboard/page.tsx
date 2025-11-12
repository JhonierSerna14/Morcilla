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
      <div className="gradient-primary text-primary-foreground lg:hidden">
        <div className="px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold">
              ¡Hola, {session?.user?.name?.split(' ')[0] || 'Usuario'}! 👋
            </h1>
            <p className="text-base opacity-90 mt-1">{session?.user?.role}</p>
          </div>
        </div>
      </div>

      {/* Header desktop */}
      <div className="hidden lg:block bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard Principal
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Bienvenido, {session?.user?.name}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/sales">
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Venta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-32 lg:pb-12">
        {/* Tanda Activa - Sección Principal */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Tanda Activa</h2>
              <p className="text-base text-muted-foreground mt-1">Seguimiento en tiempo real</p>
            </div>
            <Button 
              onClick={createNewBatch} 
              variant="secondary" 
              size="lg"
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Tanda
            </Button>
          </div>

          {activeBatch && metrics && batchDetails ? (
            <div className="space-y-6 mb-8">
              <Card className="gradient-primary text-primary-foreground border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl lg:text-3xl">{formatBatchName(activeBatch)}</CardTitle>
                  <CardDescription className="text-base opacity-90">
                    📅 {formatDateForDisplay(activeBatch.productionDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
                    <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl lg:text-4xl font-bold">{metrics.totalPounds}</div>
                      <div className="text-sm opacity-95 mt-2">📦 Libras Vendidas</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl lg:text-4xl font-bold">
                        ${metrics.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm opacity-95 mt-2">💰 Ingresos Totales</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl lg:text-4xl font-bold">
                        ${metrics.paidAmount.toLocaleString()}
                      </div>
                      <div className="text-sm opacity-95 mt-2">✅ Cobrado</div>
                    </div>
                    <div className="text-center bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl lg:text-4xl font-bold">
                        ${metrics.pendingAmount.toLocaleString()}
                      </div>
                      <div className="text-sm opacity-95 mt-2">⏳ Por Cobrar</div>
                    </div>
                  </div>
                  <div className="text-center pt-4 border-t border-white/20">
                    <Link href={`/batches/${activeBatch.id}`}>
                      <Button variant="default" size="lg" className="bg-white text-primary hover:bg-gray-100 text-base font-semibold">
                        <Eye className="w-5 h-5 mr-2" />
                        Ver Detalles Completos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Información detallada de clientes */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground text-xl">
                      <Users className="w-6 h-6 mr-3 text-primary" />
                      Resumen de Clientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-accent text-accent-foreground rounded-lg border-2 border-accent/50 font-semibold text-base">
                        <span>✅ Clientes que pagaron</span>
                        <span className="text-2xl">{batchDetails.paidCustomersCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-secondary text-secondary-foreground rounded-lg border-2 border-secondary/50 font-semibold text-base">
                        <span>⏳ Clientes que deben</span>
                        <span className="text-2xl">{batchDetails.debtorsCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-lg border-2 border-primary/50 font-semibold text-base">
                        <span>👥 Total de clientes</span>
                        <span className="text-2xl">{batchDetails.totalCustomers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground text-xl">
                      <DollarSign className="w-6 h-6 mr-3 text-primary" />
                      Dinero en Poder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batchDetails.cashHolders.length > 0 ? (
                        batchDetails.cashHolders.map((holder) => (
                          <div key={holder.userId} className="p-4 bg-muted rounded-lg border-2 border-border">
                            <div className="font-semibold text-foreground text-base">{holder.userName}</div>
                            <div className="flex justify-between mt-3 text-base">
                              <span className="text-muted-foreground">💵 Efectivo: ${holder.totalCash.toLocaleString()}</span>
                              <span className="text-muted-foreground">📱 Nequi: ${holder.totalNequi.toLocaleString()}</span>
                            </div>
                            <div className="text-right mt-3 pt-3 border-t border-border">
                              <span className="font-bold text-primary text-lg">
                                Total: ${(holder.totalCash + holder.totalNequi).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-6 text-base">No hay dinero registrado aún</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clientes que deben */}
              {batchDetails.recentDebtors.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground text-xl">
                      <AlertCircle className="w-6 h-6 mr-3 text-secondary" />
                      Top 5 Clientes con Deuda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batchDetails.recentDebtors.map((debtor) => (
                        <div key={debtor.customerId} className="flex justify-between items-center p-4 bg-secondary/20 border-2 border-secondary/40 rounded-lg hover:shadow-md transition-shadow">
                          <div>
                            <div className="font-semibold text-foreground text-base">{debtor.customerName}</div>
                            <div className="text-base text-muted-foreground mt-1">
                              📅 Última venta: {new Date(debtor.lastSaleDate).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-secondary text-2xl">
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
            <Card className="gradient-primary text-primary-foreground mb-6 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl lg:text-3xl">{activeBatch.name}</CardTitle>
                <CardDescription className="text-base opacity-90">
                  📅 Iniciada: {new Date(activeBatch.productionDate).toLocaleDateString('es-CO')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="text-center bg-white/20 rounded-lg p-4">
                    <div className="text-3xl lg:text-4xl font-bold">{metrics.totalPounds}</div>
                    <div className="text-sm opacity-95 mt-2">📦 Libras</div>
                  </div>
                  <div className="text-center bg-white/20 rounded-lg p-4">
                    <div className="text-3xl lg:text-4xl font-bold">
                      ${metrics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-95 mt-2">💰 Ingresos</div>
                  </div>
                  <div className="text-center bg-white/20 rounded-lg p-4">
                    <div className="text-3xl lg:text-4xl font-bold">
                      ${metrics.paidAmount.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-95 mt-2">✅ Pagado</div>
                  </div>
                  <div className="text-center bg-white/20 rounded-lg p-4">
                    <div className="text-3xl lg:text-4xl font-bold">
                      ${metrics.pendingAmount.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-95 mt-2">⏳ Pendiente</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-4 border-dashed border-border bg-muted/50 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Scale className="w-16 h-16 text-muted-foreground/50 mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No hay tanda activa
                </h3>
                <p className="text-muted-foreground text-center mb-6 text-base max-w-md">
                  Crea una nueva tanda para empezar a registrar ventas y hacer seguimiento
                </p>
                <Button onClick={createNewBatch} size="lg" className="text-base">
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primera Tanda
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-5">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link href="/sales">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-accent text-accent-foreground p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center text-2xl">
                    📝
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground text-base">Nueva Venta</div>
                    <div className="text-sm text-muted-foreground mt-1">Registrar venta</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/collections">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center text-2xl">
                    💸
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground text-base">Cobrar</div>
                    <div className="text-sm text-muted-foreground mt-1">Registrar cobro</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customers">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-secondary text-secondary-foreground p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground text-base">Clientes</div>
                    <div className="text-sm text-muted-foreground mt-1">Gestionar clientes</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cash">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-accent text-accent-foreground p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center text-2xl">
                    💳
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground text-base">Mi Caja</div>
                    <div className="text-sm text-muted-foreground mt-1">Gestionar dinero</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}