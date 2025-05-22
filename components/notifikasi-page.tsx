"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "./main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowRight, ArrowUp, Bell, Check, ChevronDown, Filter, Search, Trash2, BellRing, Loader2, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { notificationService, Notifikasi, formatRelativeTime } from "@/lib/notification-service"
import { Timestamp } from "firebase/firestore"
import { useUserSession } from "@/hooks/use-user-session"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NotificationTest } from "@/components/notification-test"
import { NotificationScheduler } from "@/components/notification-scheduler"

// Estado para armazenar as notificações reais do Firebase

// Fungsi untuk mendapatkan ikon berdasarkan jenis bahan
export const getIconForItem = (iconName: string) => {
  switch (iconName) {
    case "egg":
      return (
        <div className="rounded-full bg-yellow-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-yellow-600"
          >
            <path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z" />
          </svg>
        </div>
      )
    case "chili":
      return (
        <div className="rounded-full bg-red-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-red-600"
          >
            <path d="M17.5 8.5c1 1 1.5 3.2 1.5 6.5 0 4.5-2 7-5 7s-5-2.5-5-7c0-3.3.5-5.5 1.5-6.5" />
            <path d="M10.5 8.5V4a1.5 1.5 0 1 1 3 0v4.5" />
          </svg>
        </div>
      )
    case "onion":
      return (
        <div className="rounded-full bg-purple-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-purple-600"
          >
            <path d="M12 5c-1.5 0-3 .5-3 2s1.5 2 3 2 3-.5 3-2-1.5-2-3-2z" />
            <path d="M12 9c-6 0-6 3-6 3v10h12V12c0 0 0-3-6-3z" />
          </svg>
        </div>
      )
    case "rice":
      return (
        <div className="rounded-full bg-amber-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-amber-600"
          >
            <path d="M9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22a13.96 13.96 0 0 0 4-1" />
            <path d="M15 9c.64.64 1.521.954 2.402 1.165A6 6 0 0 1 16 22a13.96 13.96 0 0 1-4-1" />
            <path d="M12 4c1.5 0 3.5-1 4.5-2 .5 1.5 2 2 3 2-.5 1.5-.5 4-3 4-1 0-1.5-.5-2.5-.5s-1.5.5-2.5.5c-2.5 0-2.5-2.5-3-4 1 0 2.5-.5 3-2 1 1 2.5 2 4.5 2z" />
          </svg>
        </div>
      )
    case "oil":
      return (
        <div className="rounded-full bg-amber-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-amber-600"
          >
            <path d="M14 13.5h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" />
            <path d="M14 13.5V6a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v7.5" />
            <path d="M4 11h16" />
          </svg>
        </div>
      )
    case "chicken":
      return (
        <div className="rounded-full bg-orange-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-orange-600"
          >
            <path d="M9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22a13.96 13.96 0 0 0 4-1" />
            <path d="M15 9c.64.64 1.521.954 2.402 1.165A6 6 0 0 1 16 22a13.96 13.96 0 0 1-4-1" />
            <path d="M12 4c1.5 0 3.5-1 4.5-2 .5 1.5 2 2 3 2-.5 1.5-.5 4-3 4-1 0-1.5-.5-2.5-.5s-1.5.5-2.5.5c-2.5 0-2.5-2.5-3-4 1 0 2.5-.5 3-2 1 1 2.5 2 4.5 2z" />
          </svg>
        </div>
      )
    case "sugar":
      return (
        <div className="rounded-full bg-gray-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gray-600"
          >
            <path d="M2.99 3h18.02a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2.99a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
            <path d="M7 9v12" />
            <path d="M12 9v12" />
            <path d="M17 9v12" />
            <path d="M2 9h20" />
          </svg>
        </div>
      )
    case "tomato":
      return (
        <div className="rounded-full bg-red-100 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-red-600"
          >
            <path d="M12 2a9.96 9.96 0 0 0-7.071 2.929A9.96 9.96 0 0 0 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10a9.96 9.96 0 0 0-2.929-7.071A9.96 9.96 0 0 0 12 2Z" />
            <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="rounded-full bg-blue-100 p-2">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
      )
  }
}

// Fungsi untuk mendapatkan ikon status
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "naik":
      return <ArrowUp className="h-4 w-4 text-red-600" />
    case "turun":
      return <ArrowDown className="h-4 w-4 text-green-600" />
    case "penting":
      return <Bell className="h-4 w-4 text-blue-600" />
    default:
      return <ArrowRight className="h-4 w-4 text-gray-600" />
  }
}

// Fungsi untuk mendapatkan teks status
const getStatusText = (status: string) => {
  switch (status) {
    case "naik":
      return "Harga Naik"
    case "turun":
      return "Harga Turun"
    case "penting":
      return "Penting"
    default:
      return "Stabil"
  }
}

export function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([])
  const [filteredNotifikasi, setFilteredNotifikasi] = useState<Notifikasi[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [kategoriFilter, setKategoriFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("semua");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<{total: number, unread: number}>({total: 0, unread: 0});
  const user = useUserSession()
  
  // Fungsi untuk memfilter notifikasi berdasarkan kriteria dan tab aktif
  const filterNotifikasi = (items: Notifikasi[], query: string, statusFilters: string[], kategoriFilters: string[], currentTab: string) => {
    console.log("Filter diterapkan:", { 
      itemsLength: items?.length || 0, 
      query, 
      statusFilters, 
      kategoriFilters, 
      currentTab 
    });
    
    // Validasi input lebih ketat
    if (!Array.isArray(items)) {
      console.error("Error: items bukan array", items);
      return [];
    }
    
    // Jika items kosong, langsung kembalikan array kosong
    if (items.length === 0) {
      console.log("Tidak ada notifikasi untuk difilter");
      return [];
    }
    
    // Log sampel data untuk debugging
    console.log("Sampel data notifikasi pertama:", items[0]);
    
    const filteredItems = items.filter((item) => {
      // Filter berdasarkan tab aktif
      if (currentTab === "belum-dibaca" && item.dibaca) return false;
      if (currentTab === "penting" && item.status !== "penting") return false;

      // Filter berdasarkan status
      if (statusFilters.length > 0 && !statusFilters.includes(item.status)) return false;
      
      // Filter berdasarkan kategori
      if (kategoriFilters.length > 0 && !kategoriFilters.includes(item.kategori)) return false;
      
      // Filter berdasarkan pencarian
      if (query && query.trim() !== "") {
        const queryText = query.toLowerCase().trim();
        return (
          (item.judul?.toLowerCase() || "").includes(queryText) ||
          (item.pesan?.toLowerCase() || "").includes(queryText)
        );
      }
      
      return true;
    });
    
    console.log("Hasil filter:", filteredItems.length, "dari", items.length, "notifikasi");
    return filteredItems;
  };
  
  // Fungsi untuk memperbarui favicon dengan badge notifikasi
  const updateFaviconBadge = (count: number) => {
    // Hanya jalankan di browser
    if (typeof document === 'undefined') return;
    
    // Jika tidak ada notifikasi yang belum dibaca, kembalikan favicon normal
    if (count === 0) {
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        (existingFavicon as HTMLLinkElement).href = '/favicon.ico';
      }
      return;
    }
    
    try {
      // Buat canvas untuk menggambar favicon dengan badge
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Buat image object untuk favicon
      const img = new Image();
      img.src = '/favicon.ico';
      
      img.onload = () => {
        // Gambar favicon
        ctx.drawImage(img, 0, 0, 32, 32);
        
        // Gambar badge
        ctx.beginPath();
        ctx.arc(24, 8, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444'; // Red color
        ctx.fill();
        
        // Tambahkan teks jumlah
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
        
        // Perbarui favicon
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
          (existingFavicon as HTMLLinkElement).href = canvas.toDataURL('image/png');
        } else {
          const favicon = document.createElement('link');
          favicon.rel = 'icon';
          favicon.href = canvas.toDataURL('image/png');
          document.head.appendChild(favicon);
        }
      };
    } catch (error) {
      console.error('Error updating favicon badge:', error);
    }
  };

  // Meminta izin notifikasi saat komponen dimuat
  // Fungsi untuk meminta izin notifikasi
  const requestNotificationPermission = async () => {
    try {
      await notificationService.requestPermission()
        
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  // useEffect(() => {
  //   console.log("Notifikasi awal:", notifikasi);
  //   const filtered = filterNotifikasi(notifikasi, "", [], [], "semua");
  //   console.log("Setelah filter manual:", filtered);
  //   setFilteredNotifikasi(filtered);
  // }, []);
  
  
  // Memuat notifikasi saat komponen dimount
  useEffect(() => {
    // Jika tidak ada user, jangan lakukan apa-apa
    if (!user || !user.uid) {
      setIsLoading(false);
      return;
    }
    
    console.log("Memuat notifikasi untuk user:", user.uid);
    // Set user ID di notification service
    notificationService.setUserId(user.uid);
    
    // Definisikan timeout untuk mencegah loading tak terbatas
    const timeoutId = setTimeout(() => {
      // Jika masih loading setelah 5 detik, hentikan loading
      setIsLoading(false);
      console.log('Timeout saat memuat notifikasi');
    }, 5000);
    
    // Fungsi untuk memuat notifikasi
    const loadNotifications = async () => {
      try {
        // Gunakan getNotifications untuk mendapatkan data awal
        const initialNotifications = await notificationService.getNotifications();
        console.log("Notifikasi awal dimuat:", initialNotifications);
        
        if (!initialNotifications || initialNotifications.length === 0) {
          console.log("Tidak ada notifikasi yang dimuat");
          setIsLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        // Hitung total dan jumlah yang belum dibaca
        const unreadCount = initialNotifications.filter(item => !item.dibaca).length;
        setNotificationCount({
          total: initialNotifications.length,
          unread: unreadCount
        });
        
        console.log("Memperbarui state notifikasi dengan:", initialNotifications.length, "item");
        // Update state notifikasi
        setNotifikasi(initialNotifications);
        
        // Filter notifikasi berdasarkan filter yang dipilih dan tab aktif
        const filtered = filterNotifikasi(initialNotifications, searchQuery, statusFilter, kategoriFilter, activeTab);
        console.log("filteredNotifikasi yang akan diset:", filtered?.length || 0, "item");
        setFilteredNotifikasi(filtered);
        
        setIsLoading(false);
        clearTimeout(timeoutId); // Bersihkan timeout jika berhasil mendapatkan data
        
        // Tampilkan badge notifikasi di favicon jika ada notifikasi yang belum dibaca
        updateFaviconBadge(unreadCount);
        
        // Setelah memuat data awal, berlangganan untuk pembaruan real-time
        subscribeToRealtimeUpdates();
      } catch (error) {
        console.error('Error saat memuat notifikasi:', error);
        setIsLoading(false);
        clearTimeout(timeoutId);
        
        // Jika gagal memuat dengan getNotifications, coba dengan subscription
        subscribeToRealtimeUpdates();
      }
    };
    
    // Fungsi untuk berlangganan pembaruan real-time
    const subscribeToRealtimeUpdates = () => {
      try {
        notificationService.subscribeToNotifications((updatedNotifikasi) => {
          console.log("Notifikasi real-time diterima:", updatedNotifikasi?.length || 0, "item");
          
          if (!updatedNotifikasi || updatedNotifikasi.length === 0) {
            console.log("Tidak ada notifikasi real-time untuk diproses");
            return;
          }
          
          // Hitung total dan jumlah yang belum dibaca
          const unreadCount = updatedNotifikasi.filter(item => !item.dibaca).length;
          setNotificationCount({
            total: updatedNotifikasi.length,
            unread: unreadCount
          });
          
          // Update state notifikasi
          setNotifikasi(updatedNotifikasi);
          
          // Filter notifikasi berdasarkan filter yang dipilih dan tab aktif
          const filtered = filterNotifikasi(updatedNotifikasi, searchQuery, statusFilter, kategoriFilter, activeTab);
          console.log("filteredNotifikasi yang akan diset dari realtime:", filtered?.length || 0, "item");
          setFilteredNotifikasi(filtered);
          
          setIsLoading(false);
          
          // Tampilkan badge notifikasi di favicon jika ada notifikasi yang belum dibaca
          updateFaviconBadge(unreadCount);
        });
      } catch (error) {
        console.error('Error saat berlangganan notifikasi real-time:', error);
      }
    };
    
    // Mulai proses dengan memuat data notifikasi
    loadNotifications();
    
    // Cleanup: berhenti berlangganan notifikasi saat komponen unmount
    return () => {
      console.log("Berhenti berlangganan notifikasi");
      notificationService.unsubscribeFromNotifications();
      clearTimeout(timeoutId); // Bersihkan timeout saat unmount
      // Reset favicon badge saat unmount
      updateFaviconBadge(0);
    };
  }, [user, searchQuery, statusFilter, kategoriFilter, activeTab])

  // Menandai notifikasi sebagai dibaca
  const handleMarkAsRead = async (id: string) => {
    try {
      // Perbarui UI terlebih dahulu untuk respons yang instan
      const updatedNotifikasi = notifikasi.map((item) => 
        item.id === id ? { ...item, dibaca: true } : item
      );
      
      // Hitung jumlah notifikasi yang belum dibaca
      const unreadCount = updatedNotifikasi.filter(item => !item.dibaca).length;
      setNotificationCount(prev => ({ ...prev, unread: unreadCount }));
      
      // Perbarui state notifikasi
      setNotifikasi(updatedNotifikasi);
      
      // Jika di tab Belum Dibaca, hapus notifikasi dari tampilan
      if (activeTab === "belum-dibaca") {
        setFilteredNotifikasi(prev => prev.filter(item => item.id !== id));
      } else {
        // Di tab lain, cukup tandai sebagai dibaca
        setFilteredNotifikasi(prev => 
          prev.map((item) => item.id === id ? { ...item, dibaca: true } : item)
        );
      }
      
      // Update favicon badge
      updateFaviconBadge(unreadCount);
      
      // Kirim permintaan ke server
      await notificationService.markAsRead(id);
      
      toast({
        description: "Notifikasi ditandai sebagai dibaca",
      });
    } catch (error) {
      // Jika terjadi error, kembalikan state ke kondisi semula
      console.error("Error marking notification as read:", error);
      
      // Kembalikan state notifikasi ke kondisi sebelumnya
      const revertedNotifikasi = notifikasi.map((item) => 
        item.id === id && item.dibaca ? { ...item, dibaca: false } : item
      );
      
      // Hitung ulang jumlah notifikasi yang belum dibaca
      const unreadCount = revertedNotifikasi.filter(item => !item.dibaca).length;
      setNotificationCount(prev => ({ ...prev, unread: unreadCount }));
      
      setNotifikasi(revertedNotifikasi);
      
      // Filter ulang berdasarkan tab aktif
      const filteredReverted = filterNotifikasi(revertedNotifikasi, searchQuery, statusFilter, kategoriFilter, activeTab);
      setFilteredNotifikasi(filteredReverted);
      
      // Update favicon badge
      updateFaviconBadge(unreadCount);
      
      toast({
        variant: "destructive",
        description: "Gagal menandai notifikasi sebagai dibaca",
      });
    }
  }

  // Menandai semua notifikasi sebagai dibaca
  const handleMarkAllAsRead = async () => {
    // Simpan state sebelumnya untuk rollback jika terjadi error
    const previousNotifikasi = [...notifikasi];
    
    try {
      // Perbarui UI terlebih dahulu untuk respons yang instan
      const updatedNotifikasi = notifikasi.map((item) => ({ ...item, dibaca: true }));
      
      // Perbarui state notifikasi
      setNotifikasi(updatedNotifikasi);
      setNotificationCount(prev => ({ ...prev, unread: 0 }));
      
      // Update favicon badge
      updateFaviconBadge(0);
      
      // Jika di tab Belum Dibaca, hapus semua notifikasi dari tampilan
      if (activeTab === "belum-dibaca") {
        setFilteredNotifikasi([]);
      } else {
        // Di tab lain, cukup tandai semua sebagai dibaca
        setFilteredNotifikasi(prev => prev.map((item) => ({ ...item, dibaca: true })));
      }
      
      // Kirim permintaan ke server
      await notificationService.markAllAsRead();
      
      toast({
        description: "Semua notifikasi ditandai sebagai dibaca",
      });
    } catch (error) {
      // Jika terjadi error, kembalikan state ke kondisi semula
      console.error("Error marking all notifications as read:", error);
      
      // Kembalikan state ke kondisi sebelumnya
      setNotifikasi(previousNotifikasi);
      
      // Hitung ulang jumlah notifikasi yang belum dibaca
      const unreadCount = previousNotifikasi.filter(item => !item.dibaca).length;
      setNotificationCount(prev => ({ ...prev, unread: unreadCount }));
      
      // Update favicon badge
      updateFaviconBadge(unreadCount);
      
      // Filter ulang berdasarkan tab aktif
      const filteredReverted = filterNotifikasi(previousNotifikasi, searchQuery, statusFilter, kategoriFilter, activeTab);
      setFilteredNotifikasi(filteredReverted);
      
      toast({
        variant: "destructive",
        description: "Gagal menandai semua notifikasi sebagai dibaca",
      });
    }
  }

  // Menghapus notifikasi
  const handleDeleteNotification = async (id: string) => {
    try {
      // Simpan notifikasi yang akan dihapus untuk rollback jika terjadi error
      const notificationToDelete = notifikasi.find(item => item.id === id);
      
      // Perbarui UI terlebih dahulu untuk respons yang instan
      const updatedNotifikasi = notifikasi.filter(item => item.id !== id);
      
      // Hitung jumlah notifikasi yang belum dibaca setelah penghapusan
      const unreadCount = updatedNotifikasi.filter(item => !item.dibaca).length;
      setNotificationCount({
        total: updatedNotifikasi.length,
        unread: unreadCount
      });
      
      // Update state
      setNotifikasi(updatedNotifikasi);
      
      // Perbarui juga filtered notifikasi secara langsung
      setFilteredNotifikasi(prev => prev.filter(item => item.id !== id));
      
      // Update favicon badge
      updateFaviconBadge(unreadCount);
      
      // Kirim permintaan ke server
      await notificationService.deleteNotification(id);
      
      toast({
        description: "Notifikasi dihapus",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      
      // Jika terjadi error, kembalikan notifikasi yang dihapus
      const notificationToRestore = notifikasi.find(item => item.id === id);
      
      if (notificationToRestore) {
        // Kembalikan notifikasi ke state
        const restoredNotifikasi = [...notifikasi, notificationToRestore];
        
        // Hitung ulang jumlah notifikasi yang belum dibaca
        const unreadCount = restoredNotifikasi.filter(item => !item.dibaca).length;
        setNotificationCount({
          total: restoredNotifikasi.length,
          unread: unreadCount
        });
        
        setNotifikasi(restoredNotifikasi);
        
        // Perbarui juga filtered notifikasi
        const filteredUpdated = filterNotifikasi(restoredNotifikasi, searchQuery, statusFilter, kategoriFilter, activeTab);
        setFilteredNotifikasi(filteredUpdated);
        
        // Update favicon badge
        updateFaviconBadge(unreadCount);
      }
      
      toast({
        variant: "destructive",
        description: "Gagal menghapus notifikasi",
      });
    }
  }

 console.log(filteredNotifikasi)
 console.log(notifikasi)

  return (
    <MainLayout>
      <div className="grid gap-6">
        {/* Tampilkan alert jika permisi notifikasi belum diberikan */}
        {Notification.permission === "denied" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Notifikasi Dinonaktifkan</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Anda telah menonaktifkan notifikasi untuk situs ini. Untuk menerima notifikasi, Anda perlu mengaktifkannya
                di pengaturan browser Anda.
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium">Cara mengaktifkan notifikasi:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Klik ikon gembok (🔒) di sebelah kiri URL di address bar</li>
                  <li>Cari bagian "Notifikasi" atau "Izin Situs"</li>
                  <li>Ubah dari "Blokir" menjadi "Izinkan"</li>
                  <li>Refresh halaman website ini</li>
                </ol>
              </div>
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh Halaman
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifikasi Harga</h1>
          <p className="text-muted-foreground">
            Pemberitahuan penting tentang perubahan harga dan rekomendasi untuk bisnis Anda.
          </p>
        </div>

        {/* Filter dan pencarian */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex w-full">
            <Input
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("naik")}
                  onCheckedChange={() =>
                    setStatusFilter((prev) =>
                      prev.includes("naik") ? prev.filter((item) => item !== "naik") : [...prev, "naik"]
                    )
                  }
                >
                  Harga Naik
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("turun")}
                  onCheckedChange={() =>
                    setStatusFilter((prev) =>
                      prev.includes("turun") ? prev.filter((item) => item !== "turun") : [...prev, "turun"]
                    )
                  }
                >
                  Harga Turun
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("penting")}
                  onCheckedChange={() =>
                    setStatusFilter((prev) =>
                      prev.includes("penting") ? prev.filter((item) => item !== "penting") : [...prev, "penting"]
                    )
                  }
                >
                  Penting
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Tandai Semua Dibaca
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="semua" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="semua" className="relative">
              Semua
              {notificationCount.total > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {notificationCount.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="belum-dibaca" className="relative">
              Belum Dibaca
              {notificationCount.unread > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-100 animate-pulse">
                  {notificationCount.unread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="penting">Penting</TabsTrigger>
          </TabsList>

          <TabsContent value="semua" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Semua Notifikasi</CardTitle>
                <CardDescription>
                  Menampilkan {filteredNotifikasi.length} dari {notifikasi.length} notifikasi
                  {notificationCount.unread > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/20">
                      {notificationCount.unread} belum dibaca
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
                    </div>
                  </div>
                ) : !user?.uid ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-amber-100 p-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">Login Diperlukan</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Anda perlu login untuk melihat notifikasi.
                    </p>
                  </div>
                ) : filteredNotifikasi.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">Tidak ada notifikasi</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Anda belum memiliki notifikasi apapun.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
  {filteredNotifikasi.map((item) => (
    <div
      key={item.id}
      className={`group relative overflow-hidden flex items-start gap-5 rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
        item.status === "naik" 
          ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50" 
          : item.status === "turun" 
            ? "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50" 
            : item.status === "penting" 
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" 
              : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800/50"
      } ${!item.dibaca ? "ring-2 ring-blue-200 dark:ring-blue-800/50 shadow-sm" : ""}`}
    >
      {/* Garis samping berdasarkan status */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        item.status === "naik" 
          ? "bg-red-500 dark:bg-red-400" 
          : item.status === "turun" 
            ? "bg-green-500 dark:bg-green-400" 
            : item.status === "penting" 
              ? "bg-blue-500 dark:bg-blue-400" 
              : "bg-gray-300 dark:bg-gray-500"
      }`}></div>
      
      {/* Ikon dengan efek hover */}
      <div className="transition-transform duration-200 group-hover:scale-110">
        {getIconForItem(item.icon)}
      </div>
      
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge
            variant={
              item.status === "naik"
                ? "destructive"
                : item.status === "turun"
                  ? "default"
                  : item.status === "penting"
                    ? "secondary"
                    : "outline"
            }
            className="flex items-center px-2 py-1 font-medium"
          >
            {getStatusIcon(item.status)}
            <span className="ml-1">{getStatusText(item.status)}</span>
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">{formatRelativeTime(item.waktu)}</span>
        </div>
        
        {/* Judul dengan efek hover */}
        <h4 className="text-lg font-medium mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {item.judul}
        </h4>
        
        {/* Pesan dengan padding dan line height yang lebih baik */}
        <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed mb-3">
          {item.pesan}
        </p>
        
        {/* Tombol aksi dengan efek hover yang lebih baik */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {item.targetUrl && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => window.location.href = item.targetUrl || "/"}
            >
              <ArrowRight className="mr-1 h-3.5 w-3.5" />
              Lihat Detail
            </Button>
          )}
          
          {!item.dibaca && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => handleMarkAsRead(item.id)}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Tandai Dibaca
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-auto"
            onClick={() => handleDeleteNotification(item.id)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      </div>
      
      {/* Indikator belum dibaca dengan animasi pulse */}
      {!item.dibaca && (
        <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
      )}
    </div>
  ))}
</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="belum-dibaca" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notifikasi Belum Dibaca</CardTitle>
                <CardDescription>
                  Menampilkan {filteredNotifikasi.length} notifikasi yang belum dibaca
                  {notificationCount.unread > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/20">
                      {Math.round((notificationCount.unread / notificationCount.total) * 100)}% dari total
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredNotifikasi.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <Check className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Tidak ada notifikasi yang belum dibaca</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Anda telah membaca semua notifikasi. Notifikasi baru akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredNotifikasi.map((item) => (
                      <div
                        key={item.id}
                        className={`group relative overflow-hidden flex items-start gap-5 rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
                          item.status === "naik" 
                            ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50" 
                            : item.status === "turun" 
                              ? "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50" 
                              : item.status === "penting" 
                                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" 
                                : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800/50"
                        } ring-2 ring-blue-200 dark:ring-blue-800/50 shadow-sm`}
                      >
                        {/* Garis samping berdasarkan status */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          item.status === "naik" 
                            ? "bg-red-500 dark:bg-red-400" 
                            : item.status === "turun" 
                              ? "bg-green-500 dark:bg-green-400" 
                              : item.status === "penting" 
                                ? "bg-blue-500 dark:bg-blue-400" 
                                : "bg-gray-300 dark:bg-gray-500"
                        }`}></div>
                        
                        {/* Ikon dengan efek hover */}
                        <div className="transition-transform duration-200 group-hover:scale-110">
                          {getIconForItem(item.icon)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              variant={
                                item.status === "naik"
                                  ? "destructive"
                                  : item.status === "turun"
                                    ? "default"
                                    : item.status === "penting"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="flex items-center px-2 py-1 font-medium"
                            >
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{getStatusText(item.status)}</span>
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">{formatRelativeTime(item.waktu)}</span>
                          </div>
                          
                          {/* Judul dengan efek hover */}
                          <h4 className="text-lg font-medium mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {item.judul}
                          </h4>
                          
                          {/* Pesan dengan padding dan line height yang lebih baik */}
                          <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed mb-3">
                            {item.pesan}
                          </p>
                          
                          {/* Tombol aksi dengan efek hover yang lebih baik */}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            {item.targetUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => window.location.href = item.targetUrl || "/"}
                              >
                                <ArrowRight className="mr-1 h-3.5 w-3.5" />
                                Lihat Detail
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={() => handleMarkAsRead(item.id)}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Tandai Dibaca
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-auto"
                              onClick={() => handleDeleteNotification(item.id)}
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                        
                        {/* Indikator belum dibaca dengan animasi pulse */}
                        <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="penting" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notifikasi Penting</CardTitle>
                <CardDescription>Menampilkan {filteredNotifikasi.length} notifikasi penting</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredNotifikasi.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <Bell className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Tidak ada notifikasi penting</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Anda belum memiliki notifikasi penting. Notifikasi penting akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredNotifikasi.map((item) => (
                      <div
                        key={item.id}
                        className={`group relative overflow-hidden flex items-start gap-5 rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
                          item.status === "naik" 
                            ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50" 
                            : item.status === "turun" 
                              ? "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50" 
                              : item.status === "penting" 
                                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" 
                                : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800/50"
                        } ${!item.dibaca ? "ring-2 ring-blue-200 dark:ring-blue-800/50 shadow-sm" : ""}`}
                      >
                        {/* Garis samping berdasarkan status */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          item.status === "naik" 
                            ? "bg-red-500 dark:bg-red-400" 
                            : item.status === "turun" 
                              ? "bg-green-500 dark:bg-green-400" 
                              : item.status === "penting" 
                                ? "bg-blue-500 dark:bg-blue-400" 
                                : "bg-gray-300 dark:bg-gray-500"
                        }`}></div>
                        
                        {/* Ikon dengan efek hover */}
                        <div className="transition-transform duration-200 group-hover:scale-110">
                          {getIconForItem(item.icon)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              variant={
                                item.status === "naik"
                                  ? "destructive"
                                  : item.status === "turun"
                                    ? "default"
                                    : item.status === "penting"
                                      ? "secondary"
                                      : "outline"
                              }
                              className="flex items-center px-2 py-1 font-medium"
                            >
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{getStatusText(item.status)}</span>
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">{formatRelativeTime(item.waktu)}</span>
                          </div>
                          
                          {/* Judul dengan efek hover */}
                          <h4 className="text-lg font-medium mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {item.judul}
                          </h4>
                          
                          {/* Pesan dengan padding dan line height yang lebih baik */}
                          <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed mb-3">
                            {item.pesan}
                          </p>
                          
                          {/* Tombol aksi dengan efek hover yang lebih baik */}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            {item.targetUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => window.location.href = item.targetUrl || "/"}
                              >
                                <ArrowRight className="mr-1 h-3.5 w-3.5" />
                                Lihat Detail
                              </Button>
                            )}
                            
                            {!item.dibaca && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => handleMarkAsRead(item.id)}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Tandai Dibaca
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-auto"
                              onClick={() => handleDeleteNotification(item.id)}
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                        
                        {/* Indikator belum dibaca dengan animasi pulse */}
                        {!item.dibaca && (
                          <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informasi tambahan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tentang Notifikasi Harga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-red-100 p-2">
                    <ArrowUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Harga Naik</p>
                    <p className="text-muted-foreground">
                      Notifikasi ini muncul ketika harga bahan pokok mengalami kenaikan signifikan. Anda mungkin perlu
                      menyesuaikan strategi pembelian atau harga jual produk Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-green-100 p-2">
                    <ArrowDown className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Harga Turun</p>
                    <p className="text-muted-foreground">
                      Notifikasi ini muncul ketika harga bahan pokok mengalami penurunan. Ini mungkin waktu yang tepat
                      untuk membeli dalam jumlah lebih banyak.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-blue-100 p-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Notifikasi Penting</p>
                    <p className="text-muted-foreground">
                      Notifikasi ini berisi informasi penting tentang waktu terbaik untuk membeli atau rekomendasi khusus
                      berdasarkan analisis harga.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tambahkan komponen test notifikasi */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi</CardTitle>
                <CardDescription>
                  Kelola preferensi notifikasi dan jadwalkan notifikasi otomatis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Anda dapat mengatur jadwal notifikasi otomatis dan preferensi kategori notifikasi yang ingin diterima.
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <Button asChild className="w-full">
                      <a href="/notifikasi/jadwal" className="flex items-center justify-center gap-2">
                        <BellRing className="h-4 w-4" />
                        Kelola Jadwal Notifikasi
                      </a>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full">
                      <a href="/notifikasi/test" className="flex items-center justify-center gap-2">
                        <Bell className="h-4 w-4" />
                        Uji Notifikasi
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <NotificationScheduler />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
