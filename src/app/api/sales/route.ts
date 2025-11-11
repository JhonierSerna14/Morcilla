import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener ventas con filtros
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get("batchId")
    const customerId = searchParams.get("customerId")
    const paymentStatus = searchParams.get("paymentStatus")

    const sales = await prisma.sale.findMany({
      where: {
        ...(batchId && { productionBatchId: batchId }),
        ...(customerId && { customerId }),
        ...(paymentStatus && { paymentStatus: paymentStatus as any }),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        user: { select: { id: true, name: true } },
        productionBatch: { select: { id: true, name: true, number: true } }
      },
      orderBy: { saleDate: "desc" }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Crear nueva venta
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { 
      customerId, 
      pounds, 
      pricePerPound, 
      paymentMethod, 
      paymentStatus, 
      notes 
    } = await request.json()

    // Validaciones
    if (!customerId || !pounds || !pricePerPound || !paymentMethod) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" }, 
        { status: 400 }
      )
    }

    if (pounds <= 0 || pricePerPound <= 0) {
      return NextResponse.json(
        { error: "Las libras y el precio deben ser mayor a 0" }, 
        { status: 400 }
      )
    }

    // Verificar que existe tanda activa
    const activeBatch = await prisma.productionBatch.findFirst({
      where: { status: "ACTIVE" }
    })

    if (!activeBatch) {
      return NextResponse.json(
        { error: "No hay tanda activa. Debes crear una tanda antes de registrar ventas." },
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

    const totalAmount = pounds * pricePerPound

    // Usar transacción para crear venta y actualizar totales del cliente
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          customerId,
          userId: session.user.id,
          productionBatchId: activeBatch.id,
          pounds: pounds,
          pricePerPound: pricePerPound,
          totalAmount: totalAmount,
          paymentMethod,
          paymentStatus: paymentStatus || "PENDING",
          notes: notes || null,
        },
        include: {
          customer: { select: { id: true, name: true } },
          productionBatch: { select: { name: true } }
        }
      })

      // Actualizar totales del cliente
      const updateData: any = {}
      
      if (paymentStatus === "PAID") {
        // Si está pagado inmediatamente, aumentar totalPaid
        updateData.totalPaid = {
          increment: totalAmount
        }
      } else {
        // Si es a crédito, aumentar totalDebt
        updateData.totalDebt = {
          increment: totalAmount
        }
      }

      await tx.customer.update({
        where: { id: customerId },
        data: updateData
      })

      return sale
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}