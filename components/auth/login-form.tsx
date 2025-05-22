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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"
import { signInWithGoogle } from "@/lib/auth"
import { createSession } from "@/actions/auth-actions"
import { createOrUpdateUser } from "@/lib/services/user-service"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi form sederhana
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Email dan password harus diisi",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const userUid = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      if (userUid) {
        await createSession(userUid.user.uid);
      }

      await createOrUpdateUser(userUid.user.uid, {
        name: userUid.user.displayName || "Google User",
        email: userUid.user.email || "",
        role: "user" // Default role
      })

      toast({
        title: "Login berhasil",
        description: "Anda berhasil masuk ke akun Anda",
      })

      // Redirect ke dashboard
      router.push("/prediksi")
    } catch (error) {
      toast({
        title: "Login gagal",
        description: "Email atau password salah",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true)

      const userUid = await signInWithGoogle();

      if (userUid) {
        await createSession(userUid.user.uid);
      }

      await createOrUpdateUser(userUid.user.uid, {
        name: userUid.user.displayName || "Google User",
        email: userUid.user.email || "",
        role: "user" // Default role
      })

      toast({
        title: "Login berhasil",
        description: "Anda berhasil masuk dengan Google",
      })

      // Redirect ke dashboard
      router.push("/prediksi")
    } catch (error) {
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm sm:text-base">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs sm:text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>
        <Button type="submit" className="w-full h-9 sm:h-10 mt-2 text-sm sm:text-base" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Memproses..." : "Login"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Atau lanjutkan dengan</span>
        </div>
      </div>

      <GoogleButton
        text="Login dengan Google"
        onClick={loginWithGoogle}
        disabled={isLoading}
      />

      <div className="text-center text-xs sm:text-sm">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </div>
  )
}
