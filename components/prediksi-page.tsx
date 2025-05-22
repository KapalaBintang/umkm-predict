"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, ArrowUp, ArrowDown, ArrowRight, Egg, ChevronRight, Loader2 } from "lucide-react"
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

// Interface untuk data prediksi
interface BahanPokok {
  id: string
  nama: string
  kategori: string
  hargaSekarang: number
  hargaSebelumnya: number
  perubahan: number
  status: "naik" | "turun" | "stabil"
  satuan: string
  icon: string
  timeline?: {
    time: string
    value: number
  }[]
}

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

// Mapping icon berdasarkan keyword
const keywordToIcon: Record<string, string> = {
  "cabe": "chili",
  "bawang": "onion",
  "daging ayam": "chicken",
  "beras": "rice",
  "minyak goreng": "oil",
  "telur": "egg",
  "gula": "sugar",
  "tepung": "flour",
  "ikan": "fish",
  "susu": "milk",
  "mie instan": "noodle",
  "tempe": "tempe",
  "tahu": "tofu"
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

// Kategori bahan pokok
const kategoriOptions = ["Semua", "Sembako", "Sayuran", "Daging"]

// Fungsi untuk mendapatkan ikon berdasarkan jenis bahan
const getIconForItem = (iconName: string) => {
  switch (iconName) {
    case "egg":
      return <Egg className="h-8 w-8 text-yellow-500" />
    case "chili":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-red-500"
        >
          <path d="M17.5 8.5c1 1 1.5 3.2 1.5 6.5 0 4.5-2 7-5 7s-5-2.5-5-7c0-3.3.5-5.5 1.5-6.5" />
          <path d="M10.5 8.5V4a1.5 1.5 0 1 1 3 0v4.5" />
        </svg>
      )
    case "onion":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-purple-500"
        >
          <path d="M12 5c-1.5 0-3 .5-3 2s1.5 2 3 2 3-.5 3-2-1.5-2-3-2z" />
          <path d="M12 9c-6 0-6 3-6 3v10h12V12c0 0 0-3-6-3z" />
        </svg>
      )
    case "rice":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-amber-100"
        >
          <path d="M9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22a13.96 13.96 0 0 0 4-1" />
          <path d="M15 9c.64.64 1.521.954 2.402 1.165A6 6 0 0 1 16 22a13.96 13.96 0 0 1-4-1" />
          <path d="M12 4c1.5 0 3.5-1 4.5-2 .5 1.5 2 2 3 2-.5 1.5-.5 4-3 4-1 0-1.5-.5-2.5-.5s-1.5.5-2.5.5c-2.5 0-2.5-2.5-3-4 1 0 2.5-.5 3-2 1 1 2.5 2 4.5 2z" />
        </svg>
      )
    // ... outros ícones
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-gray-500"
        >
          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
        </svg>
      )
  }
}

// Cache global para dados de prediksi (persiste entre navegações)
let globalPrediksiCache: {
  data: BahanPokok[],
  timestamp: number,
  lastAnalysisTimestamp: number
} | null = null;

// Tempo de expiração do cache (10 minutos)
const CACHE_EXPIRY_MS = 10 * 60 * 1000;

export function PrediksiPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKategori, setSelectedKategori] = useState("Semua")
  const [bahanPokokData, setBahanPokokData] = useState<BahanPokok[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Função para processar análises sequencialmente com delay
  const processAnalysisWithDelay = async (dataToProcess: BahanPokok[], updateLoadingState: boolean = true) => {
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
        
        const response = await fetch('/api/prediksi-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword: item.nama.toLowerCase(),
            timeline: item.timeline,
            kategori: item.kategori
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
          dataToProcess[dataToProcess.indexOf(item)] = {
            ...item,
            status: analysisData.status || item.status,
            perubahan: Math.abs(analysisData.perubahan) || item.perubahan
          }
          
          // Atualizar o estado a cada item processado
          setBahanPokokData([...dataToProcess])
          
          // Atualizar o cache global
          if (globalPrediksiCache) {
            globalPrediksiCache.data = [...dataToProcess];
            globalPrediksiCache.lastAnalysisTimestamp = Date.now();
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

  // Mengambil data prediksi dari Firebase e usar cache quando disponível
  useEffect(() => {
    const fetchPrediksiData = async () => {
      // Verificar se temos dados em cache e se ainda são válidos
      const now = Date.now();
      if (globalPrediksiCache && (now - globalPrediksiCache.timestamp) < CACHE_EXPIRY_MS) {
        console.log("Using cached prediksi data");
        setBahanPokokData(globalPrediksiCache.data);
        setLoading(false);
        
        // Se a última análise foi há mais de 5 minutos, executar análise em background
        if ((now - globalPrediksiCache.lastAnalysisTimestamp) > 5 * 60 * 1000) {
          console.log("Running background analysis refresh");
          setIsAnalysisRunning(true);
          processAnalysisWithDelay(globalPrediksiCache.data, false).finally(() => {
            setIsAnalysisRunning(false);
          });
        }
        return;
      }
      
      setLoading(true);
      try {
        const prediksiRef = collection(db, "prediksi");
        const q = query(prediksiRef, orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const data: BahanPokok[] = [];
        
        // Primeiro, coletamos todos os documentos e preparamos os dados básicos
        querySnapshot.forEach((doc) => {
          const docData = doc.data()
          const keyword = docData.keyword
          const timeline = docData.timeline || []
          
          // Hanya proses jika ada data timeline
          if (timeline.length > 0) {
            // Inicialmente, usamos valores padrão para status e perubahan
            let status: "naik" | "turun" | "stabil" = "stabil"
            let perubahan = 0
            
            // Valores atuais e anteriores para cálculo de preço simulado
            const currentValue = timeline[timeline.length - 1].value
            const previousValue = timeline.length > 1 ? timeline[timeline.length - 2].value : currentValue
            
            // Konversi nilai trend menjadi harga (simulasi)
            const basePrice = 10000 + (Math.random() * 20000)
            const hargaSekarang = Math.round(basePrice + (currentValue * 200))
            const hargaSebelumnya = Math.round(basePrice + (previousValue * 200))
            
            // Format nama dengan kapitalisasi yang benar
            const formattedName = keyword.split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            
            // Criar objeto básico
            const bahanPokok: BahanPokok = {
              id: doc.id,
              nama: formattedName,
              kategori: keywordToKategori[keyword] || "Lainnya",
              hargaSekarang: hargaSekarang,
              hargaSebelumnya: hargaSebelumnya,
              perubahan: 0, // Será atualizado com a análise do Gemini
              status: "stabil", // Valor padrão, será atualizado
              satuan: keywordToSatuan[keyword] || "kg",
              icon: keywordToIcon[keyword] || "default",
              timeline: timeline
            }
            
            data.push(bahanPokok)
          }
        })
        
        // Atualizar o estado com dados básicos primeiro
        setBahanPokokData([...data])
        
        // Atualizar o cache global com dados básicos
        globalPrediksiCache = {
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
        console.error("Error fetching prediksi data:", error)
        toast({
          title: "Gagal mengambil data",
          description: "Terjadi kesalahan saat mengambil data prediksi",
          variant: "destructive",
        })
        setLoading(false)
      }
    }
    
    fetchPrediksiData()
  }, [])
  
  // Filter data berdasarkan pencarian dan kategori
  const filteredData = bahanPokokData.filter((item) => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesKategori = selectedKategori === "Semua" || item.kategori === selectedKategori
    return matchesSearch && matchesKategori
  })

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prediksi Harga Bahan Pokok</h1>
          <p className="text-muted-foreground">
            Lihat prediksi harga bahan pokok dan analisis tren untuk perencanaan bisnis Anda.
          </p>
        </div>

        {/* Search dan Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari bahan pokok..."
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

        {/* List Bahan Pokok */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Memuat data prediksi...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">Tidak ada bahan pokok yang sesuai dengan pencarian Anda.</p>
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
                    <div className="mt-1">{getIconForItem(item.icon)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {item.hargaSekarang.toLocaleString("id-ID")}
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
                    <span className="text-xs text-muted-foreground ml-2">dari minggu lalu</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/prediksi/${item.id}`}>
                      Lihat Detail
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Informasi Tambahan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Prediksi Harga</CardTitle>
            <CardDescription>Prediksi harga diperbarui setiap hari berdasarkan data pasar terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-red-100 p-1.5">
                  <ArrowUp className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Harga Naik</p>
                  <p className="text-muted-foreground">
                    Harga bahan pokok diprediksi akan naik dalam waktu dekat. Pertimbangkan untuk membeli sekarang.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-green-100 p-1.5">
                  <ArrowDown className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Harga Turun</p>
                  <p className="text-muted-foreground">
                    Harga bahan pokok diprediksi akan turun dalam waktu dekat. Pertimbangkan untuk menunda pembelian.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 rounded-full bg-gray-100 p-1.5">
                  <ArrowRight className="h-3 w-3 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Harga Stabil</p>
                  <p className="text-muted-foreground">
                    Harga bahan pokok diprediksi akan tetap stabil dalam waktu dekat. Anda dapat membeli sesuai
                    kebutuhan.
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
