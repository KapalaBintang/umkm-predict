"use client"

import type React from "react"

import {
  BarChart3,
  Calendar,
  Home,
  MessageSquare,
  Settings,
  TrendingUp,
  Package,
  ShoppingBag,
  LogOut,
  User,
  Download,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { notificationService } from "@/lib/services/notification-service"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  variant?: "desktop" | "mobile"
  onNavItemClick?: () => void
}

export function AppSidebar({ variant = "desktop", onNavItemClick }: AppSidebarProps) {
  const { user, userProfile, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const isMobile = useIsMobile()

  // Tambahkan class untuk animasi transisi
  const sidebarClasses = cn(
    "bg-gradient-to-b from-background to-muted/30 flex flex-col",
    "transition-all duration-300 ease-in-out",
    variant === "mobile" ? "w-full md:hidden" : "hidden md:flex"
  )

  useEffect(() => {
    if (user) {
      fetchUnreadCount()

      // Set up interval to check for new notifications
      const interval = setInterval(fetchUnreadCount, 60000) // Check every minute

      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const count = await notificationService.getUnreadCount(user.uid)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil keluar dari akun",
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Gagal",
        description: "Terjadi kesalahan saat logout",
        variant: "destructive",
      })
    }
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavItemClick) {
      onNavItemClick()
    }
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  const menuItems = [
    { path: "/use/dashboard", name: "Dashboard", icon: Home },
    { path: "/use/chat", name: "Chat AI", icon: MessageSquare },
    { path: "/use/trends", name: "Analisis Tren", icon: BarChart3 },
    { path: "/use/calendar", name: "Kalender Musiman", icon: Calendar },
    {
      path: "/use/reports",
      name: "Laporan & Ekspor",
      icon: Download,
      badge: unreadCount > 0 ? { text: "Baru", variant: "destructive" as const } : undefined,
    },
  ]

  const categoryItems = [
    { path: "/use/categories/food", name: "Kuliner & Makanan", icon: Package },
    { path: "/use/categories/hampers", name: "Hampers & Parcel", icon: ShoppingBag },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <Sidebar
      variant={variant === "mobile" ? "mobile" : "inset"}
      className={sidebarClasses}
    >
      <SidebarHeader className="pb-2 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-2 py-3"
        >
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-xl mr-2 shadow-sm">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              >
                UMKM Insight
              </motion.h1>
            )}
          </div>
          {user && variant === "desktop" && !isCollapsed && (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </SidebarHeader>

      {!isCollapsed && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/80 border-muted focus-visible:ring-primary/30"
            />
          </div>
        </div>
      )}

      <SidebarSeparator className="flex-shrink-0" />

      <SidebarContent className="flex-grow overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <motion.div variants={container} initial="hidden" animate="show">
                {menuItems.map((menuItem) => (
                  <motion.div key={menuItem.path} variants={item}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(menuItem.path)}
                        className={`transition-all duration-200 ${
                          isActive(menuItem.path)
                            ? "bg-primary/10 text-primary font-medium shadow-sm"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Link href={menuItem.path} onClick={handleNavClick} className="flex items-center">
                          <div className={`p-1.5 rounded-md ${isActive(menuItem.path) ? "bg-primary/10" : ""}`}>
                            <menuItem.icon
                              className={`h-5 w-5 ${isActive(menuItem.path) ? "text-primary" : "text-muted-foreground"}`}
                            />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="ml-2 flex-1">{menuItem.name}</span>
                              {menuItem.badge && (
                                <Badge variant={menuItem.badge.variant} className="ml-auto text-xs py-0.5">
                                  {menuItem.badge.text}
                                </Badge>
                              )}
                              {isActive(menuItem.path) && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </motion.div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3">
            Kategori Produk
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <motion.div variants={container} initial="hidden" animate="show" transition={{ delayChildren: 0.2 }}>
                {categoryItems.map((categoryItem) => (
                  <motion.div key={categoryItem.path} variants={item}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(categoryItem.path)}
                        className={`transition-all duration-200 ${
                          isActive(categoryItem.path)
                            ? "bg-primary/10 text-primary font-medium shadow-sm"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Link href={categoryItem.path} onClick={handleNavClick} className="flex items-center">
                          <div className={`p-1.5 rounded-md ${isActive(categoryItem.path) ? "bg-primary/10" : ""}`}>
                            <categoryItem.icon
                              className={`h-5 w-5 ${isActive(categoryItem.path) ? "text-primary" : "text-muted-foreground"}`}
                            />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="ml-2 flex-1">{categoryItem.name}</span>
                              {isActive(categoryItem.path) && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </motion.div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex-shrink-0">
        <SidebarMenu>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/settings")}
                className={`transition-all duration-200 ${
                  isActive("/settings") ? "bg-primary/10 text-primary font-medium shadow-sm" : "hover:bg-muted/50"
                }`}
              >
                <Link href="/settings" onClick={handleNavClick} className="flex items-center">
                  <div className={`p-1.5 rounded-md ${isActive("/settings") ? "bg-primary/10" : ""}`}>
                    <Settings
                      className={`h-5 w-5 ${isActive("/settings") ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  {!isCollapsed && <span className="ml-2">Pengaturan</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator />
            {loading ? (
              <SidebarMenuItem>
                <SidebarMenuButton className="cursor-wait">
                  <div className="flex items-center w-full">
                    <Skeleton className="h-8 w-8 rounded-full mr-2" />
                    {!isCollapsed && <Skeleton className="h-4 w-24" />}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : user ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/profile")}
                    className={`transition-all duration-200 ${
                      isActive("/profile") ? "bg-primary/10 text-primary font-medium shadow-sm" : "hover:bg-muted/50"
                    }`}
                  >
                    <Link href="/profile" onClick={handleNavClick}>
                      <div className="flex items-center w-full">
                        <Avatar className="h-8 w-8 mr-2 border-2 border-primary/20">
                          <AvatarImage src={user.photoURL || "/placeholder.svg?height=32&width=32"} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {userProfile?.displayName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                          <div className="flex-1 truncate">
                            <p className="font-medium text-sm truncate">
                              {userProfile?.businessName || userProfile?.displayName || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                  >
                    <div className="p-1.5 rounded-md">
                      <LogOut className="h-5 w-5 text-red-500" />
                    </div>
                    {!isCollapsed && <span className="ml-2 text-red-500">Keluar</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-primary/10 hover:bg-primary/20 transition-all duration-200">
                  <Link href="/login" onClick={handleNavClick} className="flex items-center">
                    <div className="p-1.5 rounded-md">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    {!isCollapsed && <span className="ml-2 text-primary font-medium">Login</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </motion.div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
