import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener balance de caja del usuario
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener movimientos de caja del usuario
    const movements = await prisma.cashMovement.findMany({
      where: { userId: session.user.id },
      orderBy: { movementDate: "desc" },
      take: 50
    })

    // Calcular balance por método de pago
    const balanceEfectivo = movements
      .filter((m: any) => m.paymentMethod === "EFECTIVO")
      .reduce((sum: number, m: any) => {
        return m.movementType === "INCOME" 
          ? sum + parseFloat(m.amount.toString())
          : sum - parseFloat(m.amount.toString())
      }, 0)

    const balanceNequi = movements
      .filter((m: any) => m.paymentMethod === "NEQUI")
      .reduce((sum: number, m: any) => {
        return m.movementType === "INCOME" 
          ? sum + parseFloat(m.amount.toString())
          : sum - parseFloat(m.amount.toString())
      }, 0)

    // Obtener ventas pagadas del usuario
    const paidSales = await prisma.sale.findMany({
      where: {
        userId: session.user.id,
        paymentStatus: "PAID"
      },
      select: {
        totalAmount: true,
        paymentMethod: true,
        saleDate: true
      },
      orderBy: { saleDate: "desc" },
      take: 10
    })

    // Obtener cobros realizados por el usuario
    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      select: {
        amount: true,
        paymentMethod: true,
        collectionDate: true,
        customer: { select: { name: true } }
      },
      orderBy: { collectionDate: "desc" },
      take: 10
    })

    return NextResponse.json({
      balance: {
        efectivo: balanceEfectivo,
        nequi: balanceNequi,
        total: balanceEfectivo + balanceNequi
      },
      movements,
      recentSales: paidSales,
      recentCollections: collections
    })
  } catch (error) {
    console.error("Error fetching cash balance:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Registrar movimiento de caja
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { 
      movementType, 
      amount, 
      paymentMethod, 
      description 
    } = await request.json()

    // Validaciones
    if (!movementType || !amount || !paymentMethod || !description) {
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

    const movement = await prisma.cashMovement.create({
      data: {
        userId: session.user.id,
        movementType,
        amount,
        paymentMethod,
        description
      }
    })

    return NextResponse.json(movement)
  } catch (error) {
    console.error("Error creating cash movement:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}