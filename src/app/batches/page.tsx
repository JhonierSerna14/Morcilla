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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Historial de Tandas</h1>
            <p className="text-gray-600">
              Revisa el rendimiento de tandas anteriores y compara métricas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {batches.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tandas cerradas
            </h3>
            <p className="text-gray-600">
              Las tandas aparecerán aquí cuando sean cerradas
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <Scale className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      {batches.reduce((sum, batch) => sum + batch.metrics.totalPounds, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Libras</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <DollarSign className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(batches.reduce((sum, batch) => sum + batch.metrics.totalRevenue, 0))}
                    </div>
                    <div className="text-sm text-gray-600">Ingresos Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <ShoppingCart className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      {batches.reduce((sum, batch) => sum + batch.metrics.salesCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Ventas Totales</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <TrendingUp className="w-8 h-8 text-orange-600 mr-4" />
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(batches.reduce((sum, batch) => sum + batch.metrics.totalRevenue, 0) / 
                                  batches.reduce((sum, batch) => sum + batch.metrics.totalPounds, 0) || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Precio Promedio/Lb</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Tandas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {batches.map((batch) => (
                <Card 
                  key={batch.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedBatch?.id === batch.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedBatch(selectedBatch?.id === batch.id ? null : batch)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{formatBatchName(batch)}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(batch.productionDate)}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          Tanda #{batch.number}
                        </span>
                        {batch.closedAt && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
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
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {batch.metrics.totalPounds}
                        </div>
                        <div className="text-xs text-blue-700">Libras</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(batch.metrics.totalRevenue)}
                        </div>
                        <div className="text-xs text-green-700">Ingresos</div>
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {selectedBatch?.id === batch.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Ventas:</span>
                            <span className="font-medium">{batch.metrics.salesCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Precio/Lb:</span>
                            <span className="font-medium">
                              {formatCurrency(batch.metrics.totalPounds > 0 ? batch.metrics.totalRevenue / batch.metrics.totalPounds : 0)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          <h4 className="font-medium text-sm text-gray-800">Estado de Pagos:</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Pagado inmediato:</span>
                              <span className="text-green-600 font-medium">
                                {formatCurrency(batch.metrics.paidAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cobros posteriores:</span>
                              <span className="text-blue-600 font-medium">
                                {formatCurrency(batch.metrics.collectionsAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total cobrado:</span>
                              <span className="text-green-600 font-bold">
                                {formatCurrency(batch.metrics.totalCollected)}
                              </span>
                            </div>
                            {batch.metrics.pendingAmount > 0 && (
                              <div className="flex justify-between">
                                <span>Pendiente:</span>
                                <span className="text-red-600 font-medium">
                                  {formatCurrency(batch.metrics.pendingAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Porcentaje de cobro */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span>Efectividad de Cobro:</span>
                            <span className="font-bold">
                              {Math.round((batch.metrics.totalCollected / batch.metrics.totalRevenue) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.round((batch.metrics.totalCollected / batch.metrics.totalRevenue) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Botón de acción */}
                        <div className="mt-4">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/batches/${batch.id}`)
                            }}
                          >
                            Ver Detalles Completos
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Indicador para expandir */}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500">
                        {selectedBatch?.id === batch.id ? 'Clic para contraer' : 'Clic para ver detalles'}
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