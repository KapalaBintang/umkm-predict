import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Login ke Akun Anda"
      description="Masukkan kredensial Anda untuk mengakses dashboard UMKM Predict"
    >
      <LoginForm />
    </AuthLayout>
  )
}
