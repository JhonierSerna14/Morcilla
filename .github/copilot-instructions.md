<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

NO REALIZAR ARCHIVOS .MD de resumen, intrucciones o similares aparte de este.

# Gestión Familiar Morcilla - Sistema de Control de Ventas por Tandas

Este es un sistema completo de gestión para negocio familiar de morcilla desarrollado con:
- Next.js 14 con App Router y TypeScript
- Prisma + MongoDB (schema en `prisma/schema.prisma`)
- NextAuth.js para autenticación
- Tailwind CSS + Radix UI para interface
- Diseño mobile-first optimizado para usuarios con poca experiencia tecnológica

## Contexto del Negocio

El negocio opera por **tandas de producción**: se produce morcilla cada cierto tiempo y se vende hasta agotar. Las ventas ocurren mientras se produce, por lo que la cantidad total de libras se calcula automáticamente sumando las ventas. Los clientes pueden pagar de inmediato o a crédito, y el dinero lo recaudan múltiples usuarios del sistema.

## Funcionalidades Core

### Sistema de Tandas de Producción
- [x] Crear nueva tanda (fecha, identificador, estado activa/cerrada)
- [x] **Cálculo automático de libras**: suma de todas las ventas de la tanda
- [x] Dashboard con tanda activa mostrando: libras vendidas, dinero recaudado, dinero pendiente
- [x] Cerrar tanda (automáticamente al crear nueva) con resumen final
- [x] Historial de tandas anteriores con métricas completas
- [x] Filtrar ventas y reportes por tanda específica
- [x] Comparación de rendimiento entre tandas

### Gestión de Clientes
- [x] Registro simple: nombre (obligatorio), teléfono y dirección (opcionales)
- [x] Visualizar estado de cuenta (debe/pagó)
- [x] Historial de transacciones agrupado por tandas
- [x] Búsqueda rápida con autocompletado

### Registro de Ventas
- [x] Asociación automática a tanda activa
- [x] Cantidad de libras (1, 2, 3... libras enteras)
- [x] Precio, fecha, cliente
- [x] Método de pago: efectivo o Nequi
- [x] Estado: pago inmediato o a crédito
- [x] Actualización automática del total de libras de la tanda

### Sistema de Usuarios (Vendedores/Cobradores)
- [x] Autenticación segura (registro y login)
- [x] Sistema de caja individual por usuario
- [x] Balance separado: efectivo y Nequi
- [x] Transferencias internas entre usuarios (registrar monto, método, concepto)
- [x] Ver quién tiene el dinero de cada venta/cobro

### Gestión Financiera
- [x] **Ingresos**: cobros de ventas a crédito (usuario, monto, método, tanda)
- [x] **Egresos**: gastos con concepto obligatorio
- [x] **Deudas externas**: dinero prestado del negocio a terceros
- [x] Dashboard financiero: total en caja, por cobrar, deudas pendientes
- [x] Resumen por tanda: rentabilidad, costos, ingresos

### Reportes y Visualización
- [x] Lista de clientes con deudas pendientes (filtrable por tanda)
- [x] Resumen de dinero por usuario (efectivo/Nequi)
- [x] Historial de ventas y cobros con filtro por tanda
- [x] Balance general del negocio
- [x] Métricas comparativas entre tandas

## Arquitectura Técnica

### Modelo de Datos (Prisma + MongoDB)
- **ProductionBatch**: Tandas con estado ACTIVE/CLOSED, ventas asociadas
- **Sale**: Ventas con pounds, pricePerPound, totalAmount, paymentStatus (PAID/PENDING/PARTIAL)
- **Customer**: Clientes con totalDebt/totalPaid calculados
- **User**: Usuarios con roles ADMIN/VENDEDOR/COBRADOR
- **Collection**: Cobros de deudas
- **CashMovement**: Movimientos de caja por usuario (INCOME/EXPENSE)
- **Transfer**: Transferencias entre usuarios
- **Expense**: Gastos con concepto obligatorio

### Patrones de API
- Autenticación JWT con NextAuth en cada endpoint (`await auth()`)
- Validaciones estrictas: existencia de tanda activa, cliente válido, campos obligatorios
- Queries con `include` para relaciones (ej: `sales: { include: { customer: true, user: true } }`)
- Cálculos en runtime (totalPounds = sum(sale.pounds))
- Errores en español: "No hay tanda activa", "Faltan campos obligatorios"

### Patrones de UI
- Componentes Radix UI + Tailwind para mobile-first
- Navegación con iconos Lucide React y descripciones cortas
- Formularios con react-hook-form + zod para validación
- Estados de carga y confirmaciones visuales (verde ✓ / rojo ✗)
- Calculadora integrada en formularios de ventas

### Utilidades y Helpers
- `batch-utils.ts`: Formateo de fechas (DD/MM), moneda COP, nombres de tandas
- `prisma.ts`: Cliente singleton con configuración MongoDB
- `auth.ts`: Configuración NextAuth con bcrypt para contraseñas

## Principios de Diseño UX/UI

⚠️ **CRÍTICO**: Usuarios con poca experiencia tecnológica, uso 100% móvil

- Botones grandes y táctiles (mínimo 44x44px)
- Flujos máximo 2-3 pasos
- Confirmaciones visuales claras (verde ✓ / rojo ✗)
- Navegación con iconos + texto descriptivo
- Lenguaje coloquial, cero tecnicismos
- Indicador prominente de tanda activa siempre visible
- Modo oscuro/claro
- Mobile-first responsive
- Estados de carga evidentes
- Mensajes de error comprensibles y accionables
- Calculadora integrada para ventas
- Advertencia si no hay tanda activa

## Workflows de Desarrollo

### Build y Deploy
- `npm run build`: Genera cliente Prisma, push DB schema, build Next.js
- `npm run db:seed`: Pobla datos de prueba con tsx
- `npm run dev`: Desarrollo local
- Deploy Vercel: Configurar DATABASE_URL, NEXTAUTH_SECRET

### Base de Datos
- MongoDB con Prisma para schema y migrations
- Seeds en `prisma/seed.ts` con usuarios admin/vendedor/cobrador
- Relaciones con @db.ObjectId para MongoDB

### Autenticación
- NextAuth con JWT strategy, 30 días de sesión
- Roles: ADMIN (full access), VENDEDOR (ventas), COBRADOR (cobros)
- Contraseñas hasheadas con bcrypt

## Convenciones del Proyecto

- **Lenguaje**: Español en UI, código en inglés
- **Moneda**: COP (pesos colombianos) con formateo Intl
- **Fechas**: Formato DD/MM, locale es-CO
- **Validaciones**: Campos obligatorios marcados, errores específicos
- **Nombres**: camelCase en código, PascalCase en componentes
- **Imports**: Alias `@/` para src/, paths absolutos
- **API**: RESTful con Next.js App Router, JSON responses
- **Estado**: Client components con hooks, server components para data

## Para Ejecutar el Proyecto

1. `npm install` - Instalar dependencias
2. Configurar `.env`:
```
   DATABASE_URL="mongodb://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="..."
```
3. `npx prisma generate` - Generar cliente Prisma
4. `npx prisma db push` - Crear tablas en base de datos
5. `npm run db:seed` - Poblar datos de prueba (opcional)
6. `npm run dev` - Ejecutar en desarrollo

## Despliegue en Vercel

1. Conectar repositorio GitHub a Vercel
2. Configurar MongoDB Atlas en el dashboard
3. Agregar variables de entorno en Vercel
4. Deploy automático en cada push

## Credenciales de Prueba (Seed)
- Admin: admin@morcilla.com / admin123
- Vendedor: vendedor@morcilla.com / vendedor123
- Cobrador: cobrador@morcilla.com / cobrador123

## Prioridades en Desarrollo

1. **Simplicidad** > Funcionalidades avanzadas
2. **Confiabilidad** > Velocidad de desarrollo
3. **Trazabilidad por tanda** > Reportes complejos
4. **Performance móvil** > Desktop experience

## Notas Importantes para Copilot

- Siempre vincular ventas a tanda activa
- Calcular libras totales de tanda sumando ventas
- Validar que exista tanda activa antes de registrar venta
- Mantener UI extremadamente simple (usuarios no técnicos)
- Optimizar para pantallas pequeñas primero
- Usar lenguaje natural en mensajes ("Venta registrada ✓" no "Transaction completed successfully")