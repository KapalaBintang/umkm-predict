"use client"

import { AvatarFallback } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, Check, LineChart, Package, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUserSession } from "@/hooks/use-user-session"

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Tambahkan ini di bagian atas komponen, di bawah useState
  const [scrolled, setScrolled] = useState(false)

  const user = useUserSession();

  if (user) {
   console.log("ada user")
   console.log(user) 
  } else {
    console.log("tidak ada user")
  }

  // Tambahkan useEffect untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
          scrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
            : "bg-background"
        }`}
      >
        <div className="flex w-full h-16 items-center justify-evenly gap-16 md:gap-20 lg:gap-56">
        <Logo size="md" />
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10">

            <nav className="hidden md:flex gap-6">
              {[
                { href: "#fitur", label: "Fitur" },
                { href: "#manfaat", label: "Manfaat" },
                { href: "#harga", label: "Harga" },
                { href: "#faq", label: "FAQ" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium transition-colors hover:text-primary group"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 scale-x-0 rounded-full bg-primary transition-transform group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle iconOnly variant="ghost" />
            <div className="hidden md:flex gap-3">
              {user ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Masuk</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Daftar Gratis</Link>
              </Button>
              </>
              )}
             
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="sr-only">Toggle menu</span>
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="container md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {[
                { href: "#fitur", label: "Fitur" },
                { href: "#manfaat", label: "Manfaat" },
                { href: "#harga", label: "Harga" },
                { href: "#faq", label: "FAQ" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t mt-2">
                <Button variant="outline" size="sm" asChild className="justify-center">
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button size="sm" asChild className="justify-center">
                  <Link href="/auth/register">Daftar Gratis</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-slate-950/90 -z-10" />
          <div className="container flex flex-col items-center text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent pb-2">
                Prediksi Harga Bahan Pokok untuk Bisnis Kuliner Anda
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                Optimalkan keuntungan bisnis kuliner Anda dengan prediksi harga bahan pokok yang akurat berbasis AI.
                Buat keputusan bisnis yang lebih cerdas.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Mulai Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#demo">Lihat Demo</Link>
                </Button>
              </div>
            </div>
            <div className="mt-12 md:mt-16 relative w-full max-w-5xl">
              <div className="rounded-xl overflow-hidden border shadow-xl dark:shadow-blue-900/10">
                <Image
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Dashboard UMKM Predict"
                  width={1280}
                  height={720}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                <p className="mt-2 text-sm text-muted-foreground">UMKM Terdaftar</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">95%</div>
                <p className="mt-2 text-sm text-muted-foreground">Akurasi Prediksi</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">15%</div>
                <p className="mt-2 text-sm text-muted-foreground">Peningkatan Profit</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                <p className="mt-2 text-sm text-muted-foreground">Dukungan Pelanggan</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fitur Section */}
        <section id="fitur" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Fitur Unggulan</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                UMKM Predict menyediakan berbagai fitur canggih untuk membantu bisnis kuliner Anda berkembang
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Prediksi Harga Akurat</CardTitle>
                  <CardDescription>
                    Prediksi harga bahan pokok dengan akurasi tinggi menggunakan algoritma AI canggih
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi harga hingga 30 hari ke depan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Akurasi prediksi hingga 95%</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Update data harga real-time</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Analisis Tren Pasar</CardTitle>
                  <CardDescription>
                    Analisis mendalam tentang tren harga bahan pokok untuk perencanaan bisnis yang lebih baik
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Visualisasi data yang interaktif</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Analisis musiman dan tren jangka panjang</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Laporan analisis yang dapat diunduh</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Manajemen Inventori</CardTitle>
                  <CardDescription>Kelola inventori bahan pokok dengan mudah dan efisien</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Pelacakan stok bahan pokok</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Notifikasi stok menipis</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Rekomendasi waktu pembelian optimal</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M14 9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2l2 2v-2h2a2 2 0 0 0 2-2V9z" />
                    </svg>
                  </div>
                  <CardTitle>Asisten AI</CardTitle>
                  <CardDescription>Asisten berbasis AI untuk membantu pengambilan keputusan bisnis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Rekomendasi strategi pembelian</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Analisis dampak perubahan harga</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Jawaban untuk pertanyaan bisnis spesifik</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <CardTitle>Perencanaan Menu</CardTitle>
                  <CardDescription>Rencanakan menu berdasarkan prediksi harga bahan pokok</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Optimasi harga menu</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Rekomendasi menu berdasarkan musim</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Kalkulasi margin keuntungan</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <CardTitle>Notifikasi Cerdas</CardTitle>
                  <CardDescription>Dapatkan notifikasi tentang perubahan harga penting</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Peringatan perubahan harga signifikan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Notifikasi waktu terbaik untuk membeli</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Pengingat stok bahan pokok</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section
          id="demo"
          className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-slate-950/90"
        >
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Lihat Cara Kerjanya</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Jelajahi fitur-fitur UMKM Predict dan lihat bagaimana aplikasi ini dapat membantu bisnis Anda
              </p>
            </div>
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-xl overflow-hidden border shadow-xl dark:shadow-blue-900/10">
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-blue-50 dark:bg-slate-800/50 p-1">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="prediksi">Prediksi Harga</TabsTrigger>
                    <TabsTrigger value="asisten">Asisten AI</TabsTrigger>
                  </TabsList>
                  <TabsContent value="dashboard" className="p-0">
                    <Image
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Dashboard UMKM Predict"
                      width={1280}
                      height={720}
                      className="w-full h-auto"
                    />
                  </TabsContent>
                  <TabsContent value="prediksi" className="p-0">
                    <Image
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Prediksi Harga UMKM Predict"
                      width={1280}
                      height={720}
                      className="w-full h-auto"
                    />
                  </TabsContent>
                  <TabsContent value="asisten" className="p-0">
                    <Image
                      src="/placeholder.svg?height=720&width=1280"
                      alt="Asisten AI UMKM Predict"
                      width={1280}
                      height={720}
                      className="w-full h-auto"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>
          </div>
        </section>

        {/* Manfaat Section */}
        <section id="manfaat" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Manfaat untuk Bisnis Anda</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Lihat bagaimana UMKM Predict dapat membantu bisnis kuliner Anda berkembang
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m8 14 2.5-2.5c.83-.83 2.17-.83 3 0L16 14" />
                        <path d="m16 10-2.5 2.5c-.83.83-2.17-.83-3 0L8 10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Optimalisasi Biaya</h3>
                      <p className="mt-2 text-muted-foreground">
                        Kurangi biaya bahan baku hingga 20% dengan membeli pada waktu yang tepat berdasarkan prediksi
                        harga.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path d="M12 2v20" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Peningkatan Profit</h3>
                      <p className="mt-2 text-muted-foreground">
                        Tingkatkan margin keuntungan hingga 15% dengan strategi penetapan harga yang lebih baik.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <path d="M9 9h.01" />
                        <path d="M15 9h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Kepuasan Pelanggan</h3>
                      <p className="mt-2 text-muted-foreground">
                        Pertahankan kualitas dan konsistensi menu Anda tanpa harus menaikkan harga secara drastis.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Perencanaan yang Lebih Baik</h3>
                      <p className="mt-2 text-muted-foreground">
                        Rencanakan menu dan anggaran dengan lebih baik berdasarkan prediksi harga yang akurat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 relative">
                <div className="relative rounded-xl overflow-hidden border shadow-xl dark:shadow-blue-900/10">
                  <Image
                    src="/placeholder.svg?height=720&width=720"
                    alt="Manfaat UMKM Predict"
                    width={720}
                    height={720}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-slate-950/90">
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Apa Kata Pengguna Kami</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Dengarkan pengalaman dari UMKM yang telah menggunakan platform kami
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "UMKM Predict membantu saya menghemat biaya bahan baku hingga 25%. Saya bisa membeli bahan pada saat
                    harga terbaik dan merencanakan menu dengan lebih efisien."
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        BS
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Budi Santoso</p>
                      <p className="text-sm text-muted-foreground">Warung Makan Barokah</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "Asisten AI sangat membantu dalam memberikan rekomendasi strategi pembelian. Profit bisnis saya
                    meningkat 15% dalam 3 bulan pertama menggunakan UMKM Predict."
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        SW
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Siti Wulandari</p>
                      <p className="text-sm text-muted-foreground">Catering Berkah</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "Fitur notifikasi perubahan harga sangat berguna. Saya tidak perlu lagi memantau harga bahan pokok
                    setiap hari. UMKM Predict melakukannya untuk saya."
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        AP
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Agus Pratama</p>
                      <p className="text-sm text-muted-foreground">Rumah Makan Sejahtera</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Paket Harga</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Pilih paket yang sesuai dengan kebutuhan bisnis Anda
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">Gratis</span>
                    <span className="ml-1 text-sm text-muted-foreground">/selamanya</span>
                  </div>
                  <CardDescription className="mt-4">Untuk UMKM yang baru memulai</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi harga 5 bahan pokok</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi hingga 7 hari ke depan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Notifikasi perubahan harga</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Dukungan email</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/auth/register">Daftar Gratis</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-blue-500 dark:border-blue-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm relative">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    PALING POPULER
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">Rp 99.000</span>
                    <span className="ml-1 text-sm text-muted-foreground">/bulan</span>
                  </div>
                  <CardDescription className="mt-4">Untuk UMKM yang ingin berkembang</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi harga 20 bahan pokok</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi hingga 30 hari ke depan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Asisten AI untuk rekomendasi</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Analisis tren pasar</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Manajemen inventori</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Dukungan prioritas</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/auth/register">Coba 14 Hari Gratis</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">Rp 299.000</span>
                    <span className="ml-1 text-sm text-muted-foreground">/bulan</span>
                  </div>
                  <CardDescription className="mt-4">Untuk bisnis kuliner skala besar</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi harga tidak terbatas</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Prediksi hingga 90 hari ke depan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Asisten AI premium</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Analisis tren pasar lanjutan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Integrasi dengan sistem POS</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Manajer akun dedikasi</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline" asChild>
                    <Link href="/kontak">Hubungi Kami</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-slate-950/90"
        >
          <div className="container">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Pertanyaan Umum</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Jawaban untuk pertanyaan yang sering diajukan
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Bagaimana akurasi prediksi harga UMKM Predict?</AccordionTrigger>
                  <AccordionContent>
                    UMKM Predict menggunakan algoritma AI canggih yang dilatih dengan data historis harga bahan pokok
                    dari berbagai sumber. Akurasi prediksi kami mencapai 95% untuk prediksi jangka pendek (7 hari) dan
                    85% untuk prediksi jangka menengah (30 hari).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Apakah UMKM Predict tersedia untuk semua jenis bisnis kuliner?</AccordionTrigger>
                  <AccordionContent>
                    Ya, UMKM Predict dapat digunakan oleh berbagai jenis bisnis kuliner, mulai dari warung makan kecil,
                    katering, restoran, hingga hotel. Kami memiliki database bahan pokok yang komprehensif yang mencakup
                    berbagai jenis bahan yang umum digunakan dalam bisnis kuliner.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Bagaimana cara kerja Asisten AI?</AccordionTrigger>
                  <AccordionContent>
                    Asisten AI kami menganalisis data historis harga, tren pasar, dan pola konsumsi bisnis Anda untuk
                    memberikan rekomendasi yang dipersonalisasi. Anda dapat mengajukan pertanyaan spesifik tentang
                    strategi pembelian, perencanaan menu, atau analisis biaya, dan Asisten AI akan memberikan jawaban
                    berdasarkan data dan analisis yang relevan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Apakah data saya aman?</AccordionTrigger>
                  <AccordionContent>
                    Keamanan data adalah prioritas utama kami. Kami menggunakan enkripsi end-to-end untuk melindungi
                    data Anda dan tidak pernah membagikan data individual bisnis Anda kepada pihak ketiga tanpa izin.
                    Kami juga mematuhi regulasi perlindungan data yang berlaku.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Bisakah saya mencoba UMKM Predict sebelum berlangganan?</AccordionTrigger>
                  <AccordionContent>
                    Tentu! Kami menawarkan paket Starter yang gratis selamanya dengan fitur terbatas. Untuk paket Pro,
                    Anda dapat mencoba semua fitur secara gratis selama 14 hari tanpa perlu kartu kredit. Jika Anda
                    tidak puas, Anda dapat berhenti kapan saja tanpa biaya tambahan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>Bagaimana cara mendapatkan dukungan jika saya mengalami masalah?</AccordionTrigger>
                  <AccordionContent>
                    Kami menyediakan berbagai opsi dukungan, termasuk dokumentasi lengkap, tutorial video, dukungan
                    email, dan live chat. Pelanggan Pro dan Enterprise juga mendapatkan akses ke dukungan prioritas
                    dengan waktu respons yang lebih cepat.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold">Siap Mengoptimalkan Bisnis Kuliner Anda?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Bergabunglah dengan ratusan UMKM yang telah meningkatkan profit mereka dengan UMKM Predict
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Mulai Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/kontak">Hubungi Tim Kami</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Uji coba 14 hari tanpa kartu kredit</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="lg" />
              <p className="mt-4 text-muted-foreground max-w-xs">
                Platform prediksi harga bahan pokok berbasis AI untuk membantu UMKM kuliner mengoptimalkan biaya dan
                meningkatkan profit.
              </p>
              <div className="mt-6 flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Produk</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#fitur" className="text-sm text-muted-foreground hover:text-primary">
                    Fitur
                  </Link>
                </li>
                <li>
                  <Link href="#harga" className="text-sm text-muted-foreground hover:text-primary">
                    Harga
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="text-sm text-muted-foreground hover:text-primary">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-sm text-muted-foreground hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Perusahaan</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/tentang" className="text-sm text-muted-foreground hover:text-primary">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/karir" className="text-sm text-muted-foreground hover:text-primary">
                    Karir
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="text-sm text-muted-foreground hover:text-primary">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} UMKM Predict. Hak Cipta Dilindungi.
            </p>
            <div className="flex gap-4">
              <Link href="/kebijakan-privasi" className="text-sm text-muted-foreground hover:text-primary">
                Kebijakan Privasi
              </Link>
              <Link href="/syarat-ketentuan" className="text-sm text-muted-foreground hover:text-primary">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
