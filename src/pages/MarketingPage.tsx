import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewTradeMarketing } from '@/lib/trade-marketing-permissions'
import { canViewSA } from '@/lib/supplier-allowance-permissions'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

import {
  ScreenCentralMarketing,
  ScreenSolicitacoesJobs,
  ScreenBibliotecaTemplates,
  ScreenTradeMarketing,
  ScreenVerbasFornecedor,
  ScreenCotacoesExternas,
  ScreenRelatoriosAuditoriaMarketing,
} from '@/components/marketing/screens'

export function MarketingPage() {
  const { pathname } = useLocation()
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  const allowed = canViewTradeMarketing(user?.role) || canViewSA(user?.role)
  if (!allowed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Você não tem permissão para acessar o módulo Marketing e Verbas.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
    )
  }

  // 1. Central de Marketing e Verbas (rota raiz ou /central ou /dashboard)
  if (
    pathname === '/admin/marketing' ||
    pathname === '/admin/marketing/' ||
    pathname === '/admin/marketing/central' ||
    pathname === '/admin/marketing/dashboard'
  ) {
    return <ScreenCentralMarketing />
  }

  // 2. Solicitações e Jobs
  if (
    pathname === '/admin/marketing/solicitacoes-jobs' ||
    pathname.startsWith('/admin/marketing/solicitacoes-jobs/') ||
    pathname === '/admin/marketing/solicitacoes' ||
    pathname === '/admin/marketing/jobs' ||
    pathname === '/admin/marketing/pecas' ||
    pathname === '/admin/marketing/midia'
  ) {
    return <ScreenSolicitacoesJobs />
  }

  // 3. Biblioteca e Templates
  if (
    pathname === '/admin/marketing/biblioteca-templates' ||
    pathname.startsWith('/admin/marketing/biblioteca-templates/') ||
    pathname === '/admin/marketing/biblioteca' ||
    pathname === '/admin/marketing/templates' ||
    pathname === '/admin/marketing/brand'
  ) {
    return <ScreenBibliotecaTemplates />
  }

  // 4. Trade Marketing
  if (
    pathname === '/admin/marketing/trade-marketing' ||
    pathname.startsWith('/admin/marketing/trade-marketing/') ||
    pathname === '/admin/marketing/trade' ||
    pathname === '/admin/marketing/pdv' ||
    pathname === '/admin/marketing/materiais'
  ) {
    return <ScreenTradeMarketing />
  }

  // 5. Verbas de Fornecedor
  if (
    pathname === '/admin/marketing/verbas-fornecedor' ||
    pathname.startsWith('/admin/marketing/verbas-fornecedor/') ||
    pathname === '/admin/marketing/verbas' ||
    pathname === '/admin/marketing/acordos' ||
    pathname === '/admin/marketing/conta-corrente' ||
    pathname === '/admin/marketing/liquidacoes'
  ) {
    return <ScreenVerbasFornecedor />
  }

  // 6. Cotações Externas
  if (
    pathname === '/admin/marketing/cotacoes-externas' ||
    pathname.startsWith('/admin/marketing/cotacoes-externas/') ||
    pathname === '/admin/marketing/cotacoes'
  ) {
    return <ScreenCotacoesExternas />
  }

  // 7. Relatórios e Auditoria de Marketing
  if (
    pathname === '/admin/marketing/relatorios-auditoria' ||
    pathname.startsWith('/admin/marketing/relatorios-auditoria/') ||
    pathname === '/admin/marketing/relatorios' ||
    pathname === '/admin/marketing/auditoria'
  ) {
    return <ScreenRelatoriosAuditoriaMarketing />
  }

  // Fallback padrão: Central de Marketing
  return <ScreenCentralMarketing />
}

export default MarketingPage
