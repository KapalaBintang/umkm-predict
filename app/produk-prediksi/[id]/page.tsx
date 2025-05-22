"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Loader2, ShoppingCart, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Interface para dados do produto
interface Produto {
  id: string
  nama: string
  kategori: string
  satuan: string
  konsumsiMingguan: number
  popularitas: number
  createdAt: string
  trendData?: {
    timeline_data?: {
      date: string
      timestamp: string
      values: {
        extracted_value: number
        query: string
        value: string
      }[]
    }[]
  }
  status?: "naik" | "turun" | "stabil"
  perubahan?: number
  prediksi?: string
  rekomendasi?: string
  faktorPengaruh?: string[]
  hargaEstimasi?: number
}

// Interface para dados de análise
interface GeminiAnalysis {
  status: "naik" | "turun" | "stabil"
  perubahan: number
  analisis: string
  prediksi: string
  rekomendasi: string
  faktor: string[]
  hargaEstimasi?: number
  trendFuture?: number[]
}

export default function ProdukDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [produk, setProduk] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState<GeminiAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  // Fungsi untuk mendapatkan analisis dari Gemini API com retry
  const fetchGeminiAnalysis = async (keyword: string, timeline: any[], kategori: string, konsumsiMingguan: number) => {
    setAnalysisLoading(true)
    
    // Configuração de retry
    const maxRetries = 3
    let retryCount = 0
    let success = false
    
    while (retryCount < maxRetries && !success) {
      try {
        // Se não for a primeira tentativa, espere antes de tentar novamente
        if (retryCount > 0) {
          const delayMs = Math.pow(2, retryCount) * 1000 // Exponential backoff: 2s, 4s, 8s
          console.log(`Retry ${retryCount}/${maxRetries} for ${keyword} after ${delayMs}ms delay`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
        
        const response = await fetch('/api/produk-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            keyword, 
            timeline, 
            kategori,
            konsumsiMingguan
          }),
        })

        if (!response.ok) {
          // Se for erro de rate limit, tente novamente
          if (response.status === 429) {
            console.log(`Rate limit hit for ${keyword}, will retry...`)
            retryCount++
            continue
          }
          throw new Error(`HTTP error ${response.status}`)
        }

        const data = await response.json()
        setAnalysisData(data)
        success = true
      } catch (error) {
        console.error(`Error fetching Gemini analysis (attempt ${retryCount + 1}/${maxRetries}):`, error)
        retryCount++
        
        // Se for a última tentativa, mostre o erro
        if (retryCount >= maxRetries) {
          toast({
            title: "Gagal mendapatkan analisis",
            description: "Terjadi kesalahan saat mengambil analisis dari Gemini AI",
            variant: "destructive",
          })
        }
      }
    }
    
    setAnalysisLoading(false)
  }

  useEffect(() => {
    const fetchProdukDetail = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        const produkRef = doc(db, "produk", params.id as string)
        const docSnap = await getDoc(produkRef)
        
        if (docSnap.exists()) {
          const docData = docSnap.data()
          
          // Criar objeto do produto
          const produkData: Produto = {
            id: docSnap.id,
            nama: docData.nama || "",
            kategori: docData.kategori || "Lainnya",
            satuan: docData.satuan || "kg",
            konsumsiMingguan: docData.konsumsiMingguan || 0,
            popularitas: docData.popularitas || 0,
            createdAt: docData.createdAt || "",
            trendData: docData.trendData || {},
            status: "stabil", // Valor padrão, será atualizado
            perubahan: 0, // Será atualizado com a análise
            hargaEstimasi: Math.round(10000 + (Math.random() * 20000)) // Simulação de preço
          }
          
          setProduk(produkData)
          
          // Preparar dados de timeline para análise
          const timeline = produkData.trendData?.timeline_data?.map(td => ({
            time: td.timestamp,
            value: td.values[0]?.extracted_value || 0
          })) || [];
          
          // Buscar análise apenas se houver dados suficientes
          if (timeline.length > 1) {
            fetchGeminiAnalysis(
              produkData.nama.toLowerCase(), 
              timeline, 
              produkData.kategori,
              produkData.konsumsiMingguan
            )
          }
        } else {
          toast({
            title: "Produk tidak ditemukan",
            description: "Produk yang Anda cari tidak ditemukan",
            variant: "destructive",
          })
          router.push("/produk-prediksi")
        }
      } catch (error) {
        console.error("Error fetching produk detail:", error)
        toast({
          title: "Gagal mengambil data",
          description: "Terjadi kesalahan saat mengambil detail produk",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProdukDetail()
  }, [params.id, router])

  // Preparar dados para o gráfico de tendência
  const prepareChartData = () => {
    if (!produk?.trendData?.timeline_data) return null
    
    const timelineData = produk.trendData.timeline_data
    const labels = timelineData.map(item => item.date)
    const values = timelineData.map(item => item.values[0]?.extracted_value || 0)
    
    // Adicionar previsão futura se disponível
    if (analysisData?.trendFuture) {
      // Adicionar 4 pontos de previsão
      const futureLabels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'].map(
        (label, i) => `Prediksi ${label}`
      )
      
      return {
        labels: [...labels.slice(-12), ...futureLabels],
        datasets: [
          {
            label: 'Popularitas Historis',
            data: values.slice(-12),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.3,
          },
          {
            label: 'Prediksi Popularitas',
            data: [...Array(12).fill(null), ...analysisData.trendFuture],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderDash: [5, 5],
            tension: 0.3,
          }
        ]
      }
    }
    
    // Sem previsão, mostrar apenas dados históricos
    return {
      labels: labels.slice(-12),
      datasets: [
        {
          label: 'Popularitas',
          data: values.slice(-12),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        }
      ]
    }
  }

  // Preparar dados para o gráfico de barras de consumo
  const prepareConsumptionData = () => {
    if (!produk) return null
    
    // Simulação de dados de consumo semanal
    const weeklyConsumption = produk.konsumsiMingguan
    const monthlyConsumption = weeklyConsumption * 4
    const yearlyConsumption = weeklyConsumption * 52
    
    return {
      labels: ['Mingguan', 'Bulanan', 'Tahunan'],
      datasets: [
        {
          label: `Konsumsi (${produk.satuan})`,
          data: [weeklyConsumption, monthlyConsumption, yearlyConsumption],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
          ],
          borderWidth: 1,
        }
      ]
    }
  }

  // Opções para o gráfico de linha
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tren Popularitas Produk',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      }
    }
  }

  // Opções para o gráfico de barras
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Konsumsi Produk',
      },
    },
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat detail produk...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!produk) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h2 className="text-xl font-semibold">Produk tidak ditemukan</h2>
          <p className="text-muted-foreground">Produk yang Anda cari tidak tersedia</p>
          <Button onClick={() => router.push("/produk-prediksi")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Produk
          </Button>
        </div>
      </MainLayout>
    )
  }

  const chartData = prepareChartData()
  const consumptionData = prepareConsumptionData()

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header dengan tombol kembali */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => router.push("/produk-prediksi")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>
          <div>
            <Badge
              variant={produk.status === "naik" ? "destructive" : produk.status === "turun" ? "default" : "outline"}
              className="flex items-center"
            >
              {produk.status === "naik" ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : produk.status === "turun" ? (
                <ArrowDown className="mr-1 h-3 w-3" />
              ) : (
                <ArrowRight className="mr-1 h-3 w-3" />
              )}
              {produk.status === "naik"
                ? `Naik ${analysisData?.perubahan || 0}%`
                : produk.status === "turun"
                  ? `Turun ${analysisData?.perubahan || 0}%`
                  : "Stabil"}
            </Badge>
          </div>
        </div>

        {/* Informasi Produk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">{produk.nama}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <span className="capitalize">{produk.kategori}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>Konsumsi: {produk.konsumsiMingguan} {produk.satuan}/minggu</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Harga Estimasi</p>
                    <p className="text-3xl font-bold">
                      Rp {produk.hargaEstimasi?.toLocaleString("id-ID") || "N/A"}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/{produk.satuan}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Konsumsi Mingguan: <strong>{produk.konsumsiMingguan} {produk.satuan}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Popularitas: <strong>{produk.popularitas || "Rendah"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Ditambahkan: <strong>{new Date(produk.createdAt).toLocaleDateString("id-ID")}</strong></span>
                    </div>
                  </div>
                </div>

                <Separator />

                {analysisLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Memuat analisis produk...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Analisis Tren</h3>
                      <p className="text-muted-foreground">
                        {analysisData?.analisis || "Analisis tren belum tersedia untuk produk ini."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Prediksi</h3>
                      <p className="text-muted-foreground">
                        {analysisData?.prediksi || "Prediksi belum tersedia untuk produk ini."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Rekomendasi</h3>
                      <p className="text-muted-foreground">
                        {analysisData?.rekomendasi || "Rekomendasi belum tersedia untuk produk ini."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Faktor Pengaruh</CardTitle>
              <CardDescription>Faktor-faktor yang mempengaruhi tren produk ini</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisData?.faktor ? (
                    analysisData.faktor.map((faktor, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <p className="text-sm">{faktor}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Faktor pengaruh belum tersedia untuk produk ini.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grafik dan Visualisasi */}
        <Card>
          <CardHeader>
            <CardTitle>Visualisasi Data</CardTitle>
            <CardDescription>Grafik tren popularitas dan konsumsi produk</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trend" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="trend">Tren Popularitas</TabsTrigger>
                <TabsTrigger value="consumption">Konsumsi</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trend" className="space-y-4">
                <div className="h-[300px] sm:h-[400px]">
                  {chartData ? (
                    <Line data={chartData} options={lineOptions} />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Data tren tidak tersedia untuk produk ini.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Interpretasi Grafik</h4>
                  <p className="text-sm text-muted-foreground">
                    Grafik ini menunjukkan tren popularitas produk berdasarkan data pencarian. 
                    Nilai 0-100 menunjukkan tingkat popularitas relatif, dengan 100 menjadi popularitas tertinggi.
                    {analysisData?.trendFuture && " Garis putus-putus menunjukkan prediksi popularitas untuk 4 minggu ke depan."}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="consumption" className="space-y-4">
                <div className="h-[300px] sm:h-[400px]">
                  {consumptionData ? (
                    <Bar data={consumptionData} options={barOptions} />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Data konsumsi tidak tersedia untuk produk ini.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Interpretasi Grafik</h4>
                  <p className="text-sm text-muted-foreground">
                    Grafik ini menunjukkan estimasi konsumsi produk berdasarkan data yang Anda input.
                    Nilai konsumsi bulanan dan tahunan dihitung berdasarkan konsumsi mingguan yang Anda tentukan.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tombol Kembali */}
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => router.push("/produk-prediksi")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Produk
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
