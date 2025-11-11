import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener tanda activa
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const activeBatch = await prisma.productionBatch.findFirst({
      where: { status: "ACTIVE" },
      include: {
        sales: {
          select: {
            pounds: true,
            totalAmount: true,
            paymentStatus: true,
          }
        }
      }
    })

    if (!activeBatch) {
      return NextResponse.json({ activeBatch: null, metrics: null })
    }

    // Calcular métricas de la tanda activa
    const totalPounds = activeBatch.sales.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.pounds.toString()), 0
    )
    
    const totalRevenue = activeBatch.sales.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.totalAmount.toString()), 0
    )
    
    const paidAmount = activeBatch.sales
      .filter((sale: any) => sale.paymentStatus === "PAID")
      .reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount.toString()), 0)
    
    const pendingAmount = totalRevenue - paidAmount

    const metrics = {
      totalPounds,
      totalRevenue,
      paidAmount,
      pendingAmount,
      salesCount: activeBatch.sales.length
    }

    return NextResponse.json({ activeBatch, metrics })
  } catch (error) {
    console.error("Error getting active batch:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Crear nueva tanda (cierra la anterior automáticamente)
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, productionDate } = await request.json()

    // Usar transacción para cerrar tanda anterior y crear nueva
    const result = await prisma.$transaction(async (tx: any) => {
      // Cerrar tanda activa anterior
      await tx.productionBatch.updateMany({
        where: { status: "ACTIVE" },
        data: { 
          status: "CLOSED",
          closedAt: new Date()
        }
      })

      // Obtener el siguiente número de tanda
      const lastBatch = await tx.productionBatch.findFirst({
        orderBy: { number: "desc" }
      })
      
      const nextNumber = (lastBatch?.number || 0) + 1

      // Crear nueva tanda activa
      const newBatch = await tx.productionBatch.create({
        data: {
          name: name || `Tanda #${nextNumber} - ${new Date().toLocaleDateString('es-CO')}`,
          number: nextNumber,
          productionDate: new Date(productionDate || new Date()),
          status: "ACTIVE"
        }
      })

      return newBatch
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating batch:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}