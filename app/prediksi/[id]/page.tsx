"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, LineChart, ArrowUp, ArrowDown, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Registrasi komponen ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Mapping kategori berdasarkan keyword
const keywordToKategori: Record<string, string> = {
  "cabe": "Sayuran",
  "bawang": "Sayuran",
  "daging ayam": "Daging",
  "beras": "Sembako",
  "minyak goreng": "Sembako",
  "telur": "Sembako",
  "gula": "Sembako",
  "tepung": "Sembako",
  "ikan": "Daging",
  "susu": "Sembako",
  "mie instan": "Sembako",
  "tempe": "Sembako",
  "tahu": "Sembako"
}

// Mapping satuan berdasarkan keyword
const keywordToSatuan: Record<string, string> = {
  "cabe": "kg",
  "bawang": "kg",
  "daging ayam": "kg",
  "beras": "kg",
  "minyak goreng": "liter",
  "telur": "kg",
  "gula": "kg",
  "tepung": "kg",
  "ikan": "kg",
  "susu": "liter",
  "mie instan": "dus",
  "tempe": "potong",
  "tahu": "potong"
}

// Interface untuk data prediksi
interface PrediksiDetail {
  id: string
  keyword: string
  nama: string
  kategori: string
  hargaSekarang: number
  hargaSebelumnya: number
  perubahan: number
  status: "naik" | "turun" | "stabil"
  satuan: string
  timeline: {
    time: string
    value: number
  }[]
  createdAt?: any
  updatedAt?: any
}

// Interface untuk data analisis dari Gemini
interface GeminiAnalysis {
  status: "naik" | "turun" | "stabil"
  perubahan: number
  analisis: string
  prediksi: string
  rekomendasi: string
  faktor: string[]
}

export default function PrediksiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [prediksiData, setPrediksiData] = useState<PrediksiDetail | null>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [analysisData, setAnalysisData] = useState<GeminiAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  // Fungsi untuk mendapatkan analisis dari Gemini API com retry
  const fetchGeminiAnalysis = async (keyword: string, timeline: any[], kategori: string) => {
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
        
        const response = await fetch('/api/prediksi-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keyword, timeline, kategori }),
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
    const fetchPrediksiDetail = async () => {
      if (!params.id) return

      setLoading(true)
      try {
        const prediksiRef = doc(db, "prediksi", params.id as string)
        const docSnap = await getDoc(prediksiRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          const keyword = data.keyword
          const timeline = data.timeline || []

          // Hanya proses jika ada data timeline
          if (timeline.length > 0) {
            // Ambil nilai terbaru dan sebelumnya untuk harga simulasi
            const currentValue = timeline[timeline.length - 1].value
            const previousValue = timeline.length > 1 ? timeline[timeline.length - 2].value : currentValue

            // Untuk harga simulasi saja (akan diganti dengan analisis Gemini)
            let perubahan = 0
            let status: "naik" | "turun" | "stabil" = "stabil"

            if (previousValue > 0) {
              perubahan = Math.abs(((currentValue - previousValue) / previousValue) * 100)
              status = currentValue > previousValue ? "naik" : (currentValue < previousValue ? "turun" : "stabil")
            }

            // Konversi nilai trend menjadi harga (simulasi)
            // Nilai trend 0-100 dikonversi ke rentang harga yang masuk akal
            const basePrice = 10000 + (Math.random() * 20000)
            const hargaSekarang = Math.round(basePrice + (currentValue * 200))
            const hargaSebelumnya = Math.round(basePrice + (previousValue * 200))

            // Format nama dengan kapitalisasi yang benar
            const formattedName = keyword.split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')

            const prediksiDetail: PrediksiDetail = {
              id: docSnap.id,
              keyword: keyword,
              nama: formattedName,
              kategori: keywordToKategori[keyword] || "Lainnya",
              hargaSekarang: hargaSekarang,
              hargaSebelumnya: hargaSebelumnya,
              perubahan: parseFloat(perubahan.toFixed(1)),
              status: status,
              satuan: keywordToSatuan[keyword] || "kg",
              timeline: timeline,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            }

            setPrediksiData(prediksiDetail)

            // Siapkan data untuk chart
            const labels = timeline.map((item: any) => {
              const date = new Date(item.time)
              return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            })

            const values = timeline.map((item: any) => item.value)

            setChartData({
              labels,
              datasets: [
                {
                  label: 'Nilai Trend',
                  data: values,
                  borderColor: 'rgb(53, 162, 235)',
                  backgroundColor: 'rgba(53, 162, 235, 0.5)',
                  tension: 0.3
                }
              ]
            })
            
            // Ambil analisis dari Gemini
            fetchGeminiAnalysis(keyword, timeline, keywordToKategori[keyword] || "Lainnya")
          }
        } else {
          toast({
            title: "Data tidak ditemukan",
            description: "Data prediksi yang Anda cari tidak ditemukan",
            variant: "destructive",
          })
          router.push('/prediksi')
        }
      } catch (error) {
        console.error("Error fetching prediksi detail:", error)
        toast({
          title: "Gagal mengambil data",
          description: "Terjadi kesalahan saat mengambil detail prediksi",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPrediksiDetail()
  }, [params.id, router])

  // Format tanggal
  const formatDate = (date: any) => {
    if (!date) return "-"

    let dateObj: Date

    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'object' && 'seconds' in date) {
      // Konversi timestamp Firestore ke Date
      dateObj = new Date(date.seconds * 1000)
    } else {
      return "-"
    }

    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Opsi untuk chart
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tren Popularitas',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Popularitas (0-100)'
        }
      }
    }
  }

  // Fungsi untuk mendapatkan ikon dan warna berdasarkan status
  const getStatusInfo = (status: string) => {
    if (status === "naik") {
      return {
        color: "text-green-600",
        icon: <TrendingUp className="h-5 w-5 text-green-600" />
      }
    } else if (status === "turun") {
      return {
        color: "text-red-600",
        icon: <TrendingDown className="h-5 w-5 text-red-600" />
      }
    } else {
      return {
        color: "text-blue-600",
        icon: <LineChart className="h-5 w-5 text-blue-600" />
      }
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/prediksi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detail Prediksi</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Memuat data prediksi...</p>
            </div>
          </div>
        ) : prediksiData ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{prediksiData.nama}</CardTitle>
                    <CardDescription>
                      Kategori: {prediksiData.kategori} • Diperbarui: {formatDate(prediksiData.updatedAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={analysisData?.status === "naik" ? "destructive" : analysisData?.status === "turun" ? "default" : "outline"}
                    className="flex items-center text-sm px-3 py-1"
                  >
                    {analysisData?.status === "naik" ? (
                      <ArrowUp className="mr-1 h-3 w-3" />
                    ) : analysisData?.status === "turun" ? (
                      <ArrowDown className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowRight className="mr-1 h-3 w-3" />
                    )}
                    {analysisData?.status === "naik"
                      ? `Naik ${Math.abs(analysisData.perubahan).toFixed(1)}%`
                      : analysisData?.status === "turun"
                        ? `Turun ${Math.abs(analysisData.perubahan).toFixed(1)}%`
                        : "Stabil"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Informasi Harga</h3>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3">
                          <div className="text-sm text-muted-foreground">Harga Sekarang</div>
                          <div className="text-2xl font-bold mt-1">
                            Rp {prediksiData.hargaSekarang.toLocaleString("id-ID")}
                            <span className="text-sm font-normal text-muted-foreground ml-1">/{prediksiData.satuan}</span>
                          </div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-sm text-muted-foreground">Harga Sebelumnya</div>
                          <div className="text-2xl font-bold mt-1">
                            Rp {prediksiData.hargaSebelumnya.toLocaleString("id-ID")}
                            <span className="text-sm font-normal text-muted-foreground ml-1">/{prediksiData.satuan}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Analisis Tren</h3>
                      <div className="mt-2 rounded-lg border p-4">
                        {analysisLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : analysisData ? (
                          <>
                            <div className="flex items-center gap-2">
                              {getStatusInfo(analysisData.status).icon}
                              <span className={`font-medium ${getStatusInfo(analysisData.status).color}`}>
                                {analysisData.status === "naik" 
                                  ? `Tren Naik (${Math.abs(analysisData.perubahan).toFixed(1)}%)`
                                  : analysisData.status === "turun"
                                    ? `Tren Turun (${Math.abs(analysisData.perubahan).toFixed(1)}%)`
                                    : `Tren Stabil`
                                }
                              </span>
                            </div>
                            <p className="mt-2 text-sm">{analysisData.analisis}</p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Analisis tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Prediksi</h3>
                      <div className="mt-2 rounded-lg border p-4">
                        {analysisLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : analysisData ? (
                          <p className="text-sm">{analysisData.prediksi}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Prediksi tidak tersedia</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Rekomendasi</h3>
                      <div className="mt-2 rounded-lg border p-4">
                        {analysisLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : analysisData ? (
                          <p className="text-sm">{analysisData.rekomendasi}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Rekomendasi tidak tersedia</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Grafik Tren Popularitas</h3>
                    <div className="rounded-lg border p-4 h-[300px]">
                      {chartData ? (
                        <Line options={chartOptions} data={chartData} />
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <p className="text-muted-foreground">Tidak ada data grafik yang tersedia</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Data popularitas diambil dari Google Trends. Nilai 0-100 menunjukkan tingkat popularitas pencarian.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Tambahan</CardTitle>
                <CardDescription>
                  Informasi tambahan tentang prediksi harga dan tren {prediksiData.nama}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Faktor yang Mempengaruhi Harga</h3>
                  {analysisLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : analysisData?.faktor ? (
                    <ul className="mt-2 space-y-2 text-sm">
                      {analysisData.faktor.map((faktor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          </div>
                          <span>{faktor}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        </div>
                        <span>Musim dan cuaca dapat mempengaruhi ketersediaan dan harga {prediksiData.nama}.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        </div>
                        <span>Perubahan biaya transportasi dan distribusi dapat berdampak pada harga akhir.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        </div>
                        <span>Permintaan pasar yang tinggi saat momen tertentu dapat menyebabkan lonjakan harga.</span>
                      </li>
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Tips Penghematan</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-green-100 p-1">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      </div>
                      <span>Belilah {prediksiData.nama} dalam jumlah yang sesuai dengan kebutuhan untuk menghindari pemborosan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-green-100 p-1">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      </div>
                      <span>Pertimbangkan untuk membeli dari pasar tradisional atau langsung dari produsen untuk harga yang lebih baik.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-green-100 p-1">
                        <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      </div>
                      <span>Pantau promosi dan diskon di berbagai platform belanja online atau supermarket.</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Data prediksi tidak ditemukan</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
