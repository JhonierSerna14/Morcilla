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
      concept
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

    // Verificar que el usuario tenga saldo suficiente
    const senderBalance = await prisma.cashMovement.aggregate({
      where: {
        userId: session.user.id,
        paymentMethod
      },
      _sum: {
        amount: true
      }
    })

    // Calcular balance: ingresos - egresos
    const totalIncome = await prisma.cashMovement.aggregate({
      where: {
        userId: session.user.id,
        paymentMethod,
        movementType: "INCOME"
      },
      _sum: {
        amount: true
      }
    })

    const totalExpense = await prisma.cashMovement.aggregate({
      where: {
        userId: session.user.id,
        paymentMethod,
        movementType: "EXPENSE"
      },
      _sum: {
        amount: true
      }
    })

    const balance = (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0)

    if (amount > balance) {
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
          concept
        },
        include: {
          fromUser: { select: { name: true } },
          toUser: { select: { name: true } }
        }
      })

      // Registrar movimiento de caja como EGRESO para el usuario que envía
      await tx.cashMovement.create({
        data: {
          userId: session.user.id,
          movementType: "EXPENSE",
          amount,
          paymentMethod,
          description: `Transferencia a ${transfer.toUser.name}: ${concept}`,
          movementDate: new Date()
        }
      })

      // Registrar movimiento de caja como INGRESO para el usuario que recibe
      await tx.cashMovement.create({
        data: {
          userId: toUserId,
          movementType: "INCOME",
          amount,
          paymentMethod,
          description: `Transferencia de ${transfer.fromUser.name}: ${concept}`,
          movementDate: new Date()
        }
      })

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