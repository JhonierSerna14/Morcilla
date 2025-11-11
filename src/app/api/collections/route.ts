import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener cobros con filtros
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get("batchId")
    const customerId = searchParams.get("customerId")
    const userId = searchParams.get("userId")

    const collections = await prisma.collection.findMany({
      where: {
        ...(batchId && { batchId: batchId }),
        ...(customerId && { customerId }),
        ...(userId && { userId }),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true, number: true } }
      },
      orderBy: { collectionDate: "desc" }
    })

    return NextResponse.json(collections)
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Registrar nuevo cobro
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { 
      customerId, 
      amount, 
      paymentMethod, 
      batchId,
      notes 
    } = await request.json()

    // Validaciones
    if (!customerId || !amount || !paymentMethod) {
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

    // Verificar que existe el cliente
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que el cliente tiene deuda pendiente
    if (customer.totalDebt < amount) {
      return NextResponse.json(
        { error: "El cliente no tiene suficiente deuda pendiente" },
        { status: 400 }
      )
    }

    // Usar transacción para crear cobro y actualizar totales del cliente
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear el cobro
      const collection = await tx.collection.create({
        data: {
          customerId,
          userId: session.user.id,
          batchId: batchId || null,
          amount: amount,
          paymentMethod,
          notes: notes || null,
        },
        include: {
          customer: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
          batch: { select: { name: true } }
        }
      })

      // Actualizar totales del cliente
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalDebt: {
            decrement: amount
          },
          totalPaid: {
            increment: amount
          }
        }
      })

      return collection
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating collection:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}