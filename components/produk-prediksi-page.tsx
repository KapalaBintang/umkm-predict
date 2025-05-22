"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, ArrowUp, ArrowDown, ArrowRight, ChevronRight, Loader2 } from "lucide-react"
import { MainLayout } from "./main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Kategori produk
const kategoriOptions = ["Semua", "Sembako", "Sayuran", "Daging", "Buah", "Lainnya"]

// Ícones para categorias
const getIconForCategory = (kategori: string) => {
  switch (kategori.toLowerCase()) {
    case "sayuran":
      return (
        <div className="rounded-full bg-green-100 p-2">
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
            className="h-5 w-5 text-green-600"
          >
            <path d="M2 22s4-10 7-10" />
            <path d="M16 22s-4-10-7-10" />
            <path d="M7 12a7 7 0 1 1 10 0" />
          </svg>
        </div>
      )
    case "sembako":
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
            <path d="M6 12a6 6 0 0 0 6 6c6 0 6-6 12-6a6 6 0 0 0-6-6c-6 0-6 6-12 6Z" />
          </svg>
        </div>
      )
    case "daging":
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
            <path d="M15.5 2H12v10h7V4.5a2.5 2.5 0 0 0-2.5-2.5Z" />
            <path d="M5 5.5C5 4.1 6.1 3 7.5 3H12v10H7.5A2.5 2.5 0 0 1 5 10.5z" />
            <path d="M5 10.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8.5" />
          </svg>
        </div>
      )
    case "buah":
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
            <path d="M17.8 8.2c1-1 2.5-1 3.4 0 .6.6.8 1.4.6 2.2-.5 2-2.3 3.7-4.3 4.3-.8.2-1.6 0-2.2-.6-.9-1-.9-2.5 0-3.4.4-.5 1-.7 1.6-.7.5 0 1 .2 1.4.6l.5.5" />
            <path d="M18 16a4 4 0 0 1-4 4 7 7 0 0 1-7-7c0-1.6.8-3 2-4" />
            <path d="M9 12a4 4 0 0 1-4-4 7 7 0 0 1 7-7c1.6 0 3 .8 4 2" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="rounded-full bg-blue-100 p-2">
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
            className="h-5 w-5 text-blue-600"
          >
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </svg>
        </div>
      )
  }
}

// Cache global para dados de prediksi (persiste entre navegações)
let globalProdukCache: {
  data: Produto[],
  timestamp: number,
  lastAnalysisTimestamp: number
} | null = null;

// Tempo de expiração do cache (10 minutos)
const CACHE_EXPIRY_MS = 10 * 60 * 1000;

export function ProdukPrediksiPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKategori, setSelectedKategori] = useState("Semua")
  const [produkData, setProdukData] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Função para processar análises sequencialmente com delay
  const processAnalysisWithDelay = async (dataToProcess: Produto[], updateLoadingState: boolean = true) => {
    // Limitar o número de itens para análise (priorizar os primeiros 8)
    const itemsToProcess = dataToProcess.slice(0, 8);
    const totalItems = itemsToProcess.length;
    
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i]
      try {
        // Atualizar progresso
        setAnalysisProgress(Math.round(((i + 1) / totalItems) * 100));
        
        // Adicionar delay entre as requisições
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // Preparar dados de timeline para análise
        const timeline = item.trendData?.timeline_data?.map(td => ({
          time: td.timestamp,
          value: td.values[0]?.extracted_value || 0
        })) || [];
        
        // Pular se não houver dados suficientes
        if (timeline.length < 2) {
          continue;
        }
        
        const response = await fetch('/api/produk-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword: item.nama.toLowerCase(),
            timeline: timeline,
            kategori: item.kategori,
            konsumsiMingguan: item.konsumsiMingguan
          }),
        })
        
        if (!response.ok) {
          // Se receber erro 429, adiciona um delay maior e tenta novamente
          if (response.status === 429) {
            console.log(`Rate limit hit for ${item.nama}, waiting longer...`)
            await new Promise(resolve => setTimeout(resolve, 5000))
            i-- // Tentar o mesmo item novamente
            continue
          }
          throw new Error(`HTTP error ${response.status}`)
        }
        
        const analysisData = await response.json()
        
        // Atualizar o item com os dados da análise
        if (analysisData) {
          const index = dataToProcess.findIndex(p => p.id === item.id);
          if (index !== -1) {
            dataToProcess[index] = {
              ...dataToProcess[index],
              status: analysisData.status || "stabil",
              perubahan: Math.abs(analysisData.perubahan) || 0,
              prediksi: analysisData.prediksi || "",
              rekomendasi: analysisData.rekomendasi || "",
              faktorPengaruh: analysisData.faktor || [],
              hargaEstimasi: Math.round(10000 + (Math.random() * 20000)) // Simulação de preço
            }
          }
          
          // Atualizar o estado a cada item processado
          setProdukData([...dataToProcess])
          
          // Atualizar o cache global
          if (globalProdukCache) {
            globalProdukCache.data = [...dataToProcess];
            globalProdukCache.lastAnalysisTimestamp = Date.now();
          }
        }
      } catch (error) {
        console.error(`Error analyzing ${item.nama}:`, error)
      }
    }
    
    // Finalizar o loading apenas se necessário
    if (updateLoadingState) {
      setLoading(false);
    }
    
    // Resetar progresso
    setAnalysisProgress(0);
    
    return dataToProcess;
  }

  // Mengambil data produk dari Firebase e usar cache quando disponível
  useEffect(() => {
    const fetchProdukData = async () => {
      // Verificar se temos dados em cache e se ainda são válidos
      const now = Date.now();
      if (globalProdukCache && (now - globalProdukCache.timestamp) < CACHE_EXPIRY_MS) {
        console.log("Using cached produk data");
        setProdukData(globalProdukCache.data);
        setLoading(false);
        
        // Se a última análise foi há mais de 5 minutos, executar análise em background
        if ((now - globalProdukCache.lastAnalysisTimestamp) > 5 * 60 * 1000) {
          console.log("Running background analysis refresh");
          setIsAnalysisRunning(true);
          processAnalysisWithDelay(globalProdukCache.data, false).finally(() => {
            setIsAnalysisRunning(false);
          });
        }
        return;
      }
      
      setLoading(true);
      try {
        const produkRef = collection(db, "produk");
        const q = query(produkRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const data: Produto[] = [];
        
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          
          // Criar objeto do produto
          const produto: Produto = {
            id: doc.id,
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
          
          data.push(produto)
        })
        
        // Atualizar o estado com dados básicos primeiro
        setProdukData([...data])
        
        // Atualizar o cache global com dados básicos
        globalProdukCache = {
          data: [...data],
          timestamp: Date.now(),
          lastAnalysisTimestamp: 0 // Será atualizado após a análise
        };
        
        // Iniciar o processamento em background
        setIsAnalysisRunning(true);
        processAnalysisWithDelay(data, true).finally(() => {
          setIsAnalysisRunning(false);
        });
      } catch (error) {
        console.error("Error fetching produk data:", error)
        toast({
          title: "Gagal mengambil data",
          description: "Terjadi kesalahan saat mengambil data produk",
          variant: "destructive",
        })
        setLoading(false)
      }
    }
    
    fetchProdukData()
  }, [])
  
  // Filter data berdasarkan pencarian dan kategori
  const filteredData = produkData.filter((item) => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesKategori = selectedKategori === "Semua" || item.kategori === selectedKategori
    return matchesSearch && matchesKategori
  })

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prediksi Produk Saya</h1>
          <p className="text-muted-foreground">
            Lihat prediksi tren dan harga untuk produk yang Anda input berdasarkan analisis AI.
          </p>
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Kartu Produk</TabsTrigger>
            <TabsTrigger value="table">Tabel Produk</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            {/* Search dan Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari produk..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <span className="mr-1">Kategori:</span>
                      <span className="font-medium">{selectedKategori}</span>
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {kategoriOptions.map((kategori) => (
                      <DropdownMenuCheckboxItem
                        key={kategori}
                        checked={selectedKategori === kategori}
                        onCheckedChange={() => setSelectedKategori(kategori)}
                      >
                        {kategori}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Indicador de análise em background */}
            {isAnalysisRunning && !loading && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <p className="text-sm text-blue-700">
                    Memperbarui analisis data ({analysisProgress}%)...
                  </p>
                </div>
                <div className="mt-1 w-full bg-blue-100 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* List Produk */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Memuat data produk...</p>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">Tidak ada produk yang sesuai dengan pencarian Anda.</p>
                </div>
              ) : (
                filteredData.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardDescription>{item.kategori}</CardDescription>
                          <CardTitle className="text-lg">{item.nama}</CardTitle>
                        </div>
                        <div className="mt-1">{getIconForCategory(item.kategori)}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        Rp {item.hargaEstimasi?.toLocaleString("id-ID") || "N/A"}
                        <span className="text-sm font-normal text-muted-foreground ml-1">/{item.satuan}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <Badge
                          variant={item.status === "naik" ? "destructive" : item.status === "turun" ? "default" : "outline"}
                          className="flex items-center"
                        >
                          {item.status === "naik" ? (
                            <ArrowUp className="mr-1 h-3 w-3" />
                          ) : item.status === "turun" ? (
                            <ArrowDown className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowRight className="mr-1 h-3 w-3" />
                          )}
                          {item.status === "naik"
                            ? `Naik ${item.perubahan}%`
                            : item.status === "turun"
                              ? `Turun ${item.perubahan}%`
                              : "Stabil"}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">tren popularitas</span>
                      </div>
                      <div className="mt-3 text-sm">
                        <p className="text-muted-foreground line-clamp-2">
                          {item.prediksi || "Analisis sedang diproses..."}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/produk-prediksi/${item.id}`}>
                          Lihat Detail
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            {/* Search dan Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari produk..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <span className="mr-1">Kategori:</span>
                      <span className="font-medium">{selectedKategori}</span>
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {kategoriOptions.map((kategori) => (
                      <DropdownMenuCheckboxItem
                        key={kategori}
                        checked={selectedKategori === kategori}
                        onCheckedChange={() => setSelectedKategori(kategori)}
                      >
                        {kategori}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Tabel Produk */}
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium">Produk</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Kategori</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Harga Est.</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Tren</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Konsumsi</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center">
                          <div className="flex justify-center items-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                            <span>Memuat data produk...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          Tidak ada produk yang sesuai dengan pencarian Anda.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">{item.nama}</td>
                          <td className="p-4 align-middle">{item.kategori}</td>
                          <td className="p-4 align-middle">Rp {item.hargaEstimasi?.toLocaleString("id-ID") || "N/A"}/{item.satuan}</td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant={item.status === "naik" ? "destructive" : item.status === "turun" ? "default" : "outline"}
                              className="flex items-center w-fit"
                            >
                              {item.status === "naik" ? (
                                <ArrowUp className="mr-1 h-3 w-3" />
                              ) : item.status === "turun" ? (
                                <ArrowDown className="mr-1 h-3 w-3" />
                              ) : (
                                <ArrowRight className="mr-1 h-3 w-3" />
                              )}
                              {item.status === "naik"
                                ? `Naik ${item.perubahan}%`
                                : item.status === "turun"
                                  ? `Turun ${item.perubahan}%`
                                  : "Stabil"}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">{item.konsumsiMingguan} {item.satuan}/minggu</td>
                          <td className="p-4 align-middle text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/produk-prediksi/${item.id}`}>
                                Detail
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Informasi Tambahan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Prediksi Produk</CardTitle>
            <CardDescription>Prediksi tren dan harga diperbarui berdasarkan data popularitas terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-red-100 p-1.5">
                  <ArrowUp className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Popularitas Naik</p>
                  <p className="text-muted-foreground">
                    Produk ini diprediksi akan semakin populer. Pertimbangkan untuk meningkatkan stok dan menyesuaikan harga.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-green-100 p-1.5">
                  <ArrowDown className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Popularitas Turun</p>
                  <p className="text-muted-foreground">
                    Produk ini diprediksi akan menurun popularitasnya. Pertimbangkan untuk mengurangi stok atau mencari alternatif.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-gray-100 p-1.5">
                  <ArrowRight className="h-3 w-3 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Popularitas Stabil</p>
                  <p className="text-muted-foreground">
                    Produk ini diprediksi akan tetap stabil popularitasnya. Anda dapat mempertahankan strategi bisnis saat ini.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
