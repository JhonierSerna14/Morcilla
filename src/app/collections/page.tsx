import { Suspense } from "react"
import CollectionsClient from "@/components/collections-client"

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <CollectionsClient />
    </Suspense>
  )
}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Success Message */}
        {success && (
          <Card className="border-accent bg-accent/10">
            <CardContent className="flex items-center justify-center py-4">
              <CheckCircle className="w-6 h-6 text-accent mr-2" />
              <span className="text-accent font-medium">✅ ¡Cobro registrado exitosamente!</span>
            </CardContent>
          </Card>
        )}

        {/* Registro de Cobro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <DollarSign className="w-5 h-5 mr-2" />
              💰 Registrar Cobro
            </CardTitle>
            <CardDescription>
              {activeBatch 
                ? `📋 Tanda activa: ${activeBatch.name}` 
                : "⚠️ No hay tanda activa"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buscar Cliente */}
            <div className="space-y-2">
              <label className="text-base font-semibold text-foreground">👤 Buscar Cliente con Deuda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="pl-10 text-base"
                  aria-label="Buscar cliente por nombre o teléfono"
                  aria-expanded={filteredCustomers.length > 0}
                />
              </div>
              
              {/* Lista de clientes filtrados */}
              {filteredCustomers.length > 0 && (
                <div role="listbox" aria-label="Resultados de búsqueda de clientes" className="border-2 border-border rounded-lg bg-background max-h-40 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setSearchCustomer(customer.name)
                        setFilteredCustomers([])
                      }}
                      role="option"
                      aria-selected={selectedCustomer?.id === customer.id}
                      className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-border last:border-b-0 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-foreground">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-destructive">
                            ${customer.totalDebt.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">💰 Debe</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-blue-900">{selectedCustomer.name}</h3>
                    {selectedCustomer.phone && (
                      <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      ${selectedCustomer.totalDebt.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Deuda Total</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Monto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto a Cobrar</label>
                <Input
                  type="number"
                  placeholder="Ej: 25000"
                  value={collectionForm.amount}
                  onChange={(e) => setCollectionForm({...collectionForm, amount: e.target.value})}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Pago</label>
                <select
                  value={collectionForm.paymentMethod}
                  onChange={(e) => setCollectionForm({...collectionForm, paymentMethod: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="NEQUI">📱 Nequi</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                </select>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (Opcional)</label>
                <Input
                  placeholder="Información adicional..."
                  value={collectionForm.notes}
                  onChange={(e) => setCollectionForm({...collectionForm, notes: e.target.value})}
                />
              </div>

              <Button 
                type="submit" 
                disabled={!selectedCustomer || saving}
                className="w-full py-6 text-lg"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Registrar Cobro
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resumen de Clientes con Deuda */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Clientes con Deudas Pendientes</CardTitle>
            <CardDescription>
              {customers.length} clientes deben un total de ${customers.reduce((sum, c) => sum + c.totalDebt, 0).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-accent mx-auto mb-2" />
                <p className="text-muted-foreground">✅ ¡Excelente! No hay deudas pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {customers.slice(0, showAllCustomers ? customers.length : 10).map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setSearchCustomer(customer.name)
                        setCollectionForm({
                          amount: customer.totalDebt.toString(),
                          paymentMethod: "EFECTIVO",
                          notes: ""
                        })
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="w-full flex justify-between items-center p-4 bg-destructive/10 rounded-lg border-2 border-destructive/20 hover:bg-destructive/20 hover:border-destructive/40 transition-all cursor-pointer"
                    >
                      <div className="text-left">
                        <div className="font-medium text-foreground">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-destructive">
                          ${customer.totalDebt.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Click para cobrar</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {customers.length > 10 && !showAllCustomers && (
                  <Button 
                    onClick={() => setShowAllCustomers(true)}
                    variant="outline"
                    className="w-full text-base"
                  >
                    👁️ Ver Más ({customers.length - 10} clientes más)
                  </Button>
                )}
                
                {showAllCustomers && (
                  <Button 
                    onClick={() => setShowAllCustomers(false)}
                    variant="outline"
                    className="w-full text-base"
                  >
                    👁️ Ver Menos
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}