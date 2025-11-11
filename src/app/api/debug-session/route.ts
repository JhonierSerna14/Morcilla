import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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
      
      // Auth Cookies
      sessionToken: request.cookies.get('authjs.session-token')?.value?.substring(0, 20) + '...' || '[NO ENCONTRADO]',
      csrfToken: request.cookies.get('authjs.csrf-token')?.value?.substring(0, 20) + '...' || '[NO ENCONTRADO]',
      
      // Environment
      nextauthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
      
      // Request
      origin: request.nextUrl.origin,
      pathname: request.nextUrl.pathname,
      
      // All Cookies
      allCookies: request.cookies.getAll().map(c => c.name),
      
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