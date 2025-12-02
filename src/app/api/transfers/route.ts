import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener transferencias del usuario
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ]
      },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } }
      },
      orderBy: { transferDate: "desc" },
      take: 20
    })

    return NextResponse.json(transfers)
  } catch (error) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Crear nueva transferencia
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { 
      toUserId, 
      amount, 
      paymentMethod, 
      concept, 
      notes 
    } = await request.json()

    // Validaciones
    if (!toUserId || !amount || !paymentMethod || !concept) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" }, 
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" }, 
        { status: 400 }
      )
    }

    if (toUserId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes transferir dinero a ti mismo" }, 
        { status: 400 }
      )
    }

    // Verificar que el usuario destino existe
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId }
    })

    if (!toUser || !toUser.active) {
      return NextResponse.json(
        { error: "Usuario destino no encontrado" },
        { status: 404 }
      )
    }

    // Usar transacción para crear transferencia.
    // NOTE: No creamos movimientos de caja aquí para evitar duplicar
    // registros. Las transferencias se registran en la tabla `transfer` y
    // el balance se calcula a partir de `sales`, `collections`, `transfers` y `cashMovement`.
    // Antes de crear la transferencia, verificar que el usuario que envía
    // tenga saldo suficiente en el método de pago seleccionado.
    // Calculamos el balance únicamente para ese método de pago.
    const senderBalanceResult = await prisma.$transaction(async (txWhere: any) => {
      const [sales, collections, transfersSent, transfersReceived, cashMovementsIncome, cashMovementsExpense] = await Promise.all([
        txWhere.sale.aggregate({ where: { userId: session.user.id, paymentMethod, paymentStatus: 'PAID' }, _sum: { totalAmount: true } }),
        txWhere.collection.aggregate({ where: { userId: session.user.id, paymentMethod }, _sum: { amount: true } }),
        txWhere.transfer.aggregate({ where: { fromUserId: session.user.id, paymentMethod }, _sum: { amount: true } }),
        txWhere.transfer.aggregate({ where: { toUserId: session.user.id, paymentMethod }, _sum: { amount: true } }),
        txWhere.cashMovement.aggregate({ where: { userId: session.user.id, movementType: 'INCOME', paymentMethod }, _sum: { amount: true } }),
        txWhere.cashMovement.aggregate({ where: { userId: session.user.id, movementType: 'EXPENSE', paymentMethod }, _sum: { amount: true } }),
      ])

      const salesAmount = sales._sum.totalAmount || 0
      const collectionsAmount = collections._sum.amount || 0
      const transfersSentAmount = transfersSent._sum.amount || 0
      const transfersReceivedAmount = transfersReceived._sum.amount || 0
      const cashIncome = cashMovementsIncome._sum.amount || 0
      const cashExpense = cashMovementsExpense._sum.amount || 0

      return salesAmount + collectionsAmount - transfersSentAmount + transfersReceivedAmount + cashIncome - cashExpense
    })

    if (amount > senderBalanceResult) {
      return NextResponse.json({ error: 'No tienes suficiente saldo para realizar esta transferencia' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Crear la transferencia
      const transfer = await tx.transfer.create({
        data: {
          fromUserId: session.user.id,
          toUserId,
          amount,
          paymentMethod,
          concept,
          notes: notes || null
        },
        include: {
          fromUser: { select: { name: true } },
          toUser: { select: { name: true } }
        }
      })

      // Nota: No insertamos movimientos de caja aquí para evitar duplicados.
      // Si se requiere mantener movimiento en `cashMovement`, se puede crear
      // con un campo adicional para relacionarlo a la transferencia; por ahora,
      // evitamos crear movimientos duplicados pues la interfaz lista las
      // transferencias por separado.

      return transfer
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating transfer:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// GET all users for transfer selection
export async function OPTIONS() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: { 
        active: true,
        NOT: { id: session.user.id } // Excluir al usuario actual
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}