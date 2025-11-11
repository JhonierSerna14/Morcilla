# Instrucciones de Despliegue en Vercel con Supabase

## 1. Preparar el Proyecto

1. Clona este repositorio en tu cuenta de GitHub
2. Ve a [Vercel](https://vercel.com) e importa tu repositorio

## 2. Configurar Base de Datos con Supabase

1. En el dashboard de tu proyecto en Vercel:
   - Ve a "Storage" → "Browse"
   - Selecciona "Supabase" 
   - Conecta tu cuenta o crea una nueva
   - Crea una nueva base de datos PostgreSQL

2. Vercel configurará automáticamente la variable `DATABASE_URL`

## 3. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings** → **Environment Variables** y agrega:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXTAUTH_SECRET` | `[ver instrucciones abajo]` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://tu-app-preview.vercel.app` | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |

### 🔐 Generar NEXTAUTH_SECRET

**En tu computadora local:**
```bash
# Si tienes OpenSSL (Mac/Linux/Windows con Git Bash)
openssl rand -base64 32

# Si no tienes OpenSSL, usa Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# O usa este generador online (seguro): https://generate-secret.vercel.app/32
```

**Ejemplo de secreto generado:**
```
wX8mP2vK9sQ7nR4tY6uI1oP3aS5dF8hJ0kL2mN9xC4vB
```

> **Nota**: `DATABASE_URL` se configura automáticamente cuando conectas Supabase desde Vercel Storage.

## 4. Desplegar

1. Haz push de tu código a GitHub
2. Vercel desplegará automáticamente
3. El build incluye `prisma generate` y `prisma db push`

## 5. Crear Usuario Administrador

Después del primer despliegue exitoso:

### Opción A: Usar Variables de Entorno (Recomendado)
1. En Vercel, agrega estas variables adicionales:
   - `ADMIN_EMAIL`: `tu-email@tudominio.com`
   - `ADMIN_NAME`: `Tu Nombre Completo`
   - `ADMIN_PASSWORD`: `TuPasswordSeguro123!`

2. Ve a Functions → Terminal en tu proyecto Vercel
3. Ejecuta: `npx tsx scripts/create-admin.ts`

### Opción B: Editar Script Manualmente
1. Edita `scripts/create-admin.ts` antes del despliegue:
   ```typescript
   const adminData = {
     email: 'tu-email@tudominio.com',
     name: 'Tu Nombre',
     password: 'TuPasswordSeguro123!'
   }
   ```
2. Haz push del cambio a GitHub
3. Ejecuta desde terminal: `npx tsx scripts/create-admin.ts`

## 6. Verificar Funcionamiento

1. Ve a tu URL de producción
2. Inicia sesión con las credenciales del administrador
3. Crea usuarios adicionales desde el panel de administración

## Variables de Entorno para Desarrollo Local

Crea `.env.local`:

```bash
DATABASE_URL="tu-database-url-de-supabase"
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Ver base de datos
npx prisma studio

# Resetear base de datos (desarrollo)
npx prisma db push --force-reset
npm run db:seed
```

## Estructura de Usuarios

- **Admin**: Control total del sistema
- **Vendedor**: Registrar ventas y clientes  
- **Cobrador**: Solo acceso a cobros y estado de cuentas

## Soporte

Si encuentras problemas:
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs en Vercel Dashboard
3. Asegúrate de que la base de datos esté accesible