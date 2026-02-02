import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Obtener ventas pagadas
    const sales = await prisma.sale.findMany({
      where: {
        userId: session.user.id,
        paymentStatus: 'PAID'
      },
      orderBy: { saleDate: 'desc' },
      take: limit,
      include: {
        customer: {
          select: { name: true }
        },
        batch: {
          select: { name: true }
        }
      }
    })

    // Obtener cobros
    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { collectionDate: 'desc' },
      take: limit,
      include: {
        customer: {
          select: { name: true }
        },
        batch: {
          select: { name: true }
        }
      }
    })

    // Obtener transferencias enviadas
    const transfersSent = await prisma.transfer.findMany({
      where: {
        fromUserId: session.user.id
      },
      orderBy: { transferDate: 'desc' },
      take: limit,
      include: {
        toUser: {
          select: { name: true }
        }
      }
    })

    // Obtener transferencias recibidas
    const transfersReceived = await prisma.transfer.findMany({
      where: {
        toUserId: session.user.id
      },
      orderBy: { transferDate: 'desc' },
      take: limit,
      include: {
        fromUser: {
          select: { name: true }
        }
      }
    })

    // Obtener movimientos de caja (egresos/ingresos manuales)
    // Excluir movimientos automáticos creados por ventas o cobros para evitar duplicados en la lista
    const cashMovements = await prisma.cashMovement.findMany({
      where: {
        userId: session.user.id,
        NOT: [
          { description: { startsWith: 'Cobro a' } },
          { description: { startsWith: 'Venta a' } }
        ]
      },
      orderBy: { movementDate: 'desc' },
      take: limit
    })

    // Formatear movimientos
    const movements = [
      ...sales.map(sale => ({
        id: sale.id,
        type: 'SALE' as const,
        amount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        date: sale.saleDate,
        description: `Venta - ${sale.customer?.name || 'Cliente'} (${sale.pounds} lb)`,
        batch: sale.batch?.name,
        customer: sale.customer?.name
      })),
      ...collections.map(collection => ({
        id: collection.id,
        type: 'COLLECTION' as const,
        amount: collection.amount,
        paymentMethod: collection.paymentMethod,
        date: collection.collectionDate,
        description: `Cobro - ${collection.customer?.name || 'Cliente'}`,
        batch: collection.batch?.name,
        customer: collection.customer?.name
      })),
      ...transfersSent.map(transfer => ({
        id: transfer.id,
        type: 'TRANSFER_SENT' as const,
        amount: -transfer.amount, // Negativo porque es salida
        paymentMethod: transfer.paymentMethod,
        date: transfer.transferDate,
        description: `Transferencia enviada a ${transfer.toUser?.name}`,
        concept: transfer.concept
      })),
      ...transfersReceived.map(transfer => ({
        id: transfer.id,
        type: 'TRANSFER_RECEIVED' as const,
        amount: transfer.amount,
        paymentMethod: transfer.paymentMethod,
        date: transfer.transferDate,
        description: `Transferencia recibida de ${transfer.fromUser?.name}`,
        concept: transfer.concept
      }))
      ,
      ...cashMovements.map(m => ({
        id: m.id,
        type: m.movementType === 'EXPENSE' ? 'MOVEMENT_EXPENSE' as const : 'MOVEMENT_INCOME' as const,
        amount: m.movementType === 'EXPENSE' ? -m.amount : m.amount,
        paymentMethod: m.paymentMethod,
        date: m.movementDate,
        description: m.description
      }))
    ]

    // Ordenar por fecha descendente
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      movements: movements.slice(0, limit)
    })

  } catch (error) {
    console.error('Error al obtener movimientos de caja:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}