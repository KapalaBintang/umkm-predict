"use client"

import { Card } from "@/components/ui/card"

import { AvatarFallback } from "@/components/ui/avatar"

import { AvatarImage } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { chatService, type ChatMessage } from "@/lib/services/chat-service"
import { useAuth } from "@/contexts/auth-context"
import { Timestamp } from "firebase/firestore"
import { LoadingSpinner } from "@/components/loading-spinner"
import ProtectedRoute from "@/components/protected-route"
import { ChatMessageItem } from "@/components/chat-message"
import { motion } from "framer-motion"

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [location, setLocation] = useState("Yogyakarta")
  const [category, setCategory] = useState("all")
  const [timeframe, setTimeframe] = useState("30d")

  const { toast } = useToast()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user) {
      loadChatHistory()
    } else {
      setInitialLoading(false)
    }
  }, [user])

  const loadChatHistory = async () => {
    if (!user) return

    try {
      setInitialLoading(true)
      const history = await chatService.getChatHistory(user.uid)

      if (history.length === 0) {
        // Add welcome message if no history
        const welcomeMessage: Omit<ChatMessage, "id"> = {
          userId: user.uid,
          role: "assistant",
          content:
            "Halo! Saya asisten AI Gemini untuk prediksi permintaan produk musiman UMKM. Apa yang ingin Anda ketahui tentang tren produk saat ini?",
          timestamp: Timestamp.now(),
        }

        await chatService.saveMessage(welcomeMessage)
        setMessages([welcomeMessage as ChatMessage])
      } else {
        setMessages(history)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      toast({
        title: "Error",
        description: "Gagal memuat riwayat chat",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    if (isLoading) return
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login untuk menggunakan fitur chat",
        variant: "destructive",
      })
      return
    }

    // Add user message
    const userMessage: Omit<ChatMessage, "id"> = {
      userId: user.uid,
      role: "user",
      content: input,
      timestamp: Timestamp.now(),
      location,
      category: category !== "all" ? category : undefined,
      timeframe,
    }

    setMessages((prev) => [...prev, userMessage as ChatMessage])

    // Clear input and set loading state
    const userInput = input
    setInput("")
    setIsLoading(true)

    try {
      // Save user message to Firebase
      await chatService.saveMessage(userMessage)

      // Call the Gemini API
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userInput,
          location,
          category: category !== "all" ? category : undefined,
          timeframe,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI")
      }

      const data = await response.json()

      // Create AI response message
      const aiMessage: Omit<ChatMessage, "id"> = {
        userId: user.uid,
        role: "assistant",
        content: data.text,
        timestamp: Timestamp.now(),
        location,
        category: category !== "all" ? category : undefined,
        timeframe,
      }

      // Save AI message to Firebase
      await chatService.saveMessage(aiMessage)

      // Add AI response to messages
      setMessages((prev) => [...prev, aiMessage as ChatMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      toast({
        title: "Error",
        description: "Gagal mendapatkan respons dari AI. Silakan coba lagi.",
        variant: "destructive",
      })

      // Add fallback response
      const fallbackMessage: Omit<ChatMessage, "id"> = {
        userId: user.uid,
        role: "assistant",
        content: "Maaf, saya mengalami kesulitan dalam memproses permintaan Anda. Silakan coba lagi nanti.",
        timestamp: Timestamp.now(),
        location,
        category: category !== "all" ? category : undefined,
        timeframe,
      }

      await chatService.saveMessage(fallbackMessage)
      setMessages((prev) => [...prev, fallbackMessage as ChatMessage])
    } finally {
      setIsLoading(false)
      // Focus the input field after sending
      inputRef.current?.focus()
    }
  }

  return (
    <ProtectedRoute>
        <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-4 border-b"
          >
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-primary mr-2" />
              <h1 className="text-xl font-bold">Chat dengan AI Gemini</h1>
            </div>
            <div className="text-sm text-muted-foreground hidden md:block">Tanyakan tentang tren produk musiman</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-wrap gap-2 p-2 border-b bg-muted/30 overflow-x-auto"
          >
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full sm:w-[140px] h-8">
                <SelectValue placeholder="Pilih Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="Bandung">Bandung</SelectItem>
                <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                <SelectItem value="Surabaya">Surabaya</SelectItem>
                <SelectItem value="Bali">Bali</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[140px] h-8">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="hampers">Hampers & Parcel</SelectItem>
                <SelectItem value="kue">Kue & Makanan</SelectItem>
                <SelectItem value="souvenir">Souvenir & Hadiah</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full sm:w-[140px] h-8">
                <SelectValue placeholder="Jangka Waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="30d">30 Hari</SelectItem>
                <SelectItem value="90d">90 Hari</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {initialLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner text="Memuat riwayat chat..." />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <ChatMessageItem
                  key={message.id || index}
                  message={message}
                  userPhotoURL={user?.photoURL}
                  userDisplayName={user?.displayName}
                  index={index}
                />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[90%] md:max-w-[80%] flex-row gap-2">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Card className="px-4 py-3 bg-muted">
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Menganalisis tren produk musiman...</span>
                        </div>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 border-t"
          >
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                placeholder="Tanyakan tentang tren produk musiman..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                className="flex-1"
                disabled={isLoading || initialLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || initialLoading || !input.trim()}
                className="transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menganalisis
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
    
    </ProtectedRoute>
  )
}
