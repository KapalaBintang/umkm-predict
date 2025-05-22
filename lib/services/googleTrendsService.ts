import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

interface TrendValue {
  query: string;
  value: string;
  extracted_value: number;
}

interface TrendDataPoint {
  date: string;
  timestamp: string;
  values: TrendValue[];
  partial_data?: boolean;
}

interface TrendData {
  timeline_data: TrendDataPoint[];
}

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

/**
 * Service untuk mengelola data Google Trends
 */
export const GoogleTrendsService = {
  /**
   * Mengambil data trend dari SerpAPI untuk kata kunci tertentu
   * @param keyword - Kata kunci yang ingin dicari trendnya
   * @returns Data trend dari Google Trends
   */
  async getTrend(keyword: string): Promise<TrendData | null> {
    try {
      const response = await fetch('/api/serpapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: keyword }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data trend');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return null;
    }
  },

  /**
   * Menyimpan data trend ke Firebase
   * @param keyword - Kata kunci yang dicari
   * @param data - Data trend yang akan disimpan
   * @param userId - ID pengguna yang melakukan pencarian (opsional)
   * @returns Boolean yang menunjukkan keberhasilan operasi
   */
  async saveTrendData(keyword: string, data: TrendData, userId?: string): Promise<boolean> {
    try {
      const trendsCollection = collection(db, 'googleTrends');
      const docRef = doc(trendsCollection, keyword.toLowerCase());
      
      await setDoc(docRef, {
        keyword: keyword.toLowerCase(),
        data: data,
        updatedAt: new Date().toISOString(),
        userId: userId || null, // Menyimpan user ID jika tersedia
      });
      
      return true;
    } catch (error) {
      console.error('Error saving trend data to Firebase:', error);
      return false;
    }
  },

  /**
   * Mengambil data trend dari Firebase
   * @param keyword - Kata kunci yang ingin diambil datanya
   * @returns Data trend dari Firebase
   */
  async getTrendFromFirebase(keyword: string): Promise<{data: TrendData, updatedAt: string} | null> {
    try {
      const trendsCollection = collection(db, 'googleTrends');
      const docRef = doc(trendsCollection, keyword.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          data: data.data as TrendData,
          updatedAt: data.updatedAt
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching trend data from Firebase:', error);
      return null;
    }
  },

  /**
   * Mengambil data trend untuk beberapa kata kunci
   * @param keywords - Array kata kunci yang ingin diambil datanya
   * @param userId - ID pengguna yang melakukan pencarian (opsional)
   * @returns Object dengan kata kunci sebagai key dan data trend sebagai value
   */
  async getTrendsForKeywords(keywords: string[], userId?: string): Promise<Record<string, TrendData>> {
    try {
      const results: Record<string, TrendData> = {};
      
      // Menggunakan Promise.all untuk melakukan request paralel
      await Promise.all(
        keywords.map(async (keyword) => {
          // Coba ambil dari Firebase dulu
          const cachedData = await this.getTrendFromFirebase(keyword);
          
          // Jika data ada di Firebase dan masih fresh (kurang dari 1 hari)
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          if (cachedData && new Date(cachedData.updatedAt) > oneDayAgo) {
            results[keyword] = cachedData.data;
          } else {
            // Jika tidak ada di cache atau sudah kadaluarsa, ambil dari API
            const freshData = await this.getTrend(keyword);
            if (freshData) {
              // Simpan ke Firebase untuk penggunaan berikutnya dengan user ID
              await this.saveTrendData(keyword, freshData, userId);
              results[keyword] = freshData;
            }
          }
        })
      );
      
      return results;
    } catch (error) {
      console.error('Error fetching trends for keywords:', error);
      return {};
    }
  },

  /**
   * Menganalisis data trend untuk mendapatkan skor popularitas
   * @param data - Data trend yang akan dianalisis
   * @returns Skor popularitas dari 0-100
   */
  analyzeTrendPopularity(data: TrendData): number {
    if (!data || !data.timeline_data || data.timeline_data.length === 0) {
      return 0;
    }
    
    // Ambil 12 data terakhir (3 bulan terakhir jika data mingguan)
    const recentData = data.timeline_data.slice(-12);
    console.log(recentData)
    
    // Hitung rata-rata nilai trend
    let sum = 0;
    let count = 0;
    
    recentData.forEach(point => {
      point.values.forEach(value => {
        // Konversi nilai "<1" menjadi 0.5 untuk perhitungan
        const numValue = value.value === "<1" ? 0.5 : value.extracted_value;
        sum += numValue;
        count++;
      });
    });
    
    // Kembalikan rata-rata atau 0 jika tidak ada data
    return count > 0 ? Math.round(sum / count) : 0;
  },

  getUserProducts: async (userId: string): Promise<Produk[]> => {
    try {
      const produkCollection = collection(db, 'produk');
      const q = query(produkCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const products: Produk[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          nama: data.nama,
          kategori: data.kategori,
          konsumsiMingguan: data.konsumsiMingguan,
          satuan: data.satuan,
          userId: data.userId,
          popularitas: data.popularitas,
          trendData: data.trendData,
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting user products:', error);
      return [];
    }
  },

  loadTrendData: async (produkItems: any, setIsLoading: any, trendDataLoaded: any, setProdukList: any, setTrendDataLoaded: any, toast: any, currentUser: any) => {
      if (trendDataLoaded) return;
      
      setIsLoading(true);
      try {
        // Ambil nama produk untuk digunakan sebagai kata kunci
        const keywords = produkItems.map((produk: any) => produk.nama);
        
        if (keywords.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Ambil data trend untuk semua produk dengan user ID
        const trendsData = await GoogleTrendsService.getTrendsForKeywords(keywords, currentUser || undefined);
        
        // Update produk dengan data trend
        const updatedProdukList = produkItems.map((produk: any) => {
          const trendData = trendsData[produk.nama];
          const popularitas = trendData ? GoogleTrendsService.analyzeTrendPopularity(trendData) : 0;
          
          return {
            ...produk,
            popularitas,
            trendData
          };
        });
        
        setProdukList(updatedProdukList);
        setTrendDataLoaded(true);
      } catch (error) {
        console.error('Error loading trend data:', error);
        toast({
          title: "Gagal memuat data trend",
          description: "Terjadi kesalahan saat memuat data popularitas produk",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  
};
