// Script para crear usuario administrador inicial en producción
// Ejecutar SOLO UNA VEZ después del primer deploy
// Uso: npx tsx scripts/create-admin.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createInitialAdmin() {
  console.log('🚀 Configurando usuario administrador inicial para producción...')

  // ========== CAMBIAR ESTOS DATOS ANTES DE EJECUTAR ==========
  const adminData = {
    email: process.env.ADMIN_EMAIL || 'admin@morcilla.app',     // 🔥 CAMBIAR POR TU EMAIL REAL
    name: process.env.ADMIN_NAME || 'Administrador Principal',   
    password: process.env.ADMIN_PASSWORD || 'MorcillaAdmin2025!' // 🔥 USAR PASSWORD SEGURO
  }
  // ===========================================================

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('❌ Ya existe un administrador en la base de datos')
      console.log(`📧 Admin existente: ${existingAdmin.email}`)
      return
    }

    // Verificar si el email específico ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (existingUser) {
      console.log('❌ Ya existe un usuario con ese email')
      return
    }

    // Crear admin inicial
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Administrador creado exitosamente para producción!')
    console.log('📧 Email:', admin.email)
    console.log('👤 Nombre:', admin.name)
    console.log('🔐 Password:', adminData.password)
    console.log('🆔 ID:', admin.id)
    console.log('')
    console.log('🚨 IMPORTANTE: Guarda estas credenciales en un lugar seguro')
    console.log('🔄 Cambia la password después del primer login')

  } catch (error) {
    console.error('❌ Error creando administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createInitialAdmin()