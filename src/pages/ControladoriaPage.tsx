import { useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewControladoria } from '@/lib/controladoria-permissions'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

import {
  ScreenDreDemonstracoes,
  ScreenPlanejamento,
  ScreenFechamentoConsolidacao,
  ScreenSimuladorCenarios,
  ScreenConfiguracoesVisoes,
} from '@/components/controladoria/screens'

interface ControladoriaPageProps {
  screen?: string
}

export function ControladoriaPage({ screen: screenProp }: ControladoriaPageProps) {
  const { pathname } = useLocation()
  const { slug } = useParams<{ slug?: string }>()
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  const allowed = canViewControladoria(user?.role)
  if (!allowed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Você não tem permissão para acessar o módulo de Controladoria Corporativa.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
    )
  }

  const activeSlug = screenProp || slug || ''

  // 1. DRE e Demonstrações
  if (
    activeSlug === 'dre-demonstracoes' ||
    activeSlug === 'dre' ||
    activeSlug === 'dre-analitica' ||
    activeSlug === 'ebitda' ||
    activeSlug === 'balanco' ||
    pathname === '/admin/controladoria' ||
    pathname === '/admin/controladoria/'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenDreDemonstracoes />
      </div>
    )
  }

  // 2. Planejamento
  if (
    activeSlug === 'planejamento' ||
    activeSlug === 'budget' ||
    activeSlug === 'forecast' ||
    activeSlug === 'drivers' ||
    activeSlug === 'centros' ||
    activeSlug === 'centros-resultado'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenPlanejamento />
      </div>
    )
  }

  // 3. Fechamento e Consolidação
  if (
    activeSlug === 'fechamento-consolidacao' ||
    activeSlug === 'fechamento' ||
    activeSlug === 'consolidacao' ||
    activeSlug === 'reclassificacoes' ||
    activeSlug === 'materialidade'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenFechamentoConsolidacao />
      </div>
    )
  }

  // 4. Simulador de Cenários
  if (activeSlug === 'simulador' || activeSlug === 'simulador-cenarios') {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenSimuladorCenarios />
      </div>
    )
  }

  // 5. Configurações e Visões
  if (
    activeSlug === 'configuracoes' ||
    activeSlug === 'visoes' ||
    activeSlug === 'visoes-salvas' ||
    activeSlug === 'comentarios'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenConfiguracoesVisoes />
      </div>
    )
  }

  // Fallback padrão: DRE e Demonstrações
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ScreenDreDemonstracoes />
    </div>
  )
}

export default ControladoriaPage
