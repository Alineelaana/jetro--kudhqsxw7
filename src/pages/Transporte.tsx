import { Navigate } from 'react-router-dom'

/**
 * Módulo de Transporte unificado na Central Logística do HURAM ERP.
 * Redireciona qualquer rota legado para a tela correspondente dentro das 7 telas oficiais.
 */
export default function Transporte({ screen }: { screen: string }) {
  const ROUTE_MAP: Record<string, string> = {
    dashboard: '/admin/logistica',
    cargas: '/admin/logistica/rotas-roteirizacao',
    routing: '/admin/logistica/rotas-roteirizacao',
    journeys: '/admin/logistica/rotas-roteirizacao',
    routes: '/admin/logistica/rotas-roteirizacao',
    deliveries: '/admin/logistica/distribuicao-entregas',
    vehicles: '/admin/logistica/transporte-frota',
    drivers: '/admin/logistica/transporte-frota',
    romaneios: '/admin/logistica/distribuicao-entregas',
    freights: '/admin/logistica/frete-tabelas',
    freight_tables: '/admin/logistica/frete-tabelas',
    tracking: '/admin/logistica/ocorrencias-rastreabilidade',
    occurrences: '/admin/logistica/ocorrencias-rastreabilidade',
    proof: '/admin/logistica/ocorrencias-rastreabilidade',
    costs: '/admin/logistica/custos-indicadores',
    driver_app: '/admin/logistica/distribuicao-entregas',
    reports: '/admin/logistica/custos-indicadores',
  }

  const target = ROUTE_MAP[screen] || '/admin/logistica'
  return <Navigate to={target} replace />
}
