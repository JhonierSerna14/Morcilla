import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // SEGURIDAD: Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 })
  }

  const debug = {
    // Environment Variables (sin exponer valores)
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '[CONFIGURADO]' : '[NO CONFIGURADO]',
    NODE_ENV: process.env.NODE_ENV,
    
    // Request Info básico
    origin: request.nextUrl.origin,
    protocol: request.nextUrl.protocol,
    
    // Database
    databaseConnected: !!process.env.DATABASE_URL,
    
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(debug, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}