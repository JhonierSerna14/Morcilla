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

En Vercel, agrega estas variables de entorno:

```bash
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="https://tu-app.vercel.app"
# DATABASE_URL se configura automáticamente con Supabase
```

## 4. Desplegar

1. Haz push de tu código a GitHub
2. Vercel desplegará automáticamente
3. El build incluye `prisma generate` y `prisma db push`

## 5. Crear Usuario Administrador

Después del primer despliegue exitoso:

1. Ve a la terminal de tu proyecto en Vercel
2. Edita las credenciales en `scripts/create-admin.ts`:
   ```typescript
   const adminData = {
     email: 'tu-email@tudominio.com',
     name: 'Tu Nombre',
     password: 'TuPasswordSeguro123!'
   }
   ```
3. Ejecuta: `npx tsx scripts/create-admin.ts`
4. Guarda las credenciales mostradas

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