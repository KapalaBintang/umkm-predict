"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { notificationService } from "@/lib/notification-service"
import { notificationGenerator } from "@/lib/notification-generator"
import { useUserSession } from "@/hooks/use-user-session"
import { toast } from "@/hooks/use-toast"
import { ArrowUp, ArrowDown, Bell, Loader2 } from "lucide-react"

export function NotificationTest() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"naik" | "turun" | "stabil" | "penting">("penting")
  const [icon, setIcon] = useState("package")
  const [category, setCategory] = useState<"harga" | "produk" | "sistem" | "lainnya">("sistem")
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
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

    if (!title || !message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Judul dan pesan harus diisi",
      })
      return
    }

    setIsLoading(true)

    try {
      await notificationService.addNotification({
        judul: title,
        pesan: message,
        status,
        dibaca: false,
        icon,
        userId: user.uid,
        kategori: category,
        targetUrl: "/notifikasi",
      })

      toast({
        title: "Berhasil",
        description: "Notifikasi berhasil dikirim",
      })

      // Reset form
      setTitle("")
      setMessage("")
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

  const handleGenerateNotifications = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Anda harus login untuk mengirim notifikasi",
      })
      return
    }

    setIsGenerating(true)

    try {
      await notificationGenerator.checkAllUpdates(user.uid)

      toast({
        title: "Berhasil",
        description: "Notifikasi otomatis berhasil dibuat",
      })
    } catch (error) {
      console.error("Error generating notifications:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal membuat notifikasi otomatis",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Uji Sistem Notifikasi</CardTitle>
        <CardDescription>
          Kirim notifikasi test untuk melihat bagaimana sistem notifikasi bekerja
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            placeholder="Judul notifikasi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Pesan</Label>
          <Textarea
            id="message"
            placeholder="Isi pesan notifikasi"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as any)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="naik">
                  <div className="flex items-center">
                    <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                    <span>Naik</span>
                  </div>
                </SelectItem>
                <SelectItem value="turun">
                  <div className="flex items-center">
                    <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
                    <span>Turun</span>
                  </div>
                </SelectItem>
                <SelectItem value="stabil">
                  <div className="flex items-center">
                    <span className="mr-2 h-4 w-4 inline-block text-center">-</span>
                    <span>Stabil</span>
                  </div>
                </SelectItem>
                <SelectItem value="penting">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Penting</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as any)}>
              <SelectTrigger id="category">
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
          <Label htmlFor="icon">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger id="icon">
              <SelectValue placeholder="Pilih icon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="package">Paket</SelectItem>
              <SelectItem value="rice">Beras</SelectItem>
              <SelectItem value="egg">Telur</SelectItem>
              <SelectItem value="chili">Cabai</SelectItem>
              <SelectItem value="oil">Minyak</SelectItem>
              <SelectItem value="onion">Bawang</SelectItem>
              <SelectItem value="sugar">Gula</SelectItem>
              <SelectItem value="chicken">Ayam</SelectItem>
              <SelectItem value="tomato">Tomat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={handleSendNotification}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Notifikasi Test"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGenerateNotifications}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Membuat Notifikasi...
            </>
          ) : (
            "Buat Notifikasi Otomatis"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
