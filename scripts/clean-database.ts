import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...')

    // 1. Eliminar todas las transacciones y datos relacionados
    console.log('Eliminando movimientos de caja...')
    await prisma.cashMovement.deleteMany({})

    console.log('Eliminando cobros...')
    await prisma.collection.deleteMany({})

    console.log('Eliminando transferencias...')
    await prisma.transfer.deleteMany({})

    console.log('Eliminando gastos...')
    await prisma.expense.deleteMany({})

    console.log('Eliminando ventas...')
    await prisma.sale.deleteMany({})

    console.log('Eliminando tandas de producción...')
    await prisma.productionBatch.deleteMany({})

    console.log('Eliminando clientes...')
    await prisma.customer.deleteMany({})

    // 2. Eliminar usuarios excepto admin
    console.log('Eliminando usuarios (excepto admin)...')
    await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    })

    // 3. Verificar/crear usuario admin si no existe
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('Creando usuario admin...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@morcilla.com',
          password: hashedPassword,
          role: 'ADMIN',
          active: true
        }
      })
    } else {
      console.log('Usuario admin ya existe:', adminUser.email)
    }

    console.log('✅ Base de datos limpiada exitosamente')
    console.log('')
    console.log('📋 Estado final:')
    console.log('- Todas las transacciones eliminadas')
    console.log('- Todos los clientes eliminados')
    console.log('- Todas las tandas eliminadas')
    console.log('- Solo el usuario admin permanece')
    console.log('')
    console.log('🔐 Credenciales de admin:')
    console.log('Email: admin@morcilla.com')
    console.log('Contraseña: admin123')

  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()