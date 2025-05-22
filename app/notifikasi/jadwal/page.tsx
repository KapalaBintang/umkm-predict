"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationScheduler } from "@/components/notification-scheduler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, Bell, Calendar, AlertTriangle } from "lucide-react"

export default function JadwalNotifikasiPage() {
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Periksa apakah pengaturan notifikasi sudah dikonfigurasi
    const settings = localStorage.getItem('notificationSettings')
    setIsConfigured(!!settings)
  }, [])

  return (
    <MainLayout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jadwal Notifikasi</h1>
          <p className="text-muted-foreground">
            Atur kapan dan bagaimana Anda ingin menerima notifikasi penting
          </p>
        </div>

        {!isConfigured && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Notifikasi belum dikonfigurasi</AlertTitle>
            <AlertDescription>
              Anda belum mengatur jadwal notifikasi otomatis. Konfigurasikan pengaturan di bawah untuk mulai menerima notifikasi penting tentang perubahan harga dan tren produk.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="jadwal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jadwal" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Jadwal</span>
            </TabsTrigger>
            <TabsTrigger value="jenis" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Jenis Notifikasi</span>
            </TabsTrigger>
            <TabsTrigger value="riwayat" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Riwayat</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="jadwal" className="space-y-4">
            <NotificationScheduler />
            
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Pemeriksaan Otomatis</CardTitle>
                <CardDescription>
                  Sistem akan memeriksa perubahan harga dan tren produk secara otomatis berdasarkan jadwal berikut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Setiap Jam</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          Memeriksa perubahan harga yang signifikan dan mengirim notifikasi penting.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Setiap Hari (09:00)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          Menganalisis tren harga dan memberikan rekomendasi untuk pembelian bahan pokok.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Setiap Minggu (Senin, 08:00)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-purple-600 dark:text-purple-300">
                          Menganalisis tren produk dan memberikan rekomendasi strategis untuk bisnis Anda.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="jenis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Jenis Notifikasi</CardTitle>
                <CardDescription>
                  Berikut adalah jenis notifikasi yang dapat Anda terima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-600 dark:text-red-400">
                        <path d="m6 15 6-6 6 6"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Kenaikan Harga</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi saat harga bahan pokok naik melebihi ambang batas yang Anda tetapkan. Membantu Anda mengantisipasi perubahan harga dan menyesuaikan strategi bisnis.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600 dark:text-green-400">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Penurunan Harga</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi saat harga bahan pokok turun. Membantu Anda menemukan waktu terbaik untuk membeli stok dan mengoptimalkan biaya produksi.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600 dark:text-blue-400">
                        <path d="M12 16V8" />
                        <path d="M9 12h6" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Tren Produk</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi tentang perubahan tren popularitas produk Anda. Membantu Anda mengidentifikasi produk yang sedang naik daun atau yang perlu perhatian khusus.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-600 dark:text-amber-400">
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Stok Rendah</h3>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi saat stok produk Anda rendah dan perlu diisi ulang. Membantu Anda menghindari kehabisan stok dan kehilangan penjualan potensial.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="riwayat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Notifikasi Otomatis</CardTitle>
                <CardDescription>
                  Riwayat pemeriksaan dan pengiriman notifikasi otomatis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Hari Ini</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">09:00</span>
                          <span className="text-sm font-medium">Pemeriksaan Harian</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                          3 notifikasi dikirim
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">08:00</span>
                          <span className="text-sm font-medium">Pemeriksaan Jam</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                          1 notifikasi dikirim
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Kemarin</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">09:00</span>
                          <span className="text-sm font-medium">Pemeriksaan Harian</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                          2 notifikasi dikirim
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">15:00</span>
                          <span className="text-sm font-medium">Pemeriksaan Jam</span>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full dark:bg-slate-800 dark:text-slate-400">
                          Tidak ada perubahan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
