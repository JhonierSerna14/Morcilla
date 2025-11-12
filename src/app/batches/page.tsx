"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Calendar, DollarSign, ShoppingCart, Clock, TrendingUp } from "lucide-react"
import { formatBatchName, formatCurrency } from "@/lib/batch-utils"

interface BatchHistory {
  id: string
  name: string
  number: number
  productionDate: string
  status: string
  closedAt?: string
  metrics: {
    totalPounds: number
    totalRevenue: number
    paidAmount: number
    collectionsAmount: number
    totalCollected: number
    pendingAmount: number
    salesCount: number
  }
}

export default function BatchesPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<BatchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<BatchHistory | null>(null)

  useEffect(() => {
    fetchBatchHistory()
  }, [])

  const fetchBatchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/batches/history")
      const data = await response.json()
      setBatches(data)
    } catch (error) {
      console.error("Error fetching batch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDuration = (start: string, end?: string) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-base">Cargando historial...</p>
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
            <h1 className="text-3xl font-bold text-foreground">📊 Historial de Tandas</h1>
            <p className="text-muted-foreground text-base mt-1">
              Revisa el rendimiento de tandas anteriores y compara métricas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {batches.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ⏳ No hay tandas cerradas
            </h3>
            <p className="text-muted-foreground text-base">
              Las tandas aparecerán aquí cuando sean cerradas
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">⚖️</div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {batches.reduce((sum, batch) => sum + batch.metrics.totalPounds, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Libras Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">💰</div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {formatCurrency(batches.reduce((sum, batch) => sum + batch.metrics.totalRevenue, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Ingresos Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">🛒</div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">
                      {batches.reduce((sum, batch) => sum + batch.metrics.salesCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Ventas Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="flex items-center p-6 gap-4">
                  <div className="text-3xl">📈</div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(batches.reduce((sum, batch) => sum + batch.metrics.totalRevenue, 0) / 
                                  batches.reduce((sum, batch) => sum + batch.metrics.totalPounds, 0) || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Precio Prom/Lb</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Tandas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {batches.map((batch) => (
                <Card 
                  key={batch.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedBatch?.id === batch.id ? 'ring-2 ring-primary bg-primary/10 border-primary' : 'border-border'
                  }`}
                  onClick={() => setSelectedBatch(selectedBatch?.id === batch.id ? null : batch)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-foreground">📦 {formatBatchName(batch)}</CardTitle>
                        <CardDescription className="text-base">
                          <div className="flex items-center mt-2">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(batch.productionDate)}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          Tanda #{batch.number}
                        </span>
                        {batch.closedAt && (
                          <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {getDuration(batch.productionDate, batch.closedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Métricas principales */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <div className="text-2xl font-bold text-primary">
                          {batch.metrics.totalPounds}
                        </div>
                        <div className="text-sm text-muted-foreground font-semibold">⚖️ Libras</div>
                      </div>
                      <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/30">
                        <div className="text-2xl font-bold text-accent">
                          {formatCurrency(batch.metrics.totalRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground font-semibold">💰 Ingresos</div>
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {selectedBatch?.id === batch.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">🛒 Ventas:</span>
                            <span className="font-semibold text-foreground">{batch.metrics.salesCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">💵 Precio/Lb:</span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(batch.metrics.totalPounds > 0 ? batch.metrics.totalRevenue / batch.metrics.totalPounds : 0)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg space-y-3 border border-border">
                          <h4 className="font-semibold text-base text-foreground">📋 Estado de Pagos</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">💵 Pagado inmediato:</span>
                              <span className="text-accent font-semibold">
                                {formatCurrency(batch.metrics.paidAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">📞 Cobros posteriores:</span>
                              <span className="text-primary font-semibold">
                                {formatCurrency(batch.metrics.collectionsAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2">
                              <span className="text-foreground font-semibold">✅ Total cobrado:</span>
                              <span className="text-accent font-bold">
                                {formatCurrency(batch.metrics.totalCollected)}
                              </span>
                            </div>
                            {batch.metrics.pendingAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-foreground font-semibold">⏳ Pendiente:</span>
                                <span className="text-destructive font-semibold">
                                  {formatCurrency(batch.metrics.pendingAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Porcentaje de cobro */}
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-foreground font-semibold">📊 Efectividad de Cobro:</span>
                            <span className="font-bold text-primary">
                              {Math.round((batch.metrics.totalCollected / batch.metrics.totalRevenue) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-primary/20 rounded-full h-3">
                            <div 
                              className="bg-primary h-3 rounded-full transition-all"
                              style={{
                                width: `${Math.round((batch.metrics.totalCollected / batch.metrics.totalRevenue) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Botón de acción */}
                        <div className="mt-4">
                          <Button 
                            size="lg" 
                            className="w-full text-base"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/batches/${batch.id}`)
                            }}
                          >
                            👁️ Ver Detalles Completos
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Indicador para expandir */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-muted-foreground">
                        {selectedBatch?.id === batch.id ? '⬆️ Clic para contraer' : '⬇️ Clic para ver detalles'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparación rápida */}
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Rendimiento</CardTitle>
                <CardDescription>
                  Top 5 tandas por diferentes métricas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Top por libras */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-800 mb-3">Más Libras Vendidas</h4>
                    <div className="space-y-2">
                      {batches
                        .sort((a, b) => b.metrics.totalPounds - a.metrics.totalPounds)
                        .slice(0, 5)
                        .map((batch, index) => (
                          <div key={batch.id} className="flex justify-between items-center text-sm">
                            <span className="flex items-center">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </span>
                              Tanda #{batch.number}
                            </span>
                            <span className="font-medium">{batch.metrics.totalPounds} lbs</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Top por ingresos */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-800 mb-3">Más Ingresos</h4>
                    <div className="space-y-2">
                      {batches
                        .sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue)
                        .slice(0, 5)
                        .map((batch, index) => (
                          <div key={batch.id} className="flex justify-between items-center text-sm">
                            <span className="flex items-center">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </span>
                              Tanda #{batch.number}
                            </span>
                            <span className="font-medium">{formatCurrency(batch.metrics.totalRevenue)}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Top por precio por libra */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-800 mb-3">Mejor Precio/Libra</h4>
                    <div className="space-y-2">
                      {batches
                        .sort((a, b) => {
                          const priceA = a.metrics.totalPounds > 0 ? a.metrics.totalRevenue / a.metrics.totalPounds : 0
                          const priceB = b.metrics.totalPounds > 0 ? b.metrics.totalRevenue / b.metrics.totalPounds : 0
                          return priceB - priceA
                        })
                        .slice(0, 5)
                        .map((batch, index) => (
                          <div key={batch.id} className="flex justify-between items-center text-sm">
                            <span className="flex items-center">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </span>
                              Tanda #{batch.number}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(batch.metrics.totalPounds > 0 ? batch.metrics.totalRevenue / batch.metrics.totalPounds : 0)}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}