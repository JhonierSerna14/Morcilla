import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener reportes financieros generales
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type")
    const batchId = searchParams.get("batchId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const dateFilter = startDate && endDate ? {
      gte: new Date(startDate),
      lte: new Date(endDate)
    } : undefined

    switch (reportType) {
      case "financial-summary":
        return await getFinancialSummary(batchId, dateFilter)
      
      case "customers-with-debt":
        return await getCustomersWithDebt()
      
      case "user-cash-summary":
        return await getUserCashSummary()
      
      case "batch-comparison":
        return await getBatchComparison()
      
      case "sales-history":
        return await getSalesHistory(batchId, dateFilter)
      
      default:
        return NextResponse.json(
          { error: "Tipo de reporte no válido" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

async function getFinancialSummary(batchId?: string | null, dateFilter?: any) {
  // Tanda activa
  const activeBatch = await prisma.productionBatch.findFirst({
    where: { status: "ACTIVE" },
    include: {
      sales: { select: { pounds: true, totalAmount: true, paymentStatus: true } }
    }
  })

  // Total ventas
  const totalSales = await prisma.sale.aggregate({
    _sum: { totalAmount: true, pounds: true },
    _count: true,
    where: {
      ...(batchId && { batchId }),
      ...(dateFilter && { saleDate: dateFilter })
    }
  })

  // Ventas pagadas de contado
  const paidSales = await prisma.sale.aggregate({
    _sum: { totalAmount: true },
    where: {
      paymentStatus: "PAID",
      ...(batchId && { batchId }),
      ...(dateFilter && { saleDate: dateFilter })
    }
  })

  // Total cobros
  const totalCollections = await prisma.collection.aggregate({
    _sum: { amount: true },
    _count: true,
    where: {
      ...(batchId && { batchId }),
      ...(dateFilter && { collectionDate: dateFilter })
    }
  })

  // Total gastos
  const totalExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    _count: true,
    where: {
      ...(dateFilter && { expenseDate: dateFilter })
    }
  })

  // Clientes con deuda
  const customersWithDebt = await prisma.customer.count({
    where: { totalDebt: { gt: 0 } }
  })

  return NextResponse.json({
    activeBatch: activeBatch ? {
      name: activeBatch.name,
      totalPounds: activeBatch.sales.reduce((sum, sale) => sum + Number(sale.pounds), 0),
      totalRevenue: activeBatch.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)
    } : null,
    totals: {
      sales: {
        amount: totalSales._sum.totalAmount || 0,
        pounds: totalSales._sum.pounds || 0,
        count: totalSales._count,
        paidAmount: paidSales._sum.totalAmount || 0
      },
      collections: {
        amount: totalCollections._sum.amount || 0,
        count: totalCollections._count
      },
      expenses: {
        amount: totalExpenses._sum.amount || 0,
        count: totalExpenses._count
      }
    },
    customersWithDebt
  })
}

async function getCustomersWithDebt() {
  const customers = await prisma.customer.findMany({
    where: { totalDebt: { gt: 0 } },
    select: {
      id: true,
      name: true,
      phone: true,
      totalDebt: true,
      totalPaid: true,
      sales: {
        where: { paymentStatus: "PENDING" },
        include: {
          batch: { select: { name: true } }
        },
        orderBy: { saleDate: "desc" }
      }
    },
    orderBy: { totalDebt: "desc" }
  })

  return NextResponse.json(customers)
}

async function getUserCashSummary() {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      role: true,
      sales: {
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true, paymentMethod: true }
      },
      collections: {
        select: { amount: true, paymentMethod: true }
      },
      cashMovements: {
        select: { amount: true, paymentMethod: true, movementType: true }
      }
    }
  })

  const userSummary = users.map(user => {
    const salesByMethod = user.sales.reduce((acc, sale) => {
      // Solo contar ventas que tienen método de pago (ventas pagadas)
      if (sale.paymentMethod) {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + Number(sale.totalAmount)
      }
      return acc
    }, {} as Record<string, number>)

    const collectionsByMethod = user.collections.reduce((acc, collection) => {
      if (collection.paymentMethod) {
        acc[collection.paymentMethod] = (acc[collection.paymentMethod] || 0) + Number(collection.amount)
      }
      return acc
    }, {} as Record<string, number>)

    return {
      ...user,
      cashSummary: {
        efectivo: (salesByMethod.EFECTIVO || 0) + (collectionsByMethod.EFECTIVO || 0),
        nequi: (salesByMethod.NEQUI || 0) + (collectionsByMethod.NEQUI || 0),
        transferencia: (salesByMethod.TRANSFERENCIA || 0) + (collectionsByMethod.TRANSFERENCIA || 0)
      }
    }
  })

  return NextResponse.json(userSummary)
}

async function getBatchComparison() {
  const batches = await prisma.productionBatch.findMany({
    include: {
      sales: { select: { pounds: true, totalAmount: true } }
    },
    orderBy: { productionDate: "desc" },
    take: 10 // Últimas 10 tandas
  })

  const comparison = batches.map(batch => {
    const totalPounds = batch.sales.reduce((sum, sale) => sum + Number(sale.pounds), 0)
    const totalRevenue = batch.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)

    return {
      id: batch.id,
      name: batch.name,
      number: batch.number,
      status: batch.status,
      productionDate: batch.productionDate,
      totalPounds,
      totalRevenue,
      salesCount: batch.sales.length,
      averagePricePerPound: totalPounds > 0 ? totalRevenue / totalPounds : 0
    }
  })

  return NextResponse.json(comparison)
}

async function getSalesHistory(batchId?: string | null, dateFilter?: any) {
  const sales = await prisma.sale.findMany({
    where: {
      ...(batchId && { batchId }),
      ...(dateFilter && { saleDate: dateFilter })
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      user: { select: { id: true, name: true } },
      batch: { select: { id: true, name: true, number: true } }
    },
    orderBy: { saleDate: "desc" }
  })

  return NextResponse.json(sales)
}