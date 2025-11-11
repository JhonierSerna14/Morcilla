# 🥩 Gestión Familiar MorcillaThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Una aplicación web completa para gestionar el negocio familiar de venta de morcilla, desarrollada con Next.js 14, TypeScript, Prisma y PostgreSQL.## Getting Started



## 🚀 Características PrincipalesFirst, run the development server:



### 📊 Sistema de Tandas de Producción```bash

- **Operación por tandas**: El negocio opera por lotes de producción, no venta continuanpm run dev

- **Cálculo automático**: Las libras totales se calculan automáticamente sumando todas las ventas# or

- **Control de estado**: Solo una tanda puede estar activa a la vezyarn dev

- **Métricas en tiempo real**: Dashboard con total de libras, dinero recaudado y pendiente por cobrar# or

- **Historial completo**: Registro de todas las tandas anteriores con sus métricaspnpm dev

# or

### 👥 Gestión de Clientesbun dev

- **Registro simple**: Solo nombre obligatorio (teléfono y dirección opcionales)```

- **Estado de cuenta**: Visualización clara de deudas y pagos

- **Búsqueda rápida**: Filtros por nombre, teléfono y estado de deudaOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Historial por tandas**: Todas las transacciones organizadas por tanda de producción

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### 🛒 Sistema de Ventas

- **Vinculación automática**: Todas las ventas se asocian a la tanda activaThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **Venta por libras**: Registro de cantidad, precio por libra y total automático

- **Métodos de pago**: Efectivo o Nequi## Learn More

- **Estados de pago**: Inmediato (pagado) o a crédito (pendiente)

- **Actualización automática**: Los totales de la tanda se actualizan en tiempo realTo learn more about Next.js, take a look at the following resources:



### 💰 Sistema de Usuarios y Caja- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Autenticación segura**: Login con email y contraseña- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Roles de usuario**: Administrador, Vendedor y Cobrador

- **Caja individual**: Balance separado por usuario (efectivo y Nequi)You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Transferencias internas**: Registro de entregas de dinero entre usuarios

- **Historial de movimientos**: Seguimiento completo de ingresos y egresos## Deploy on Vercel



### 📱 Diseño Mobile-FirstThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- **Botones grandes**: Optimizados para uso táctil

- **Navegación intuitiva**: Iconos + texto para facilitar el usoCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- **Flujos simples**: Máximo 2-3 pasos por operación
- **Responsive**: Se adapta perfectamente a móviles, tablets y desktop

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: API Routes de Next.js
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js con credenciales
- **Componentes**: Radix UI + shadcn/ui
- **Iconos**: Lucide React
- **Despliegue**: Vercel (frontend y backend)

## 📋 Instalación Local

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd familiar
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura las variables:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/morcilla_db"

# NextAuth
NEXTAUTH_SECRET="tu-secret-muy-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# App Settings
NEXT_PUBLIC_APP_NAME="Gestión Familiar Morcilla"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 4. Configurar base de datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones (si usas PostgreSQL local)
npx prisma migrate dev --name init

# Poblar con datos de ejemplo
npm run db:seed
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔐 Credenciales de Prueba

Después de ejecutar el seeder, puedes usar estas credenciales:

- **Administrador**: 
  - Email: `admin@morcilla.com`
  - Contraseña: `admin123`

- **Vendedor**: 
  - Email: `vendedor@morcilla.com`
  - Contraseña: `vendedor123`

## 🌐 Despliegue en Vercel + Supabase

> 📋 **Ver instrucciones completas en [DEPLOY.md](./DEPLOY.md)**

### Resumen del proceso:

1. **Importar a Vercel**: Conecta tu repositorio GitHub
2. **Configurar Supabase**: Usa Vercel Storage > Supabase para la base de datos
3. **Variables de entorno**:
   ```
   NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
   NEXTAUTH_URL=https://tu-app.vercel.app
   # DATABASE_URL se configura automáticamente
   ```
4. **Desplegar**: Vercel hace el build automáticamente
5. **Crear admin**: Ejecutar `npx tsx scripts/create-admin.ts` desde Vercel terminal

### Scripts útiles para producción:
```bash
# Verificar estado de la app
npx tsx scripts/check-app-status.ts

# Crear usuario administrador
npx tsx scripts/create-admin.ts
```

## 📊 Diagrama de Base de Datos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │ ProductionBatch │    │    Customers    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ name            │    │ name            │
│ email (unique)  │    │ number (unique) │    │ phone           │
│ password        │    │ productionDate  │    │ address         │
│ role            │    │ status          │    │ totalDebt       │
│ active          │    │ closedAt        │    │ totalPaid       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │      Sales      │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ pounds          │
                    │ pricePerPound   │
                    │ totalAmount     │
                    │ paymentMethod   │
                    │ paymentStatus   │
                    │ userId (FK)     │
                    │ customerId (FK) │
                    │ batchId (FK)    │
                    └─────────────────┘
```

## 🎯 Flujos de Uso Principales

### 1. Iniciar Nueva Tanda
1. Ir al Dashboard
2. Hacer clic en "Nueva Tanda"
3. La tanda anterior se cierra automáticamente
4. La nueva tanda queda activa para recibir ventas

### 2. Registrar Venta
1. Ir a "Nueva Venta"
2. Buscar y seleccionar cliente
3. Ingresar libras y precio por libra
4. Seleccionar método de pago y estado (pagado/crédito)
5. La venta se asocia automáticamente a la tanda activa

### 3. Gestionar Clientes
1. Ir a "Clientes" 
2. Crear nuevos clientes o buscar existentes
3. Ver historial de compras y estado de cuenta
4. Filtrar por clientes con deudas pendientes

### 4. Manejar Caja Personal
1. Ir a "Mi Caja"
2. Ver balance de efectivo y Nequi
3. Registrar ingresos/egresos adicionales
4. Transferir dinero a otros usuarios

## 📱 Optimizaciones Móviles

- **Botones táctiles**: Mínimo 44px de altura
- **Campos grandes**: Inputs de 48px para facilitar escritura
- **Navegación clara**: Iconos grandes con texto descriptivo
- **Confirmaciones visuales**: Estados de carga y mensajes de éxito/error
- **Offline-ready**: Preparado para PWA (futuras versiones)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción  
npm run start        # Servidor de producción
npm run lint         # Verificar código con ESLint
npm run db:seed      # Poblar base de datos con datos de ejemplo
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Issues](../../issues) existentes
2. Crea un nuevo issue describiendo el problema
3. Incluye pasos para reproducir el error
4. Especifica tu entorno (OS, Node.js version, etc.)

---

**¡Gracias por usar Gestión Familiar Morcilla! 🥩✨**