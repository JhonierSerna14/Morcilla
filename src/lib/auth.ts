import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"

const authConfig: NextAuthConfig = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string
            }
          })

          if (!user || !user.active) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Logs para debugging en producción
      console.log('NextAuth redirect callback:', { url, baseUrl })
      
      // Para localhost y desarrollo
      if (baseUrl.includes('localhost')) {
        if (url.startsWith("/")) return `${baseUrl}${url}`
        if (url.includes('localhost')) return url
        return `${baseUrl}/dashboard`
      }
      
      // Para producción en Vercel
      const prodBaseUrl = process.env.NEXTAUTH_URL || baseUrl
      if (url.startsWith("/")) return `${prodBaseUrl}${url}`
      
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(prodBaseUrl)
        if (urlObj.origin === baseUrlObj.origin) return url
      } catch (e) {
        console.error('URL parsing error:', e)
      }
      
      return `${prodBaseUrl}/dashboard`
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)