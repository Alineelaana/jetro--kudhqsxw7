import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from 'react-router-dom'
import { AdminLogin } from '@/components/admin-login'
import { Loader2, HandCoins } from 'lucide-react'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { cn } from '@/lib/utils'
import { canViewSA } from '@/lib/supplier-allowance-permissions'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const VERBAS_NAV_ITEMS = [
  { label: 'Cockpit', route: '/admin/verbas/cockpit' },
  { label: 'Gestão de Acordos', route: '/admin/verbas/acordos' },
  { label: 'Conta Corrente', route: '/admin/verbas/conta-corrente' },
  { label: 'Movimentações', route: '/admin/verbas/movimentacoes' },
  { label: 'Apurações', route: '/admin/verbas/apuracoes' },
  { label: 'Aplicação em Produtos', route: '/admin/verbas/aplicacao-produtos' },
  { label: 'Consumos', route: '/admin/verbas/consumos' },
  { label: 'Prestação de Contas', route: '/admin/verbas/prestacao-contas' },
  { label: 'Verbas por Fornecedor', route: '/admin/verbas/por-fornecedor' },
  { label: 'Cotações Externas', route: '/admin/verbas/cotacoes-externas' },
]

export function SaLayout({
  children,
  title = 'Verbas de Fornecedores',
}: {
  children: ReactNode
  title?: string
}) {
  const { isAuthenticated, loading, userRole } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewSA(userRole)) return <AdminLogin />
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={HandCoins}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Verbas', to: '/admin/verbas' },
          { label: title },
        ]}
      />
      <div className="flex flex-col lg:flex-row gap-4">
        <aside className="lg:w-52 shrink-0">
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="border-b border-gray-100 px-3 py-2">
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-gray-500"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" /> Voltar ao Dashboard
                </Button>
              </Link>
            </div>
            <div className="p-1.5 space-y-0.5">
              {VERBAS_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.route
                return (
                  <Link
                    key={item.route}
                    to={item.route}
                    className={cn(
                      'block px-3 py-1.5 rounded text-sm transition-colors',
                      isActive
                        ? 'bg-[#005B2E] text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
