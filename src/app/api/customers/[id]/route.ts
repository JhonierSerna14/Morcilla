import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PATCH(request: Request, context: any) {
  const { params } = context
  let customerId = params?.id

  if (context?.params instanceof Promise) {
    const p = await context.params
    customerId = p.id
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!customerId) {
       return NextResponse.json({ error: "ID de cliente no proporcionado" }, { status: 400 })
    }

    const { name, phone, address } = await request.json()

    // Validar nombre si viene
    if (name !== undefined) {
      const trimmedName = name.trim()
      if (trimmedName.length < 2) {
        return NextResponse.json(
          { error: "El nombre debe tener al menos 2 caracteres" },
          { status: 400 }
        )
      }

      // Evitar duplicados (asegurando que no cambie el nombre a uno ya existente)
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          name: {
            equals: trimmedName,
            mode: "insensitive"
          },
          active: true,
          id: {
            not: String(customerId)
          }
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: `Ya existe un cliente activo con el nombre "${trimmedName}"` },
          { status: 400 }
        )
      }
    }

    if (phone !== undefined && phone.trim().length > 0 && phone.trim().length < 7) {
      return NextResponse.json(
        { error: "El teléfono debe tener al menos 7 dígitos" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone.trim() === "" ? null : phone.trim()
    if (address !== undefined) updateData.address = address.trim() === "" ? null : address.trim()

    const updatedCustomer = await prisma.customer.update({
      where: { id: String(customerId) },
      data: updateData
    })

    return NextResponse.json(updatedCustomer)

  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
