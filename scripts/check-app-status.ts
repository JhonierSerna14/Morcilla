// Script para verificar el estado de la aplicación en producción
// Ejecutar: npx tsx scripts/check-app-status.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppStatus() {
  console.log('🔍 Verificando estado de la aplicación...')
  
  try {
    // Verificar conexión a base de datos
    console.log('\n📊 Conectando a base de datos...')
    await prisma.$connect()
    console.log('✅ Base de datos conectada')

    // Contar usuarios
    const userCount = await prisma.user.count()
    console.log(`👥 Total usuarios: ${userCount}`)

    // Verificar admin
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    console.log(`🔐 Administrador: ${adminExists ? '✅ Configurado' : '❌ No encontrado'}`)

    // Contar clientes
    const customerCount = await prisma.customer.count()
    console.log(`👤 Total clientes: ${customerCount}`)

    // Verificar tandas
    const batchCount = await prisma.productionBatch.count()
    const activeBatch = await prisma.productionBatch.findFirst({
      where: { status: 'ACTIVE' }
    })
    console.log(`📦 Total tandas: ${batchCount}`)
    console.log(`🔄 Tanda activa: ${activeBatch ? activeBatch.name : 'Ninguna'}`)

    // Contar ventas
    const salesCount = await prisma.sale.count()
    console.log(`💰 Total ventas: ${salesCount}`)

    console.log('\n🎉 Verificación completada exitosamente!')

    if (!adminExists) {
      console.log('\n⚠️  ACCIÓN REQUERIDA:')
      console.log('   Crear administrador: npx tsx scripts/create-admin.ts')
    }

  } catch (error) {
    console.error('❌ Error verificando aplicación:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppStatus()