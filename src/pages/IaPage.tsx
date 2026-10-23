import { useLocation, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewAiModule } from '@/lib/permissions'
import { checkProfileScreenAccess } from '@/lib/profile-permissions'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  ScreenAssistente,
  ScreenAgentesAutomacoes,
  ScreenBaseConhecimento,
  ScreenHistoricoAprovacoes,
} from '@/components/ia/screens'

interface IaPageProps {
  screen?: string
}

export function IaPage({ screen: screenProp }: IaPageProps) {
  const { pathname } = useLocation()
  const { slug } = useParams<{ slug?: string }>()
  const { isAuthenticated, loading, userRole } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  const isSup = userRole?.toUpperCase() === 'SUP'
  const isAllowed =
    isSup || canViewAiModule(userRole) || checkProfileScreenAccess(userRole, '/admin/ia', 'v')

  if (!isAllowed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Você não tem permissão para acessar o módulo de Inteligência Artificial.
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

  // 1. Assistente de IA (/admin/ia, /admin/ia/assistente, /admin/ia/dashboard)
  if (
    activeSlug === 'assistente' ||
    activeSlug === 'assistant' ||
    activeSlug === 'dashboard' ||
    pathname === '/admin/ia' ||
    pathname === '/admin/ia/'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenAssistente />
      </div>
    )
  }

  // 2. Agentes e Automações (/admin/ia/agentes-automacoes, /admin/ia/agentes, /admin/ia/automacoes, /admin/ia/fluxos)
  if (
    activeSlug === 'agentes-automacoes' ||
    activeSlug === 'agentes' ||
    activeSlug === 'agents' ||
    activeSlug === 'automacoes' ||
    activeSlug === 'automations' ||
    activeSlug === 'fluxos' ||
    activeSlug === 'flows'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenAgentesAutomacoes />
      </div>
    )
  }

  // 3. Base de Conhecimento (/admin/ia/base-conhecimento, /admin/ia/conhecimento, /admin/ia/treinamento)
  if (
    activeSlug === 'base-conhecimento' ||
    activeSlug === 'knowledge' ||
    activeSlug === 'conhecimento' ||
    activeSlug === 'treinamento' ||
    activeSlug === 'training'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenBaseConhecimento />
      </div>
    )
  }

  // 4. Histórico e Aprovações (/admin/ia/historico-aprovacoes, /admin/ia/historico, /admin/ia/aprovacoes, /admin/ia/configuracoes)
  if (
    activeSlug === 'historico-aprovacoes' ||
    activeSlug === 'historico' ||
    activeSlug === 'history' ||
    activeSlug === 'aprovacoes' ||
    activeSlug === 'approvals' ||
    activeSlug === 'configuracoes' ||
    activeSlug === 'settings'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenHistoricoAprovacoes />
      </div>
    )
  }

  // Fallback padrão: Assistente de IA
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ScreenAssistente />
    </div>
  )
}

export default IaPage
