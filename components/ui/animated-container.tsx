"use client"

import { useAnimationOnMount, useAnimationOnScroll } from "@/hooks/use-animations"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type AnimationType = "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "none"

interface AnimatedContainerProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
  onScroll?: boolean
  threshold?: number
}

export function AnimatedContainer({
  children,
  animation = "fade-in",
  delay = 0,
  duration = 300,
  className,
  onScroll = false,
  threshold = 0.1,
}: AnimatedContainerProps) {
  const isVisibleOnMount = useAnimationOnMount()
  const [ref, isVisibleOnScroll] = useAnimationOnScroll(threshold)

  const isVisible = onScroll ? isVisibleOnScroll : isVisibleOnMount

  const getAnimationClasses = (type: AnimationType) => {
    switch (type) {
      case "fade-in":
        return "opacity-0 transition-opacity"
      case "slide-up":
        return "opacity-0 translate-y-4 transition-all"
      case "slide-down":
        return "opacity-0 -translate-y-4 transition-all"
      case "slide-left":
        return "opacity-0 translate-x-4 transition-all"
      case "slide-right":
        return "opacity-0 -translate-x-4 transition-all"
      case "scale":
        return "opacity-0 scale-95 transition-all"
      case "none":
        return ""
      default:
        return "opacity-0 transition-opacity"
    }
  }

  return (
    <div
      ref={onScroll ? ref : undefined}
      className={cn(
        getAnimationClasses(animation),
        isVisible && "opacity-100 translate-x-0 translate-y-0 scale-100",
        className,
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
