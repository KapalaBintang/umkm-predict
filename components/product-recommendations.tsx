"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import { motion } from "framer-motion"

interface Product {
  id: number
  name: string
  category: string
  trend: "up" | "down" | "stable"
  score: number
}

interface ProductRecommendationsProps {
  products: Product[]
}

export function ProductRecommendations({ products }: ProductRecommendationsProps) {
  // Function to get trend icon based on trend direction
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  // Function to get trend text based on trend direction
  const getTrendText = (trend: string) => {
    switch (trend) {
      case "up":
        return "Meningkat"
      case "down":
        return "Menurun"
      default:
        return "Stabil"
    }
  }

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Tidak ada rekomendasi produk</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{product.name}</h3>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  {getTrendIcon(product.trend)}
                  <span className="ml-1">{getTrendText(product.trend)}</span>
                </div>
              </div>
              <div className={`text-xl font-bold ${getScoreColor(product.score)}`}>{product.score}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium mb-2">Rekomendasi Tindakan:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Fokus pada produk dengan skor di atas 80</li>
          <li>• Evaluasi ulang produk dengan skor di bawah 60</li>
          <li>• Pantau tren produk secara berkala</li>
        </ul>
      </div>
    </div>
  )
}
