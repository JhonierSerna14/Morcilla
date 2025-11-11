#!/usr/bin/env node
/**
 * Script para generar NEXTAUTH_SECRET seguro
 * Uso: node scripts/generate-secret.js
 */

const crypto = require('crypto')

function generateSecureSecret() {
  // Generar 32 bytes aleatorios y convertir a base64
  const secret = crypto.randomBytes(32).toString('base64')
  return secret
}

function main() {
  console.log('🔐 Generando NEXTAUTH_SECRET seguro...\n')
  
  const secret = generateSecureSecret()
  
  console.log('✅ NEXTAUTH_SECRET generado:')
  console.log('=' .repeat(50))
  console.log(secret)
  console.log('=' .repeat(50))
  
  console.log('\n📝 Instrucciones:')
  console.log('1. Copia el secret generado')
  console.log('2. En Vercel Dashboard > Settings > Environment Variables')
  console.log('3. Agrega: NEXTAUTH_SECRET = [el secret copiado]')
  console.log('4. ¡NUNCA lo subas al repositorio!')
  
  console.log('\n🚀 Para desarrollo local:')
  console.log('Agrega a tu archivo .env:')
  console.log(`NEXTAUTH_SECRET="${secret}"`)
}

if (require.main === module) {
  main()
}

module.exports = { generateSecureSecret }