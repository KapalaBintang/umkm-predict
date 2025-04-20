"use client"

import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  text?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ text, size = "md", className }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center w-full h-full min-h-[200px] ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Loader2 className={`${sizeMap[size]} text-primary`} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )
}
