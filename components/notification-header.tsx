"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationService, Notifikasi, formatRelativeTime } from "@/lib/notification-service"
import { useUserSession } from "@/hooks/use-user-session"
import { getIconForItem, getStatusIcon } from "@/components/notifikasi-page"
import { Badge } from "@/components/ui/badge"

export function NotificationHeader() {
  const [notifications, setNotifications] = useState<Notifikasi[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const user = useUserSession()

  // Berlangganan notifikasi saat user tersedia
  useEffect(() => {
    if (user?.uid) {
      // Set user ID di service
      notificationService.setUserId(user.uid)

      // Berlangganan notifikasi
      notificationService.subscribeToNotifications((notifs) => {
        // Ambil 5 notifikasi terbaru
        const latestNotifications = notifs.slice(0, 5)
        setNotifications(latestNotifications)
        
        // Hitung jumlah notifikasi yang belum dibaca
        const unread = notifs.filter(notif => !notif.dibaca).length
        setUnreadCount(unread)
      })

      // Minta izin notifikasi
      notificationService.requestPermission()

      // Berhenti berlangganan saat komponen unmount
      return () => {
        notificationService.unsubscribeFromNotifications()
      }
    }
  }, [user?.uid])

  // Menandai notifikasi sebagai dibaca
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      
      // Update state lokal
      setNotifications(prev => 
        prev.map(notif => notif.id === id ? { ...notif, dibaca: true } : notif)
      )
      
      // Update jumlah notifikasi yang belum dibaca
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full relative border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800"
        >
          <Bell className="h-4 w-4 text-slate-700 dark:text-slate-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifikasi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-400">
              {unreadCount} baru
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-auto scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => !item.dibaca && handleMarkAsRead(item.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIconForItem(item.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium truncate">{item.judul}</span>
                    <div className="flex items-center gap-1">
                      {!item.dibaca && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      )}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(item.waktu)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.pesan}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(item.status)}
                    <span className="text-xs">{item.kategori === "harga" ? "Harga" : item.kategori === "produk" ? "Produk" : "Sistem"}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center cursor-pointer">
          <Link href="/notifikasi" className="flex items-center">
            Lihat Semua Notifikasi
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
