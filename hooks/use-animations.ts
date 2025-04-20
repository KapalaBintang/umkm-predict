"use client"

import { useState, useEffect } from "react"

export function useAnimationOnMount() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    return () => clearTimeout(timeout)
  }, [])

  return isVisible
}

export function useAnimationOnScroll(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, threshold])

  return [setRef, isVisible] as const
}
