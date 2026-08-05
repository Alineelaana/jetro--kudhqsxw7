import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Bot } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewAiModule } from '@/lib/ai-permissions'

export function AiLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  if (!canViewAiModule(user?.role as string)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-bold text-foreground">Acesso negado</p>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar este módulo.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}
