import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // SEGURIDAD: Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 })
  }

  try {
    const session = await auth()
    
    const authDebug = {
      // Session Status
      sessionExists: !!session,
      sessionUser: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      } : null,
      
      // Environment
      nodeEnv: process.env.NODE_ENV,
      
      // Request básico
      origin: request.nextUrl.origin,
      pathname: request.nextUrl.pathname,
      
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(authDebug, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Auth Debug Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}