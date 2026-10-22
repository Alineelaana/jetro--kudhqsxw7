import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { ProtectedRoute } from '@/components/protected-route'
import { canViewIndustry } from '@/lib/industrial-permissions'
import { useAuth } from '@/hooks/use-auth'

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
  const { user } = useAuth()
  const allowed = canViewIndustry(user?.role)

  return (
    <ProtectedRoute allowed={allowed}>
      <Layout>
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
            <Route path="*" element={<Navigate to="/admin/industria" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </ProtectedRoute>
  )
}
