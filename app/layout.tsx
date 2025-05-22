import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/constants'; // added

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UMKM Predict - Prediksi Harga Bahan Pokok",
  description: "Aplikasi prediksi harga bahan pokok untuk UMKM sektor kuliner",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value || null;
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="umkm-predict-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
