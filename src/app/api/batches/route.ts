import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener tanda específica por ID o todas las tandas
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get("id")

    // Si se solicita una tanda específica
    if (batchId) {
      const batch = await prisma.productionBatch.findUnique({
        where: { id: batchId },
        include: {
          sales: {
            include: {
              customer: {
                select: { id: true, name: true, phone: true }
              },
              user: {
                select: { id: true, name: true }
              }
            },
            orderBy: { saleDate: "desc" }
          },
          _count: {
            select: {
              sales: true
            }
          }
        }
      })

      if (!batch) {
        return NextResponse.json({ error: "Tanda no encontrada" }, { status: 404 })
      }

      // Calcular el total de libras
      const totalPounds = batch.sales.reduce((sum, sale) => sum + sale.pounds, 0)

      return NextResponse.json({
        ...batch,
        totalPounds
      })
    }

    // Si no se especifica ID, devolver todas las tandas
    const batches = await prisma.productionBatch.findMany({
      include: {
        _count: {
          select: {
            sales: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(batches)
    
  } catch (error) {
    console.error("Error fetching batches:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Crear nueva tanda
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo permitir a admins crear tandas
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo los administradores pueden crear tandas" }, { status: 403 })
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la tanda es obligatorio" },
        { status: 400 }
      )
    }

    // Usar transacción para cerrar tanda anterior y crear nueva
    const result = await prisma.$transaction(async (tx) => {
      // Cerrar todas las tandas activas
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

      // Crear la nueva tanda
      const newBatch = await tx.productionBatch.create({
        data: {
          name: name.trim(),
          number: nextNumber,
          status: "ACTIVE",
          productionDate: new Date()
        }
      })

      return newBatch
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error("Error creating batch:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}