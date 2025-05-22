import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Carregamento dinâmico do componente para evitar erros de SSR
const NotifikasiPage = dynamic(
  () => import('@/components/notifikasi-page').then((mod) => mod.NotifikasiPage),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default function Notifikasi() {
  return <NotifikasiPage />
}
