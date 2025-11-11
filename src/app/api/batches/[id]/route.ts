import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener detalles completos de una tanda específica para el dashboard
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: batchId } = await params

    // Obtener la tanda con todas sus ventas y cobros
    const batch = await prisma.productionBatch.findUnique({
      where: { id: batchId },
      include: {
        sales: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true, totalDebt: true }
            },
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { saleDate: "desc" }
        },
        collections: {
          include: {
            customer: {
              select: { id: true, name: true }
            },
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { collectionDate: "desc" }
        }
      }
    })

    if (!batch) {
      return NextResponse.json({ error: "Tanda no encontrada" }, { status: 404 })
    }

    // Calcular métricas básicas
    const totalPounds = batch.sales.reduce((sum, sale) => sum + sale.pounds, 0)
    const totalRevenue = batch.sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalCollections = batch.collections.reduce((sum, collection) => sum + collection.amount, 0)

    // Obtener clientes únicos de esta tanda
    const uniqueCustomers = Array.from(new Set(batch.sales.map(sale => sale.customerId)))
    const totalCustomers = uniqueCustomers.length

    // Calcular deudores (clientes con deuda pendiente de esta tanda)
    const customerDebts = new Map()
    
    // Sumar ventas a crédito por cliente
    batch.sales
      .filter(sale => sale.paymentStatus === "PENDING")
      .forEach(sale => {
        const currentDebt = customerDebts.get(sale.customerId) || 0
        customerDebts.set(sale.customerId, currentDebt + sale.totalAmount)
      })

    // Restar cobros por cliente
    batch.collections.forEach(collection => {
      const currentDebt = customerDebts.get(collection.customerId) || 0
      customerDebts.set(collection.customerId, currentDebt - collection.amount)
    })

    // Filtrar solo los que tienen deuda pendiente
    const debtors = Array.from(customerDebts.entries())
      .filter(([_, debt]) => debt > 0)
      .map(([customerId, debt]) => {
        const customer = batch.sales.find(s => s.customerId === customerId)?.customer
        const lastSale = batch.sales
          .filter(s => s.customerId === customerId)
          .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0]
        
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
    batch.sales
      .filter(sale => sale.paymentStatus === "PAID")
      .forEach(sale => {
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
          userInfo.totalCash += sale.totalAmount
        } else if (sale.paymentMethod === "NEQUI") {
          userInfo.totalNequi += sale.totalAmount
        }
      })

    // Dinero de cobros
    batch.collections.forEach(collection => {
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
        userInfo.totalCash += collection.amount
      } else if (collection.paymentMethod === "NEQUI") {
        userInfo.totalNequi += collection.amount
      }
    })

    const cashHolders = Array.from(userCash.values())
      .filter(holder => holder.totalCash > 0 || holder.totalNequi > 0)
      .sort((a, b) => (b.totalCash + b.totalNequi) - (a.totalCash + a.totalNequi))

    // Crear resumen detallado de deudores para la página de detalles
    const detailedDebtors = Array.from(customerDebts.entries())
      .filter(([_, debt]) => debt > 0)
      .map(([customerId, debt]) => {
        const customer = batch.sales.find(s => s.customerId === customerId)?.customer
        const customerSales = batch.sales.filter(s => s.customerId === customerId && s.paymentStatus === "PENDING")
        const totalSales = customerSales.reduce((sum, sale) => sum + sale.pounds, 0)
        
        return {
          customerId,
          customerName: customer?.name || "Cliente desconocido",
          customerPhone: customer?.phone || undefined,
          totalDebt: debt,
          totalSales,
          salesCount: customerSales.length
        }
      })
      .sort((a, b) => b.totalDebt - a.totalDebt)

    // Calcular montos pagados y pendientes
    const totalPaid = batch.sales
      .filter(sale => sale.paymentStatus === "PAID")
      .reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalPending = totalRevenue - totalPaid - totalCollections

    const details = {
      totalSales: batch.sales.length,
      totalCustomers,
      debtorsCount,
      paidCustomersCount,
      cashHolders,
      recentDebtors: debtors,
      debtorsSummary: detailedDebtors // Usar el nombre correcto
    }

    return NextResponse.json({
      batch: {
        ...batch,
        totalPounds,
        totalRevenue,
        totalCollections,
        paidAmount: totalPaid + totalCollections, // Pagos inmediatos + cobros
        pendingAmount: Math.max(0, totalPending), // Evitar negativos
        salesCount: batch.sales.length
      },
      details,
      // También incluir las ventas para la página de detalles
      sales: batch.sales.map(sale => ({
        id: sale.id,
        pounds: sale.pounds,
        pricePerPound: sale.pricePerPound,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        saleDate: sale.saleDate.toISOString(),
        notes: sale.notes,
        customer: sale.customer,
        user: sale.user
      })),
      // Incluir resumen de deudores directamente
      debtorsSummary: detailedDebtors
    })

  } catch (error) {
    console.error("Error fetching batch details:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}