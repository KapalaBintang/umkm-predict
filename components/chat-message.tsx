"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { ChatMessage } from "@/lib/services/chat-service"
import { Timestamp } from "firebase/firestore"

interface ChatMessageProps {
  message: ChatMessage
  userPhotoURL?: string | null
  userDisplayName?: string | null
  index: number
}

export function ChatMessageItem({ message, userPhotoURL, userDisplayName, index }: ChatMessageProps) {
  const timestamp =
    message.timestamp instanceof Timestamp
      ? message.timestamp.toDate()
      : message.timestamp instanceof Date
        ? message.timestamp
        : new Date()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 > 1 ? 0 : index * 0.1 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[90%] md:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"} gap-2`}
      >
        {message.role === "assistant" ? (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={userPhotoURL || "/placeholder.svg?height=32&width=32"} />
            <AvatarFallback>{userDisplayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
            <Card
              className={`px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
            </Card>
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1 px-1">{formatTime(timestamp)}</div>
        </div>
      </div>
    </motion.div>
  )
}
