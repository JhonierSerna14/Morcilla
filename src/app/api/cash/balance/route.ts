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

    // Obtener todas las transacciones del usuario
    const [sales, collections, transfersSent, transfersReceived, cashMovements] = await Promise.all([
      // Ventas del usuario (solo ventas pagadas)
      prisma.sale.aggregate({
        where: { userId, paymentStatus: 'PAID' },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Cobros del usuario
      prisma.collection.aggregate({
        where: { userId },
        _sum: {
          amount: true
        }
      }),
      
      // Transferencias enviadas
      prisma.transfer.aggregate({
        where: { fromUserId: userId },
        _sum: {
          amount: true
        }
      }),
      
      // Transferencias recibidas
      prisma.transfer.aggregate({
        where: { toUserId: userId },
        _sum: {
          amount: true
        }
      }),
      
      // Movimientos de caja (separamos ingresos y egresos)
        prisma.cashMovement.aggregate({
          where: { userId },
          _sum: {
            amount: true
          }
        })
    ]);

    // Calcular por método de pago
    const [salesByMethod, collectionsByMethod, transfersSentByMethod, transfersReceivedByMethod, cashMovementsIncomeByMethod, cashMovementsExpenseByMethod] = await Promise.all([
      // Ventas por método (solo ventas pagadas)
      prisma.sale.groupBy({
        by: ['paymentMethod'],
        where: { userId, paymentStatus: 'PAID' },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Cobros por método
      prisma.collection.groupBy({
        by: ['paymentMethod'],
        where: { userId },
        _sum: {
          amount: true
        }
      }),
      
      // Transferencias enviadas por método
      prisma.transfer.groupBy({
        by: ['paymentMethod'],
        where: { fromUserId: userId },
        _sum: {
          amount: true
        }
      }),
      
      // Transferencias recibidas por método
      prisma.transfer.groupBy({
        by: ['paymentMethod'],
        where: { toUserId: userId },
        _sum: {
          amount: true
        }
      }),
      
      // Movimientos de caja ingresos por método
      prisma.cashMovement.groupBy({
        by: ['paymentMethod'],
        where: { userId, movementType: 'INCOME' },
        _sum: { amount: true }
      }),
      // Movimientos de caja egresos por método
      prisma.cashMovement.groupBy({
        by: ['paymentMethod'],
        where: { userId, movementType: 'EXPENSE' },
        _sum: { amount: true }
      })
    ]);

    // Procesar los datos
    const salesCash = salesByMethod.find((s: any) => s.paymentMethod === 'EFECTIVO')?._sum.totalAmount || 0;
    const salesNequi = salesByMethod.find((s: any) => s.paymentMethod === 'NEQUI')?._sum.totalAmount || 0;
    
    const collectionsCash = collectionsByMethod.find((c: any) => c.paymentMethod === 'EFECTIVO')?._sum.amount || 0;
    const collectionsNequi = collectionsByMethod.find((c: any) => c.paymentMethod === 'NEQUI')?._sum.amount || 0;
    
    const transfersSentCash = transfersSentByMethod.find((t: any) => t.paymentMethod === 'EFECTIVO')?._sum.amount || 0;
    const transfersSentNequi = transfersSentByMethod.find((t: any) => t.paymentMethod === 'NEQUI')?._sum.amount || 0;
    
    const transfersReceivedCash = transfersReceivedByMethod.find((t: any) => t.paymentMethod === 'EFECTIVO')?._sum.amount || 0;
    const transfersReceivedNequi = transfersReceivedByMethod.find((t: any) => t.paymentMethod === 'NEQUI')?._sum.amount || 0;

    const cashMovementsIncomeCash = cashMovementsIncomeByMethod.find((m: any) => m.paymentMethod === 'EFECTIVO')?._sum.amount || 0;
    const cashMovementsIncomeNequi = cashMovementsIncomeByMethod.find((m: any) => m.paymentMethod === 'NEQUI')?._sum.amount || 0;

    const cashMovementsExpenseCash = cashMovementsExpenseByMethod.find((m: any) => m.paymentMethod === 'EFECTIVO')?._sum.amount || 0;
    const cashMovementsExpenseNequi = cashMovementsExpenseByMethod.find((m: any) => m.paymentMethod === 'NEQUI')?._sum.amount || 0;

    // Calcular totales (descontar gastos)
    // Sumamos ingresos y restamos egresos, teniendo en cuenta ventas, cobros y transferencias
    const totalCash = salesCash + collectionsCash - transfersSentCash + transfersReceivedCash + cashMovementsIncomeCash - cashMovementsExpenseCash;
    const totalNequi = salesNequi + collectionsNequi - transfersSentNequi + transfersReceivedNequi + cashMovementsIncomeNequi - cashMovementsExpenseNequi;
    const grandTotal = totalCash + totalNequi;

    const response = {
      userId,
      userName: session.user.name,
      sales: {
        cash: salesCash,
        nequi: salesNequi
      },
      collections: {
        cash: collectionsCash,
        nequi: collectionsNequi
      },
      transfersSent: {
        cash: transfersSentCash,
        nequi: transfersSentNequi
      },
      transfersReceived: {
        cash: transfersReceivedCash,
        nequi: transfersReceivedNequi
      },
      cashMovements: {
        cash: (cashMovementsIncomeCash - cashMovementsExpenseCash),
        nequi: (cashMovementsIncomeNequi - cashMovementsExpenseNequi)
      },
      totalCash,
      totalNequi,
      grandTotal
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener balance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}