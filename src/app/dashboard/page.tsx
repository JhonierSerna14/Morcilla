"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Scale, DollarSign, Clock, Users, LogOut } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeBatch, setActiveBatch] = useState<ActiveBatch | null>(null)
  const [metrics, setMetrics] = useState<BatchMetrics | null>(null)
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión Familiar Morcilla
              </h1>
              <p className="text-gray-600">
                Bienvenido, {session?.user?.name}
              </p>
            </div>
            <div className="flex space-x-4 flex-wrap">
              <Link href="/customers">
                <Button variant="outline" size="lg">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes
                </Button>
              </Link>
              <Link href="/sales">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Venta
                </Button>
              </Link>
              {session?.user?.role === 'ADMIN' && (
                <Link href="/register">
                  <Button variant="outline" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tanda Activa */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tanda Activa</h2>
            <Button onClick={createNewBatch} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tanda
            </Button>
          </div>

          {activeBatch && metrics ? (
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">{activeBatch.name}</CardTitle>
                <CardDescription className="text-blue-100">
                  Iniciada: {new Date(activeBatch.productionDate).toLocaleDateString('es-CO')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{metrics.totalPounds}</div>
                    <div className="text-sm text-blue-100">Libras Vendidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      ${metrics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-100">Ingresos Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      ${metrics.paidAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-100">Cobrado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      ${metrics.pendingAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-100">Por Cobrar</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scale className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay tanda activa
                </h3>
                <p className="text-gray-600 text-center mb-4">
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Nueva Venta</div>
                  <div className="text-sm text-gray-600">Registrar venta</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/collections">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Cobrar</div>
                  <div className="text-sm text-gray-600">Registrar cobro</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Clientes</div>
                  <div className="text-sm text-gray-600">Gestionar clientes</div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cash">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mi Caja</div>
                  <div className="text-sm text-gray-600">Gestionar dinero</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}