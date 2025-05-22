"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import LogoUMKM from "./logo-umkm"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "white"
}

export function Logo({ className, size = "md", variant = "default" }: LogoProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"


  const colors = {
    default: {
      primary: isDark ? "#60A5FA" : "#3B82F6", // blue-400 in dark, blue-500 in light
      secondary: isDark ? "#34D399" : "#10B981", // emerald-400 in dark, emerald-500 in light
      accent: isDark ? "#FB923C" : "#F97316", // orange-400 in dark, orange-500 in light
      text: isDark ? "#F1F5F9" : "#1E293B", // slate-100 in dark, slate-800 in light
    },
    white: {
      primary: "#FFFFFF",
      secondary: "#F3F4F6",
      accent: "#F3F4F6",
      text: "#FFFFFF",
    },
  }

  const colorScheme = colors[variant]

  return (
    <div className={cn("flex items-center gap-2", className)}>

      <LogoUMKM size={size} variant={variant} />
      
      <div
        className={cn("flex flex-col", {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
          "text-xl": size === "xl",
        })}
      >
        <span className="font-bold" style={{ color: colorScheme.text }}>
          UMKM
        </span>
        <span className="font-medium" style={{ color: colorScheme.primary }}>
          Predict
        </span>
      </div>
    </div>
  )
}
