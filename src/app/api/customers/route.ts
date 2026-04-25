import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// GET - Obtener todos los clientes
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const onlyWithDebt = searchParams.get("onlyWithDebt") === "true"
    const onlyPaid = searchParams.get("onlyPaid") === "true"
    const customerId = searchParams.get("id")
    const batchId = searchParams.get("batchId")
    // Si se solicita un cliente específico por ID
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          sales: {
            include: {
              batch: {
                select: { name: true, number: true }
              }
            },
            orderBy: { saleDate: "desc" }
          },
          collections: {
            include: {
              batch: {
                select: { name: true, number: true }
              }
            },
            orderBy: { collectionDate: "desc" }
          }
        }
      })

      if (!customer) {
        return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
      }

      return NextResponse.json([customer]) // Retorno como array para compatibilidad
    }

    if (batchId) {
      const customers = await prisma.customer.findMany({
        where: {
          active: true,
          ...(search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ]
          } : {})
        },
        include: {
          sales: {
            where: { batchId },
            include: { batch: { select: { name: true } } }
          },
          collections: {
            where: { batchId }
          }
        },
        orderBy: { name: "asc" }
      })

      // Calcular deuda y pagos solo para esta tanda y filtrar en memoria
      const filteredCustomers = customers.map(c => {
        const batchCreditSalesAmount = c.sales.filter(s => s.paymentStatus === 'PENDING').reduce((sum, s) => sum + s.totalAmount, 0)
        const batchPaidSalesAmount = c.sales.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + s.totalAmount, 0)
        const batchCollectionsAmount = c.collections.reduce((sum, col) => sum + col.amount, 0)
        
        const computedDebt = batchCreditSalesAmount - batchCollectionsAmount
        const computedPaid = batchPaidSalesAmount + batchCollectionsAmount
        
        return {
          ...c,
          totalDebt: Math.max(0, computedDebt), // Reemplazamos la totalDebt general por la de esta tanda
          totalPaid: computedPaid
        }
      }).filter(c => {
        // Exclude those with absolutely no activity in this batch to keep the list clean?
        // Let's only include them if they have sales or collections in this batch
        if (c.sales.length === 0 && c.collections.length === 0) return false;

        if (onlyWithDebt && c.totalDebt <= 0) return false;
        if (onlyPaid && c.totalDebt === 0 && c.totalPaid <= 0) return false;
        return true;
      })

      return NextResponse.json(filteredCustomers)
    }

    const customers = await prisma.customer.findMany({
      where: {
        AND: [
          { active: true },
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ]
          } : {},
          onlyWithDebt ? {
            totalDebt: { gt: 0 }
          } : {},
          onlyPaid ? {
            totalDebt: 0,
            totalPaid: { gt: 0 }
          } : {}
        ]
      },
      include: {
        sales: {
          include: {
            batch: {
              select: { name: true }
            }
          },
          orderBy: { saleDate: "desc" },
          take: 5
        },
        collections: {
          orderBy: { collectionDate: "desc" },
          take: 5
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Crear nuevo cliente
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, phone, address } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" }, 
        { status: 400 }
      )
    }

    // Verificar si ya existe un cliente con el mismo nombre
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        active: true
      }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese nombre" },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}