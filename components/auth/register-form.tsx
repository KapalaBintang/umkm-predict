"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { GoogleButton } from "./oauth-buttons"
import { createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase"
import { signInWithGoogle } from "@/lib/auth"
import { createSession } from "@/actions/auth-actions"
import { createOrUpdateUser } from "@/lib/services/user-service"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password harus minimal 8 karakter",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Buat akun dengan Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      // Simpan data user ke Firestore
      await createOrUpdateUser(userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        role: "user" // Default role
      })

      // Buat session
      await createSession(userCredential.user.uid)

      await createOrUpdateUser(userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        role: "user" // Default role
      })

      toast({
        title: "Registrasi berhasil",
        description: "Akun Anda berhasil dibuat",
      })

      // Redirect ke dashboard
      router.push("/prediksi")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registrasi gagal",
        description: "Terjadi kesalahan saat membuat akun",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
      try {
        setIsLoading(true)
  
        const result = await signInWithGoogle()

        if (result && result.user) {
          // Simpan data user ke Firestore
          await createOrUpdateUser(result.user.uid, {
            name: result.user.displayName || "Google User",
            email: result.user.email || "",
            role: "user" // Default role
          })
          
          // Buat session
          await createSession(result.user.uid)
          
          toast({
            title: "Login berhasil",
            description: "Anda berhasil masuk dengan Google",
          })
    
          // Redirect ke dashboard
          router.push("/prediksi")
        }
      } catch (error) {
        console.error("Google login error:", error)
        toast({
          title: "Login gagal",
          description: "Terjadi kesalahan saat login dengan Google",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

  return (
    <div className="space-y-5 sm:space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm sm:text-base">
            Nama Lengkap
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Masukkan nama lengkap"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className="h-9 sm:h-10 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm sm:text-base">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@example.com"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className="h-9 sm:h-10 text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm sm:text-base">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Minimal 8 karakter</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
            Konfirmasi Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="sr-only">{showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full h-9 sm:h-10 mt-2 text-sm sm:text-base" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Atau daftar dengan</span>
        </div>
      </div>

      <GoogleButton
        text="Daftar dengan Google"
        onClick={loginWithGoogle}
        disabled={isLoading}
      />

      <div className="text-center text-xs sm:text-sm">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Login sekarang
        </Link>
      </div>
    </div>
  )
}
