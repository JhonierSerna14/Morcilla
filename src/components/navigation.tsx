"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wallet,
  TrendingUp,
  ClipboardList,
  ArrowLeftRight,
  DollarSign,
  FileText,
  Scale,
  LogOut,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

interface NavItem {
  name: string
  href: string
  icon: any
  description: string
}

const baseNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Resumen general"
  },
  {
    name: "Ventas",
    href: "/sales",
    icon: ShoppingCart,
    description: "Registrar ventas"
  },
  {
    name: "Clientes",
    href: "/customers",
    icon: Users,
    description: "Gestionar clientes"
  },
  {
    name: "Movimientos",
    href: "/cash",
    icon: Wallet,
    description: "Ver movimientos y transferencias"
  },
  // Transferencias están integradas en Movimientos (un solo apartado)
  {
    name: "Gastos",
    href: "/expenses",
    icon: TrendingUp,
    description: "Registrar gastos"
  },
  {
    name: "Tandas",
    href: "/batches",
    icon: Scale,
    description: "Historial de tandas"
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: ClipboardList,
    description: "Informes completos"
  }
]

const adminNavItems: NavItem[] = [
  {
    name: "Usuarios",
    href: "/users",
    icon: UserPlus,
    description: "Gestionar usuarios"
  }
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expanded, setExpanded] = useState(false)

  // Combinar elementos de navegación base con los de admin si es necesario
  const navItems = [...baseNavItems, ...(session?.user?.role === "ADMIN" ? adminNavItems : [])]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg backdrop-blur-lg lg:hidden">
      {/* Navegación principal móvil */}
      <div className="flex overflow-x-auto px-2 py-2">
        {/* Mostrar: Dashboard, Ventas, Clientes */}
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-center min-w-[88px] transition-all duration-200 interactive-large ${isActive
                ? "bg-primary text-primary-foreground shadow-md font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              aria-label={`Ir a ${item.name}`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm font-medium">{item.name}</div>
            </Link>
          )
        })}

        {/* Botón rápido: Cobrar (antes de Movimientos) */}
        <Link
          href="/collections"
          className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-center min-w-[88px] transition-all duration-200 interactive-large ${pathname === '/collections'
            ? "bg-primary text-primary-foreground shadow-md font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          aria-label="Ir a Cobrar"
        >
          <DollarSign className="w-6 h-6 mx-auto mb-1" />
          <div className="text-sm font-medium">Cobrar</div>
        </Link>

        {/* Movimientos (el que estaba en posición 4) */}
        {navItems.slice(3, 4).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-center min-w-[88px] transition-all duration-200 interactive-large ${isActive
                ? "bg-primary text-primary-foreground shadow-md font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              aria-label={`Ir a ${item.name}`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm font-medium">{item.name}</div>
            </Link>
          )
        })}

        {/* Botón de menú expandido */}
        <button
          className="flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-center min-w-[88px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 interactive-large"
          aria-expanded={expanded}
          aria-controls="expanded-menu"
          aria-label={expanded ? 'Cerrar más opciones' : 'Abrir más opciones'}
          onClick={() => setExpanded((v) => !v)}
        >
          <ClipboardList className="w-6 h-6 mx-auto mb-1" />
          <div className="text-xs font-medium">Más</div>
        </button>
      </div>

      {/* Menú expandido */}
      <div id="expanded-menu" className={`${expanded ? '' : 'hidden'} bg-card border-t border-border px-4 py-4 max-h-64 overflow-y-auto`}>
        <div className="grid grid-cols-2 gap-3">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 interactive-large ${isActive
                  ? "bg-primary text-primary-foreground shadow-md font-semibold"
                  : "bg-muted text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                aria-label={`Ir a ${item.name}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <Button
            variant="destructive"
            className="w-full h-10 justify-start"
            onClick={() => signOut()}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente para navegación desktop
export function DesktopNavigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Combinar elementos de navegación base con los de admin si es necesario
  const navItems = [...baseNavItems, ...(session?.user?.role === "ADMIN" ? adminNavItems : [])]

  return (
    <div className="hidden lg:block">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}

              <div className="ml-4 border-l border-border pl-4 flex items-center space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => signOut()}
                  className="h-10"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}