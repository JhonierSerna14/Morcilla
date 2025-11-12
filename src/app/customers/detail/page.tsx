"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Phone, MapPin, ShoppingCart, CreditCard, Calendar, DollarSign } from "lucide-react"
import { formatBatchName, formatCurrency } from "@/lib/batch-utils"

interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
  totalDebt: number
  totalPaid: number
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
  batch: {
    id: string
    name: string
    number: number
    productionDate: string
  }
}

interface Collection {
  id: string
  amount: number
  paymentMethod: string
  collectionDate: string
  notes?: string
  batch?: {
    id: string
    name: string
    number: number
  }
}

function CustomerDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get("id")
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      fetchCustomerData()
    }
  }, [customerId])

  const fetchCustomerData = async () => {
    try {
      // Fetch customer info
      const customerResponse = await fetch(`/api/customers?id=${customerId}`)
      if (customerResponse.ok) {
        const customerData = await customerResponse.json()
        setCustomer(customerData[0]) // Assuming the API returns an array
      }

      // Fetch customer sales
      const salesResponse = await fetch(`/api/sales?customerId=${customerId}`)
      if (salesResponse.ok) {
        const salesData = await salesResponse.json()
        setSales(salesData)
      }

      // Fetch customer collections
      const collectionsResponse = await fetch(`/api/collections?customerId=${customerId}`)
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json()
        setCollections(collectionsData)
      }
    } catch (error) {
      console.error("Error fetching customer data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">⏳ Cargando información del cliente...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">🚫 Cliente no encontrado</h1>
          <p className="text-muted-foreground mb-4">No se pudo encontrar la información del cliente.</p>
          <Button onClick={() => router.back()} className="text-base h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            ← Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
                ← Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">👤 {customer.name}</h1>
                <p className="text-muted-foreground">Detalle del cliente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <User className="w-5 h-5 mr-2" />
                  👤 Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{customer.name}</h3>
                </div>
                
                {customer.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {customer.address}
                  </div>
                )}

                {/* Financial Summary */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="text-2xl font-bold text-destructive">
                        ${customer.totalDebt.toLocaleString()}
                      </div>
                      <div className="text-sm text-destructive">💰 Debe actualmente</div>
                    </div>
                    
                    <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="text-2xl font-bold text-accent">
                        ${customer.totalPaid.toLocaleString()}
                      </div>
                      <div className="text-sm text-accent">✅ Total pagado</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">🛒 Total de ventas:</span>
                    <span className="font-semibold text-foreground">{sales.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">💳 Total de cobros:</span>
                    <span className="font-semibold text-foreground">{collections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">⚖️ Libras compradas:</span>
                    <span className="font-semibold text-foreground">
                      {sales.reduce((sum, sale) => sum + sale.pounds, 0)} libras
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales & Collections History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sales History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  🛒 Historial de Ventas ({sales.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ℹ️ No hay ventas registradas para este cliente
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.id} className="border-2 border-border rounded-lg p-4 hover:bg-primary/5 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-semibold mr-2 text-foreground">
                                {sale.pounds} libras × ${sale.pricePerPound.toLocaleString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                sale.paymentStatus === 'PAID' 
                                  ? 'bg-accent/20 text-accent' 
                                  : 'bg-destructive/20 text-destructive'
                              }`}>
                                {sale.paymentStatus === 'PAID' ? '✅ Pagado' : '⏳ A crédito'}
                              </span>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(sale.saleDate).toLocaleDateString()}
                              </div>
                              <div>📋 Tanda: {formatBatchName(sale.batch)}</div>
                              {sale.paymentMethod && (
                                <div>💳 Pagado con: {sale.paymentMethod}</div>
                              )}
                              {sale.notes && (
                                <div>📝 Nota: {sale.notes}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              ${sale.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collections History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <CreditCard className="w-5 h-5 mr-2" />
                  💳 Historial de Cobros ({collections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ℹ️ No hay cobros registrados para este cliente
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collections.map((collection) => (
                      <div key={collection.id} className="border-2 border-accent/30 rounded-lg p-4 bg-accent/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-semibold mr-2 text-foreground">✅ Cobro</span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                                {collection.paymentMethod}
                              </span>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(collection.collectionDate).toLocaleDateString()}
                              </div>
                              {collection.batch && (
                                <div>📋 Tanda: {collection.batch.name}</div>
                              )}
                              {collection.notes && (
                                <div> Nota: {collection.notes}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-accent">
                              +${collection.amount.toLocaleString()}
                            </div>
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
      </div>
    </div>
  )
}

export default function CustomerDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">⏳ Cargando detalles del cliente...</p>
        </div>
      </div>
    }>
      <CustomerDetailContent />
    </Suspense>
  )
}