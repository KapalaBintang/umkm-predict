import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"

export interface ChatMessage {
  id?: string
  userId: string
  content: string
  role: "user" | "assistant"
  timestamp: Timestamp
  category?: string
}

class ChatService {
  private readonly collectionName = "chats"

  async sendMessage(message: Omit<ChatMessage, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), message)
      return docRef.id
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  async getUserMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        orderBy("timestamp", "asc")
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]
    } catch (error) {
      console.error("Error getting user messages:", error)
      throw error
    }
  }
}

export const chatService = new ChatService()