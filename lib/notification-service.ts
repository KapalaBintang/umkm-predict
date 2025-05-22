import { collection, addDoc, updateDoc, doc, query, where, serverTimestamp, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Interface untuk NotificationService
export interface INotificationService {
  setUserId(userId: string): void;
  checkNotificationSupport(): boolean;
  requestPermission(): Promise<boolean>;
  subscribeToNotifications(callback: (notifications: Notifikasi[]) => void): void;
  unsubscribeFromNotifications(): void;
  showPushNotification(notification: Notifikasi): void;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  addNotification(notification: Omit<Notifikasi, 'id' | 'waktu'>): Promise<string>;
  getNotifications(): Promise<Notifikasi[]>;
}

// Base class dengan fungsi yang bekerja di server dan client
export class NotificationServiceBase implements Partial<INotificationService> {
  protected userId: string | null = null;

  public setUserId(userId: string): void {
    this.userId = userId;
  }

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

  public async getNotifications(): Promise<Notifikasi[]> {
    try {
      const notifikasiRef = collection(db, 'notifikasi');
      const q = query(notifikasiRef, where('userId', '==', this.userId));
      const querySnapshot = await getDocs(q);

      console.log("Data notifikasi:", querySnapshot.docs.map(doc => doc.data()));
      
      // Gunakan type assertion untuk memberi tahu TypeScript bahwa data sesuai dengan tipe Notifikasi
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Notifikasi);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

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

  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifRef = doc(db, 'notifikasi', notificationId);
      await deleteDoc(notifRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

// Server-safe version that implements the interface but disables browser-specific features
class NotificationServiceSSR extends NotificationServiceBase implements INotificationService {
  public checkNotificationSupport(): boolean {
    return false;
  }

  public async requestPermission(): Promise<boolean> {
    return false;
  }

  public subscribeToNotifications(callback: (notifications: Notifikasi[]) => void): void {
    callback([]);
  }

  public unsubscribeFromNotifications(): void {
    // No-op on server
  }

  public showPushNotification(notification: Notifikasi): void {
    // No-op on server
  }
}

// Helper function untuk memformat waktu relatif
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

// Create and export a service instance that's safe for SSR
let service: INotificationService = new NotificationServiceSSR();

// Only in browser, try to load the actual implementation
if (typeof window !== 'undefined') {
  // We'll replace the implementation when the module is loaded
  import('./notification-service-client').then(module => {
    service = module.notificationService;
  }).catch(err => {
    console.error('Failed to load client notification service:', err);
  });
}

export const notificationService = service;
