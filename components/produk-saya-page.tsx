"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "./main-layout"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Package2, ShoppingBasket, BarChart, TrendingUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { GoogleTrendsService } from "@/lib/services/googleTrendsService"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"


// Interface untuk produk/bahan
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

// Data dummy kategori
const kategoriOptions = ["Bumbu Dapur", "Sayuran", "Daging", "Sembako", "Buah", "Tepung", "Minyak", "Lainnya"]

// Data dummy satuan
const satuanOptions = ["kg", "gram", "liter", "ml", "pcs", "ikat", "karung", "botol"]

export function ProdukSayaPage() {
  // State untuk data produk
  const [produkList, setProdukList] = useState<Produk[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [trendDataLoaded, setTrendDataLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  // Fungsi untuk memuat data trend dari Google Trends
  const loadTrendData = async (produkItems: Produk[]) => {
    return GoogleTrendsService.loadTrendData(produkItems, setIsLoading, trendDataLoaded, setProdukList, setTrendDataLoaded, toast, currentUser)
  }

  // Mendapatkan user ID saat ini
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Mengambil data produk dari Firebase berdasarkan user ID
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!currentUser) {
        setProdukList([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Ambil data produk dari Firestore berdasarkan user ID
        const userProducts = await GoogleTrendsService.getUserProducts(currentUser);
        console.log("userProducts", userProducts)
        setProdukList(userProducts);
        
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

  // State untuk dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  // State untuk form
  const [formData, setFormData] = useState<Omit<Produk, "id">>({
    nama: "",
    kategori: "",
    konsumsiMingguan: 0,
    satuan: "kg",
  })

  
  // Handler untuk menambah produk baru
  const handleSubmit = async() => {
    if (!formData.nama || !formData.kategori || formData.konsumsiMingguan <= 0) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      })
      return
    }

    if (isEditMode && currentId) {
      // Update produk yang sudah ada di Firestore
      try {
        if (!currentId) throw new Error('ID produk tidak valid');
        
        const produkDoc = doc(db, 'produk', currentId);
        await updateDoc(produkDoc, {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        
        // Update state
        setProdukList(
          produkList.map((item) =>
            item.id === currentId
              ? {
                  ...item,
                  ...formData,
                }
              : item,
          ),
        );
        
        toast({
          title: "Produk berhasil diperbarui",
          description: `${formData.nama} telah diperbarui`,
        });
      } catch (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Gagal memperbarui produk",
          description: "Terjadi kesalahan saat memperbarui data produk",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!currentUser) {
        toast({
          title: "Anda belum login",
          description: "Silakan login terlebih dahulu untuk menambahkan bahan",
          variant: "destructive",
        });
        return;
      }
      
      // Tambah produk baru ke Firestore
      try {
        const produkCollection = collection(db, 'produk');
        const newProdukData = {
          ...formData,
          userId: currentUser,
          createdAt: new Date().toISOString(),
        };
      
        // Coba ambil data trend untuk produk baru
        setIsLoading(true);
        let popularitas = 0;
        let trendData = null;
        
        try {
          trendData = await GoogleTrendsService.getTrend(formData.nama);
          if (trendData) {
            // Simpan data trend ke Firebase dengan user ID
            await GoogleTrendsService.saveTrendData(formData.nama, trendData, currentUser);
            
            // Analisis popularitas
            popularitas = GoogleTrendsService.analyzeTrendPopularity(trendData);
            
            // Tambahkan data popularitas ke produk
            newProdukData.popularitas = popularitas;
            newProdukData.trendData = trendData;
          }
        } catch (error) {
          console.error('Error fetching trend data for new product:', error);
        }
        
        // Simpan produk ke Firestore
        const docRef = await addDoc(produkCollection, newProdukData);
        
        // Tambahkan ke state dengan ID dari Firestore
        const newProduk: Produk = {
          id: docRef.id,
          ...formData,
          userId: currentUser,
          popularitas,
          trendData,
        };
        
        setProdukList([...produkList, newProduk]);
      } catch (error) {
        console.error('Error adding new product:', error);
        toast({
          title: "Gagal menambahkan produk",
          description: "Terjadi kesalahan saat menyimpan data produk",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      toast({
        title: "Produk berhasil ditambahkan",
        description: `${formData.nama} telah ditambahkan ke daftar produk Anda`,
      })
    }

    // Reset form dan tutup dialog
    resetForm()
    setIsDialogOpen(false)
  }

  // Handler untuk menghapus produk
  const handleDelete = async (id: string) => {
    const produkToDelete = produkList.find((p) => p.id === id);
    if (!produkToDelete) return;
    
    try {
      // Hapus dari Firestore
      const produkDoc = doc(db, 'produk', id);
      await deleteDoc(produkDoc);
      
      // Update state
      setProdukList(produkList.filter((item) => item.id !== id));
      
      toast({
        title: "Produk dihapus",
        description: `${produkToDelete?.nama} telah dihapus dari daftar produk Anda`,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Gagal menghapus produk",
        description: "Terjadi kesalahan saat menghapus produk",
        variant: "destructive",
      });
    }
  }

  // Handler untuk edit produk
  const handleEdit = (id: string) => {
    const produkToEdit = produkList.find((item) => item.id === id);
    if (produkToEdit) {
      setFormData({
        nama: produkToEdit.nama,
        kategori: produkToEdit.kategori,
        konsumsiMingguan: produkToEdit.konsumsiMingguan,
        satuan: produkToEdit.satuan,
      });
      setCurrentId(id);
      setIsEditMode(true);
      setIsDialogOpen(true);
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: "",
      kategori: "",
      konsumsiMingguan: 0,
      satuan: "kg",
    })
    setIsEditMode(false)
    setCurrentId(null)
  }

  // Handler untuk menutup dialog
  const handleCloseDialog = () => {
    resetForm()
    setIsDialogOpen(false)
  }

  console.log(produkList)

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produk Saya</h1>
            <p className="text-muted-foreground">
              Kelola daftar bahan pokok yang sering Anda gunakan untuk bisnis kuliner Anda.
            </p>
          </div>

          {/* Dialog untuk tambah/edit produk */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Bahan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Bahan" : "Tambah Bahan Baru"}</DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Perbarui informasi bahan yang Anda gunakan."
                    : "Tambahkan bahan yang sering Anda gunakan untuk bisnis kuliner Anda."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nama">Nama Bahan</Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama bahan"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="kategori">Kategori</Label>
                    <Select
                      value={formData.kategori}
                      onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                    >
                      <SelectTrigger id="kategori">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Kategori Bahan</SelectLabel>
                          {kategoriOptions.map((kategori) => (
                            <SelectItem key={kategori} value={kategori}>
                              {kategori}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="konsumsi">Konsumsi Rata-rata per Minggu</Label>
                    <div className="flex">
                      <Input
                        id="konsumsi"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0"
                        className="rounded-r-none"
                        value={formData.konsumsiMingguan || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            konsumsiMingguan: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Select
                        value={formData.satuan}
                        onValueChange={(value) => setFormData({ ...formData, satuan: value })}
                      >
                        <SelectTrigger className="w-[80px] rounded-l-none border-l-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {satuanOptions.map((satuan) => (
                            <SelectItem key={satuan} value={satuan}>
                              {satuan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Batal
                </Button>
                <Button onClick={handleSubmit}>{isEditMode ? "Perbarui" : "Tambahkan"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabel daftar produk */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Bahan</CardTitle>
            <CardDescription>Bahan-bahan yang sering Anda gunakan untuk bisnis kuliner Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            {produkList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <ShoppingBasket className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Belum ada bahan yang ditambahkan</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Tambahkan bahan-bahan yang sering Anda gunakan untuk memantau harga dan mendapatkan rekomendasi
                  pembelian.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Bahan Sekarang
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Bahan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Konsumsi Rata-rata/Minggu</TableHead>
                      <TableHead>Popularitas</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produkList.map((produk) => (
                      <TableRow key={produk.id}>
                        <TableCell className="font-medium">{produk.nama}</TableCell>
                        <TableCell>{produk.kategori}</TableCell>
                        <TableCell>
                          {produk.konsumsiMingguan} {produk.satuan}
                        </TableCell>
                        <TableCell>
                          {isLoading ? (
                            <span className="text-muted-foreground">Memuat...</span>
                          ) : produk.popularitas !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${produk.popularitas > 50 ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${produk.popularitas}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{produk.popularitas}%</span>
                              {produk.popularitas > 50 && <TrendingUp className="h-3 w-3 text-green-500" />}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Tidak tersedia</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(produk.id)} title="Edit">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(produk.id)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informasi tambahan */}
        {produkList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Manfaat Mencatat Bahan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-blue-100 p-2">
                    <Package2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pantau Harga Bahan</p>
                    <p className="text-muted-foreground">
                      Dapatkan notifikasi saat harga bahan yang Anda gunakan mengalami perubahan signifikan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-green-100 p-2">
                    <ShoppingBasket className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rekomendasi Pembelian</p>
                    <p className="text-muted-foreground">
                      Dapatkan rekomendasi kapan waktu terbaik untuk membeli bahan berdasarkan prediksi harga.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-purple-100 p-2">
                    <BarChart className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Analisis Popularitas</p>
                    <p className="text-muted-foreground">
                      Lihat tren popularitas bahan di Google Trends untuk membantu Anda mengidentifikasi peluang pasar.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
