import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Creando usuario administrador...')

    const email = process.env.ADMIN_EMAIL || 'admin@morcilla.com'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const name = process.env.ADMIN_NAME || 'Administrador'

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('⚠️  El usuario administrador ya existe:', email)
      return
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear admin
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        active: true
      }
    })

    console.log('✅ Usuario administrador creado exitosamente:')
    console.log('   Email:', admin.email)
    console.log('   Nombre:', admin.name)
    console.log('   Rol:', admin.role)
    console.log('')
    console.log('🚀 Ya puedes hacer login con estas credenciales')

  } catch (error) {
    console.error('❌ Error creando administrador:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()