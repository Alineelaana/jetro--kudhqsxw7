import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewIndustrial } from '@/lib/industrial-permissions'
import { IndustryLayout } from '@/components/industry/industry-layout'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'

const CentralIndustrial = lazy(() =>
  import('@/components/industry/screens/screen-central-industrial').then((m) => ({
    default: m.ScreenCentralIndustrial,
  })),
)
const PlanejamentoOrdens = lazy(() =>
  import('@/components/industry/screens/screen-planejamento-ordens').then((m) => ({
    default: m.ScreenPlanejamentoOrdens,
  })),
)
const OrdemProducao = lazy(() =>
  import('@/components/industry/screens/screen-ordem-producao').then((m) => ({
    default: m.ScreenOrdemProducao,
  })),
)
const FichasTecnicas = lazy(() =>
  import('@/components/industry/screens/screen-fichas-tecnicas').then((m) => ({
    default: m.ScreenFichasTecnicas,
  })),
)
const QualidadeRastreabilidade = lazy(() =>
  import('@/components/industry/screens/screen-qualidade-rastreabilidade').then((m) => ({
    default: m.ScreenQualidadeRastreabilidade,
  })),
)
const CustosEficiencia = lazy(() =>
  import('@/components/industry/screens/screen-custos-eficiencia').then((m) => ({
    default: m.ScreenCustosEficiencia,
  })),
)
const ManutencaoRecursos = lazy(() =>
  import('@/components/industry/screens/screen-manutencao-recursos').then((m) => ({
    default: m.ScreenManutencaoRecursos,
  })),
)
const RecebimentoSafra = lazy(() =>
  import('@/components/industry/screens/screen-recebimento-safra').then((m) => ({
    default: m.ScreenRecebimentoSafra,
  })),
)
const TanquesCura = lazy(() =>
  import('@/components/industry/screens/screen-tanques-cura').then((m) => ({
    default: m.ScreenTanquesCura,
  })),
)
const PerdasLinha = lazy(() =>
  import('@/components/industry/screens/screen-perdas-linha').then((m) => ({
    default: m.ScreenPerdasLinha,
  })),
)
const LaboratorioLaudos = lazy(() =>
  import('@/components/industry/screens/screen-laboratorio-laudos').then((m) => ({
    default: m.ScreenLaboratorioLaudos,
  })),
)
const RastreabilidadeCompleta = lazy(() =>
  import('@/components/industry/screens/screen-rastreabilidade-completa').then((m) => ({
    default: m.ScreenRastreabilidadeCompleta,
  })),
)

function IndustryFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-[#005B2E] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando Indústria & Produção...</span>
      </div>
    </div>
  )
}

export default function Industry() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  if (!canViewIndustrial(user?.role)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Você não tem permissão para acessar o módulo Industrial.
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
    <IndustryLayout>
      <Suspense fallback={<IndustryFallback />}>
        <Routes>
          <Route index element={<CentralIndustrial />} />
          <Route path="central" element={<CentralIndustrial />} />
          <Route path="planejamento" element={<PlanejamentoOrdens />} />
          <Route path="planejamento-ordens" element={<PlanejamentoOrdens />} />
          <Route path="ordem-producao" element={<OrdemProducao />} />
          <Route path="ordem-producao/:id" element={<OrdemProducao />} />
          <Route path="ordens" element={<OrdemProducao />} />
          <Route path="ordens/:id" element={<OrdemProducao />} />
          <Route path="fichas-tecnicas" element={<FichasTecnicas />} />
          <Route path="qualidade" element={<QualidadeRastreabilidade />} />
          <Route path="qualidade-rastreabilidade" element={<QualidadeRastreabilidade />} />
          <Route path="custos" element={<CustosEficiencia />} />
          <Route path="custos-eficiencia" element={<CustosEficiencia />} />
          <Route path="manutencao" element={<ManutencaoRecursos />} />
          <Route path="manutencao-recursos" element={<ManutencaoRecursos />} />
          <Route path="recebimento-safra" element={<RecebimentoSafra />} />
          <Route path="tanques-cura" element={<TanquesCura />} />
          <Route path="perdas-linha" element={<PerdasLinha />} />
          <Route path="laboratorio-laudos" element={<LaboratorioLaudos />} />
          <Route path="rastreabilidade-completa" element={<RastreabilidadeCompleta />} />
          <Route path="*" element={<Navigate to="/admin/industria" replace />} />
        </Routes>
      </Suspense>
    </IndustryLayout>
  )
}
