"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

const mockData = [
  { date: "1 Nov", "Hampers Eco-friendly": 40, "Kue Kering Korea": 24, "Souvenir Handmade": 35 },
  { date: "5 Nov", "Hampers Eco-friendly": 45, "Kue Kering Korea": 28, "Souvenir Handmade": 32 },
  { date: "10 Nov", "Hampers Eco-friendly": 50, "Kue Kering Korea": 35, "Souvenir Handmade": 30 },
  { date: "15 Nov", "Hampers Eco-friendly": 55, "Kue Kering Korea": 40, "Souvenir Handmade": 28 },
  { date: "20 Nov", "Hampers Eco-friendly": 65, "Kue Kering Korea": 45, "Souvenir Handmade": 30 },
  { date: "25 Nov", "Hampers Eco-friendly": 70, "Kue Kering Korea": 50, "Souvenir Handmade": 35 },
  { date: "30 Nov", "Hampers Eco-friendly": 80, "Kue Kering Korea": 55, "Souvenir Handmade": 40 },
]

export default function TrendChart() {
  const [isMounted, setIsMounted] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => setAnimationComplete(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-[200px] md:h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[200px] md:h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#888888" }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            tick={{ fontSize: 10, fill: "#888888" }}
            width={30}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 border shadow-sm bg-background">
                    <div className="text-sm font-bold">{label}</div>
                    {payload.map((entry, index) => (
                      <div key={`item-${index}`} className="text-xs flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
                        <span>
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </Card>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="Hampers Eco-friendly"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            strokeDasharray={animationComplete ? "0" : "1000"}
            strokeDashoffset={animationComplete ? "0" : "1000"}
            style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
          />
          <Line
            type="monotone"
            dataKey="Kue Kering Korea"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            strokeDasharray={animationComplete ? "0" : "1000"}
            strokeDashoffset={animationComplete ? "0" : "1000"}
            style={{ transition: "stroke-dashoffset 1.5s ease-in-out 0.3s" }}
          />
          <Line
            type="monotone"
            dataKey="Souvenir Handmade"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            strokeDasharray={animationComplete ? "0" : "1000"}
            strokeDashoffset={animationComplete ? "0" : "1000"}
            style={{ transition: "stroke-dashoffset 1.5s ease-in-out 0.6s" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
