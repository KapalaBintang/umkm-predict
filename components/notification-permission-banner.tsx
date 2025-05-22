"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { notificationService } from "@/lib/notification-service"

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Cek apakah browser mendukung notifikasi
    if (!("Notification" in window)) {
      return
    }

    // Cek status izin notifikasi
    setPermissionState(Notification.permission)

    // Tampilkan banner jika izin belum diberikan dan belum ditolak
    if (Notification.permission === "default") {
      // Cek apakah pengguna sudah menutup banner sebelumnya
      const hasClosedBanner = localStorage.getItem("notificationBannerClosed")
      if (!hasClosedBanner) {
        setShowBanner(true)
      }
    }
  }, [])

  const requestPermission = async () => {
    try {
      const granted = await notificationService.requestPermission()
      setPermissionState(Notification.permission)
      
      if (granted) {
        setShowBanner(false)
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const closeBanner = () => {
    setShowBanner(false)
    // Simpan preferensi pengguna untuk tidak menampilkan banner lagi
    localStorage.setItem("notificationBannerClosed", "true")
  }

  if (!showBanner || permissionState !== "default") {
    return null
  }

  return (
    <Alert className="fixed bottom-4 right-4 w-96 z-50 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <AlertTitle className="text-lg font-semibold mb-2">
            Aktifkan Notifikasi
          </AlertTitle>
          <AlertDescription className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Dapatkan pemberitahuan penting tentang perubahan harga dan tren produk Anda secara real-time.
          </AlertDescription>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={requestPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Aktifkan Sekarang
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={closeBanner}
            >
              Nanti Saja
            </Button>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full -mt-1 -mr-1" 
          onClick={closeBanner}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Tutup</span>
        </Button>
      </div>
    </Alert>
  )
}
