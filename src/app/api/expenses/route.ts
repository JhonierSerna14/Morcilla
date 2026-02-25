import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener gastos con filtros
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const expenses = await prisma.expense.findMany({
      where: {
        ...(userId && { userId }),
        ...(startDate && endDate && {
          expenseDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }),
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { expenseDate: "desc" }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Registrar nuevo gasto
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { 
      amount, 
      concept, 
      description,
      paymentMethod,
      expenseDate
    } = await request.json()

    // Validaciones
    const validConcepts = [
      "Retiro Ganancias",
      "Materia Prima",
      "Gasolina",
      "Empaques",
      "Herramientas",
      "Otros"
    ]

    const validMethods = ["EFECTIVO", "NEQUI"]

    if (!amount || !concept) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (monto y concepto)" }, 
        { status: 400 }
      )
    }

    if (!validConcepts.includes(concept)) {
      return NextResponse.json(
        { error: `Concepto no válido: ${concept}` },
        { status: 400 }
      )
    }

    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Método de pago no válido. Debe ser EFECTIVO o NEQUI" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser mayor a 0" }, 
        { status: 400 }
      )
    }

    // Usar transacción para crear gasto y registrar movimiento de caja
    const result = await prisma.$transaction(async (tx) => {
      // Crear el gasto
      const expense = await tx.expense.create({
        data: {
          userId: session.user.id,
          amount: amount,
          concept,
          description: description || null,
          paymentMethod: paymentMethod,
          expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        },
        include: {
          user: { select: { id: true, name: true } }
        }
      })

      // Registrar movimiento de caja como EGRESO
      await tx.cashMovement.create({
        data: {
          userId: session.user.id,
          movementType: 'EXPENSE',
          amount: amount,
          paymentMethod: paymentMethod,
          description: `Gasto: ${concept}${description ? ` - ${description}` : ''}`,
          movementDate: expenseDate ? new Date(expenseDate) : new Date(),
        }
      })

      return expense
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}