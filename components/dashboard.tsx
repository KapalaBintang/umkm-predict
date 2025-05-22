"use client"

import { useState, useEffect } from "react"
import { AreaChart, BarChart, Calendar, Info, LineChart, Loader2, Package, ShoppingBag, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceChart } from "./price-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { MainLayout } from "./main-layout"
import { GoogleTrendsService } from "@/lib/services/googleTrendsService"
import { onAuthStateChanged } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { useUserSession } from "@/hooks/use-user-session"

interface Produk {
  id: string
  nama: string
  kategori: string
  konsumsiMingguan: number
  satuan: string
  popularitas?: number
  trendData?: any
  userId?: string
}



export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [userProducts, setUserProducts] = useState<any[]>([])
  const [rekomendasiAI, setRekomendasiAI] = useState<any[]>([])
  const [prediksiRingkasan, setPrediksiRingkasan] = useState<any[]>([])
  const [trenData, setTrenData] = useState<any[]>([])
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)
  const [trendDataLoaded, setTrendDataLoaded] = useState(false)
 
  const userSession = useUserSession()

const loadTrendData = async (produkItems: Produk[]) => {
    return GoogleTrendsService.loadTrendData(produkItems, setIsLoading, trendDataLoaded, setUserProducts, setTrendDataLoaded, toast, currentUser)
  }


  useEffect(() => {
    if (userSession) {
      setCurrentUser(userSession.uid)
    }
  }, [userSession])
  
  // Fetch recommendation data when component mounts
  useEffect(() => {
    fetchRecommendation()
  }, [])


  // Fungsi untuk mengambil data rekomendasi langsung dari Gemini
  const fetchRecommendation = async () => {
    try {
      setIsLoadingRecommendation(true);
      
      // Menggunakan Gemini client untuk mendapatkan rekomendasi
      const response = await fetch('/api/dashboard-recommendation')
      const data = await response.json()
      console.log('Recommendation data from Gemini:', data);
      
      // Update state dengan data dari Gemini
      if (data) {
        setPrediksiRingkasan(data.prediksiRingkasan || []);
        setRekomendasiAI(data.rekomendasiAI || []);
        setTrenData(data.trenData || []);
      }
    } catch (error) {
      console.error('Error fetching recommendation data from Gemini:', error);
      toast({
        title: "Gagal memuat rekomendasi",
        description: "Terjadi kesalahan saat memuat data rekomendasi",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // Mengambil data produk user dari Firestore
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!currentUser) {
        setUserProducts([])
        return;
      }
      
      setIsLoading(true);
      try {
        // Ambil data produk dari Firestore berdasarkan user ID
        const userProducts = await GoogleTrendsService.getUserProducts(currentUser);
        console.log("userProducts", userProducts)
        setUserProducts(userProducts);
        
        // Muat data trend untuk produk-produk tersebut
        if (userProducts.length > 0) {
          loadTrendData(userProducts);
        }
      } catch (error) {
        console.error('Error fetching user products:', error);
        toast({
          title: "Gagal memuat data produk",
          description: "Terjadi kesalahan saat memuat daftar bahan Anda",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProducts();
  }, [currentUser]);

 
  return (
    <MainLayout>
    {isLoadingRecommendation ? (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ) : (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Pantau prediksi harga bahan pokok dan dapatkan rekomendasi untuk bisnis kuliner Anda.
          </p>
        </div>

        {/* Ringkasan Prediksi Harga */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))
            : prediksiRingkasan.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardDescription>Prediksi Harga</CardDescription>
                    <CardTitle className="text-lg">{item.nama}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Rp {item.hargaSekarang.toLocaleString("id-ID")}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/{item.satuan}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant={
                          item.status === "naik" ? "destructive" : item.status === "turun" ? "default" : "outline"
                        }
                      >
                        {item.status === "naik"
                          ? `↑ Naik ${item.perubahan}%`
                          : item.status === "turun"
                            ? `↓ Turun ${item.perubahan}%`
                            : "→ Stabil"}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">dari minggu lalu</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Rekomendasi AI dan Grafik */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Rekomendasi AI */}
          <Card className="md:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rekomendasi AI</CardTitle>
                  <CardDescription>Insight untuk keputusan bisnis Anda</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Powered by Gemini
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {rekomendasiAI.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <Badge
                          variant="outline"
                          className={
                            item.prioritas === "tinggi"
                              ? "bg-red-50 text-red-700 border-red-200 mr-2"
                              : "bg-blue-50 text-blue-700 border-blue-200 mr-2"
                          }
                        >
                          {item.prioritas === "tinggi" ? "Prioritas Tinggi" : "Info"}
                        </Badge>
                        {item.judul}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.pesan}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Info className="mr-2 h-4 w-4" />
                Lihat Semua Rekomendasi
              </Button>
            </CardFooter>
          </Card>

          {/* Grafik Tren Harga */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Tren Harga Bahan Pokok</CardTitle>
              <CardDescription>Perbandingan harga 6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                  <Skeleton className="h-[250px] w-[90%]" />
                </div>
              ) : (
                <Tabs defaultValue="area">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="area" className="text-xs">
                        <AreaChart className="h-3.5 w-3.5 mr-1" />
                        Area
                      </TabsTrigger>
                      <TabsTrigger value="bar" className="text-xs">
                        <BarChart className="h-3.5 w-3.5 mr-1" />
                        Bar
                      </TabsTrigger>
                      <TabsTrigger value="line" className="text-xs">
                        <LineChart className="h-3.5 w-3.5 mr-1" />
                        Line
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="area" className="mt-0">
                    <div className="h-[300px]">
                      <PriceChart data={trenData} type="area" />
                    </div>
                  </TabsContent>
                  <TabsContent value="bar" className="mt-0">
                    <div className="h-[300px]">
                      <PriceChart data={trenData} type="bar" />
                    </div>
                  </TabsContent>
                  <TabsContent value="line" className="mt-0">
                    <div className="h-[300px]">
                      <PriceChart data={trenData} type="line" />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Lihat Detail Prediksi
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Bahan Pokok Terpantau */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bahan Pokok Terpantau</CardTitle>
                <CardDescription>Bahan pokok yang Anda pantau saat ini</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Package className="mr-2 h-4 w-4" />
                Kelola Bahan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : userProducts.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {userProducts.map((produk) => (
                  <div key={produk.id} className="flex items-center space-x-4 rounded-md border p-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        produk.popularitas && produk.popularitas > 50
                          ? "bg-green-100 text-green-700"
                          : produk.popularitas && produk.popularitas > 20
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {produk.popularitas && produk.popularitas > 50 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        produk.nama.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{produk.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {produk.konsumsiMingguan} {produk.satuan}/minggu
                      </p>
                      {produk.popularitas !== undefined && (
                        <div className="mt-1 flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${produk.popularitas > 50 ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${produk.popularitas}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{produk.popularitas}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : currentUser ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">Belum ada bahan yang dipantau</h3>
                <p className="text-muted-foreground mb-4">Tambahkan bahan-bahan yang sering Anda gunakan untuk memantau harga dan popularitasnya</p>
                <Link href="/produk-saya">
                  <Button>
                    <Package className="mr-2 h-4 w-4" />
                    Tambah Bahan Sekarang
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">Silakan login terlebih dahulu</h3>
                <p className="text-muted-foreground mb-4">Login untuk melihat bahan-bahan yang Anda pantau</p>
                <Link href="/login">
                  <Button>
                    Login / Daftar
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Link href="/produk-saya" className="w-full">
              <Button variant="outline" className="w-full">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Lihat Semua Produk Saya
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )}
    </MainLayout>
  )
}
