import { useLocation, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Loader2 } from 'lucide-react'

import {
  ScreenCentralChamados,
  ScreenMeusChamados,
  ScreenPainelSla,
} from '@/components/chamados/screens'

interface ChamadosPageProps {
  screen?: 'central' | 'meus-chamados' | 'painel-sla'
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

  // 1. Central de Chamados
  if (
    activeSlug === 'central' ||
    pathname === '/admin/chamados' ||
    pathname === '/admin/chamados/' ||
    pathname === '/admin/chamados/central'
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenCentralChamados />
      </div>
    )
  }

  // 2. Meus Chamados
  if (
    activeSlug === 'meus-chamados' ||
    pathname === '/admin/chamados/meus-chamados' ||
    pathname.startsWith('/admin/chamados/meus-chamados')
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenMeusChamados />
      </div>
    )
  }

  // 3. Painel e SLA
  if (
    activeSlug === 'painel-sla' ||
    pathname === '/admin/chamados/painel-sla' ||
    pathname.startsWith('/admin/chamados/painel-sla')
  ) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ScreenPainelSla />
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
