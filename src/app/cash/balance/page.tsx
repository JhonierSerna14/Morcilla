'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon } from 'lucide-react';

interface CashBalance {
  userId: string;
  userName: string;
  sales: {
    cash: number;
    nequi: number;
  };
  collections: {
    cash: number;
    nequi: number;
  };
  transfersSent: {
    cash: number;
    nequi: number;
  };
  transfersReceived: {
    cash: number;
    nequi: number;
  };
  totalCash: number;
  totalNequi: number;
  grandTotal: number;
}

interface RecentTransaction {
  id: string;
  type: 'sale' | 'collection' | 'transfer_sent' | 'transfer_received';
  amount: number;
  method: 'EFECTIVO' | 'NEQUI';
  date: string;
  description: string;
}

export default function MiCaja() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<CashBalance | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
      fetchRecentTransactions();
    }
  }, [session]);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/cash/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Error al cargar balance:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/cash/transactions');
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data.slice(0, 10)); // Últimas 10 transacciones
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
      case 'collection':
      case 'transfer_received':
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case 'transfer_sent':
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSignIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale':
      case 'collection':
      case 'transfer_received':
        return 'text-green-600';
      case 'transfer_sent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

  if (!balance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mi Caja</h1>
        <p className="text-gray-500">Error al cargar la información de su caja</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mi Caja</h1>
        <Button
          onClick={() => {
            fetchBalance();
            fetchRecentTransactions();
          }}
          variant="outline"
          size="sm"
        >
          🔄 Actualizar
        </Button>
      </div>

      {/* Resumen de Dinero */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              💵 Efectivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(balance.totalCash)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <div>Ventas: {formatCurrency(balance.sales.cash)}</div>
              <div>Cobros: {formatCurrency(balance.collections.cash)}</div>
              <div>Enviado: -{formatCurrency(balance.transfersSent.cash)}</div>
              <div>Recibido: +{formatCurrency(balance.transfersReceived.cash)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              📱 Nequi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(balance.totalNequi)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <div>Ventas: {formatCurrency(balance.sales.nequi)}</div>
              <div>Cobros: {formatCurrency(balance.collections.nequi)}</div>
              <div>Enviado: -{formatCurrency(balance.transfersSent.nequi)}</div>
              <div>Recibido: +{formatCurrency(balance.transfersReceived.nequi)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              💰 Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(balance.grandTotal)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Efectivo + Nequi
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimientos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay movimientos recientes
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.date)} • {transaction.method}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'transfer_sent' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón para ir a Transferencias */}
      <div className="mt-6 text-center">
        <Button 
          onClick={() => window.location.href = '/cash'}
          variant="outline"
          size="lg"
        >
          📤 Hacer Transferencia
        </Button>
      </div>
    </div>
  );
}