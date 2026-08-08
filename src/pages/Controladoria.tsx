import { ControladoriaLayout } from '@/components/controladoria/controladoria-layout'
import { ControladoriaCockpit } from '@/components/controladoria/controladoria-cockpit'
import { ControladoriaDRE } from '@/components/controladoria/controladoria-dre'
import { ControladoriaKPIs } from '@/components/controladoria/controladoria-kpis'
import { ControladoriaClosing } from '@/components/controladoria/controladoria-closing'
import { ControladoriaSimulator } from '@/components/controladoria/controladoria-simulator'
import { ControladoriaDrivers } from '@/components/controladoria/controladoria-drivers'
import { ControladoriaGenericScreen } from '@/components/controladoria/controladoria-generic'
import { ControladoriaAdapta } from '@/components/controladoria/controladoria-adapta'
import { ControladoriaBudget } from '@/components/controladoria/controladoria-budget'
import { ControladoriaForecast } from '@/components/controladoria/controladoria-forecast'
import { ControladoriaSavedViews } from '@/components/controladoria/controladoria-saved-views'
import { ControladoriaComments } from '@/components/controladoria/controladoria-comments'
import { ControladoriaEbitda } from '@/components/controladoria/controladoria-ebitda'

interface ControladoriaPageProps {
  screen?: string
}

const TITLES: Record<string, string> = {
  dashboard: 'Cockpit Executivo',
  dre: 'DRE — Contábil / Gerencial / Analítica',
  'dre-analitica': 'DRE Analítica',
  kpis: 'KPIs Corporativos',
  drivers: 'Drivers Empresariais',
  budget: 'Orçado × Realizado',
  forecast: 'Forecast & Projeções',
  fechamento: 'Fechamento Gerencial',
  simulador: 'Simulador Corporativo',
  consolidacao: 'Consolidação Empresarial',
  materialidade: 'Motor de Materialidade',
  reclassificacoes: 'Reclassificações Gerenciais',
  'visoes-salvas': 'Visões Salvas',
  comentarios: 'Comentários da Controladoria',
  'centros-resultado': 'Centros de Resultado',
  ebitda: 'EBITDA',
  adapta: 'ADAPTA Financeira',
  balanco: 'Balanço Patrimonial',
  'fluxo-caixa': 'Fluxo de Caixa Gerencial',
  configuracoes: 'Configurações da Controladoria',
}

export default function Controladoria({ screen = 'dashboard' }: ControladoriaPageProps) {
  const title = TITLES[screen] || 'Controladoria'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <ControladoriaCockpit />
      case 'dre':
        return <ControladoriaDRE />
      case 'dre-analitica':
        return <ControladoriaDRE />
      case 'kpis':
        return <ControladoriaKPIs />
      case 'drivers':
        return <ControladoriaDrivers />
      case 'fechamento':
        return <ControladoriaClosing />
      case 'simulador':
        return <ControladoriaSimulator />
      case 'budget':
        return <ControladoriaBudget />
      case 'forecast':
        return <ControladoriaForecast />
      case 'visoes-salvas':
        return <ControladoriaSavedViews />
      case 'comentarios':
        return <ControladoriaComments />
      case 'ebitda':
        return <ControladoriaEbitda />
      case 'centros-resultado':
        return <ControladoriaGenericScreen configKey="result_centers" />
      case 'consolidacao':
        return <ControladoriaGenericScreen configKey="consolidation" />
      case 'materialidade':
        return <ControladoriaGenericScreen configKey="materiality" />
      case 'reclassificacoes':
        return <ControladoriaGenericScreen configKey="reclassifications" />
      case 'adapta':
        return <ControladoriaAdapta />
      case 'balanco':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Balanço Patrimonial — demonstração consolidada do patrimônio da empresa.
            </p>
            <ControladoriaGenericScreen configKey="consolidation" />
          </div>
        )
      case 'fluxo-caixa':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fluxo de Caixa Gerencial — projeção de entradas e saídas baseada nos dados oficiais.
            </p>
            <ControladoriaGenericScreen configKey="consolidation" />
          </div>
        )
      case 'configuracoes':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configurações da Controladoria — parâmetros de DRE, KPIs, materialidade e
              consolidação.
            </p>
            <ControladoriaGenericScreen configKey="reclassifications" />
          </div>
        )
      default:
        return <ControladoriaCockpit />
    }
  }

  return <ControladoriaLayout title={title}>{renderScreen()}</ControladoriaLayout>
}
