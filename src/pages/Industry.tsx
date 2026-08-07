import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IndustryDashboard } from '@/components/industry/industry-dashboard'
import { ItemCatalogPanel } from '@/components/industry/item-catalog-panel'
import { BomPanel } from '@/components/industry/bom-panel'
import { BomEngineeringPanel } from '@/components/industry/bom-engineering-panel'
import { EngineeringPanel } from '@/components/industry/engineering-panel'
import { MasterPlanPanel } from '@/components/industry/master-plan-panel'
import { ApsPanel } from '@/components/industry/aps-panel'
import { ProductionResourcesPanel } from '@/components/industry/production-resources-panel'
import { ProductionRoutesPanel } from '@/components/industry/production-routes-panel'
import { IndustrialCostsPanel } from '@/components/industry/industrial-costs-panel'
import { CapacityPanel } from '@/components/industry/capacity-panel'
import { PlanningPanel } from '@/components/industry/planning-panel'
import { ExecutionPanel } from '@/components/industry/execution-panel'
import { KpisPanel } from '@/components/industry/kpis-panel'
import { MaintenancePanel } from '@/components/industry/maintenance-panel'
import { QualityExtendedPanel } from '@/components/industry/quality-extended-panel'
import { TraceabilityPanel } from '@/components/industry/traceability-panel'

interface Props {
  screen?: string
}

export default function Industry({ screen = 'dashboard' }: Props) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
      <IndustryContent screen={screen} />
    </div>
  )
}

function IndustryContent({ screen }: { screen: string }) {
  switch (screen) {
    case 'dashboard':
      return <IndustryDashboard />
    case 'catalogo':
      return <ItemCatalogPanel />
    case 'bom':
    case 'formulacoes':
      return <BomPanel />
    case 'engenharia-bom':
      return <BomEngineeringPanel />
    case 'engenharia':
      return <EngineeringPanel />
    case 'plano-mestre':
      return <MasterPlanPanel />
    case 'aps':
      return <ApsPanel />
    case 'recursos':
      return <ProductionResourcesPanel />
    case 'roteiros':
      return <ProductionRoutesPanel />
    case 'custos':
      return <IndustrialCostsPanel />
    case 'capacidade':
      return <CapacityPanel />
    case 'planejamento':
    case 'mrp':
      return <PlanningPanel />
    case 'execucao':
    case 'apontamentos':
      return <ExecutionPanel />
    case 'qualidade':
      return <QualityExtendedPanel />
    case 'rastreabilidade':
      return <TraceabilityPanel />
    case 'kpis':
    case 'indicadores':
      return <KpisPanel />
    case 'manutencao':
      return <MaintenancePanel />
    case 'especificacoes':
    case 'conversoes':
    default:
      return (
        <div className="text-center py-20">
          <p className="text-lg font-bold text-muted-foreground">Módulo em desenvolvimento</p>
          <p className="text-sm text-muted-foreground mt-2">
            Esta seção será implementada na próxima iteração.
          </p>
        </div>
      )
  }
}
