import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // SEGURIDAD: Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 })
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ SET" : "❌ MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING", 
    DATABASE_URL: process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING",
    // Removido: headers y cookies por seguridad
    timestamp: new Date().toISOString()
  })
}