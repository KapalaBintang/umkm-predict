"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Bell, ArrowUp, ArrowDown, Info, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { notificationService } from "@/lib/notification-service"
import { useUserSession } from "@/hooks/use-user-session"

export default function NotifikasiTestPage() {
  const [judul, setJudul] = useState("")
  const [pesan, setPesan] = useState("")
  const [status, setStatus] = useState<"naik" | "turun" | "stabil" | "penting">("penting")
  const [kategori, setKategori] = useState<"harga" | "produk" | "sistem" | "lainnya">("harga")
  const [icon, setIcon] = useState("bell")
  const [isLoading, setIsLoading] = useState(false)
  const user = useUserSession()

  const handleSendNotification = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Anda harus login untuk mengirim notifikasi",
      })
      return
    }

    if (!judul || !pesan) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Judul dan pesan notifikasi harus diisi",
      })
      return
    }

    setIsLoading(true)

    try {
      await notificationService.addNotification({
        judul,
        pesan,
        status,
        kategori,
        icon,
        userId: user.uid,
        dibaca: false
      })

      toast({
        title: "Berhasil",
        description: "Notifikasi berhasil dikirim",
      })

      // Reset form
      setJudul("")
      setPesan("")
      setStatus("penting")
      setKategori("harga")
      setIcon("bell")
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengirim notifikasi",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Uji Notifikasi</h1>
          <p className="text-muted-foreground">
            Kirim notifikasi uji untuk memeriksa sistem notifikasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buat Notifikasi Uji</CardTitle>
              <CardDescription>
                Isi formulir berikut untuk mengirim notifikasi uji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Notifikasi</Label>
                <Input
                  id="judul"
                  placeholder="Masukkan judul notifikasi"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pesan">Pesan Notifikasi</Label>
                <Textarea
                  id="pesan"
                  placeholder="Masukkan pesan notifikasi"
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: "naik" | "turun" | "stabil" | "penting") => setStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="naik">Naik</SelectItem>
                      <SelectItem value="turun">Turun</SelectItem>
                      <SelectItem value="stabil">Stabil</SelectItem>
                      <SelectItem value="penting">Penting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select value={kategori} onValueChange={(value: "harga" | "produk" | "sistem" | "lainnya") => setKategori(value)}>
                    <SelectTrigger id="kategori">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harga">Harga</SelectItem>
                      <SelectItem value="produk">Produk</SelectItem>
                      <SelectItem value="sistem">Sistem</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ikon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger id="icon">
                    <SelectValue placeholder="Pilih ikon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="rice">Beras</SelectItem>
                    <SelectItem value="chili">Cabai</SelectItem>
                    <SelectItem value="egg">Telur</SelectItem>
                    <SelectItem value="oil">Minyak</SelectItem>
                    <SelectItem value="onion">Bawang</SelectItem>
                    <SelectItem value="sugar">Gula</SelectItem>
                    <SelectItem value="chicken">Ayam</SelectItem>
                    <SelectItem value="tomato">Tomat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendNotification} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Kirim Notifikasi
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pratinjau Notifikasi</CardTitle>
                <CardDescription>
                  Pratinjau notifikasi yang akan dikirim
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${
                      status === "naik" ? "bg-red-100" : 
                      status === "turun" ? "bg-green-100" : 
                      status === "stabil" ? "bg-blue-100" : 
                      "bg-amber-100"
                    }`}>
                      {status === "naik" ? (
                        <ArrowUp className="h-5 w-5 text-red-600" />
                      ) : status === "turun" ? (
                        <ArrowDown className="h-5 w-5 text-green-600" />
                      ) : status === "stabil" ? (
                        <Info className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Bell className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{judul || "Judul Notifikasi"}</h3>
                      <p className="text-sm text-muted-foreground">{pesan || "Pesan notifikasi akan muncul di sini"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Baru saja</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {kategori === "harga" ? "Harga" : 
                           kategori === "produk" ? "Produk" : 
                           kategori === "sistem" ? "Sistem" : "Lainnya"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tentang Notifikasi Uji</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Notifikasi uji memungkinkan Anda untuk menguji sistem notifikasi tanpa harus menunggu perubahan harga atau tren produk.
                </p>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Jenis Status:</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-red-100 p-1">
                        <ArrowUp className="h-3 w-3 text-red-600" />
                      </div>
                      <span>Naik - Harga naik</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <ArrowDown className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Turun - Harga turun</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-1">
                        <Info className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>Stabil - Harga stabil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1">
                        <Bell className="h-3 w-3 text-amber-600" />
                      </div>
                      <span>Penting - Notifikasi penting</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
