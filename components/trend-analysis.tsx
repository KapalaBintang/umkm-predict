"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrendAnalysisProps {
  location: string
  category: string
  timeframe: string
}

export default function TrendAnalysis({ location, category, timeframe }: TrendAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Reset loading state when props change
    setIsLoading(true)

    // Simulate API call with delay
    const timer = setTimeout(() => {
      // Generate mock data based on props
      const mockData = generateMockData(timeframe, category)
      setData(mockData)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [location, category, timeframe])

  // Generate mock data based on timeframe and category
  const generateMockData = (timeframe: string, category: string) => {
    let dates: string[] = []
    let baseValue = 50
    let volatility = 15

    // Adjust dates based on timeframe
    switch (timeframe) {
      case "7d":
        dates = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
        volatility = 20
        break
      case "30d":
        dates = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"]
        volatility = 15
        break
      case "90d":
        dates = ["Jan", "Feb", "Mar"]
        volatility = 10
        break
      default:
        dates = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"]
    }

    // Adjust base value based on category
    switch (category) {
      case "hampers":
        baseValue = 70
        break
      case "kue":
        baseValue = 60
        break
      case "souvenir":
        baseValue = 40
        break
      default:
        baseValue = 50
    }

    // Generate data
    return dates.map((date, index) => {
      const value = Math.max(0, Math.min(100, baseValue + Math.floor(Math.random() * volatility * 2) - volatility))
      const interest = Math.max(
        0,
        Math.min(100, baseValue - 10 + Math.floor(Math.random() * volatility * 2) - volatility),
      )
      const forecast = Math.max(
        0,
        Math.min(100, baseValue + 5 + Math.floor(Math.random() * volatility * 2) - volatility + index * 2),
      )

      return {
        name: date,
        permintaan: value,
        minat: interest,
        prediksi: forecast,
      }
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Analisis Tren {category !== "all" ? `- ${category}` : ""}</CardTitle>
        <CardDescription>
          Analisis tren permintaan produk musiman di {location} dalam{" "}
          {timeframe === "7d" ? "7 hari" : timeframe === "30d" ? "30 hari" : "90 hari"} terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner text="Menganalisis data tren..." />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="permintaan"
                  name="Permintaan"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="minat"
                  name="Minat Pencarian"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                  animationBegin={300}
                />
                <Line
                  type="monotone"
                  dataKey="prediksi"
                  name="Prediksi"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1500}
                  animationBegin={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
