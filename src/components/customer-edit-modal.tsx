"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

export function CustomerEditModal({ customer, isOpen, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false)
  const { success, error, warning, ToastContainer } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || ""
      })
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return
    
    const trimmedName = formData.name.trim()
    if (trimmedName.length < 2) {
      error("El nombre debe tener al menos 2 caracteres")
      return
    }

    if (formData.phone && formData.phone.trim().length > 0 && formData.phone.trim().length < 7) {
      error("El teléfono debe tener al menos 7 dígitos")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar cliente")
      }

      success("Cliente actualizado correctamente")
      
      onSave()
      onClose()
    } catch (err: any) {
      error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!customer) return null

  return (
    <>
      <ToastContainer />
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4">
          <div className="bg-white text-slate-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto ring-1 ring-slate-200">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Editar Cliente</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Actualiza los datos personales del cliente.
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Do�a Maria"
                    required
                    minLength={2}
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Tel�fono (Opcional)</label>
                  <Input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ej: 3001234567"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Direcci�n (Opcional)</label>
                  <Input 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Ej: Calle 123 #45-67"
                  />
                </div>

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


