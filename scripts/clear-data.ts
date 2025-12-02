import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ Iniciando limpieza de datos...')

  try {
    // 1. Eliminar transacciones y movimientos (orden para evitar problemas de integridad referencial si los hubiera)
    console.log('Eliminando ventas...')
    await prisma.sale.deleteMany({})

    console.log('Eliminando cobros...')
    await prisma.collection.deleteMany({})

    console.log('Eliminando movimientos de caja...')
    await prisma.cashMovement.deleteMany({})

    console.log('Eliminando transferencias...')
    await prisma.transfer.deleteMany({})

    console.log('Eliminando gastos...')
    await prisma.expense.deleteMany({})

    // 2. Eliminar tandas
    console.log('Eliminando tandas de producción...')
    await prisma.productionBatch.deleteMany({})

    // 3. Resetear saldos de clientes
    console.log('Reseteando saldos de clientes...')
    await prisma.customer.updateMany({
      data: {
        totalDebt: 0,
        totalPaid: 0
      }
    })

    console.log('✅ Limpieza completada exitosamente.')
    console.log('ℹ️ Se han conservado los Usuarios y Clientes (con saldo reiniciado a 0).')
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
