import { NextResponse } from 'next/server';
import { runNotificationWorker } from '@/lib/notification-worker';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Endpoint API untuk dijalankan oleh cron job
 * Endpoint ini akan menjalankan notification worker untuk mengirim notifikasi otomatis
 * Dijalankan dengan frekuensi berbeda (hourly, daily, weekly) oleh Vercel Cron Jobs
 */
export async function GET(request: Request) {
  try {
    // Periksa otorisasi
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.split(' ')[1];
    
    // Pastikan request memiliki API key yang valid
    // Gunakan NOTIFICATION_WORKER_API_KEY untuk otorisasi
    if (apiKey !== process.env.NOTIFICATION_WORKER_API_KEY) {
      console.log('Unauthorized attempt to access cron notification endpoint');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Dapatkan parameter frekuensi dari URL
    const url = new URL(request.url);
    const frequency = url.searchParams.get('frequency') || 'daily';
    
    if (!['hourly', 'daily', 'weekly'].includes(frequency)) {
      return NextResponse.json({ 
        error: 'Invalid frequency parameter',
        message: 'Frequency must be one of: hourly, daily, weekly'
      }, { status: 400 });
    }
    
    console.log(`Menjalankan notifikasi otomatis (${frequency}) via cron job:`, new Date().toISOString());
    
    // Ambil pengguna berdasarkan preferensi frekuensi
    const users = await getUsersByFrequency(frequency as 'hourly' | 'daily' | 'weekly');
    
    if (users.length === 0) {
      console.log(`Tidak ada pengguna dengan preferensi frekuensi ${frequency}`);
      return NextResponse.json({
        success: true,
        message: `Tidak ada pengguna dengan preferensi frekuensi ${frequency}`,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Mengirim notifikasi ke ${users.length} pengguna dengan frekuensi ${frequency}`);
    
    // Jalankan worker notifikasi dengan daftar pengguna berdasarkan frekuensi
    const result = await runNotificationWorker(users);
    
    console.log(`Notifikasi otomatis (${frequency}) berhasil: ${result?.notifikasi?.length || 0} notifikasi dibuat`);
    
    return NextResponse.json({
      success: true,
      message: `Notifikasi otomatis (${frequency}) berhasil dijalankan: ${result?.notifikasi?.length || 0} notifikasi dibuat untuk ${users.length} pengguna`,
      timestamp: new Date().toISOString(),
      frequency,
      userCount: users.length
    });
  } catch (error) {
    console.error('Error running cron notification:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * Mengambil daftar pengguna berdasarkan preferensi frekuensi notifikasi
 * @param frequency - Frekuensi notifikasi (hourly, daily, weekly)
 * @returns Array pengguna
 */
async function getUsersByFrequency(frequency: 'hourly' | 'daily' | 'weekly') {
  try {
    const userSettingsRef = collection(db, 'userSettings');
    const q = query(
      userSettingsRef,
      where('notificationFrequency', '==', frequency),
      where('enableNotifications', '==', true),
      limit(100) // Batasi 100 pengguna per eksekusi
    );
    
    const snapshot = await getDocs(q);
    
    const users: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users by frequency:', error);
    return [];
  }
}
