"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Bell, Clock, Settings, AlertTriangle, Info } from "lucide-react"
import { runNotificationWorker } from "@/lib/notification-worker"
import { useUserSession } from "@/hooks/use-user-session"
import { toast } from "@/hooks/use-toast"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotificationScheduler() {
  const [enabled, setEnabled] = useState(false)
  const [frequency, setFrequency] = useState("daily")
  const [threshold, setThreshold] = useState([5])
  const [categories, setCategories] = useState({
    harga: true,
    produk: true,
    sistem: true
  })
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const user = useUserSession()

  // Load settings from Firestore on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const userSettingsRef = doc(db, 'userSettings', user.uid);
        const docSnap = await getDoc(userSettingsRef);
        
        if (docSnap.exists()) {
          const settings = docSnap.data();
          setEnabled(settings.enableNotifications || false);
          setFrequency(settings.notificationFrequency || "daily");
          setThreshold([settings.notificationThreshold || 5]);
          setCategories({
            harga: settings.notifyHarga !== false, // default true
            produk: settings.notifyProduk !== false, // default true
            sistem: settings.notifySistem !== false // default true
          });
        } else {
          // Create default settings if none exist
          const defaultSettings = {
            enableNotifications: false,
            notificationFrequency: "daily",
            notificationThreshold: 5,
            notifyHarga: true,
            notifyProduk: true,
            notifySistem: true,
            userId: user.uid,
            lastUpdated: new Date()
          };
          
          await setDoc(userSettingsRef, defaultSettings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat pengaturan notifikasi",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user?.uid])

  const handleToggleCategory = (category: "harga" | "produk" | "sistem") => {
    setCategories({
      ...categories,
      [category]: !categories[category]
    })
  }

  const handleRunNow = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Anda harus login untuk menjalankan notifikasi otomatis",
      })
      return
    }

    setIsRunning(true)
    
    try {
      // Jalankan worker notifikasi
      const result = await runNotificationWorker()
      console.log('Notification worker result:', result)
      toast({
        title: "Berhasil",
        description: "Notifikasi otomatis berhasil dijalankan",
      })
    } catch (error) {
      console.error('Error running notification check:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menjalankan notifikasi otomatis",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Anda harus login untuk menyimpan pengaturan notifikasi",
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      // Simpan pengaturan ke Firestore
      const userSettingsRef = doc(db, 'userSettings', user.uid)
      
      const settings = {
        enableNotifications: enabled,
        notificationFrequency: frequency,
        notificationThreshold: threshold[0],
        notifyHarga: categories.harga,
        notifyProduk: categories.produk,
        notifySistem: categories.sistem,
        userId: user.uid,
        lastUpdated: new Date()
      }
      
      await setDoc(userSettingsRef, settings, { merge: true })
      
      console.log('Notification settings saved to Firestore:', settings)
      toast({
        title: "Berhasil",
        description: "Pengaturan notifikasi berhasil disimpan",
      })
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan pengaturan notifikasi",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pengaturan Notifikasi Otomatis
        </CardTitle>
        <CardDescription>
          Atur bagaimana sistem akan mengirimkan notifikasi otomatis kepada Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Memuat pengaturan...</span>
          </div>
        ) : (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Notifikasi Otomatis</AlertTitle>
              <AlertDescription>
                Notifikasi akan dikirim secara otomatis sesuai dengan frekuensi yang Anda pilih. 
                Anda harus mengaktifkan notifikasi di browser untuk menerima pemberitahuan.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-notify">Notifikasi Otomatis</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan untuk menerima notifikasi otomatis tentang perubahan harga
                </p>
              </div>
              <Switch
                id="auto-notify"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori Notifikasi</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categories.harga ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCategory("harga")}
                  className={categories.harga ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Harga Bahan Pokok
                </Button>
                <Button
                  variant={categories.produk ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCategory("produk")}
                  className={categories.produk ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Produk Saya
                </Button>
                <Button
                  variant={categories.sistem ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleCategory("sistem")}
                  className={categories.sistem ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Sistem
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="threshold">Ambang Batas Perubahan (%)</Label>
                <span className="text-sm">{threshold[0]}%</span>
              </div>
              <Slider
                id="threshold"
                min={1}
                max={20}
                step={1}
                value={threshold}
                onValueChange={setThreshold}
              />
              <p className="text-xs text-muted-foreground">
                Hanya kirim notifikasi jika perubahan harga melebihi ambang batas ini
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frekuensi Pemeriksaan</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Pilih frekuensi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Setiap Jam</SelectItem>
                  <SelectItem value="daily">Setiap Hari</SelectItem>
                  <SelectItem value="weekly">Setiap Minggu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Seberapa sering sistem harus memeriksa perubahan harga
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSaveSettings} disabled={isSaving || isLoading}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Pengaturan"
          )}
        </Button>
        <Button onClick={handleRunNow} disabled={isRunning || isLoading}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Jalankan Sekarang
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
