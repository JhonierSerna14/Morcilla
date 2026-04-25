"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { AlertCircle, AlertTriangle } from "lucide-react"

export function SaleEditModal({ sale, isOpen, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false)
  const { success, error, warning, ToastContainer } = useToast()

  const [formData, setFormData] = useState<{
    pounds: string;
    pricePerPound: string;
    paymentStatus: string;
    paymentMethod: string;
    notes: string;
  }>({
    pounds: "",
    pricePerPound: "",
    paymentStatus: "",
    paymentMethod: "",
    notes: ""
  })

  useEffect(() => {
    if (sale) {
      setFormData({
        pounds: sale.pounds.toString(),
        pricePerPound: sale.pricePerPound.toString(),
        paymentStatus: sale.paymentStatus,
        paymentMethod: sale.paymentMethod || "EFECTIVO",
        notes: sale.notes || ""
      })
    }
  }, [sale])

  const calculateTotal = () => {
    const p = parseFloat(formData.pounds) || 0
    const price = parseFloat(formData.pricePerPound) || 0
    return p * price
  }

  const isChangingToCredit = sale?.paymentStatus === "PAID" && formData.paymentStatus === "PENDING"
  const isChangingToPaid = sale?.paymentStatus === "PENDING" && formData.paymentStatus === "PAID"
  const isAmountChanging = sale && (parseFloat(formData.pounds || '0') !== sale.pounds || parseFloat(formData.pricePerPound || '0') !== sale.pricePerPound)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sale) return
    
    const p = parseFloat(formData.pounds)
    const price = parseFloat(formData.pricePerPound)
    
    if (p <= 0 || price <= 0) {
      error("Libras y precio deben ser mayores a 0")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pounds: p,
          pricePerPound: price,
          paymentStatus: formData.paymentStatus,
          paymentMethod: formData.paymentStatus === "PAID" ? formData.paymentMethod : null,
          notes: formData.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar venta")
      }

      success("Venta actualizada ✓")
      
      onSave()
      onClose()
    } catch (err: any) {
      error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!sale) return null

  return (
    <>
      <ToastContainer />
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white text-slate-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto ring-1 ring-slate-200">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Editar Venta</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cliente: <strong>{sale.customer?.name}</strong> • Tanda: {sale.batch?.name}
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Libras</label>
                    <Input 
                      type="number" 
                      value={formData.pounds}
                      onChange={(e) => setFormData({...formData, pounds: e.target.value})}
                      min="0" 
                      step="1"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio ($)</label>
                    <Input 
                      type="number" 
                      value={formData.pricePerPound}
                      onChange={(e) => setFormData({...formData, pricePerPound: e.target.value})}
                      min="0" 
                      step="100"
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3 text-center border border-border mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Calculado</p>
                  <p className="text-2xl font-bold font-mono">
                    ${calculateTotal().toLocaleString('es-CO')}
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Estado de Pago</label>
                  <select 
                    value={formData.paymentStatus} 
                    onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white text-slate-900 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="PAID">De Contado (Pagó YA)</option>
                    <option value="PENDING">A Crédito (Debe)</option>
                  </select>
                </div>

                {formData.paymentStatus === "PAID" && (
                  <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-medium">Método de Pago</label>
                    <select 
                      value={formData.paymentMethod} 
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white text-slate-900 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="EFECTIVO">Efectivo 💵</option>
                      <option value="NEQUI">Nequi 📱</option>
                    </select>
                  </div>
                )}
                
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Notas (Opcional)</label>
                  <Input 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Nota de la venta..."
                  />
                </div>

                {isChangingToCredit && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 mt-4">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>
                      <strong>Atención:</strong> Al cambiar a crédito, se <strong>borrará</strong> el ingreso de ${sale.totalAmount.toLocaleString('es-CO')} que estaba registrado en tu caja y la deuda del cliente aumentará.
                    </p>
                  </div>
                )}
                
                {isChangingToPaid && (
                  <div className="rounded-md bg-sky-50 dark:bg-sky-950/30 p-3 flex items-start gap-2 text-sm text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 mt-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                      <strong>Atención:</strong> Al cambiar a contado, se <strong>registrará automáticamente un ingreso</strong> en tu caja por ${calculateTotal().toLocaleString('es-CO')} y reducirá la deuda del cliente.
                    </p>
                  </div>
                )}

                {isAmountChanging && !isChangingToCredit && !isChangingToPaid && formData.paymentStatus === "PAID" && (
                  <div className="rounded-md bg-sky-50 dark:bg-sky-950/30 p-3 flex items-start gap-2 text-sm text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50 mt-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                      <strong>El monto cambió:</strong> Se ajustará tu ingreso en caja y los totales del cliente.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 mt-2 border-t">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


