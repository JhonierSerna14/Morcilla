import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeder...')

  // Crear usuario administrador (solo en desarrollo)
  const isProduction = process.env.NODE_ENV === 'production'
  let admin = null
  
  if (!isProduction) {
    const adminPassword = await bcrypt.hash('admin123', 12)
    
    admin = await prisma.user.upsert({
      where: { email: 'admin@morcilla.com' },
      update: {},
      create: {
        email: 'admin@morcilla.com',
        name: 'Administrador',
        password: adminPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Usuario administrador creado:', admin.email)
  } else {
    console.log('ℹ️  En producción - usar scripts/create-admin.ts para crear admin')
  }

  // Crear vendedor de ejemplo
  const vendedorPassword = await bcrypt.hash('vendedor123', 12)
  
  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor@morcilla.com' },
    update: {},
    create: {
      email: 'vendedor@morcilla.com',
      name: 'María Vendedora',
      password: vendedorPassword,
      role: 'VENDEDOR'
    }
  })

  console.log('✅ Vendedor creado:', vendedor.email)

  // Crear clientes de ejemplo
  const customers = [
    { name: 'Carlos Pérez', phone: '3001234567', address: 'Calle 10 #15-20' },
    { name: 'Ana García', phone: '3009876543', address: 'Carrera 5 #8-12' },
    { name: 'Luis Rodríguez', phone: '3005555555', address: null },
    { name: 'Carmen López', phone: null, address: 'Avenida 20 #30-40' },
    { name: 'José Martínez', phone: '3002468135', address: 'Calle 25 #18-35' }
  ]

  // Eliminar clientes existentes para evitar duplicados
  await prisma.customer.deleteMany({})
  
  // Crear clientes
  await prisma.customer.createMany({
    data: customers
  })

  console.log(`✅ ${customers.length} clientes creados`)

  // Crear primera tanda de producción
  const batch = await prisma.productionBatch.create({
    data: {
      name: 'Tanda #1 - Noviembre 2025',
      number: 1,
      productionDate: new Date(),
      status: 'ACTIVE'
    }
  })

  console.log('✅ Tanda de producción creada:', batch.name)

  // Crear algunas ventas de ejemplo (solo en desarrollo)
  if (!isProduction) {
    const allCustomers = await prisma.customer.findMany()
    
    const sampleSales = [
      {
        customerId: allCustomers[0].id,
        userId: vendedor.id,
        productionBatchId: batch.id,
        pounds: 2.0,
        pricePerPound: 12000,
        totalAmount: 24000,
        paymentMethod: 'EFECTIVO' as const,
        paymentStatus: 'PAID' as const,
        notes: 'Venta de contado'
      },
      {
        customerId: allCustomers[1].id,
        userId: vendedor.id,
        productionBatchId: batch.id,
        pounds: 1.5,
        pricePerPound: 12000,
        totalAmount: 18000,
        paymentMethod: 'NEQUI' as const,
        paymentStatus: 'PENDING' as const,
        notes: 'Venta a crédito'
      },
      {
        customerId: allCustomers[2].id,
        userId: admin!.id,
        productionBatchId: batch.id,
        pounds: 3.0,
        pricePerPound: 12000,
        totalAmount: 36000,
        paymentMethod: 'EFECTIVO' as const,
        paymentStatus: 'PAID' as const,
        notes: null
      }
    ]

    for (const sale of sampleSales) {
      await prisma.sale.create({ data: sale })
      
      // Actualizar totales del cliente
      const updateData: any = {}
      if (sale.paymentStatus === 'PAID') {
        updateData.totalPaid = { increment: sale.totalAmount }
      } else {
        updateData.totalDebt = { increment: sale.totalAmount }
      }
      
      await prisma.customer.update({
        where: { id: sale.customerId },
        data: updateData
      })
    }

    console.log(`✅ ${sampleSales.length} ventas de ejemplo creadas`)
  }

  console.log('\n🎉 Seeder completado exitosamente!')
  if (!isProduction) {
    console.log('\n📧 Credenciales de acceso (desarrollo):')
    console.log('Admin: admin@morcilla.com / admin123')
    console.log('Vendedor: vendedor@morcilla.com / vendedor123')
  } else {
    console.log('\n📧 Para crear administrador en producción:')
    console.log('Ejecutar: npx tsx scripts/create-admin.ts')
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en seeder:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })