import { DpLayout } from '@/components/dp/dp-shared'
import { DpPainelScreen } from '@/components/dp/screens/dp-painel-screen'
import { DpColaboradoresContratosScreen } from '@/components/dp/screens/dp-colaboradores-contratos-screen'
import { DpJornadaPontoScreen } from '@/components/dp/screens/dp-jornada-ponto-screen'
import { DpFeriasAfastamentosScreen } from '@/components/dp/screens/dp-ferias-afastamentos-screen'
import { DpFolhaBeneficiosScreen } from '@/components/dp/screens/dp-folha-beneficios-screen'
import { DpObrigacoesEsocialScreen } from '@/components/dp/screens/dp-obrigacoes-esocial-screen'

const TITLES: Record<string, string> = {
  painel: 'Painel DP',
  'colaboradores-contratos': 'Colaboradores e Contratos',
  'jornada-ponto': 'Jornada e Ponto',
  'ferias-afastamentos': 'Férias e Afastamentos',
  'folha-beneficios': 'Folha e Benefícios',
  'obrigacoes-esocial': 'Obrigações e eSocial',
  // Legados para compatibilidade
  dashboard: 'Painel DP',
  payroll: 'Folha e Benefícios',
  time_control: 'Jornada e Ponto',
  vacations: 'Férias e Afastamentos',
  reports: 'Obrigações e eSocial',
  bank_hours: 'Jornada e Ponto',
  esocial_monitor: 'Obrigações e eSocial',
  fgts_digital: 'Obrigações e eSocial',
  reinstatement: 'Colaboradores e Contratos',
}

export default function DP({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Departamento Pessoal'

  const renderScreen = () => {
    switch (screen) {
      case 'painel':
      case 'dashboard':
        return <DpPainelScreen />

      case 'colaboradores-contratos':
      case 'reinstatement':
      case 'admissoes':
      case 'alteracoes':
      case 'desligamentos':
      case 'reintegracao':
      case 'documentos':
        return <DpColaboradoresContratosScreen />

      case 'jornada-ponto':
      case 'time_control':
      case 'bank_hours':
      case 'banco_horas':
      case 'horas_extras':
      case 'escalas':
      case 'jornadas':
        return <DpJornadaPontoScreen />

      case 'ferias-afastamentos':
      case 'vacations':
      case 'afastamentos':
      case 'licencas':
        return <DpFeriasAfastamentosScreen />

      case 'folha-beneficios':
      case 'payroll':
      case 'rubricas':
      case 'encargos':
      case 'provisoes':
      case 'benefits':
      case 'consignados':
        return <DpFolhaBeneficiosScreen />

      case 'obrigacoes-esocial':
      case 'esocial_monitor':
      case 'fgts_digital':
      case 'reports':
      case 'sindicatos':
      case 'dissidio':
      case 'tabelas_tributarias':
      default:
        return <DpObrigacoesEsocialScreen />
    }
  }

  return <DpLayout title={title}>{renderScreen()}</DpLayout>
}
