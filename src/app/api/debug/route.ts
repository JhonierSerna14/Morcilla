// Página de diagnóstico para verificar configuración de NextAuth
// Accede a /api/debug en desarrollo para ver los valores

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 })
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Configurado" : "❌ No configurado",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Configurado" : "❌ No configurado",
    timestamp: new Date().toISOString()
  })
}