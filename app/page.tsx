"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Calendar, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { AnimatedContainer } from "@/components/ui/animated-container";

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Chat AI Assistant",
      description: "Dapatkan insight dan prediksi tren produk musiman melalui chat interaktif dengan AI Assistant",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Analisis Tren",
      description: "Visualisasi data tren pasar dan analisis mendalam untuk produk musiman UMKM",
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Kalender Musiman",
      description: "Jadwal event penting dan rekomendasi persiapan produk untuk memaksimalkan penjualan",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section dengan gradient yang lebih menarik */}
      <header className="relative bg-gradient-to-b from-primary/20 via-primary/5 to-background overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 2 }} className="absolute inset-0 bg-grid-white/[0.2] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-4 bg-background/50 backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-primary">AI-Powered</span>
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Prediksi Tren Produk Musiman dengan{" "}
                <span className="text-primary relative">
                  InstaTrend
                  <motion.div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/30 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">Solusi cerdas berbasis AI untuk membantu UMKM menganalisis tren pasar dan memprediksi permintaan produk musiman dengan akurat.</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button size="lg" asChild className="text-lg group">
                  <Link href={user ? "/use/dashboard" : "/register"}>
                    {user ? "Buka Dashboard" : "Mulai Sekarang"}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <Link href="/login">{user ? "Lihat Tren Terbaru" : "Login"}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur-2xl opacity-20 animate-pulse" />
                <div className="relative bg-card border rounded-lg overflow-hidden shadow-2xl">
                  <div className="p-4 bg-primary/10 border-b flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium">InstaTrend Dashboard</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="h-8 bg-muted rounded-md w-3/4 animate-pulse" />
                    <div className="h-32 bg-muted rounded-md animate-pulse" />
                    <div className="flex gap-4">
                      <div className="h-20 bg-muted rounded-md w-1/2 animate-pulse" />
                      <div className="h-20 bg-muted rounded-md w-1/2 animate-pulse" />
                    </div>
                    <div className="h-24 bg-muted rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section dengan card yang lebih menarik */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedContainer animation="slide-up" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Fitur Utama</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Tingkatkan strategi bisnis musiman Anda dengan insight berbasis AI</p>
          </AnimatedContainer>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedContainer key={index} animation="slide-up" delay={index * 100 + 200}>
                <Card className="group h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader>
                    <div className="mb-4 p-3 bg-primary/10 w-fit rounded-xl group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section dengan desain yang lebih modern */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedContainer animation="slide-up" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Mulai dengan Mudah</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Tiga langkah sederhana untuk memulai perjalanan analisis tren produk Anda</p>
          </AnimatedContainer>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 -z-10" />
            {[
              {
                step: "1",
                title: "Daftar & Login",
                description: "Buat akun dan masukkan informasi bisnis UMKM Anda",
              },
              {
                step: "2",
                title: "Pilih Kategori",
                description: "Tentukan kategori produk musiman yang ingin Anda analisis",
              },
              {
                step: "3",
                title: "Dapatkan Insight",
                description: "Akses dashboard dengan prediksi tren dan rekomendasi produk",
              },
            ].map((item, index) => (
              <AnimatedContainer key={index} animation="slide-up" delay={index * 100 + 200}>
                <div className="flex flex-col items-center text-center group">
                  <div className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">{item.step}</div>
                  <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section dengan desain yang lebih menarik */}
      <section className="py-24 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedContainer animation="slide-up">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Siap Meningkatkan Bisnis Musiman Anda?</h2>
              <p className="text-xl text-muted-foreground mb-12">Dapatkan akses ke insight berbasis AI dan prediksi tren produk musiman sekarang juga dengan InstaTrend.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" asChild className="text-lg group">
                  <Link href={user ? "/use/dashboard" : "/register"}>
                    {user ? "Buka Dashboard" : "Daftar Sekarang"}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg">
                  <Link href="/chat">Coba Chat AI</Link>
                </Button>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* Footer dengan desain yang lebih modern */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <span className="font-bold text-2xl">InstaTrend</span>
            </div>
            <div className="text-muted-foreground">© {new Date().getFullYear()} InstaTrend. Semua hak dilindungi.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
