import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Headset } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/atendimento', label: 'Dashboard', icon: '📊' },
  { to: '/admin/atendimento/novo', label: 'Novo Atendimento', icon: '➕' },
  { to: '/admin/atendimento/abertos', label: 'Abertos', icon: '📂' },
  { to: '/admin/atendimento/andamento', label: 'Em Andamento', icon: '⏳' },
  { to: '/admin/atendimento/pendentes', label: 'Pendentes', icon: '⚠️' },
  { to: '/admin/atendimento/finalizados', label: 'Finalizados', icon: '✅' },
  { to: '/admin/atendimento/motivos', label: 'Motivos', icon: '🏷️' },
  { to: '/admin/atendimento/setores', label: 'Setores', icon: '🏢' },
  { to: '/admin/atendimento/sla', label: 'SLA', icon: '⏱️' },
  { to: '/admin/atendimento/fluxos', label: 'Fluxos Inteligentes', icon: '🔄' },
  { to: '/admin/atendimento/relatorios', label: 'Relatórios', icon: '📈' },
]

export function AtendimentoLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Headset className="w-5 h-5 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">{title}</h2>
        </div>
      </div>
      <nav className="mb-6 flex flex-wrap gap-1.5">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.to}
            variant="outline"
            size="sm"
            asChild
            className="border-[#005B2E]/30 hover:bg-[#005B2E]/5 hover:text-[#005B2E] text-xs"
          >
            <Link to={item.to}>
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      {children}
    </div>
  )
}
