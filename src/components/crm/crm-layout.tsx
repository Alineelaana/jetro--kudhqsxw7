import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Users } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/crm', label: 'Dashboard', icon: '📊' },
  { to: '/admin/crm/leads', label: 'Leads', icon: '🎯' },
  { to: '/admin/crm/oportunidades', label: 'Oportunidades', icon: '💼' },
  { to: '/admin/crm/funil', label: 'Funil de Vendas', icon: '🔻' },
  { to: '/admin/crm/agenda', label: 'Agenda', icon: '📅' },
  { to: '/admin/crm/propostas', label: 'Propostas', icon: '📄' },
  { to: '/admin/crm/historico', label: 'Histórico', icon: '📋' },
  { to: '/admin/crm/atividades', label: 'Atividades', icon: '⚡' },
  { to: '/admin/crm/motivos-perda', label: 'Motivos de Perda', icon: '❌' },
  { to: '/admin/crm/metas', label: 'Metas', icon: '🏆' },
  { to: '/admin/crm/automacao', label: 'Automação', icon: '🤖' },
  { to: '/admin/crm/relatorios', label: 'Relatórios', icon: '📈' },
]

export function CrmLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated) return <AdminLogin />
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#005B2E]" />
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
