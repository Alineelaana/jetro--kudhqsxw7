import { useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Loader2 } from 'lucide-react'

import {
  ScreenCentralChamados,
  ScreenPainelChamados,
  ScreenSla,
} from '@/components/chamados/screens'

interface ChamadosPageProps {
  screen?: 'central' | 'painel' | 'sla' | 'meus-chamados' | 'painel-sla'
}

export function ChamadosPage({ screen: screenProp }: ChamadosPageProps) {
  const { pathname } = useLocation()
  const { slug } = useParams<{ slug?: string }>()
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  const activeSlug = screenProp || slug || ''

  // 1. Central de Chamados (unifica Meus Chamados e Novo Chamado em sub-abas)
  if (
    activeSlug === 'central' ||
    activeSlug === 'meus-chamados' ||
    pathname === '/admin/chamados' ||
    pathname === '/admin/chamados/' ||
    pathname.startsWith('/admin/chamados/central') ||
    pathname.startsWith('/admin/chamados/meus-chamados')
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenCentralChamados />
      </div>
    )
  }

  // 2. Painel de Chamados
  if (
    activeSlug === 'painel' ||
    pathname === '/admin/chamados/painel' ||
    pathname.startsWith('/admin/chamados/painel')
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenPainelChamados />
      </div>
    )
  }

  // 3. Gestão de SLA
  if (
    activeSlug === 'sla' ||
    activeSlug === 'painel-sla' ||
    pathname === '/admin/chamados/sla' ||
    pathname.startsWith('/admin/chamados/sla') ||
    pathname.startsWith('/admin/chamados/painel-sla')
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenSla />
      </div>
    )
  }

  // Fallback padrão: Central de Chamados
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ScreenCentralChamados />
    </div>
  )
}

export default ChamadosPage
