"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface GoogleTrendsWidgetProps {
  query?: string
  geo?: string
  title?: string
  description?: string
}

export function GoogleTrendsWidget({
  query = "produk musiman",
  geo = "ID",
  title = "Google Trends",
  description = "Analisis tren pencarian Google",
}: GoogleTrendsWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [query, geo])

  // In a real implementation, we would use the Google Trends API
  // For now, we'll just display a placeholder with the query and geo parameters

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner text="Memuat data Google Trends..." />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Parameter Pencarian:</p>
              <div className="text-sm text-muted-foreground mt-1">
                <p>
                  <span className="font-medium">Query:</span> {query}
                </p>
                <p>
                  <span className="font-medium">Lokasi:</span> {geo}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Tren Relatif:</p>
              <div className="space-y-2">
                {["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"].map((week, index) => {
                  // Generate random percentage between 30 and 100
                  const percentage = Math.floor(Math.random() * 70) + 30
                  return (
                    <motion.div
                      key={week}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      className="flex items-center"
                    >
                      <span className="text-sm w-16">{week}</span>
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                        <div className="h-full bg-primary rounded-md" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="text-sm w-12 text-right">{percentage}%</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="text-sm text-muted-foreground italic text-center mt-4">
              * Data ini adalah simulasi. Untuk data aktual, gunakan Google Trends API.
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export default GoogleTrendsWidget
