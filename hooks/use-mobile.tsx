"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Fungsi untuk memeriksa apakah layar adalah mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Periksa saat komponen dimuat
    checkIfMobile()

    // Tambahkan event listener untuk resize
    window.addEventListener("resize", checkIfMobile)

    // Bersihkan event listener saat komponen unmount
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}
