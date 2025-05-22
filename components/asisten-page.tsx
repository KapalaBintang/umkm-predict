"use client"

import { useState, useRef, useEffect } from "react"
import { MainLayout } from "./main-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles, Trash2, MessageSquare, Clock } from "lucide-react"
import { useUserSession } from "@/hooks/use-user-session"
import { chatService, getChats, deleteChat } from "@/lib/services/chatService"
import { FirebaseChatData } from "@/types/ChatTypes"
import { Timestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import formatTime from "@/lib/formatTime"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"


type ChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}



const initialMessages: ChatMessage[] = [
  {
    id: "1",
    content:
      "Halo! Saya Asisten UMKM, siap membantu Anda dengan pertanyaan seputar bisnis kuliner dan prediksi harga bahan pokok. Apa yang bisa saya bantu hari ini?",
    role: "assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
]

const bubbleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

const typingIndicatorVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" } }
}


export function AsistenPage() {
  const user = useUserSession()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputMessage, setInputMessage] = useState("")
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  
  // Tambahkan CSS untuk styling markdown di dalam chat
  useEffect(() => {
    // Pastikan style hanya ditambahkan sekali
    if (!document.getElementById('markdown-styles')) {
      const style = document.createElement('style')
      style.id = 'markdown-styles'
      style.innerHTML = `
        .markdown-content pre {
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 0.375rem;
          padding: 0.75rem;
          margin: 0.75rem 0;
          overflow-x: auto;
        }
        .dark .markdown-content pre {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .markdown-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        .markdown-content hr {
          border: none;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
        }
        .dark .markdown-content hr {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        const previousChats = await getChats(user.uid) as FirebaseChatData[]
        if (previousChats.length > 0) {
          const latestChat = previousChats[0]
          const chatHistory: ChatMessage[] = latestChat.history.map(msg => ({
            id: Date.now().toString() + Math.random(),
            content: msg.content,
            role: msg.role,
            timestamp: latestChat.timestamp.toDate()
          }))
    
          setHistory(chatHistory)
          setMessages([...initialMessages, ...chatHistory])
        }
      }
    }
    
    loadChats()
  }, [user])

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
  
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
  
    try {

      console.log(history)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputMessage,
          history,
        }),
      });
  
      if (!response.body) throw new Error("No response body");
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiContent = "";
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiContent += decoder.decode(value, { stream: true });
      }
  
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        role: "assistant",
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, aiMessage]);
      const newHistory = [...history, userMessage, aiMessage];
      setHistory(newHistory);
  
      // ✅ Simpan ke Firebase (termasuk jawaban AI)
      if (user) {
        await chatService({
          prompt: inputMessage,
          history: newHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          userUid: user.uid,
          timestamp: Timestamp.fromDate(new Date()),
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const deleteChatMessages = async () => {
    if (user) {
      await deleteChat(user?.uid)
    }
    setMessages(initialMessages)
    setHistory([])
  }


  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asisten UMKM</h1>
          <p className="text-muted-foreground">
            Tanyakan tentang prediksi harga, strategi bisnis, dan rekomendasi untuk usaha kuliner Anda.
          </p>
        </div>

        <Card className="flex flex-col h-[calc(100vh-100px)] border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-950 dark:to-gray-900">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Asisten Bisnis Kuliner
                </CardTitle>
                <CardDescription className="text-blue-100">Asisten AI untuk membantu bisnis kuliner Anda</CardDescription>
              </div>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by Gemini
              </Badge>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <DialogTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:text-red-500 transition-all"
      onClick={() => setShowDeleteDialog(true)}
    >
      <Trash2 className="w-5 h-5" />
    </Button>
  </DialogTrigger>

 <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Hapus semua pesan?</DialogTitle>
    </DialogHeader>
    <p className="text-sm text-muted-foreground">Tindakan ini tidak dapat dibatalkan. Semua riwayat chat akan terhapus permanen.</p>

    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <Button variant="outline">Batal</Button>
      </DialogClose>
      <Button
        variant="destructive"
        onClick={() => {
          deleteChatMessages()
          setShowDeleteDialog(false)
        }}
      >
        Hapus
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto scrollbar-thin p-4 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-950/10">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <motion.div 
                  key={message.id} 
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  initial="hidden"
                  animate="visible"
                  variants={bubbleVariants}
                  custom={index}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {message.role === "assistant" && (
                      <Avatar className="h-10 w-10 mt-1 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl p-4 shadow-md",
                        message.role === "user" 
                          ? "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground rounded-tr-none" 
                          : "bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-blue-900 rounded-tl-none"
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Asisten UMKM</span>
                          </div>
                        )}
                        <div className={cn(
                          "text-sm leading-relaxed",
                          message.role === "assistant" && "prose prose-blue dark:prose-invert max-w-none"
                        )}>
                          {message.role === "assistant" ? (
                            <div className="markdown-content">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                components={{
                                  // Kustomisasi tampilan elemen markdown
                                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-md font-bold mt-3 mb-2" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                                  code: ({node, ...props}) => 
                                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded text-xs" {...props} />,
                                  table: ({node, ...props}) => <table className="border-collapse border border-gray-300 my-2 text-xs" {...props} />,
                                  th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-800" {...props} />,
                                  td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 dark:border-blue-700 pl-3 italic my-2" {...props} />,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            message.content
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className={cn(
                            "h-3 w-3",
                            message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          )} />
                          <p
                            className={cn(
                              "text-xs",
                              message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-10 w-10 mt-1 ring-2 ring-primary/20 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <Avatar className="h-10 w-10 mt-1 ring-2 ring-blue-200 dark:ring-blue-800 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl p-4 shadow-md bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-blue-900 rounded-tl-none">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((dot) => (
                            <motion.div
                              key={dot}
                              className="h-2 w-2 rounded-full bg-blue-500"
                              initial={{ opacity: 0.3 }}
                              animate={{ opacity: 1 }}
                              transition={{ 
                                duration: 0.6, 
                                repeat: Infinity, 
                                repeatType: "reverse", 
                                delay: dot * 0.2 
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Asisten sedang mengetik...</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="border-t border-blue-100 dark:border-blue-900 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex w-full items-center gap-3"
            >
              <Input
                placeholder="Ketik pesan Anda di sini..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500 shadow-sm"
              />
              <Button 
                type="submit" 
                disabled={inputMessage.trim() === "" || isTyping}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md"
              >
                <Send className="h-4 w-4 mr-2" />
                Kirim
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Contoh pertanyaan */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-950 dark:to-gray-900">
          <CardHeader className="border-b border-blue-100 dark:border-blue-900">
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Apa yang bisa ditanyakan?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <motion.div 
                className="rounded-xl border-0 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h3 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Prediksi Harga</h3>
                <p className="text-sm text-blue-600/80 dark:text-blue-300/80">
                  "Bagaimana prediksi harga cabai merah untuk bulan depan?"
                </p>
              </motion.div>
              <motion.div 
                className="rounded-xl border-0 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h3 className="font-medium mb-2 text-purple-700 dark:text-purple-400">Strategi Stok</h3>
                <p className="text-sm text-purple-600/80 dark:text-purple-300/80">
                  "Bagaimana cara mengelola stok bahan yang efisien untuk warung makan?"
                </p>
              </motion.div>
              <motion.div 
                className="rounded-xl border-0 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <h3 className="font-medium mb-2 text-teal-700 dark:text-teal-400">Rekomendasi Menu</h3>
                <p className="text-sm text-teal-600/80 dark:text-teal-300/80">
                  "Menu apa yang cocok untuk musim hujan saat ini?"
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
