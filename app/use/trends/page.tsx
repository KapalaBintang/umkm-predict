"use client"

import ResponsiveLayout from "@/components/responsive-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import TrendAnalysis from "@/components/trend-analysis"
import GoogleTrendsWidget from "@/components/google-trends-widget"
import { motion } from "framer-motion"
import { AnimatedContainer } from "@/components/ui/animated-container"

export default function TrendsPage() {
  const [category, setCategory] = useState("all")
  const [timeframe, setTimeframe] = useState("30d")
  const [location, setLocation] = useState("Yogyakarta")
  const [searchQuery, setSearchQuery] = useState("produk musiman")

  // Map location to Google Trends geo code
  const locationToGeo: Record<string, string> = {
    Jakarta: "ID-JK",
    Bandung: "ID-JB",
    Yogyakarta: "ID-YO",
    Surabaya: "ID-JI",
    Bali: "ID-BA",
  }

  // Map category to search query for Google Trends
  const categoryToQuery: Record<string, string> = {
    all: "produk musiman",
    hampers: "hampers parcel",
    kue: "kue kering lebaran",
    souvenir: "souvenir handmade",
  }

  // Update search query when category changes
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setSearchQuery(categoryToQuery[value] || "produk musiman")
  }

  // Mock data for social media trends
  const socialMediaData = [
    { platform: "TikTok", hampers: 65, kue: 45, souvenir: 30 },
    { platform: "Instagram", hampers: 55, kue: 50, souvenir: 35 },
    { platform: "YouTube", hampers: 40, kue: 60, souvenir: 25 },
    { platform: "Pinterest", hampers: 35, kue: 30, souvenir: 55 },
    { platform: "Twitter", hampers: 25, kue: 20, souvenir: 15 },
  ]

  // Mock data for product interest by location
  const locationData = [
    { name: "Yogyakarta", value: 35, color: "#22c55e" },
    { name: "Jakarta", value: 25, color: "#3b82f6" },
    { name: "Bandung", value: 20, color: "#f59e0b" },
    { name: "Surabaya", value: 15, color: "#8b5cf6" },
    { name: "Bali", value: 5, color: "#ec4899" },
  ]

  return (
      <div className="p-4 md:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analisis Tren</h2>
            <p className="text-muted-foreground">Insight mendalam tentang tren produk musiman dari berbagai sumber</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="hampers">Hampers & Parcel</SelectItem>
                <SelectItem value="kue">Kue & Makanan</SelectItem>
                <SelectItem value="souvenir">Souvenir & Hadiah</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full sm:w-[180px]">
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

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pilih Jangka Waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                <SelectItem value="90d">90 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedContainer animation="slide-up" delay={200}>
            <TrendAnalysis location={location} category={category} timeframe={timeframe} />
          </AnimatedContainer>
          <AnimatedContainer animation="slide-up" delay={300}>
            <GoogleTrendsWidget
              query={searchQuery}
              geo={locationToGeo[location] || "ID"}
              title="Google Trends Analysis"
              description={`Analisis tren pencarian Google untuk "${searchQuery}"`}
            />
          </AnimatedContainer>
        </div>

        <Tabs defaultValue="social" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="social">Media Sosial</TabsTrigger>
              <TabsTrigger value="search">Pencarian</TabsTrigger>
              <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatedContainer animation="slide-up" delay={400} className="col-span-2">
                <Card hover>
                  <CardHeader>
                    <CardTitle>Tren Media Sosial</CardTitle>
                    <CardDescription>Popularitas produk musiman di berbagai platform media sosial</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={socialMediaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="platform" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="hampers" name="Hampers & Parcel" fill="#22c55e" />
                          <Bar dataKey="kue" name="Kue & Makanan" fill="#3b82f6" />
                          <Bar dataKey="souvenir" name="Souvenir & Hadiah" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer animation="slide-up" delay={500}>
                <Card hover>
                  <CardHeader>
                    <CardTitle>Minat Berdasarkan Lokasi</CardTitle>
                    <CardDescription>Distribusi minat produk musiman berdasarkan lokasi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={locationData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={300}
                            animationDuration={1500}
                          >
                            {locationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <AnimatedContainer animation="fade-in">
              <Card hover>
                <CardHeader>
                  <CardTitle>Analisis Pencarian Google</CardTitle>
                  <CardDescription>Tren pencarian Google untuk produk musiman</CardDescription>
                </CardHeader>
                <CardContent>
                  <GoogleTrendsWidget
                    query={`${searchQuery},produk lebaran,hampers natal`}
                    geo={locationToGeo[location] || "ID"}
                    title="Perbandingan Tren Pencarian"
                    description="Perbandingan tren pencarian untuk beberapa kata kunci produk musiman"
                  />
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="ecommerce" className="space-y-4">
            <AnimatedContainer animation="fade-in">
              <Card hover>
                <CardHeader>
                  <CardTitle>Analisis E-Commerce</CardTitle>
                  <CardDescription>Tren produk musiman di platform e-commerce</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center h-[400px]"
                  >
                    <p className="text-muted-foreground">Data analisis e-commerce akan segera tersedia</p>
                  </motion.div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </div>
  )
}
