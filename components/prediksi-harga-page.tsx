"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  ChevronDown,
  Clock,
  Filter,
  Home,
  LineChart,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Data dummy untuk bahan pokok
const bahanPokokData = [
  {
    id: 1,
    nama: "Cabai Merah",
    kategori: "Bumbu",
    hargaSekarang: 45000,
    hargaSebelumnya: 40000,
    status: "naik",
    persentase: 12.5,
    prediksiHarga: 42000,
    prediksiStatus: "turun",
    prediksiPersentase: 6.7,
    saranAksi: "Tunda",
  },
  {
    id: 2,
    nama: "Cabai Rawit",
    kategori: "Bumbu",
    hargaSekarang: 52000,
    hargaSebelumnya: 48000,
    status: "naik",
    persentase: 8.3,
    prediksiHarga: 55000,
    prediksiStatus: "naik",
    prediksiPersentase: 5.8,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 3,
    nama: "Bawang Merah",
    kategori: "Bumbu",
    hargaSekarang: 34000,
    hargaSebelumnya: 36000,
    status: "turun",
    persentase: 5.6,
    prediksiHarga: 32000,
    prediksiStatus: "turun",
    prediksiPersentase: 5.9,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 4,
    nama: "Bawang Putih",
    kategori: "Bumbu",
    hargaSekarang: 38000,
    hargaSebelumnya: 38000,
    status: "stabil",
    persentase: 0,
    prediksiHarga: 40000,
    prediksiStatus: "naik",
    prediksiPersentase: 5.3,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 5,
    nama: "Telur Ayam",
    kategori: "Sembako",
    hargaSekarang: 28000,
    hargaSebelumnya: 30000,
    status: "turun",
    persentase: 6.7,
    prediksiHarga: 27000,
    prediksiStatus: "turun",
    prediksiPersentase: 3.6,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 6,
    nama: "Minyak Goreng",
    kategori: "Sembako",
    hargaSekarang: 18000,
    hargaSebelumnya: 18000,
    status: "stabil",
    persentase: 0,
    prediksiHarga: 19000,
    prediksiStatus: "naik",
    prediksiPersentase: 5.6,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 7,
    nama: "Gula Pasir",
    kategori: "Sembako",
    hargaSekarang: 16000,
    hargaSebelumnya: 15000,
    status: "naik",
    persentase: 6.7,
    prediksiHarga: 16000,
    prediksiStatus: "stabil",
    prediksiPersentase: 0,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 8,
    nama: "Beras",
    kategori: "Sembako",
    hargaSekarang: 12000,
    hargaSebelumnya: 12500,
    status: "turun",
    persentase: 4.0,
    prediksiHarga: 12000,
    prediksiStatus: "stabil",
    prediksiPersentase: 0,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 9,
    nama: "Kentang",
    kategori: "Sayur",
    hargaSekarang: 15000,
    hargaSebelumnya: 14000,
    status: "naik",
    persentase: 7.1,
    prediksiHarga: 16000,
    prediksiStatus: "naik",
    prediksiPersentase: 6.7,
    saranAksi: "Tunda",
  },
  {
    id: 10,
    nama: "Wortel",
    kategori: "Sayur",
    hargaSekarang: 12000,
    hargaSebelumnya: 13000,
    status: "turun",
    persentase: 7.7,
    prediksiHarga: 11000,
    prediksiStatus: "turun",
    prediksiPersentase: 8.3,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 11,
    nama: "Tomat",
    kategori: "Sayur",
    hargaSekarang: 10000,
    hargaSebelumnya: 12000,
    status: "turun",
    persentase: 16.7,
    prediksiHarga: 9000,
    prediksiStatus: "turun",
    prediksiPersentase: 10.0,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 12,
    nama: "Kol/Kubis",
    kategori: "Sayur",
    hargaSekarang: 8000,
    hargaSebelumnya: 7500,
    status: "naik",
    persentase: 6.7,
    prediksiHarga: 8500,
    prediksiStatus: "naik",
    prediksiPersentase: 6.3,
    saranAksi: "Tunda",
  },
  {
    id: 13,
    nama: "Tepung Terigu",
    kategori: "Sembako",
    hargaSekarang: 12000,
    hargaSebelumnya: 11500,
    status: "naik",
    persentase: 4.3,
    prediksiHarga: 12500,
    prediksiStatus: "naik",
    prediksiPersentase: 4.2,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 14,
    nama: "Daging Ayam",
    kategori: "Sembako",
    hargaSekarang: 35000,
    hargaSebelumnya: 34000,
    status: "naik",
    persentase: 2.9,
    prediksiHarga: 36000,
    prediksiStatus: "naik",
    prediksiPersentase: 2.9,
    saranAksi: "Beli Sekarang",
  },
  {
    id: 15,
    nama: "Daging Sapi",
    kategori: "Sembako",
    hargaSekarang: 120000,
    hargaSebelumnya: 120000,
    status: "stabil",
    persentase: 0,
    prediksiHarga: 125000,
    prediksiStatus: "naik",
    prediksiPersentase: 4.2,
    saranAksi: "Beli Sekarang",
  },
]

// Kategori bahan pokok
const kategoriOptions = ["Semua", "Bumbu", "Sembako", "Sayur"]

export default function PrediksiHargaPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKategori, setSelectedKategori] = useState("Semua")

  // Filter data berdasarkan pencarian dan kategori
  const filteredData = bahanPokokData.filter((item) => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesKategori = selectedKategori === "Semua" || item.kategori === selectedKategori
    return matchesSearch && matchesKategori
  })

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar untuk desktop */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">UMKM Predict</h2>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-4 py-2">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Menu Utama</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <a href="/">
                  <Home className="h-4 w-4" />
                  Beranda
                </a>
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-2" asChild>
                <a href="/prediksi">
                  <LineChart className="h-4 w-4" />
                  Prediksi Harga
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <ShoppingBag className="h-4 w-4" />
                Produk Saya
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Notifikasi
              </Button>
            </div>
          </div>
          <div className="px-4 py-2">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Analisis</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Clock className="h-4 w-4" />
                Riwayat Harga
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                Bahan Pokok
              </Button>
            </div>
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>UM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Warung Barokah</p>
              <p className="text-xs text-muted-foreground">UMKM Kuliner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar mobile */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">UMKM Predict</h2>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Menu Utama</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsSidebarOpen(false)}
                  asChild
                >
                  <a href="/">
                    <Home className="h-4 w-4" />
                    Beranda
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsSidebarOpen(false)}
                  asChild
                >
                  <a href="/prediksi">
                    <LineChart className="h-4 w-4" />
                    Prediksi Harga
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <ShoppingBag className="h-4 w-4" />
                  Produk Saya
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <Bell className="h-4 w-4" />
                  Notifikasi
                </Button>
              </div>
            </div>
            <div className="px-4 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Analisis</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <Clock className="h-4 w-4" />
                  Riwayat Harga
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <Package className="h-4 w-4" />
                  Bahan Pokok
                </Button>
              </div>
            </div>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>UM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Warung Barokah</p>
                <p className="text-xs text-muted-foreground">UMKM Kuliner</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Konten utama */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-2 sm:gap-4 border-b bg-muted/40 px-2 sm:px-4 lg:px-6">
          <div className="md:hidden">{/* SheetTrigger is inside the Sheet component above */}</div>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2 sm:left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari bahan pokok..."
                  className="w-full appearance-none bg-background pl-7 sm:pl-8 text-sm shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifikasi</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
            <User className="h-4 w-4" />
            <span className="sr-only">Profil</span>
          </Button>
        </header>

        {/* Konten halaman prediksi */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="grid gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Prediksi Harga Bahan Pokok</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Daftar lengkap bahan pokok dengan prediksi harga dan rekomendasi aksi
              </p>
            </div>

            {/* Filter dan pencarian */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
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
              <div className="flex items-center gap-2">
                <span className="text-sm hidden sm:inline">Filter:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between">
                      <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>{selectedKategori}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Kategori Bahan</DropdownMenuLabel>
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

            {/* Tabel prediksi harga */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Daftar Prediksi Harga</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Perkiraan harga untuk minggu depan (
                      {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID")})
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tabs defaultValue="semua" className="w-full sm:w-auto">
                      <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                        <TabsTrigger value="semua" className="text-xs">
                          Semua
                        </TabsTrigger>
                        <TabsTrigger value="naik" className="text-xs">
                          Naik
                        </TabsTrigger>
                        <TabsTrigger value="turun" className="text-xs">
                          Turun
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-2">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px] px-2 sm:px-4">Nama Bahan</TableHead>
                        <TableHead className="px-2 sm:px-4">Kategori</TableHead>
                        <TableHead className="px-2 sm:px-4">Harga Saat Ini</TableHead>
                        <TableHead className="px-2 sm:px-4">Status Prediksi</TableHead>
                        <TableHead className="px-2 sm:px-4">Prediksi Harga</TableHead>
                        <TableHead className="px-2 sm:px-4">Saran Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            Tidak ada data yang sesuai dengan pencarian
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium px-2 sm:px-4">{item.nama}</TableCell>
                            <TableCell className="px-2 sm:px-4">
                              <Badge variant="outline" className="bg-muted/50">
                                {item.kategori}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4">
                              Rp {item.hargaSekarang.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="px-2 sm:px-4">
                              <Badge
                                variant={
                                  item.prediksiStatus === "naik"
                                    ? "destructive"
                                    : item.prediksiStatus === "turun"
                                      ? "default"
                                      : "outline"
                                }
                                className="flex w-20 items-center justify-center text-xs"
                              >
                                {item.prediksiStatus === "naik" ? (
                                  <ArrowUp className="mr-1 h-3 w-3" />
                                ) : item.prediksiStatus === "turun" ? (
                                  <ArrowDown className="mr-1 h-3 w-3" />
                                ) : (
                                  <ArrowRight className="mr-1 h-3 w-3" />
                                )}
                                {item.prediksiStatus === "naik"
                                  ? "Naik"
                                  : item.prediksiStatus === "turun"
                                    ? "Turun"
                                    : "Stabil"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4">
                              <div className="font-medium">Rp {item.prediksiHarga.toLocaleString("id-ID")}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.prediksiStatus === "naik"
                                  ? `+${item.prediksiPersentase}%`
                                  : item.prediksiStatus === "turun"
                                    ? `-${item.prediksiPersentase}%`
                                    : "0%"}
                              </div>
                            </TableCell>
                            <TableCell className="px-2 sm:px-4">
                              <Badge
                                variant={item.saranAksi === "Beli Sekarang" ? "default" : "secondary"}
                                className="bg-opacity-80"
                              >
                                {item.saranAksi}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Informasi tambahan */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Prediksi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-red-500 p-1">
                        <ArrowUp className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Harga Naik</p>
                        <p className="text-muted-foreground">
                          Prediksi harga akan naik dalam 7 hari ke depan. Pertimbangkan untuk membeli sekarang jika
                          kenaikan signifikan.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-green-500 p-1">
                        <ArrowDown className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Harga Turun</p>
                        <p className="text-muted-foreground">
                          Prediksi harga akan turun dalam 7 hari ke depan. Pertimbangkan untuk menunda pembelian jika
                          penurunan signifikan.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-gray-200 p-1">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="font-medium">Harga Stabil</p>
                        <p className="text-muted-foreground">
                          Prediksi harga akan stabil dalam 7 hari ke depan. Anda dapat membeli sesuai kebutuhan.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saran Aksi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Badge variant="default" className="mt-0.5">
                        Beli Sekarang
                      </Badge>
                      <div>
                        <p className="text-muted-foreground">
                          Disarankan untuk membeli sekarang karena harga diprediksi akan naik atau stabil pada level
                          yang menguntungkan.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">
                        Tunda
                      </Badge>
                      <div>
                        <p className="text-muted-foreground">
                          Disarankan untuk menunda pembelian karena harga diprediksi akan turun dalam waktu dekat.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-md bg-muted p-3">
                      <p className="text-xs font-medium">Catatan:</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prediksi harga didasarkan pada analisis data historis, tren pasar, dan faktor musiman. Akurasi
                        prediksi dapat bervariasi tergantung pada kondisi pasar dan peristiwa tidak terduga.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
