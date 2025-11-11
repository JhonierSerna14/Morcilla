<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Gestión Familiar Morcilla - Proyecto Completado ✅

Este es un sistema completo de gestión para negocio familiar de morcilla desarrollado con:
- Next.js 14 con App Router y TypeScript
- Prisma + PostgreSQL para base de datos
- NextAuth.js para autenticación
- Tailwind CSS + Radix UI para interface
- Diseño mobile-first optimizado

## Funcionalidades Implementadas

- [x] **Sistema de Tandas de Producción**: Control de lotes con cálculo automático de libras
- [x] **Gestión de Clientes**: Registro simple con historial por tandas  
- [x] **Sistema de Ventas**: Vinculación automática a tandas activas
- [x] **Autenticación de Usuarios**: Login seguro con roles (Admin/Vendedor/Cobrador)
- [x] **Sistema de Caja**: Balance individual por usuario con transferencias internas
- [x] **Interface Mobile-First**: Botones grandes, navegación intuitiva
- [x] **Dashboard en Tiempo Real**: Métricas de tanda activa y accesos rápidos
- [x] **Configuración para Vercel**: Lista para despliegue en producción

## Estructura del Proyecto Completada

- [x] Clarify Project Requirements - Especificaciones completas recibidas
- [x] Scaffold the Project - Next.js 14 con todas las dependencias
- [x] Customize the Project - Funcionalidades core implementadas
- [x] Install Required Extensions - No se requieren extensiones adicionales
- [x] Compile the Project - Proyecto compilando correctamente
- [x] Create and Run Task - Scripts npm configurados
- [x] Launch the Project - Listo para `npm run dev`
- [x] Ensure Documentation is Complete - README completo con instrucciones

## Para Ejecutar el Proyecto

1. `npm install` - Instalar dependencias
2. Configurar `.env` con DATABASE_URL y NEXTAUTH_SECRET
3. `npx prisma generate` - Generar cliente Prisma
4. `npm run db:seed` - Poblar datos de ejemplo (opcional)
5. `npm run dev` - Ejecutar en desarrollo

## Credenciales de Prueba
- Admin: admin@morcilla.com / admin123
- Vendedor: vendedor@morcilla.com / vendedor123