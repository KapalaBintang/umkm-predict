import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { notificationService } from './notification-service';

// Interface para dados de predição
interface PredictionData {
  id: string;
  keyword: string;
  kategori: string;
  timeline: string;
  tren: 'naik' | 'turun' | 'stabil';
  persentase: number;
  lastUpdated: Timestamp;
}

// Interface para dados de produto
interface ProductData {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  harga: number;
  stok: number;
  tren?: 'naik' | 'turun' | 'stabil';
  persentaseTren?: number;
  lastUpdated?: Timestamp;
}

/**
 * Kelas untuk menghasilkan notifikasi otomatis berdasarkan prediksi dan produk
 */
class NotificationGenerator {
  /**
   * Memeriksa prediksi terbaru dan membuat notifikasi jika ada perubahan signifikan
   * @param userId ID pengguna
   */
  async checkPredictionUpdates(userId: string): Promise<void> {
    try {
      // Dapatkan prediksi terbaru yang diperbarui dalam 24 jam terakhir
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const prediksiRef = collection(db, 'prediksi');
      const q = query(
        prediksiRef,
        where('lastUpdated', '>', Timestamp.fromDate(yesterday)),
        orderBy('lastUpdated', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const prediksi = doc.data() as PredictionData;
        
        // Buat notifikasi untuk perubahan signifikan
        if (prediksi.persentase >= 10 && prediksi.tren === 'naik') {
          await this.createPriceChangeNotification(
            userId,
            prediksi.keyword,
            'naik',
            prediksi.persentase,
            prediksi.kategori
          );
        } else if (prediksi.persentase >= 10 && prediksi.tren === 'turun') {
          await this.createPriceChangeNotification(
            userId,
            prediksi.keyword,
            'turun',
            prediksi.persentase,
            prediksi.kategori
          );
        }
      }
    } catch (error) {
      console.error('Error checking prediction updates:', error);
    }
  }
  
  /**
   * Memeriksa produk pengguna dan membuat notifikasi jika ada yang perlu diperhatikan
   * @param userId ID pengguna
   */
  async checkProductUpdates(userId: string): Promise<void> {
    try {
      // Dapatkan produk pengguna
      const produkRef = collection(db, 'produk');
      const q = query(
        produkRef,
        where('userId', '==', userId),
        orderBy('lastUpdated', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      // Dapatkan prediksi terbaru untuk perbandingan
      const prediksiRef = collection(db, 'prediksi');
      const prediksiSnapshot = await getDocs(prediksiRef);
      const prediksiMap = new Map<string, PredictionData>();
      
      prediksiSnapshot.docs.forEach(doc => {
        const prediksi = doc.data() as PredictionData;
        prediksiMap.set(prediksi.keyword.toLowerCase(), prediksi);
      });
      
      for (const doc of snapshot.docs) {
        const produk = doc.data() as ProductData;
        
        // Periksa stok rendah
        if (produk.stok <= 5) {
          await this.createLowStockNotification(userId, produk.nama, produk.stok);
        }
        
        // Periksa tren produk berdasarkan kategori
        const relatedPredictions = Array.from(prediksiMap.values())
          .filter(p => p.kategori.toLowerCase() === produk.kategori.toLowerCase());
        
        if (relatedPredictions.length > 0) {
          // Hitung rata-rata tren untuk kategori
          const avgTrend = relatedPredictions.reduce((sum, p) => {
            return p.tren === 'naik' ? sum + p.persentase : 
                   p.tren === 'turun' ? sum - p.persentase : sum;
          }, 0) / relatedPredictions.length;
          
          if (Math.abs(avgTrend) >= 15) {
            await this.createProductTrendNotification(
              userId,
              produk.nama,
              avgTrend > 0 ? 'naik' : 'turun',
              Math.abs(avgTrend),
              produk.kategori
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking product updates:', error);
    }
  }
  
  /**
   * Membuat notifikasi perubahan harga
   */
  private async createPriceChangeNotification(
    userId: string,
    itemName: string,
    trend: 'naik' | 'turun',
    percentage: number,
    category: string
  ): Promise<void> {
    const icon = this.getCategoryIcon(category);
    const status = trend === 'naik' ? 'naik' : 'turun';
    
    await notificationService.addNotification({
      judul: itemName,
      pesan: `Harga ${itemName} diprediksi ${trend} ${percentage.toFixed(1)}% dalam waktu dekat.`,
      status,
      dibaca: false,
      icon,
      userId,
      kategori: 'harga',
      targetUrl: '/prediksi'
    });
  }
  
  /**
   * Membuat notifikasi stok rendah
   */
  private async createLowStockNotification(
    userId: string,
    productName: string,
    stock: number
  ): Promise<void> {
    await notificationService.addNotification({
      judul: `Stok ${productName} Rendah`,
      pesan: `Stok ${productName} tinggal ${stock} unit. Segera lakukan pemesanan kembali.`,
      status: 'penting',
      dibaca: false,
      icon: 'package',
      userId,
      kategori: 'produk',
      targetUrl: '/produk-saya'
    });
  }
  
  /**
   * Membuat notifikasi tren produk
   */
  private async createProductTrendNotification(
    userId: string,
    productName: string,
    trend: 'naik' | 'turun',
    percentage: number,
    category: string
  ): Promise<void> {
    const icon = this.getCategoryIcon(category);
    const status = trend === 'naik' ? 'naik' : 'turun';
    
    const message = trend === 'naik'
      ? `Popularitas produk ${productName} meningkat ${percentage.toFixed(1)}%. Pertimbangkan untuk menambah stok.`
      : `Popularitas produk ${productName} menurun ${percentage.toFixed(1)}%. Pertimbangkan untuk promosi khusus.`;
    
    await notificationService.addNotification({
      judul: productName,
      pesan: message,
      status,
      dibaca: false,
      icon,
      userId,
      kategori: 'produk',
      targetUrl: `/produk-prediksi/${encodeURIComponent(productName)}`
    });
  }
  
  /**
   * Mendapatkan ikon berdasarkan kategori
   */
  private getCategoryIcon(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('beras') || lowerCategory.includes('padi')) return 'rice';
    if (lowerCategory.includes('telur')) return 'egg';
    if (lowerCategory.includes('cabai') || lowerCategory.includes('cabe')) return 'chili';
    if (lowerCategory.includes('minyak')) return 'oil';
    if (lowerCategory.includes('bawang')) return 'onion';
    if (lowerCategory.includes('gula')) return 'sugar';
    if (lowerCategory.includes('ayam') || lowerCategory.includes('daging')) return 'chicken';
    if (lowerCategory.includes('tomat')) return 'tomato';
    
    return 'package';
  }
  
  /**
   * Memeriksa semua pembaruan dan membuat notifikasi yang sesuai
   * @param userId ID pengguna
   */
  async checkAllUpdates(userId: string): Promise<void> {
    await this.checkPredictionUpdates(userId);
    await this.checkProductUpdates(userId);
  }
}

// Ekspor instance singleton
export const notificationGenerator = new NotificationGenerator();
