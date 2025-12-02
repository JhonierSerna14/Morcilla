import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener transacciones recientes (incluye movimientos manuales de caja)
    const [cashMovements, sales, collections, transfersSent, transfersReceived] = await Promise.all([
      // Movimientos manuales de caja (ingresos/egresos)
      prisma.cashMovement.findMany({ where: { userId }, orderBy: { movementDate: 'desc' }, take: 20 }),
      // Ventas del usuario
      prisma.sale.findMany({
        where: { userId },
        include: {
          customer: { select: { name: true } },
          batch: { select: { name: true } }
        },
        orderBy: { saleDate: 'desc' },
        take: 20
      }),
      
      // Cobros del usuario
      prisma.collection.findMany({
        where: { userId },
        include: {
          customer: { select: { name: true } },
          batch: { select: { name: true } }
        },
        orderBy: { collectionDate: 'desc' },
        take: 20
      }),
      
      // Transferencias enviadas
      prisma.transfer.findMany({
        where: { fromUserId: userId },
        include: {
          toUser: { select: { name: true } }
        },
        orderBy: { transferDate: 'desc' },
        take: 20
      }),
      
      // Transferencias recibidas
      prisma.transfer.findMany({
        where: { toUserId: userId },
        include: {
          fromUser: { select: { name: true } }
        },
        orderBy: { transferDate: 'desc' },
        take: 20
      })
    ]);

    // Combinar y formatear todas las transacciones
    const transactions = [
      // Ventas
      ...sales.map(sale => ({
        id: sale.id,
        type: 'sale' as const,
        amount: sale.totalAmount,
        method: sale.paymentMethod,
        date: sale.saleDate.toISOString(),
        description: `Venta a ${sale.customer.name} - ${sale.pounds} lb`
      })),
      
      // Cobros
      ...collections.map(collection => ({
        id: collection.id,
        type: 'collection' as const,
        amount: collection.amount,
        method: collection.paymentMethod,
        date: collection.collectionDate.toISOString(),
        description: `Cobro a ${collection.customer.name}`
      })),
      
      // Transferencias enviadas
      ...transfersSent.map(transfer => ({
        id: transfer.id,
        type: 'transfer_sent' as const,
        amount: transfer.amount,
        method: transfer.paymentMethod,
        date: transfer.transferDate.toISOString(),
        description: `Envío a ${transfer.toUser.name}: ${transfer.concept}`
      })),
      
      // Transferencias recibidas
      ...transfersReceived.map(transfer => ({
        id: transfer.id,
        type: 'transfer_received' as const,
        amount: transfer.amount,
        method: transfer.paymentMethod,
        date: transfer.transferDate.toISOString(),
        description: `Recibo de ${transfer.fromUser.name}: ${transfer.concept}`
      })),

      // Movimientos manuales de caja
      ...cashMovements.map(m => ({
        id: m.id,
        type: m.movementType === 'EXPENSE' ? 'cash_movement_expense' as const : 'cash_movement_income' as const,
        amount: m.movementType === 'EXPENSE' ? -m.amount : m.amount,
        method: m.paymentMethod,
        date: m.movementDate.toISOString(),
        description: m.description
      }))
    ];

    // Ordenar por fecha y retornar las más recientes
    const sortedTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    return NextResponse.json(sortedTransactions);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}