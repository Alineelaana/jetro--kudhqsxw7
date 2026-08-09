import { type ReactNode } from 'react'
import { IndustryLayout } from '@/components/industry/industry-layout'
import { IndustryDashboard } from '@/components/industry/industry-dashboard'
import { ItemCatalogPanel } from '@/components/industry/item-catalog-panel'
import { BomPanel } from '@/components/industry/bom-panel'
import { BomEngineeringPanel } from '@/components/industry/bom-engineering-panel'
import { EngineeringPanel } from '@/components/industry/engineering-panel'
import { ProductionResourcesPanel } from '@/components/industry/production-resources-panel'
import { ProductionRoutesPanel } from '@/components/industry/production-routes-panel'
import { CapacityPanel } from '@/components/industry/capacity-panel'
import { MasterPlanPanel } from '@/components/industry/master-plan-panel'
import { ApsPanel } from '@/components/industry/aps-panel'
import { PlanningPanel } from '@/components/industry/planning-panel'
import { IndustrialCostsPanel } from '@/components/industry/industrial-costs-panel'
import { ProductionOrdersPanel } from '@/components/industry/production-orders-panel'
import { ExecutionPanel } from '@/components/industry/execution-panel'
import { ProductionPhasesPanel } from '@/components/industry/production-phases-panel'
import { QualityExtendedPanel } from '@/components/industry/quality-extended-panel'
import { TraceabilityPanel } from '@/components/industry/traceability-panel'
import { KpisPanel } from '@/components/industry/kpis-panel'
import { MaintenancePanel } from '@/components/industry/maintenance-panel'
import { ThresholdCalibrationPanel } from '@/components/industry/threshold-calibration-panel'
import { ExecutiveDashboard } from '@/components/industry/executive-dashboard'
import { FactoryCockpit } from '@/components/industry/factory-cockpit'
import { IntelligencePanel } from '@/components/industry/intelligence-panel'
import { IndustrialAdaptaChat } from '@/components/industry/industrial-adapta-chat'
import { Card, CardContent } from '@/components/ui/card'

function ScreenPlaceholder({ name }: { name: string }) {
  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardContent className="py-12 text-center">
        <p className="text-lg font-bold text-[#005B2E]">{name}</p>
        <p className="text-sm text-muted-foreground mt-2">Carregando módulo...</p>
      </CardContent>
    </Card>
  )
}

function renderScreen(screen: string): ReactNode {
  switch (screen) {
    case 'dashboard':
      return <IndustryDashboard />
    case 'catalogo':
      return <ItemCatalogPanel />
    case 'especificacoes':
      return <ScreenPlaceholder name="Especificações Técnicas" />
    case 'conversoes':
      return <ScreenPlaceholder name="Conversões de Unidade" />
    case 'bom':
      return <BomPanel />
    case 'engenharia-bom':
      return <BomEngineeringPanel />
    case 'formulacoes':
      return <ScreenPlaceholder name="Formulações" />
    case 'engenharia':
      return <EngineeringPanel />
    case 'recursos':
      return <ProductionResourcesPanel />
    case 'roteiros':
      return <ProductionRoutesPanel />
    case 'capacidade':
      return <CapacityPanel />
    case 'plano-mestre':
      return <MasterPlanPanel />
    case 'aps':
      return <ApsPanel />
    case 'planejamento':
      return <PlanningPanel />
    case 'custos':
      return <IndustrialCostsPanel />
    case 'ordens-producao':
      return <ProductionOrdersPanel />
    case 'execucao':
      return <ExecutionPanel />
    case 'fases':
      return <ProductionPhasesPanel />
    case 'qualidade':
      return <QualityExtendedPanel />
    case 'rastreabilidade':
      return <TraceabilityPanel />
    case 'kpis':
      return <KpisPanel />
    case 'manutencao':
      return <MaintenancePanel />
    case 'calibracao':
      return <ThresholdCalibrationPanel />
    case 'executivo':
      return <ExecutiveDashboard />
    case 'cockpit':
      return <FactoryCockpit />
    case 'intelligence':
      return <IntelligencePanel />
    case 'adapta':
      return <IndustrialAdaptaChat />
    default:
      return <IndustryDashboard />
  }
}

export default function Industry({ screen = 'dashboard' }: { screen?: string }) {
  return <IndustryLayout>{renderScreen(screen)}</IndustryLayout>
}
