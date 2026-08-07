import { ControladoriaLayout } from '@/components/controladoria/controladoria-layout'
import { ControladoriaCockpit } from '@/components/controladoria/controladoria-cockpit'
import { ControladoriaDRE } from '@/components/controladoria/controladoria-dre'
import { ControladoriaKPIs } from '@/components/controladoria/controladoria-kpis'
import { ControladoriaClosing } from '@/components/controladoria/controladoria-closing'
import { ControladoriaSimulator } from '@/components/controladoria/controladoria-simulator'
import { ControladoriaDrivers } from '@/components/controladoria/controladoria-drivers'
import { ControladoriaGenericScreen } from '@/components/controladoria/controladoria-generic'
import { ControladoriaAdapta } from '@/components/controladoria/controladoria-adapta'

interface ControladoriaPageProps {
  screen?: string
}

const TITLES: Record<string, string> = {
  dashboard: 'Cockpit Executivo',
  dre: 'DRE — Contábil / Gerencial / Analítica',
  kpis: 'KPIs Corporativos',
  drivers: 'Drivers Empresariais',
  budget: 'Orçamento (Budget)',
  forecast: 'Forecast & Projeções',
  fechamento: 'Fechamento Gerencial',
  simulador: 'Simulador Corporativo',
  consolidacao: 'Consolidação Empresarial',
  materialidade: 'Motor de Materialidade',
  reclassificacoes: 'Reclassificações Gerenciais',
  'visoes-salvas': 'Visões Salvas',
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
      case 'kpis':
        return <ControladoriaKPIs />
      case 'drivers':
        return <ControladoriaDrivers />
      case 'fechamento':
        return <ControladoriaClosing />
      case 'simulador':
        return <ControladoriaSimulator />
      case 'consolidacao':
        return <ControladoriaGenericScreen configKey="consolidation" />
      case 'materialidade':
        return <ControladoriaGenericScreen configKey="materiality" />
      case 'reclassificacoes':
        return <ControladoriaGenericScreen configKey="reclassifications" />
      case 'adapta':
        return <ControladoriaAdapta />
      case 'budget':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Orçamento corporativo — dados consumidos das versões de resultado oficiais.
            </p>
            <ControladoriaGenericScreen configKey="reclassifications" />
          </div>
        )
      case 'forecast':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Forecast — projeção = realizado até hoje + projeção restante. Sempre identificado como
              estimativa.
            </p>
            <ControladoriaGenericScreen configKey="consolidation" />
          </div>
        )
      case 'visoes-salvas':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Análises salvas com filtros, colunas, agrupamentos e comparações.
            </p>
            <ControladoriaGenericScreen configKey="materiality" />
          </div>
        )
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
