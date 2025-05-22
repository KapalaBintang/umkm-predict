import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 md:p-8">
     

      <Card className="w-full max-w-[90%] sm:max-w-md md:max-w-lg shadow-lg">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6">
          <div className="mx-auto mb-4 hidden sm:block">
            <Logo size="lg" className="mx-auto" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-sm sm:text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">{children}</CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs sm:text-sm text-muted-foreground px-4 sm:px-6 pb-6">
          <p>
            Dengan melanjutkan, Anda menyetujui{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Syarat dan Ketentuan
            </a>{" "}
            serta{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Kebijakan Privasi
            </a>{" "}
            kami.
          </p>
          <p>© {new Date().getFullYear()} UMKM Predict. Hak Cipta Dilindungi.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
