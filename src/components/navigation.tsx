"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
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
import ThemeToggle from "@/components/ui/theme-toggle"

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
    name: "Mi Caja",
    href: "/cash/balance",
    icon: Wallet,
    description: "Mi dinero"
  },
  {
    name: "Transferencias",
    href: "/cash",
    icon: ArrowLeftRight,
    description: "Entre usuarios"
  },
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

  // Combinar elementos de navegación base con los de admin si es necesario
  const navItems = [...baseNavItems, ...(session?.user?.role === "ADMIN" ? adminNavItems : [])]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden shadow-lg">
      {/* Navegación principal móvil */}
      <div className="flex overflow-x-auto px-2 py-2">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-center min-w-[60px] transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-medium">{item.name}</div>
            </Link>
          )
        })}
        
        {/* Botón de menú expandido */}
        <button
          className="flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-center min-w-[60px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          onClick={() => {
            const menu = document.getElementById('expanded-menu')
            if (menu) {
              menu.classList.toggle('hidden')
            }
          }}
        >
          <ClipboardList className="w-6 h-6 mx-auto mb-1" />
          <div className="text-xs font-medium">Más</div>
        </button>
      </div>

      {/* Menú expandido */}
      <div id="expanded-menu" className="hidden bg-card border-t border-border px-4 py-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-card-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <ThemeToggle />
          <Button
            variant="outline"
            className="flex-1 ml-3 justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
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
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-foreground">
                Gestión Morcilla
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
              
              <ThemeToggle />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}