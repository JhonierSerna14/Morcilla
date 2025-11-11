import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// PATCH - Actualizar estado de usuario (activar/desactivar)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo permitir a admins modificar usuarios
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo los administradores pueden modificar usuarios" }, { status: 403 })
    }

    const { id: userId } = await params
    const { active } = await request.json()

    // No permitir que el admin se desactive a sí mismo
    if (userId === session.user.id && active === false) {
      return NextResponse.json({ error: "No puedes desactivarte a ti mismo" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active: active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}