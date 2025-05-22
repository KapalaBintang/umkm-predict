import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Buat Akun Baru"
      description="Daftar untuk mengakses fitur prediksi harga dan rekomendasi untuk bisnis kuliner Anda"
    >
      <RegisterForm />
    </AuthLayout>
  )
}
