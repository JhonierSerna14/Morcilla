"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'

// Transfer page now redirects to /cash

export default function TransfersPage() {
  // Esta página fue consolidada en /cash (Movimientos).
  // Para evitar duplicar interfaces, redirigimos al usuario a /cash.
  const router = useRouter()
  useEffect(() => { router.replace('/cash') }, [router])
  return null

  // Form states
  const [transferForm, setTransferForm] = useState({
    toUserId: "",
    amount: "",
    paymentMethod: "EFECTIVO",
    concept: "",
    notes: ""
  })

  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchTransfers()
    ]).finally(() => setLoading(false))
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      // Filtrar al usuario actual de la lista
      const otherUsers = data.filter((user: User) => user.id !== session?.user?.id)
      setUsers(otherUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchTransfers = async () => {
    try {
      const response = await fetch("/api/transfers")
      const data = await response.json()
      setTransfers(data)
    } catch (error) {
      console.error("Error fetching transfers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(transferForm.amount)

    if (!amount || amount <= 0) {
      alert("❌ Por favor ingresa un monto válido (mayor a 0)")
      return
    }

    if (!transferForm.toUserId) {
      alert("❌ Debes seleccionar el usuario que va a recibir el dinero")
      return
    }

    if (!transferForm.concept.trim()) {
      alert("❌ El concepto de la transferencia es obligatorio")
      return
    }

    if (transferForm.concept.trim().length < 3) {
      alert("❌ El concepto debe tener al menos 3 caracteres")
      return
    }

    // Confirmación para transferencias grandes
    if (amount > 500000) {
      const toUser = users.find(u => u.id === transferForm.toUserId)
      const confirm = window.confirm(`⚠️ Estás transfiriendo $${amount.toLocaleString()} a ${toUser?.name || 'usuario desconocido'}. ¿Estás seguro?`)
      if (!confirm) return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: transferForm.toUserId,
          amount: amount,
          paymentMethod: transferForm.paymentMethod,
          concept: transferForm.concept.trim(),
          notes: transferForm.notes.trim() || null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)

        // Mostrar mensaje de éxito
        const toUser = users.find(u => u.id === transferForm.toUserId)
        alert(`✅ ¡Transferencia registrada exitosamente!\n\n` +
              `Para: ${toUser?.name || 'Usuario'}\n` +
              `Monto: $${amount.toLocaleString()}\n` +
              `Método: ${transferForm.paymentMethod}\n` +
              `Concepto: ${transferForm.concept.trim()}`)

        // Reset form
        setTransferForm({
          toUserId: "",
          amount: "",
          paymentMethod: "EFECTIVO",
          concept: "",
          notes: ""
        })

        // Refresh data
        fetchTransfers()
      } else {
        const error = await response.json()
        alert(`❌ Error al registrar la transferencia:\n${error.error || "Error desconocido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error de conexión. Verifica tu internet y vuelve a intentar.")
    } finally {
      setSaving(false)
    }
  }

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
            <h1 className="text-3xl font-bold text-foreground">🔄 Transferencias Internas</h1>
            <p className="text-muted-foreground text-base mt-1">
              Registra cuando entregas dinero a otro usuario del sistema
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
              <span className="text-accent font-semibold text-base">✅ ¡Transferencia registrada exitosamente!</span>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-secondary/10 border-2 border-secondary/40">
          <CardContent className="flex items-start py-5">
            <AlertCircle className="w-6 h-6 text-secondary mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-foreground text-base">
              <p className="font-semibold mb-2">❓ ¿Cuándo usar las transferencias?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cuando le entregas efectivo o Nequi a otro vendedor</li>
                <li>• Al pasar dinero de ventas al administrador</li>
                <li>• Para dividir el dinero entre usuarios del sistema</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Registro de Transferencia */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ArrowLeftRight className="w-6 h-6 mr-3 text-primary" />
              Registrar Transferencia
            </CardTitle>
            <CardDescription className="text-base">
              De: {session?.user?.name || "Tu usuario"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Usuario destino */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  👤 Usuario Destino *
                </label>
                <select
                  value={transferForm.toUserId}
                  onChange={(e) => setTransferForm({...transferForm, toUserId: e.target.value})}
                  className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-3 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="">Selecciona a quién le entregas el dinero...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  💰 Monto a Transferir *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="number"
                    placeholder="Ej: 150000"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                    min="0"
                    step="1000"
                    required
                    className="pl-10 py-3 text-lg"
                  />
                </div>
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  💳 Tipo de Dinero *
                </label>
                <select
                  value={transferForm.paymentMethod}
                  onChange={(e) => setTransferForm({...transferForm, paymentMethod: e.target.value})}
                  className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="NEQUI">📱 Nequi</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              {/* Concepto */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  📋 Concepto/Motivo *
                </label>
                <select
                  value={transferForm.concept}
                  onChange={(e) => setTransferForm({...transferForm, concept: e.target.value})}
                  className="w-full h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  required
                >
                  <option value="">Selecciona el motivo...</option>
                  <option value="Entrega de ventas">💰 Entrega de ventas del día</option>
                  <option value="Entrega de cobros">💳 Entrega de cobros realizados</option>
                  <option value="División de dinero">🤝 División de dinero entre usuarios</option>
                  <option value="Préstamo interno">🏦 Préstamo entre usuarios</option>
                  <option value="Cambio de efectivo">💱 Cambio efectivo por Nequi</option>
                  <option value="Otros">📝 Otros</option>
                </select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="text-base font-semibold text-foreground">
                  📝 Notas Adicionales
                </label>
                <textarea
                  placeholder="Información adicional sobre la transferencia..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({...transferForm, notes: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button 
                type="submit" 
                disabled={saving}
                className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  <>
                    <ArrowLeftRight className="w-5 h-5 mr-2" />
                    Registrar Transferencia
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Historial de Transferencias */}
        <Card>
          <CardHeader>
            <CardTitle>📤 Historial de Transferencias</CardTitle>
            <CardDescription>
              Transferencias recientes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transfers.length === 0 ? (
              <div className="text-center py-8">
                <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No hay transferencias registradas</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="p-4 border-2 border-border rounded-lg bg-background/50 hover:bg-primary/5 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <ArrowLeftRight className="w-4 h-4 text-primary mr-2" />
                          <span className="font-semibold text-foreground">{transfer.concept}</span>
                        </div>
                        
                        <div className="text-base text-foreground mb-2">
                          <span className="font-medium">{transfer.fromUser.name}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{transfer.toUser.name}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{new Date(transfer.transferDate).toLocaleDateString('es-CO')}</span>
                          <span className="mx-2">•</span>
                          <span>{transfer.paymentMethod}</span>
                        </div>
                        
                        {transfer.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{transfer.notes}</p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="font-bold text-purple-600 text-lg">
                          ${transfer.amount.toLocaleString()}
                        </div>
                        <div className={`text-xs ${
                          transfer.fromUser.id === session?.user?.id ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transfer.fromUser.id === session?.user?.id ? 'Enviado' : 'Recibido'}
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
  )
}