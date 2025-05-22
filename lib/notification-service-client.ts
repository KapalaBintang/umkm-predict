import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, where, serverTimestamp, DocumentData, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

// Interface untuk notifikasi
export interface Notifikasi {
  id: string;
  judul: string;
  pesan: string;
  waktu: Date | Timestamp;
  status: "naik" | "turun" | "stabil" | "penting";
  dibaca: boolean;
  icon: string;
  userId?: string;
  targetUrl?: string;
  kategori: "harga" | "produk" | "sistem" | "lainnya";
}

import { INotificationService } from './notification-service';

// Kelas untuk mengelola notifikasi
class NotificationService implements INotificationService {
  private unsubscribe: (() => void) | null = null;
  private isPermissionGranted = false;
  private userId: string | null = null;

  constructor() {
    // Cek apakah browser mendukung notifikasi
    this.checkNotificationSupport();
  }

  // Memeriksa apakah browser mendukung notifikasi
  public checkNotificationSupport(): boolean {
    if (!('Notification' in window)) {
      console.log('Browser ini tidak mendukung notifikasi desktop');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      this.isPermissionGranted = true;
    }
    
    return true;
  }

  // Meminta izin notifikasi
  public async requestPermission(): Promise<boolean> {
    if (!this.checkNotificationSupport()) {
      return false;
    }

    if (Notification.permission === 'granted') {
      this.isPermissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      return this.isPermissionGranted;
    }

    return false;
  }

  // Mengatur ID pengguna
  public setUserId(userId: string) {
    this.userId = userId;
  }

  // Berlangganan notifikasi
  public subscribeToNotifications(callback: (notifications: Notifikasi[]) => void) {
    if (!this.userId) {
      console.error('UserId belum diatur. Panggil setUserId terlebih dahulu.');
      // Retornar um array vazio para evitar carregamento infinito
      callback([]);
      return;
    }

    try {
      // Buat query untuk mendapatkan notifikasi pengguna
      const notifikasiRef = collection(db, 'notifikasi');
      const q = query(
        notifikasiRef,
        where('userId', '==', this.userId),
        orderBy('waktu', 'desc')
      );

      // Berlangganan perubahan
      this.unsubscribe = onSnapshot(q, 
        // OnNext callback
        (snapshot) => {
          const notifications: Notifikasi[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            notifications.push({
              id: doc.id,
              judul: data.judul,
              pesan: data.pesan,
              waktu: data.waktu,
              status: data.status,
              dibaca: data.dibaca,
              icon: data.icon,
              userId: data.userId,
              targetUrl: data.targetUrl,
              kategori: data.kategori
            });
          });

          // Panggil callback com as notificações, mesmo que vazio
          callback(notifications);

          // Cek notifikasi baru yang belum dibaca
          this.checkForNewNotifications(notifications);
        },
        // OnError callback
        (error) => {
          console.error('Error subscribing to notifications:', error);
          // Retornar um array vazio em caso de erro
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
      // Retornar um array vazio em caso de erro
      callback([]);
    }
  }

  // Berhenti berlangganan notifikasi
  public unsubscribeFromNotifications() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Memeriksa notifikasi baru yang belum dibaca
  private checkForNewNotifications(notifications: Notifikasi[]) {
    // Ambil notifikasi baru yang belum dibaca
    const newNotifications = notifications.filter(
      (notif) => !notif.dibaca && 
      (notif.waktu instanceof Timestamp ? 
        notif.waktu.toDate() > new Date(Date.now() - 60000) : 
        notif.waktu > new Date(Date.now() - 60000))
    );

    // Tampilkan notifikasi push untuk setiap notifikasi baru
    newNotifications.forEach((notif) => {
      this.showPushNotification(notif);
    });
  }

  // Menampilkan notifikasi push
  public showPushNotification(notification: Notifikasi): void {
    if (!this.isPermissionGranted) {
      return;
    }

    // Tampilkan notifikasi toast di aplikasi
    toast({
      title: notification.judul,
      description: notification.pesan,
      variant: notification.status === "naik" ? "destructive" : 
               notification.status === "turun" ? "default" : 
               notification.status === "penting" ? "default" : "default",
    });

    // Tampilkan notifikasi browser jika tab tidak aktif
    if (document.visibilityState !== 'visible') {
      const notif = new Notification(notification.judul, {
        body: notification.pesan,
        icon: '/logo.png'
      });

      // Tambahkan event listener untuk klik pada notifikasi
      notif.onclick = () => {
        window.focus();
        if (notification.targetUrl) {
          window.location.href = notification.targetUrl;
        }
      };
    }
  }

  // Menambahkan notifikasi baru
  public async addNotification(notification: Omit<Notifikasi, 'id' | 'waktu'>): Promise<string> {
    try {
      const notifikasiRef = collection(db, 'notifikasi');
      const docRef = await addDoc(notifikasiRef, {
        ...notification,
        waktu: serverTimestamp(),
        dibaca: false
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }

  // Menandai notifikasi sebagai dibaca
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifRef = doc(db, 'notifikasi', notificationId);
      await updateDoc(notifRef, {
        dibaca: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Menandai semua notifikasi sebagai dibaca
  public async markAllAsRead(): Promise<void> {
    if (!this.userId) {
      console.error('UserId belum diatur. Panggil setUserId terlebih dahulu.');
      return;
    }

    try {
      const notifikasiRef = collection(db, 'notifikasi');
      const q = query(
        notifikasiRef,
        where('userId', '==', this.userId),
        where('dibaca', '==', false)
      );

      const querySnapshot = await getDocs(q);
      
      // Gunakan Promise.all untuk menjalankan semua updateDoc secara paralel
      const updatePromises = querySnapshot.docs.map((docSnapshot) => 
        updateDoc(docSnapshot.ref, { dibaca: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Menghapus notifikasi
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifRef = doc(db, 'notifikasi', notificationId);
      await deleteDoc(notifRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  // Mengambil semua notifikasi pengguna
  public async getNotifications(): Promise<Notifikasi[]> {
    if (!this.userId) {
      console.error('UserId belum diatur. Panggil setUserId terlebih dahulu.');
      return [];
    }
    
    try {
      const notifikasiRef = collection(db, 'notifikasi');
      const q = query(
        notifikasiRef, 
        where('userId', '==', this.userId),
        orderBy('waktu', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Notifikasi);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
}

// Ekspor instance singleton
export const notificationService = new NotificationService();

// Fungsi untuk format waktu relatif
export function formatRelativeTime(date: Date | Timestamp): string {
  const now = new Date();
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Baru saja";
  } else if (diffMin < 60) {
    return `${diffMin} menit yang lalu`;
  } else if (diffHour < 24) {
    return `${diffHour} jam yang lalu`;
  } else if (diffDay < 7) {
    return `${diffDay} hari yang lalu`;
  } else {
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}
