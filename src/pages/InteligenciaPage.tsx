import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewBI } from '@/lib/bi-permissions'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  ScreenCentralInteligencia,
  ScreenDashboardsProjecoes,
  ScreenInteligenciaPorArea,
  ScreenRelatoriosAgendamentos,
} from '@/components/inteligencia/screens'

export function InteligenciaPage() {
  const { pathname } = useLocation()
  const { isAuthenticated, loading, userRole } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  const allowed = canViewBI(userRole)
  if (!allowed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Você não tem permissão para acessar o módulo de Inteligência.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
    )
  }

  // 1. Central de Inteligência (/admin/inteligencia ou /admin/inteligencia/)
  if (
    pathname === '/admin/inteligencia' ||
    pathname === '/admin/inteligencia/' ||
    pathname === '/admin/inteligencia/central'
  ) {
    return <ScreenCentralInteligencia />
  }

  // 2. Dashboards e Projeções
  if (
    pathname === '/admin/inteligencia/dashboards-projecoes' ||
    pathname.startsWith('/admin/inteligencia/dashboards-projecoes/') ||
    pathname === '/admin/inteligencia/dashboards' ||
    pathname === '/admin/inteligencia/projecoes'
  ) {
    return <ScreenDashboardsProjecoes />
  }

  // 3. Inteligência por Área
  if (
    pathname === '/admin/inteligencia/por-area' ||
    pathname.startsWith('/admin/inteligencia/por-area/') ||
    pathname === '/admin/inteligencia/areas'
  ) {
    return <ScreenInteligenciaPorArea />
  }

  // 4. Relatórios e Agendamentos
  if (
    pathname === '/admin/inteligencia/relatorios' ||
    pathname.startsWith('/admin/inteligencia/relatorios/') ||
    pathname === '/admin/inteligencia/agendamentos'
  ) {
    return <ScreenRelatoriosAgendamentos />
  }

  // Fallback padrão: Central de Inteligência
  return <ScreenCentralInteligencia />
}

export default InteligenciaPage
