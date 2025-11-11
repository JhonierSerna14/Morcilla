import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener historial de tandas cerradas
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const batches = await prisma.productionBatch.findMany({
      where: { status: "CLOSED" },
      include: {
        sales: {
          select: {
            pounds: true,
            totalAmount: true,
            paymentStatus: true,
          }
        },
        collections: {
          select: {
            amount: true,
          }
        }
      },
      orderBy: { closedAt: "desc" }
    })

    // Calcular métricas para cada tanda
    const batchesWithMetrics = batches.map(batch => {
      const totalPounds = batch.sales.reduce((sum: number, sale: any) => 
        sum + parseFloat(sale.pounds.toString()), 0
      )
      
      const totalRevenue = batch.sales.reduce((sum: number, sale: any) => 
        sum + parseFloat(sale.totalAmount.toString()), 0
      )
      
      const paidAmount = batch.sales
        .filter((sale: any) => sale.paymentStatus === "PAID")
        .reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount.toString()), 0)
      
      const collectionsAmount = batch.collections.reduce((sum: number, collection: any) => 
        sum + parseFloat(collection.amount.toString()), 0
      )
      
      const totalCollected = paidAmount + collectionsAmount
      const pendingAmount = totalRevenue - totalCollected

      return {
        ...batch,
        metrics: {
          totalPounds,
          totalRevenue,
          paidAmount,
          collectionsAmount,
          totalCollected,
          pendingAmount,
          salesCount: batch.sales.length
        }
      }
    })

    return NextResponse.json(batchesWithMetrics)
  } catch (error) {
    console.error("Error fetching batch history:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}