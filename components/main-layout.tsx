"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  ChevronRight,
  Home,
  LineChart,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  PanelLeft,
  Search,
  Settings,
  ShoppingBag,
  User,
  BarChart3,
  Layers,
  X,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationHeader } from "@/components/notification-header"
import { NotificationPermissionBanner } from "@/components/notification-permission-banner"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUserSession } from "@/hooks/use-user-session"
import { signOutWithGoogle } from "@/lib/auth"

// Tambahkan di bagian atas file, setelah import
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 5px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
  }
  
  .scrollbar-thin:hover::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
  }
  
  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.3);
  }
  
  .dark .scrollbar-thin:hover::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
  }
`

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = useUserSession()

  // Simpan state sidebar di localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  

  const routes = [
    {
      name: "Beranda",
      path: "/",
      icon: Home,
      description: "Halaman utama",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LineChart,
      description: "Ringkasan bisnis Anda",
    },
    {
      name: "Prediksi",
      path: "/prediksi",
      icon: LineChart,
      description: "Prediksi harga bahan pokok",
      badge: "Terbaru",
    },
    {
      name: "Prediksi Produk",
      path: "/produk-prediksi",
      icon: BarChart3,
      description: "Prediksi tren produk Anda",
      badge: "Baru",
    },
    {
      name: "Produk Saya",
      path: "/produk-saya",
      icon: ShoppingBag,
      description: "Kelola produk Anda",
    },
    {
      name: "Notifikasi",
      path: "/notifikasi",
      icon: Bell,
      description: "Pemberitahuan penting",
      badge: "Baru",
    },
    {
      name: "Asisten",
      path: "/asisten",
      icon: MessageSquareText,
      description: "Bantuan AI untuk bisnis",
    },
  ]

 
  // Tambahkan di dalam komponen MainLayout, sebelum return statement
  return (
    <div className="flex min-h-screen bg-background">
      {/* Tambahkan style tag untuk scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      {/* Sidebar untuk desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 z-20 hidden md:flex flex-col border-r bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-900/80 dark:to-slate-950 dark:border-slate-800 transition-all duration-300 h-screen",
          isCollapsed ? "w-[70px]" : "w-72",
        )}
      >
        <div className="flex h-16 items-center border-b px-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <Logo size={isCollapsed ? "sm" : "md"} variant={isCollapsed ? "default" : "default"} />
          </Link>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-blue-50 dark:hover:bg-slate-700"
        >
          <PanelLeft className={cn("h-3 w-3 transition-transform", isCollapsed && "rotate-180")} />
        </button>

        <nav className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-6 flex-1 overflow-y-auto scrollbar-thin px-3 py-6">
            <div>
              {!isCollapsed && (
                <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Menu Utama
                </h3>
              )}
              <div className="space-y-1.5">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "group relative flex items-center rounded-lg text-sm font-medium transition-all",
                      pathname === route.path
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                        : "text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-800/60",
                      isCollapsed ? "px-2 py-2.5 justify-center" : "px-4 py-2.5",
                    )}
                    title={isCollapsed ? `${route.name}: ${route.description}` : undefined}
                  >
                    <route.icon
                      className={cn(
                        "h-5 w-5",
                        pathname === route.path ? "text-white" : "text-blue-500 dark:text-blue-400",
                        isCollapsed ? "mr-0" : "mr-3",
                      )}
                    />
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <span>{route.name}</span>
                        <span
                          className={cn(
                            "text-xs font-normal",
                            pathname === route.path ? "text-blue-100" : "text-slate-500 dark:text-slate-400",
                          )}
                        >
                          {route.description}
                        </span>
                      </div>
                    )}
                    {!isCollapsed && route.badge && (
                      <Badge
                        className={cn(
                          "ml-auto",
                          pathname === route.path
                            ? "bg-white text-blue-600"
                            : route.badge === "Terbaru"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                        )}
                      >
                        {route.badge}
                      </Badge>
                    )}
                    {isCollapsed && route.badge && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                        {route.badge === "Terbaru" ? "!" : route.badge}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                <AvatarImage src={user?.photoURL || "/placeholder-user.jpg"} alt={user?.displayName || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  {user?.displayName?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <ThemeToggle iconOnly />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-slate-800 p-3">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
                  <AvatarImage src={user?.photoURL || "/placeholder-user.jpg"} alt={user?.displayName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    {user?.displayName?.substring(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email || "Loading..."}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">UMKM Kuliner</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Pengaturan</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Pengaturan</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login" onClick={signOutWithGoogle}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Keluar</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ThemeToggle variant="outline" size="default" className="w-full justify-center" />
            </div>
          )}
        </div>
      </aside>

      {/* Sidebar mobile */}
   
<Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
<SheetContent
  side="left"
  className="w-80 p-0 bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-900/80 dark:to-slate-950 overflow-y-auto overflow-x-hidden scrollbar-thin" 
>

    <div className="flex h-16 items-center justify-between border-b px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm dark:border-slate-800">
      <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2">
        <Logo size="md" />
      </Link>
    </div>

    <nav className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-300 px-4 py-6 space-y-6">
        {/* MENU UTAMA */}
        <div>
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Menu Utama
          </h3>
          <div className="space-y-1.5">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  pathname === route.path
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                    : "text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                )}
              >
                <route.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    pathname === route.path ? "text-white" : "text-blue-500 dark:text-blue-400"
                  )}
                />
                <div className="flex flex-col">
                  <span>{route.name}</span>
                  <span
                    className={cn(
                      "text-xs font-normal",
                      pathname === route.path ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {route.description}
                  </span>
                </div>
                {route.badge && (
                  <Badge
                    className={cn(
                      "ml-auto",
                      pathname === route.path
                        ? "bg-white text-blue-600"
                        : route.badge === "Terbaru"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    )}
                  >
                    {route.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>


      

       
      
      </div>
    </nav>

    {/* FOOTER */}
    <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-slate-800 p-3 shadow-inner">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow">
            <AvatarImage src={user?.photoURL || "/placeholder-user.jpg"} alt={user?.displayName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              {user?.displayName?.substring(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email || "Loading..."}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">UMKM Kuliner</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Pengaturan</span>
          </Button>
        </div>
        <ThemeToggle variant="outline" size="default" className="w-full justify-center" />
      </div>
    </div>
  </SheetContent>
</Sheet>


      {/* Konten utama */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isMobile ? "w-full" : isCollapsed ? "md:ml-[70px]" : "md:ml-72",
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white/80 dark:bg-slate-950/80 dark:border-slate-800 backdrop-blur-sm px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-blue-50 dark:hover:bg-slate-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <div className="w-full flex-1">
          </div>
          <ThemeToggle className="hidden sm:flex" />
          <NotificationHeader />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                <span className="sr-only">Profil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth/login" onClick={signOutWithGoogle}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Konten halaman */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900">{children}</main>
      </div>
      <NotificationPermissionBanner />
    </div>
  )
}
