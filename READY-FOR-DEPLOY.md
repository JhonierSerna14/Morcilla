# ✅ Proyecto Listo para Despliegue en Vercel + Supabase

## 🎯 Estado del Proyecto

Este proyecto de **Gestión Familiar Morcilla** está completamente preparado para desplegarse en Vercel usando Supabase como base de datos PostgreSQL.

## 📁 Archivos Configurados para Despliegue

### ✅ Configuración de Vercel
- ✅ `vercel.json` - Configuración del build y variables
- ✅ `package.json` - Scripts actualizados para producción
- ✅ `next.config.ts` - Configuración optimizada para Vercel
- ✅ `.env.example` - Template de variables de entorno

### ✅ Base de Datos y Migración
- ✅ `prisma/schema.prisma` - Esquema completo de base de datos
- ✅ `prisma/seed.ts` - Datos iniciales (adaptado para prod/dev)
- ✅ Scripts de inicialización para producción

### ✅ Scripts de Administración
- ✅ `scripts/create-admin.ts` - Crear administrador inicial
- ✅ `scripts/check-app-status.ts` - Verificar estado de la app
- ✅ `scripts/add-user.ts` - Agregar usuarios adicionales
- ✅ `scripts/init-production.sh` - Inicialización completa

### ✅ Documentación
- ✅ `DEPLOY.md` - Instrucciones detalladas de despliegue
- ✅ `README.md` - Actualizado con info de producción

## 🚀 Pasos para Desplegar

### 1. Preparar repositorio
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Configurar en Vercel
1. Importar repositorio desde GitHub
2. Ir a Storage → Browse → Seleccionar Supabase
3. Configurar variables de entorno:
   ```
   NEXTAUTH_SECRET="[generar con: openssl rand -base64 32]"
   NEXTAUTH_URL="https://tu-app.vercel.app"
   ```

### 3. Desplegar
- Vercel desplegará automáticamente
- El build incluye `prisma generate` y `prisma db push`

### 4. Crear administrador
En la terminal de Vercel:
```bash
npx tsx scripts/create-admin.ts
```

## 👤 Usuario Base Configurado

El sistema creará un usuario administrador con estas credenciales por defecto:
- **Email**: `admin@morcilla.app`
- **Password**: `MorcillaAdmin2025!`
- **Rol**: `ADMIN`

> ⚠️ **IMPORTANTE**: Cambia estas credenciales editando `scripts/create-admin.ts` antes del despliegue.

## 🔧 Variables de Entorno Necesarias

### En Vercel:
```bash
DATABASE_URL="[auto-configurado por Supabase]"
NEXTAUTH_SECRET="[generar secreto seguro]"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
```

### Opcionales para crear admin:
```bash
ADMIN_EMAIL="tu@email.com"
ADMIN_NAME="Tu Nombre"
ADMIN_PASSWORD="TuPasswordSeguro123!"
```

## ✨ Funcionalidades Listas

- ✅ Sistema de autenticación con NextAuth
- ✅ Base de datos PostgreSQL con Prisma
- ✅ Gestión de tandas de producción
- ✅ Sistema de ventas y clientes
- ✅ Control de caja por usuario
- ✅ Interface mobile-first
- ✅ Dashboard en tiempo real
- ✅ Roles de usuario (Admin/Vendedor/Cobrador)

## 📞 Soporte Post-Despliegue

### Comandos útiles desde Vercel terminal:
```bash
# Verificar estado
npx tsx scripts/check-app-status.ts

# Ver base de datos
npx prisma studio

# Crear usuario adicional
npx tsx scripts/add-user.ts

# Poblar datos de ejemplo (solo desarrollo)
npm run db:seed
```

## 🎉 ¡Listo para Producción!

El proyecto está completamente configurado y listo para desplegarse. Sigue las instrucciones en `DEPLOY.md` para el proceso detallado paso a paso.