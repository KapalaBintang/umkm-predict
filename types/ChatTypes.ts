import { Timestamp } from "firebase/firestore"

export type FirebaseChatData = {
  id?: string
  prompt: string
  history: {
    role: "user" | "assistant"
    content: string
  }[]
  userUid: string
  timestamp: Timestamp
}