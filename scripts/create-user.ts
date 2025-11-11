// Script para crear usuario nuevo
// Ejecutar con: npx tsx scripts/create-user.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  const email = 'nuevo@morcilla.com'
  const name = 'Nuevo Usuario'
  const password = 'password123'
  const role = 'VENDEDOR' // ADMIN, VENDEDOR, COBRADOR

  try {
    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      console.log('❌ Usuario ya existe con ese email')
      return
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as 'ADMIN' | 'VENDEDOR' | 'COBRADOR'
      }
    })

    console.log('✅ Usuario creado exitosamente:')
    console.log(`Email: ${user.email}`)
    console.log(`Nombre: ${user.name}`)
    console.log(`Rol: ${user.role}`)
    console.log(`ID: ${user.id}`)

  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()