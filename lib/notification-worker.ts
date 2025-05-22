/**
 * Notification Worker
 * 
 * Worker untuk menjalankan notifikasi otomatis secara periodik
 * Menggunakan client-side untuk mengambil data dan mengirim ke API
 */

import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Notifikasi } from './notification-service';

// Interface untuk data prediksi
interface PrediksiData {
  id: string;
  keyword: string;
  kategori: string;
  hargaSekarang?: number;
  hargaSebelumnya?: number;
  persentasePerubahan?: number;
  tren: "naik" | "turun" | "stabil";
  prediksiHarga?: number;
  prediksiTren?: string;
  lastUpdated?: any;
  confidence?: number;
}

/**
 * Jalankan worker notifikasi otomatis
 * @param filteredUsers - Daftar pengguna yang sudah difilter berdasarkan frekuensi (opsional)
 */
export async function runNotificationWorker(filteredUsers?: any[]) {
  try {
    console.log("Menjalankan notification worker...");
    
    let users;
    
    // Jika sudah ada daftar pengguna yang difilter, gunakan itu
    if (filteredUsers && filteredUsers.length > 0) {
      console.log(`Menggunakan ${filteredUsers.length} pengguna yang telah difilter berdasarkan frekuensi`);
      users = filteredUsers;
    } else {
      // Jika tidak, ambil semua pengguna
      console.log('Tidak ada daftar pengguna yang difilter, mengambil semua pengguna');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    // Ekstrak daftar user IDs untuk dikirim ke API
    const userIds = users.map(user => user.id);

    console.log("userIds", userIds);
    
    // Dapatkan data prediksi terbaru
    const prediksiRef = collection(db, 'prediksi');
    const q = query(
      prediksiRef,
      orderBy('updatedAt', 'desc'),
      limit(20) // Ambil 20 prediksi terbaru
    );
    
    const prediksiSnapshot = await getDocs(q);
   
    let prediksiData: PrediksiData[] = [];
    
    prediksiSnapshot.forEach(doc => {
      console.log(doc.data());
      prediksiData.push({
        id: doc.id,
        ...doc.data()
      } as PrediksiData);
    });
    
    // Jika tidak ada data prediksi dari Firestore, gunakan data dummy untuk testing
    if (prediksiData.length === 0) {
      console.log("Tidak ada data prediksi dari Firestore, menggunakan data dummy");
      prediksiData = [
        {
          id: "dummy1",
          keyword: "Beras",
          kategori: "Bahan Pokok",
          hargaSekarang: 12000,
          prediksiHarga: 13200,
          persentasePerubahan: 10,
          tren: "naik",
          lastUpdated: new Date()
        },
        {
          id: "dummy2",
          keyword: "Minyak Goreng",
          kategori: "Bahan Pokok",
          hargaSekarang: 18000,
          prediksiHarga: 16200,
          persentasePerubahan: -10,
          tren: "turun",
          lastUpdated: new Date()
        },
        {
          id: "dummy3",
          keyword: "Gula Pasir",
          kategori: "Bahan Pokok",
          hargaSekarang: 15000,
          prediksiHarga: 15750,
          persentasePerubahan: 5,
          tren: "naik",
          lastUpdated: new Date()
        }
      ];
    }
    
    console.log("Data prediksi:", prediksiData);
    
    // Kirim data ke API untuk diproses
    const apiKey = process.env.NEXT_PUBLIC_NOTIFICATION_API_KEY;
    if (!apiKey) {
      console.error("API key tidak ditemukan");
      return;
    }
    
    try {
      // Gunakan URL lengkap untuk menghindari masalah relatif URL
      // Deteksi apakah kita berada di localhost atau production
      const baseUrl = window.location.origin; // Misalnya http://localhost:3000 atau https://abdul-aziz.my.id
      
      // Pertama, kirim data ke auto-notification API untuk memproses notifikasi
      const autoNotificationUrl = `${baseUrl}/api/auto-notification`;
      
      console.log("Mengirim request ke auto-notification API:", autoNotificationUrl);
      
      const autoNotificationResponse = await fetch(autoNotificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          users,
          prediksiData
        })
      });
      
      if (!autoNotificationResponse.ok) {
        throw new Error(`HTTP error! status: ${autoNotificationResponse.status}`);
      }
      
      const autoNotificationResult = await autoNotificationResponse.json();
      console.log("Respons dari auto-notification API:", autoNotificationResult);
      
      // Kemudian, kirim daftar userIds ke notification-worker API untuk memproses notifikasi
      const notificationWorkerUrl = `${baseUrl}/api/notification-worker`;
      
      console.log("Mengirim request ke notification-worker API:", notificationWorkerUrl);
      
      const response = await fetch(notificationWorkerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          userIds
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Respons dari notification-worker API:", result);
      
      if (autoNotificationResult.success) {
        // Simpan notifikasi ke Firestore
        await saveNotificationsToFirestore(autoNotificationResult.notifikasi);
        console.log(`${autoNotificationResult.notifikasi.length} notifikasi berhasil dibuat`);
      } else {
        console.error("Gagal menjalankan auto-notification:", autoNotificationResult.error);
      }

      console.log(autoNotificationResult.notifikasi)
      
      return {
        success: true,
        notifikasi: autoNotificationResult.notifikasi || [],
        message: `${autoNotificationResult.notifikasi?.length || 0} notifikasi telah dibuat dan diproses untuk ${result.processedUsers?.length || 0} pengguna`,
        prediksiSignifikan: autoNotificationResult.prediksiSignifikan || 0,
        processedUsers: result.processedUsers || []
      };
    } catch (fetchError) {
      console.error("Error saat fetch API:", fetchError);
      
      // Jika fetch gagal, buat notifikasi lokal sebagai fallback
      console.log("Menggunakan fallback untuk membuat notifikasi lokal");
      
      // Buat notifikasi lokal berdasarkan prediksi
      const notifikasi: Notifikasi[] = [];
      
      users.forEach(user => {
        prediksiData.forEach(prediksi => {
          if (prediksi.keyword) {
            const status = (prediksi.tren || "penting") as "naik" | "turun" | "stabil" | "penting";
            const icon = prediksi.kategori?.toLowerCase().includes('beras') ? 'rice' : 
                         prediksi.kategori?.toLowerCase().includes('minyak') ? 'oil' : 'package';
            
            let pesan = '';
            if (status === 'naik') {
              pesan = `Harga ${prediksi.keyword} diprediksi naik ${Math.abs(prediksi.persentasePerubahan || 0).toFixed(1)}%. Pertimbangkan untuk menyesuaikan harga produk Anda.`;
            } else if (status === 'turun') {
              pesan = `Harga ${prediksi.keyword} diprediksi turun ${Math.abs(prediksi.persentasePerubahan || 0).toFixed(1)}%. Ini waktu yang tepat untuk membeli stok.`;
            } else {
              pesan = `Informasi penting tentang ${prediksi.keyword}. Pantau terus perkembangan harga untuk keputusan bisnis yang lebih baik.`;
            }
            
            // Buat ID unik untuk notifikasi lokal
            const notifId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            notifikasi.push({
              id: notifId,
              judul: prediksi.keyword,
              pesan,
              status,
              dibaca: false,
              icon,
              userId: user.id,
              kategori: "harga",
              targetUrl: `/prediksi?keyword=${encodeURIComponent(prediksi.keyword)}`,
              waktu: new Date() // Tambahkan waktu saat ini
            });
          }
        });
      });
      
      // Simpan notifikasi lokal ke Firestore
      await saveNotificationsToFirestore(notifikasi);
      console.log(`${notifikasi.length} notifikasi lokal berhasil dibuat`);
      
      // Kirim userIds ke notification-worker API untuk memproses notifikasi tambahan
      try {
        const baseUrl = window.location.origin;
        const notificationWorkerUrl = `${baseUrl}/api/notification-worker`;
        
        console.log("Mengirim request ke notification-worker API (fallback):", notificationWorkerUrl);
        
        await fetch(notificationWorkerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            userIds: users.map(user => user.id)
          })
        });
      } catch (workerError) {
        console.error("Error saat memanggil notification-worker API (fallback):", workerError);
      }
      
      return {
        success: true,
        notifikasi,
        message: `${notifikasi.length} notifikasi lokal telah dibuat`,
        prediksiSignifikan: prediksiData.length
      };
    }
  } catch (error) {
    console.error("Error menjalankan notification worker:", error);
    throw error;
  }
}

/**
 * Simpan notifikasi ke Firestore
 */
async function saveNotificationsToFirestore(notifikasi: Notifikasi[]) {
  try {
    const notifikasiRef = collection(db, 'notifikasi');
    const promises = notifikasi.map(notif => 
      addDoc(notifikasiRef, {
        ...notif,
        waktu: serverTimestamp(),
        dibaca: false
      })
    );
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error menyimpan notifikasi ke Firestore:", error);
    throw error;
  }
}

/**
 * Jalankan worker berdasarkan jadwal
 * @param schedule Jadwal dalam format cron
 */
export function scheduleNotificationWorker(intervalMinutes: number = 60) {
  // Jalankan worker setiap intervalMinutes menit
  const intervalId = setInterval(async () => {
    try {
      await runNotificationWorker();
    } catch (error) {
      console.error("Error menjalankan scheduled notification worker:", error);
    }
  }, intervalMinutes * 60 * 1000);
  
  return intervalId;
}
