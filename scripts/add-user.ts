// Ejecutar con: npx tsx scripts/add-user.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addUser() {
  // ========== CAMBIAR ESTOS DATOS ANTES DE EJECUTAR ==========
  const userData = {
    email: process.env.USER_EMAIL || 'nuevo@morcilla.com',
    name: process.env.USER_NAME || 'Nuevo Usuario',  
    password: process.env.USER_PASSWORD || 'password123',
    role: (process.env.USER_ROLE || 'VENDEDOR') as 'ADMIN' | 'VENDEDOR' | 'COBRADOR'
  }
  // ===========================================================

  try {
    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existing) {
      console.log('❌ Usuario ya existe con ese email')
      return
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role
      }
    })

    console.log('✅ Usuario creado exitosamente:')
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Nombre: ${user.name}`)
    console.log(`🔐 Password: ${userData.password}`)
    console.log(`👮 Rol: ${user.role}`)
    console.log(`🆔 ID: ${user.id}`)

  } catch (error) {
    console.error('❌ Error creando usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addUser()