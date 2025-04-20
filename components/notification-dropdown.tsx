"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { notificationService } from "@/lib/services/notification-service"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
}

export default function NotificationDropdown() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const fetchedNotifications = await notificationService.getUserNotifications(user.uid)
      setNotifications(fetchedNotifications)
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(
        notifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return

    try {
      await notificationService.markAllAsRead(user.uid)
      setNotifications(notifications.map(notification => ({ ...notification, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-7">
              Tandai semua dibaca
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map(notification => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-default ${!notification.read ? "bg-muted/50" : ""}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="flex justify-between w-full">
                <span className="font-medium">{notification.title}</span>
                {!notification.read && <Badge variant="outline">Baru</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <span className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: id })}
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-3 text-center text-muted-foreground">Tidak ada notifikasi</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="/notifications" className="w-full text-center text-sm text-primary">
            Lihat semua notifikasi
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}