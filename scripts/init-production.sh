#!/bin/bash
# Script de inicialización para después del primer deploy en Vercel
# Ejecutar manualmente desde la terminal de Vercel

echo "🚀 Inicializando base de datos de producción..."

# Aplicar migraciones de Prisma
echo "📊 Aplicando esquema de base de datos..."
npx prisma db push --force-reset

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo "✅ Base de datos inicializada"
echo ""
echo "🔐 SIGUIENTE PASO: Crear usuario administrador"
echo "   Ejecutar: npx tsx scripts/create-admin.ts"
echo ""
echo "📝 RECORDAR:"
echo "   1. Cambiar email y password en scripts/create-admin.ts"
echo "   2. Ejecutar el script UNA SOLA VEZ"
echo "   3. Guardar las credenciales de forma segura"