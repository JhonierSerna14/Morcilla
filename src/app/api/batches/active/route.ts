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
          include: {
            customer: {
              select: { id: true, name: true, phone: true }
            },
            user: {
              select: { id: true, name: true }
            }
          }
        },
        collections: {
          include: {
            customer: {
              select: { id: true, name: true }
            },
            user: {
              select: { id: true, name: true }
            }
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
    
    const paidSalesAmount = activeBatch.sales
      .filter((sale: any) => sale.paymentStatus === "PAID")
      .reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount.toString()), 0)

    // Calcular detalles adicionales para el dashboard (incluye cobros)
    const totalCollections = activeBatch.collections.reduce((sum: number, collection: any) => 
      sum + parseFloat(collection.amount.toString()), 0
    )

    // El monto cobrado incluye ventas pagadas + cobros registrados
    const paidAmount = paidSalesAmount + totalCollections

    const pendingAmount = totalRevenue - paidAmount


    // Obtener clientes únicos de esta tanda
    const uniqueCustomers = Array.from(new Set(activeBatch.sales.map((sale: any) => sale.customerId)))
    const totalCustomers = uniqueCustomers.length

    // Calcular deudores (clientes con deuda pendiente de esta tanda)
    const customerDebts = new Map()
    
    // Sumar ventas a crédito por cliente
    activeBatch.sales
      .filter((sale: any) => sale.paymentStatus === "PENDING")
      .forEach((sale: any) => {
        const currentDebt = customerDebts.get(sale.customerId) || 0
        customerDebts.set(sale.customerId, currentDebt + parseFloat(sale.totalAmount.toString()))
      })

    // Restar cobros por cliente
    activeBatch.collections.forEach((collection: any) => {
      const currentDebt = customerDebts.get(collection.customerId) || 0
      customerDebts.set(collection.customerId, currentDebt - parseFloat(collection.amount.toString()))
    })

    // Filtrar solo los que tienen deuda pendiente
    const debtors = Array.from(customerDebts.entries())
      .filter(([_, debt]) => debt > 0)
      .map(([customerId, debt]) => {
        const customer = activeBatch.sales.find((s: any) => s.customerId === customerId)?.customer
        const lastSale = activeBatch.sales
          .filter((s: any) => s.customerId === customerId)
          .sort((a: any, b: any) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0]
        
        return {
          customerId,
          customerName: customer?.name || "Cliente desconocido",
          totalDebt: debt,
          lastSaleDate: lastSale?.saleDate || ""
        }
      })
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, 5) // Top 5 deudores

    const debtorsCount = debtors.length
    const paidCustomersCount = totalCustomers - debtorsCount

    // Calcular dinero en poder de cada usuario
    const userCash = new Map()

    // Dinero de ventas al contado
    activeBatch.sales
      .filter((sale: any) => sale.paymentStatus === "PAID")
      .forEach((sale: any) => {
        const userId = sale.userId
        if (!userCash.has(userId)) {
          userCash.set(userId, {
            userId,
            userName: sale.user.name,
            totalCash: 0,
            totalNequi: 0
          })
        }
        
        const userInfo = userCash.get(userId)
        if (sale.paymentMethod === "EFECTIVO") {
          userInfo.totalCash += parseFloat(sale.totalAmount.toString())
        } else if (sale.paymentMethod === "NEQUI") {
          userInfo.totalNequi += parseFloat(sale.totalAmount.toString())
        }
      })

    // Dinero de cobros
    activeBatch.collections.forEach((collection: any) => {
      const userId = collection.userId
      if (!userCash.has(userId)) {
        userCash.set(userId, {
          userId,
          userName: collection.user.name,
          totalCash: 0,
          totalNequi: 0
        })
      }
      
      const userInfo = userCash.get(userId)
      if (collection.paymentMethod === "EFECTIVO") {
        userInfo.totalCash += parseFloat(collection.amount.toString())
      } else if (collection.paymentMethod === "NEQUI") {
        userInfo.totalNequi += parseFloat(collection.amount.toString())
      }
    })

    const cashHolders = Array.from(userCash.values())
      .filter((holder: any) => holder.totalCash > 0 || holder.totalNequi > 0)
      .sort((a: any, b: any) => (b.totalCash + b.totalNequi) - (a.totalCash + a.totalNequi))

    const metrics = {
      totalPounds,
      totalRevenue,
      paidAmount,
      pendingAmount,
      salesCount: activeBatch.sales.length
    }

    const details = {
      totalSales: activeBatch.sales.length,
      totalCustomers,
      debtorsCount,
      paidCustomersCount,
      cashHolders,
      recentDebtors: debtors
    }

    return NextResponse.json({ 
      activeBatch, 
      metrics, 
      details 
    })
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