import { cn } from "@/lib/utils";

import { useTheme } from "@/components/theme-provider"

interface LogoProps {
    className?: string
    size?: "sm" | "md" | "lg" | "xl"
    variant?: "default" | "white"
  }
  

export default function LogoUMKM({ size = "md", variant = "default" }: LogoProps) {
    const { theme } = useTheme()
    const isDark = theme === "dark"
  
    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    }
  
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
        <div className={cn("relative", sizes[size])}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Outer circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill={isDark ? "#1E293B" : "white"}
            stroke={colorScheme.primary}
            strokeWidth="4"
          />

          {/* Graph element */}
          <path
            d="M25 70 L35 55 L45 60 L60 40 L75 25"
            stroke={colorScheme.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Upward arrow */}
          <path
            d="M65 35 L75 25 L85 35"
            stroke={colorScheme.accent}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Dots on the graph */}
          <circle cx="35" cy="55" r="4" fill={colorScheme.secondary} />
          <circle cx="45" cy="60" r="4" fill={colorScheme.secondary} />
          <circle cx="60" cy="40" r="4" fill={colorScheme.secondary} />
          <circle cx="75" cy="25" r="4" fill={colorScheme.accent} />

          {/* Stylized "P" for Predict */}
          <path
            d="M30 75 C30 75, 40 65, 30 55 C20 45, 30 45, 40 55"
            stroke={colorScheme.secondary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    )
}