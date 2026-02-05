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