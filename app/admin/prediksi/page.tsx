"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Download, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Interface untuk data timeline
interface TimelineItem {
  date: string
  timestamp: string
  values: {
    query: string
    value: string
    extracted_value: number
  }[]
}

// Interface untuk data yang disimpan di Firebase
interface PrediksiData {
  id?: string
  keyword: string
  timeline: {
    time: string
    value: number
  }[]
  createdAt: Date | { seconds: number, nanoseconds: number }
  updatedAt: Date | { seconds: number, nanoseconds: number }
}

export default function PrediksiAdminPage() {
  const [loading, setLoading] = useState(false)
  const [prediksiData, setPrediksiData] = useState<PrediksiData[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [apiData, setApiData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  // Ambil data dari Firebase saat komponen dimuat
  useEffect(() => {
    fetchPrediksiData()
  }, [])

  // Fungsi untuk mengambil data dari Firebase
  const fetchPrediksiData = async () => {
    setLoading(true)
    try {
      const prediksiRef = collection(db, "prediksi")
      const q = query(prediksiRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      
      const data: PrediksiData[] = []
      querySnapshot.forEach((doc) => {
        // Konversi data dari Firestore
        const docData = doc.data()
        data.push({ 
          id: doc.id, 
          ...docData,
        } as PrediksiData)
      })
      
      setPrediksiData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Gagal mengambil data",
        description: "Terjadi kesalahan saat mengambil data prediksi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk mengambil data dari API
  const fetchApiData = async () => {
    setIsImporting(true)
    try {
      const response = await fetch("/api/prediksi", {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch API data")
      }
      
      const data = await response.json()
      console.log(data)
      setApiData(data)
      toast({
        title: "Data berhasil diambil",
        description: `Berhasil mengambil data untuk ${data.length} keyword`,
      })
    } catch (error) {
      console.error("Error fetching API data:", error)
      toast({
        title: "Gagal mengambil data API",
        description: "Terjadi kesalahan saat mengambil data dari API",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Fungsi untuk menyimpan data ke Firebase
  const saveToFirebase = async () => {
    if (apiData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Silakan ambil data dari API terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simpan setiap keyword sebagai dokumen terpisah
      for (const item of apiData) {
        const prediksiRef = collection(db, "prediksi")
        
        // Cek apakah keyword sudah ada di database
        const q = query(prediksiRef, where("keyword", "==", item.keyword))
        const querySnapshot = await getDocs(q)
        const existingDoc = querySnapshot.docs[0] // Ambil dokumen pertama jika ada
        
        const now = new Date()
        const serverTimestamp = now
        
        if (existingDoc) {
          // Update dokumen yang sudah ada
          await updateDoc(doc(db, "prediksi", existingDoc.id), {
            keyword: item.keyword,
            timeline: item.timeline,
            updatedAt: serverTimestamp
          })
        } else {
          // Buat dokumen baru
          await addDoc(prediksiRef, {
            keyword: item.keyword,
            timeline: item.timeline,
            createdAt: serverTimestamp,
            updatedAt: serverTimestamp
          })
        }
      }
      
      toast({
        title: "Data berhasil disimpan",
        description: `Berhasil menyimpan data untuk ${apiData.length} keyword ke Firebase`,
      })
      
      // Refresh data
      fetchPrediksiData()
    } catch (error) {
      console.error("Error saving to Firebase:", error)
      toast({
        title: "Gagal menyimpan data",
        description: "Terjadi kesalahan saat menyimpan data ke Firebase",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsDialogOpen(false)
    }
  }

  // Fungsi untuk menghapus data dari Firebase
  const deleteData = async (id: string) => {
    if (!id) return
    
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return
    }
    
    setLoading(true)
    try {
      await deleteDoc(doc(db, "prediksi", id))
      
      toast({
        title: "Data berhasil dihapus",
        description: "Data prediksi telah dihapus dari Firebase",
      })
      
      // Refresh data
      setPrediksiData(prediksiData.filter(item => item.id !== id))
    } catch (error) {
      console.error("Error deleting data:", error)
      toast({
        title: "Gagal menghapus data",
        description: "Terjadi kesalahan saat menghapus data dari Firebase",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter data berdasarkan pencarian
  const filteredData = prediksiData.filter(item => 
    item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format tanggal
  const formatDate = (date: Date | { seconds: number, nanoseconds: number }) => {
    if (!date) return "-";
    
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'object' && 'seconds' in date) {
      // Konversi timestamp Firestore ke Date
      dateObj = new Date(date.seconds * 1000);
    } else {
      return "-";
    }
    
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Admin Prediksi Trend</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPrediksiData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Data Prediksi</DialogTitle>
                <DialogDescription>
                  Ambil data dari API dan simpan ke Firebase
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex justify-center">
                  <Button 
                    onClick={fetchApiData} 
                    disabled={isImporting}
                    variant="outline"
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mengambil Data...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Ambil Data dari API
                      </>
                    )}
                  </Button>
                </div>
                
                {apiData.length > 0 && (
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm font-medium">Data berhasil diambil:</p>
                    <p className="text-sm text-muted-foreground">
                      {apiData.length} keyword dengan total {apiData.reduce((acc, item) => acc + item.timeline.length, 0)} data timeline
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={saveToFirebase} 
                  disabled={loading || apiData.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan ke Firebase
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Prediksi Trend</CardTitle>
                <CardDescription>
                  Kelola data prediksi trend yang tersimpan di Firebase
                </CardDescription>
              </div>
              <Input
                placeholder="Cari keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading && prediksiData.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-350px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Jumlah Data</TableHead>
                      <TableHead>Nilai Terakhir</TableHead>
                      <TableHead>Dibuat Pada</TableHead>
                      <TableHead>Diperbarui Pada</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          {searchQuery ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data prediksi"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.keyword}</TableCell>
                          <TableCell>{item.timeline.length} data</TableCell>
                          <TableCell>
                            {item.timeline.length > 0 ? item.timeline[item.timeline.length - 1].value : "-"}
                          </TableCell>
                          <TableCell>
                            {item.createdAt ? formatDate(item.createdAt) : "-"}
                          </TableCell>
                          <TableCell>
                            {item.updatedAt ? formatDate(item.updatedAt) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteData(item.id!)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-xs text-muted-foreground">
              Menampilkan {filteredData.length} dari {prediksiData.length} data
            </div>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} disabled={!searchQuery}>
              Reset Filter
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Panduan Penggunaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Import Data</p>
                <p className="text-muted-foreground">
                  Klik tombol "Import Data" untuk mengambil data terbaru dari API dan menyimpannya ke Firebase.
                </p>
              </div>
              <div>
                <p className="font-medium">Refresh Data</p>
                <p className="text-muted-foreground">
                  Klik tombol "Refresh" untuk memperbarui tampilan data dari Firebase.
                </p>
              </div>
              <div>
                <p className="font-medium">Hapus Data</p>
                <p className="text-muted-foreground">
                  Klik ikon tempat sampah untuk menghapus data prediksi dari Firebase.
                </p>
              </div>
              <div className="mt-2 rounded-md bg-muted p-3">
                <p className="text-xs font-medium">Catatan:</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data yang diimpor dari API akan secara otomatis diperbarui jika keyword sudah ada di database.
                  Pastikan data yang diimpor akurat sebelum menyimpannya ke Firebase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
