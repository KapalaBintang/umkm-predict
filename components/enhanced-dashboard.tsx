"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TrendChart from "./trend-chart"
import { UpcomingEvents } from "./upcoming-events"
import { GoogleTrendsWidget } from "./google-trends-widget"
import { ProductRecommendations } from "./product-recommendations"
import { LoadingSpinner } from "./loading-spinner"
import { AnimatedContainer } from "./ui/animated-container"
import { motion } from "framer-motion"

export default function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [trendData, setTrendData] = useState([])
  const [productData, setProductData] = useState([])
  const [eventData, setEventData] = useState([])

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      try {
        // In a real app, these would be actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setTrendData([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 500 },
          { name: "Apr", value: 200 },
          { name: "May", value: 350 },
          { name: "Jun", value: 600 },
        ])

        setProductData([
          { id: 1, name: "Product A", category: "Electronics", trend: "up", score: 85 },
          { id: 2, name: "Product B", category: "Fashion", trend: "down", score: 65 },
          { id: 3, name: "Product C", category: "Home", trend: "stable", score: 75 },
        ])

        setEventData([
          { id: 1, title: "Market Analysis Review", date: "2023-06-15", time: "10:00 AM" },
          { id: 2, title: "Product Launch Planning", date: "2023-06-18", time: "2:00 PM" },
          { id: 3, title: "Quarterly Strategy Meeting", date: "2023-06-22", time: "9:00 AM" },
        ])

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <LoadingSpinner text="Memuat data dashboard..." />
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Your market trends and business insights at a glance.</p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <motion.div variants={item}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Market Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12.5%</div>
                  <p className="text-xs text-muted-foreground">+4.3% from last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="transition-all duration-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">+18 from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <AnimatedContainer animation="slide-up" delay={200} className="lg:col-span-4">
              <Card className="transition-all duration-300 hover:shadow-md h-full">
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <TrendChart />
                </CardContent>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={300} className="lg:col-span-3">
              <Card className="transition-all duration-300 hover:shadow-md h-full">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingEvents events={eventData} />
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <AnimatedContainer animation="slide-up" delay={400} className="lg:col-span-4">
              <Card className="transition-all duration-300 hover:shadow-md h-full">
                <CardHeader>
                  <CardTitle>Google Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <GoogleTrendsWidget />
                </CardContent>
              </Card>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={500} className="lg:col-span-3">
              <Card className="transition-all duration-300 hover:shadow-md h-full">
                <CardHeader>
                  <CardTitle>Product Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductRecommendations products={productData} />
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnimatedContainer animation="fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Advanced analytics content will appear here.</p>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <AnimatedContainer animation="fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Generated reports will appear here.</p>
              </CardContent>
            </Card>
          </AnimatedContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
