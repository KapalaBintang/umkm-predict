import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import type { Notification } from "@/components/notification-dropdown"

class NotificationService {
  private readonly collectionName = "notifications"

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          message: data.message,
          read: data.read,
          createdAt: data.createdAt.toDate(),
          link: data.link,
        } as Notification
      })
    } catch (error) {
      console.error("Error getting notifications:", error)
      throw error
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("read", "==", false)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (error) {
      console.error("Error getting unread count:", error)
      throw error
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, this.collectionName, notificationId)
      await updateDoc(notificationRef, {
        read: true
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("read", "==", false)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) return
      
      const batch = writeBatch(db)
      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true })
      })
      
      await batch.commit()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...notification,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()