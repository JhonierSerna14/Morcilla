# 🚀 Instrucciones para Desplegar en Vercel

## ✅ Estado Actual del Proyecto
- ✅ **Base de datos**: MongoDB Atlas configurado y funcionando
- ✅ **Schema**: Migrado a MongoDB con ObjectId
- ✅ **Seeder**: Usuario admin creado (admin@morcilla.com / admin123)
- ✅ **Datos de ejemplo**: Clientes, tanda y ventas creadas
- ✅ **Compilación**: Proyecto compila sin errores
- ✅ **Aplicación**: Funcionando localmente

## 📋 Pasos para Desplegar en Vercel

### 1. Preparar Variables de Entorno para Vercel

Crear archivo `.env.production` con:

```env
# Database - MongoDB Atlas
DATABASE_URL="mongodb+srv://Vercel-Admin-morcilladb:lRva2zVHU8ICn6rs@morcilladb.v8uu4bv.mongodb.net/morcilladb?retryWrites=true&w=majority"

# NextAuth - IMPORTANTE: Cambiar en producción
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="nuevo-secret-super-seguro-para-produccion-cambiar-este-valor"

# Admin por defecto
ADMIN_EMAIL="admin@morcilla.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Administrador"
```

### 2. Subir a GitHub

```bash
# En PowerShell
git init
git add .
git commit -m "feat: Sistema de gestión familiar con MongoDB Atlas"
git branch -M main
git remote add origin https://github.com/JhonierSerna14/Morcilla.git
git push -u origin main
```

### 3. Configurar en Vercel

1. **Ir a vercel.com** y conectar tu cuenta GitHub
2. **Import Git Repository** → Seleccionar el repositorio `Morcilla`
3. **Configure Project**:
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build`
   - Install Command: `npm install`

### 4. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables, agregar:

```
DATABASE_URL = mongodb+srv://Vercel-Admin-morcilladb:lRva2zVHU8ICn6rs@morcilladb.v8uu4bv.mongodb.net/morcilladb?retryWrites=true&w=majority
NEXTAUTH_URL = https://tu-dominio.vercel.app
NEXTAUTH_SECRET = nuevo-secret-super-seguro-para-produccion
ADMIN_EMAIL = admin@morcilla.com
ADMIN_PASSWORD = admin123
ADMIN_NAME = Administrador
```

### 5. Deploy y Crear Usuario Admin en Producción

Después del primer deploy exitoso:

```bash
# Desde el terminal de Vercel o Functions
npx tsx scripts/create-admin.ts
```

## 🔐 Credenciales de Acceso

### Desarrollo (Local)
- **Admin**: admin@morcilla.com / admin123
- **Vendedor**: vendedor@morcilla.com / vendedor123

### Producción
- **Admin**: admin@morcilla.com / admin123 (cambiar password después del login)

## 📊 Base de Datos

- **Proveedor**: MongoDB Atlas
- **Cluster**: morcilladb.v8uu4bv.mongodb.net
- **Base de datos**: morcilladb
- **Colecciones creadas**: 9 colecciones con índices únicos

## 🛠 Comandos Útiles

```bash
# Compilar proyecto
npm run build

# Crear admin en producción
npm run create-admin

# Poblar datos (solo desarrollo)
npm run db:seed

# Ver base de datos
npx prisma studio
```

## ⚡ Optimizaciones para Producción

1. **Cambiar NEXTAUTH_SECRET** por algo único y seguro
2. **Cambiar contraseña del admin** después del primer login
3. **Configurar dominio personalizado** en Vercel (opcional)
4. **Habilitar Analytics** en Vercel (opcional)

## 🎯 Próximos Pasos Post-Deploy

1. Acceder a la aplicación desplegada
2. Login como admin y cambiar contraseña
3. Crear usuarios adicionales según necesidad
4. Configurar primera tanda de producción real
5. Comenzar a registrar clientes y ventas

---

**🚀 ¡Todo listo para producción!** El sistema está completamente funcional y optimizado para Vercel.