"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SaleEditModal } from "@/components/sale-edit-modal"
import { ArrowLeft, Package, Users, DollarSign, Clock, CheckCircle, AlertCircle, Edit } from "lucide-react"

interface BatchInfo {
  id: string
  name: string
  number: number
  createdAt: string
  status: string
  totalPounds: number
}

interface Sale {
  id: string
  pounds: number
  pricePerPound: number
  totalAmount: number
  paymentMethod?: string
  paymentStatus: string
  saleDate: string
  notes?: string
  customer: {
    id: string
    name: string
    phone?: string
  }
  user: {
    id: string
    name: string
  }
}

interface Collection {
  id: string
  amount: number
  paymentMethod: string
  collectionDate: string
  notes?: string
  customer: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
  }
}

function BatchSalesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const batchId = searchParams.get("id")
  
  const [batch, setBatch] = useState<BatchInfo | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale)
    setIsEditModalOpen(true)
  }

  useEffect(() => {
    if (batchId) {
      fetchBatchData()
    }
  }, [batchId])

  const fetchBatchData = async () => {
    try {
      // Fetch batch info
      const batchResponse = await fetch(`/api/batches?id=${batchId}`)
      if (batchResponse.ok) {
        const batchData = await batchResponse.json()
        setBatch(batchData)
      }

      // Fetch sales for this batch
      const salesResponse = await fetch(`/api/sales?batchId=${batchId}`)
      if (salesResponse.ok) {
        const salesData = await salesResponse.json()
        setSales(salesData)
      }

      // Fetch collections for this batch
      const collectionsResponse = await fetch(`/api/collections?batchId=${batchId}`)
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json()
        setCollections(collectionsData)
      }
    } catch (error) {
      console.error("Error fetching batch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de la tanda...</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tanda no encontrada</h1>
          <p className="text-gray-600 mb-4">No se pudo encontrar la información de la tanda.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const totalSales = sales.length
  const totalPounds = sales.reduce((sum, sale) => sum + sale.pounds, 0)
  const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const paidSales = sales.filter(sale => sale.paymentStatus === 'PAID')
  const creditSales = sales.filter(sale => sale.paymentStatus === 'PENDING')
  const totalCollected = collections.reduce((sum, collection) => sum + collection.amount, 0)
  const totalDebt = creditSales.reduce((sum, sale) => sum + sale.totalAmount, 0) - totalCollected

  // Usuarios que tienen dinero
  const usersWithMoney = new Map()
  paidSales.forEach(sale => {
    const userId = sale.user.id
    const userName = sale.user.name
    if (!usersWithMoney.has(userId)) {
      usersWithMoney.set(userId, { name: userName, amount: 0 })
    }
    usersWithMoney.get(userId).amount += sale.totalAmount
  })

  collections.forEach(collection => {
    const userId = collection.user.id
    const userName = collection.user.name
    if (!usersWithMoney.has(userId)) {
      usersWithMoney.set(userId, { name: userName, amount: 0 })
    }
    usersWithMoney.get(userId).amount += collection.amount
  })

  return (
    <div className="min-h-screen bg-background">
      <SaleEditModal 
        sale={selectedSale} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        onSave={fetchBatchData} 
      />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                 Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">📋 {batch.name}</h1>
                <p className="text-muted-foreground">Ventas y cobros de la tanda #{batch.number}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              batch.status === 'ACTIVE' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
            }`}>
              {batch.status === 'ACTIVE' ? '✅ Activa' : '❌ Cerrada'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">⚖️ Libras Vendidas</p>
                  <p className="text-2xl font-bold text-foreground">{totalPounds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">💰 Total Vendido</p>
                  <p className="text-2xl font-bold text-foreground">${totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">✅ Pagado</p>
                  <p className="text-2xl font-bold text-accent">
                    ${(paidSales.reduce((sum, sale) => sum + sale.totalAmount, 0) + totalCollected).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">💰 Por Cobrar</p>
                  <p className="text-2xl font-bold text-destructive">${totalDebt.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Users with Money */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Users className="w-5 h-5 mr-2" />
                  👥 Dinero por Usuario
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersWithMoney.size === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ℹ️ No hay dinero registrado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(usersWithMoney.entries()).map(([userId, user]) => (
                      <div key={userId} className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ${user.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debtors Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Clock className="w-5 h-5 mr-2" />
                  ⏳ Clientes que Deben
                </CardTitle>
              </CardHeader>
              <CardContent>
                {creditSales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ℹ️ No hay ventas a crédito
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(new Set(creditSales.map(sale => sale.customer.id))).map(customerId => {
                      const customerSales = creditSales.filter(sale => sale.customer.id === customerId)
                      const customer = customerSales[0].customer
                      const customerCollections = collections.filter(collection => collection.customer.id === customerId)
                      const totalOwed = customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
                      const totalPaid = customerCollections.reduce((sum, collection) => sum + collection.amount, 0)
                      const currentDebt = totalOwed - totalPaid
                      
                      if (currentDebt <= 0) return null
                      
                      return (
                        <div key={customerId} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                          <div>
                            <div className="font-medium text-foreground">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customerSales.length} venta{customerSales.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-destructive">
                              ${currentDebt.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sales List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Ventas ({sales.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay ventas registradas en esta tanda
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-semibold mr-2">{sale.customer.name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sale.paymentStatus === 'PAID' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}>
                                {sale.paymentStatus === 'PAID' ? '✓ Contado' : '⏳ Crédito'}
                              </span>
                              {sale.paymentStatus === 'PENDING' && (
                                (() => {
                                  // Find collections for this customer in this batch
                                  const customerCollections = collections.filter(c => c.customer.id === sale.customer.id)
                                  const customerSales = creditSales.filter(s => s.customer.id === sale.customer.id)
                                  
                                  const totalCollectionAmount = customerCollections.reduce((sum, c) => sum + c.amount, 0)
                                  const totalCreditSalesAmount = customerSales.reduce((sum, s) => sum + s.totalAmount, 0)
                                  
                                  if (totalCollectionAmount > 0) {
                                    if (totalCollectionAmount >= totalCreditSalesAmount) {
                                      return (
                                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                          ✓ Cobrado
                                        </span>
                                      )
                                    } else {
                                      return (
                                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                          Abonado
                                        </span>
                                      )
                                    }
                                  }
                                  return null
                                })()
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <div>{sale.pounds} libras × ${sale.pricePerPound.toLocaleString()}</div>
                              <div>{new Date(sale.saleDate).toLocaleDateString()}</div>
                              <div>Vendido por: {sale.user.name}</div>
                              {sale.paymentMethod && (
                                <div>Método: {sale.paymentMethod}</div>
                              )}
                              {sale.notes && (
                                <div>Nota: {sale.notes}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ${sale.totalAmount.toLocaleString()}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEditSale(sale)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collections */}
            {collections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">💳 Cobros ({collections.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collections.map((collection) => (
                      <div key={collection.id} className="border-2 border-accent/30 rounded-lg p-4 bg-accent/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-semibold mr-2 text-foreground">✅ {collection.customer.name}</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                                Cobro - {collection.paymentMethod}
                              </span>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>{new Date(collection.collectionDate).toLocaleDateString()}</div>
                              <div>💼 Cobrado por: {collection.user.name}</div>
                              {collection.notes && (
                                <div>📝 Nota: {collection.notes}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              +${collection.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BatchSalesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando página...</p>
        </div>
      </div>
    }>
      <BatchSalesContent />
    </Suspense>
  )
}