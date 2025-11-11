'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Scale, 
  Calendar,
  User,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatBatchName, formatCurrency, formatDateForDisplay } from '@/lib/batch-utils';

interface BatchDetails {
  id: string;
  name: string;
  number: number;
  productionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Métricas calculadas
  totalPounds: number;
  totalRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  salesCount: number;
  
  // Ventas de la tanda
  sales: Sale[];
  
  // Resumen de deudores
  debtorsSummary: DebtorSummary[];
}

interface Sale {
  id: string;
  pounds: number;
  pricePerPound: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  saleDate: string;
  notes?: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  user: {
    id: string;
    name: string;
  };
}

interface DebtorSummary {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  totalDebt: number;
  totalSales: number;
  salesCount: number;
}

interface PaymentForm {
  amount: number;
  paymentMethod: 'EFECTIVO' | 'NEQUI';
  notes: string;
}

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;
  
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingTo, setPayingTo] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: 0,
    paymentMethod: 'EFECTIVO',
    notes: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails();
    }
  }, [batchId]);

  const fetchBatchDetails = async () => {
    try {
      const response = await fetch(`/api/batches/${batchId}`);
      if (response.ok) {
        const data = await response.json();
        // Restructurar los datos para que coincidan con la interfaz esperada
        const batchDetails = {
          id: data.batch.id,
          name: data.batch.name,
          number: data.batch.number,
          productionDate: data.batch.productionDate,
          status: data.batch.status,
          createdAt: data.batch.createdAt,
          updatedAt: data.batch.updatedAt,
          closedAt: data.batch.closedAt,
          totalPounds: data.batch.totalPounds,
          totalRevenue: data.batch.totalRevenue,
          paidAmount: data.batch.paidAmount,
          pendingAmount: data.batch.pendingAmount,
          salesCount: data.batch.salesCount,
          sales: data.sales,
          debtorsSummary: data.debtorsSummary
        };
        setBatchDetails(batchDetails);
      } else {
        console.error('Error al cargar detalles de tanda');
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPayment = (debtor: DebtorSummary) => {
    setPayingTo(debtor.customerId);
    setPaymentForm({
      amount: debtor.totalDebt,
      paymentMethod: 'EFECTIVO',
      notes: ''
    });
  };

  const cancelPayment = () => {
    setPayingTo(null);
    setPaymentForm({
      amount: 0,
      paymentMethod: 'EFECTIVO',
      notes: ''
    });
  };

  const submitPayment = async () => {
    if (!payingTo || paymentForm.amount <= 0) return;

    setPaymentLoading(true);
    
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: payingTo,
          batchId: batchId,
          amount: paymentForm.amount,
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes
        })
      });

      if (response.ok) {
        alert('✅ Pago registrado correctamente');
        cancelPayment();
        fetchBatchDetails(); // Recargar datos
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'No se pudo registrar el pago'}`);
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('❌ Error al registrar el pago');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!batchDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tanda no encontrada</h1>
          <p className="text-gray-600 mb-4">No se pudo cargar la información de esta tanda</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{formatBatchName(batchDetails)}</h1>
            <p className="text-gray-600">{formatDateForDisplay(batchDetails.productionDate)}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            batchDetails.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {batchDetails.status === 'ACTIVE' ? '🟢 Activa' : '🔴 Cerrada'}
          </div>
        </div>
      </div>

      {/* Métricas Generales */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Scale className="w-4 h-4" />
              Total Libras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchDetails.totalPounds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(batchDetails.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Ya Cobrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(batchDetails.paidAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(batchDetails.pendingAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista de Deudores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Clientes con Deuda ({batchDetails.debtorsSummary.length})
            </CardTitle>
            <CardDescription>
              Clientes que deben dinero de esta tanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {batchDetails.debtorsSummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">¡Todas las deudas cobradas!</p>
                <p className="text-sm">No hay deudas pendientes en esta tanda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {batchDetails.debtorsSummary.map((debtor) => (
                  <div
                    key={debtor.customerId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{debtor.customerName}</span>
                      </div>
                      {debtor.customerPhone && (
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{debtor.customerPhone}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        {debtor.salesCount} venta(s) • {debtor.totalSales} lbs
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(debtor.totalDebt)}
                      </div>
                      <Button
                        onClick={() => startPayment(debtor)}
                        size="sm"
                        className="mt-2"
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Cobrar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventas de la Tanda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Ventas Registradas ({batchDetails.sales.length})
            </CardTitle>
            <CardDescription>
              Todas las ventas de esta tanda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {batchDetails.sales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Scale className="w-12 h-12 mx-auto mb-3" />
                <p>No hay ventas registradas</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {batchDetails.sales.map((sale) => (
                  <div key={sale.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{sale.customer.name}</div>
                        <div className="text-sm text-gray-600">
                          {sale.pounds} lbs × {formatCurrency(sale.pricePerPound)} = {formatCurrency(sale.totalAmount)}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        sale.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {sale.paymentStatus === 'PAID' ? 'Pagado' : 'A Crédito'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.saleDate).toLocaleDateString('es-CO')} • 
                      {sale.paymentMethod} • 
                      Vendido por {sale.user.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Pago */}
      {payingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Registrar Pago</CardTitle>
              <CardDescription>
                Cliente: {batchDetails.debtorsSummary.find(d => d.customerId === payingTo)?.customerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monto a cobrar</label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Método de pago</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as 'EFECTIVO' | 'NEQUI' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="EFECTIVO">💵 Efectivo</option>
                  <option value="NEQUI">📱 Nequi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Notas adicionales..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={cancelPayment}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={submitPayment}
                  disabled={paymentLoading || paymentForm.amount <= 0}
                  className="flex-1"
                >
                  {paymentLoading ? 'Guardando...' : `Cobrar ${formatCurrency(paymentForm.amount)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}