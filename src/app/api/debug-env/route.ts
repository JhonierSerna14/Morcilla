import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING",
    headers: Object.fromEntries(request.headers.entries()),
    cookies: request.cookies.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value
      return acc
    }, {} as Record<string, string>),
    url: request.url,
    timestamp: new Date().toISOString()
  })
}