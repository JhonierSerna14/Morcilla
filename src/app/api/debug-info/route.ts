import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const debug = {
    // Environment Variables
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '[CONFIGURADO]' : '[NO CONFIGURADO]',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    
    // Vercel Info
    vercelEnv: process.env.VERCEL_ENV,
    vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    
    // Request Info
    origin: request.nextUrl.origin,
    host: request.headers.get('host'),
    protocol: request.nextUrl.protocol,
    
    // Cookies
    cookies: request.cookies.getAll().map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 20) + '...'
    })),
    
    // Headers relevantes
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    
    // Database
    databaseConnected: !!process.env.DATABASE_URL
  }
  
  return NextResponse.json(debug, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}