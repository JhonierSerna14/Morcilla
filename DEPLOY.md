# 🚀 Despliegue en Vercel - Gestión Familiar Morcilla

## Variables de Entorno Requeridas

En Vercel Dashboard → Settings → Environment Variables:

```env
NEXTAUTH_SECRET=f738d3c4ddc4c8be85b4429611d0591fc3181f9a642a4ab059bb0d70d4ef2a0e
NEXTAUTH_URL=https://tu-proyecto.vercel.app
DATABASE_URL=postgresql://username:password@host:port/database
```

## Pasos de Despliegue

1. **Configurar Variables:**
   - Ve a Vercel Dashboard
   - Selecciona tu proyecto
   - Settings → Environment Variables
   - Agrega las 3 variables arriba

2. **Redeploy:**
   - Deployments → Redeploy (latest deployment)
   - O hacer un push nuevo al repositorio

3. **Verificar:**
   - Visita: `https://tu-app.vercel.app/api/debug-production`
   - Debe mostrar que todas las variables están "SET"

## Debug en Producción

- **URL de debug:** `/api/debug-production`
- **Logs:** Vercel Functions → Ver logs en tiempo real
- **Errores comunes:**
  - NEXTAUTH_SECRET no configurado
  - NEXTAUTH_URL incorrecta
  - DATABASE_URL inválida

## Credenciales de Prueba

```
Email: admin@morcilla.com
Password: admin123
```

## Solución de Problemas

### Login se queda en bucle:
1. Verificar NEXTAUTH_URL = URL exacta de Vercel
2. Verificar NEXTAUTH_SECRET configurado
3. Limpiar cookies del navegador
4. Verificar logs en Vercel Functions

### Base de datos no conecta:
1. Verificar DATABASE_URL válida
2. Verificar que Prisma haya ejecutado `db push`
3. Verificar que las tablas existan

### Sessions no persisten:
1. Verificar cookies en DevTools
2. Verificar que `__Secure-next-auth.session-token` existe
3. Verificar configuración de cookies en NextAuth