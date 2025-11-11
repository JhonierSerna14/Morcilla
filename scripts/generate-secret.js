// Script para generar NEXTAUTH_SECRET
// Ejecutar: node scripts/generate-secret.js

const crypto = require('crypto')

function generateSecret() {
  const secret = crypto.randomBytes(32).toString('base64')
  
  console.log('🔐 NEXTAUTH_SECRET generado:')
  console.log('')
  console.log(secret)
  console.log('')
  console.log('📋 Copia este valor y úsalo como NEXTAUTH_SECRET en Vercel')
  console.log('⚠️  Este secreto es único - no lo compartas públicamente')
  
  return secret
}

// Si se ejecuta directamente
if (require.main === module) {
  generateSecret()
}

module.exports = { generateSecret }