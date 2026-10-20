import { RhLayout } from '@/components/rh/rh-shared'
import { RhDashboard } from '@/components/rh/rh-dashboard'
import { RhEmployees } from '@/components/rh/rh-employees'
import { RhTimeControl } from '@/components/rh/rh-time-control'
import { RhVacations } from '@/components/rh/rh-vacations'
import { RhPayroll } from '@/components/rh/rh-payroll'
import { RhReports } from '@/components/rh/rh-reports'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RhOrganograma } from '@/components/rh/rh-organograma'
import { RhNineBox } from '@/components/rh/rh-nine-box'
import { RhTalentReview } from '@/components/rh/rh-talent-review'
import { RhEngajamento } from '@/components/rh/rh-engajamento'
import { RhCockpit } from '@/components/rh/rh-cockpit'
import { RhAdapta } from '@/components/rh/rh-adapta'
import { RH_SCREEN_CONFIGS } from '@/lib/rh-types'
import { RH_ENTERPRISE_CONFIGS } from '@/lib/rh-enterprise-types'
import { RH_EXTENDED_CONFIGS } from '@/lib/rh-extended-configs'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard de RH',
  employees: 'Colaboradores',
  positions: 'Cargos',
  departments: 'Departamentos',
  time_control: 'Controle de Ponto',
  vacations: 'Férias',
  payroll: 'Folha de Pagamento',
  benefits: 'Benefícios',
  trainings: 'Treinamentos',
  documents: 'Documentos dos Colaboradores',
  approvals: 'Aprovações de RH',
  reports: 'Relatórios de RH',
  organograma: 'Organograma',
  posicoes: 'Posições',
  competencias: 'Competências',
  avaliacao_competencias: 'Avaliação de Competências',
  calibracao: 'Calibração',
  feedback: 'Feedback Contínuo',
  pdi: 'PDI — Plano de Desenvolvimento',
  carreira: 'Plano de Carreira',
  sucessao: 'Sucessão',
  nine_box: 'Matriz 9 Box',
  talent_review: 'Talent Review',
  onboarding: 'Onboarding',
  offboarding: 'Offboarding',
  reconhecimento: 'Reconhecimento',
  engajamento: 'Engajamento',
  cockpit: 'Cockpit Executivo',
  adapta: 'ADAPTA RH',
}

export default function RH({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'RH'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <RhDashboard />
      case 'employees':
        return <RhEmployees />
      case 'time_control':
        return <RhTimeControl />
      case 'vacations':
        return <RhVacations />
      case 'payroll':
        return <RhPayroll />
      case 'reports':
        return <RhReports />
      case 'organograma':
        return <RhOrganograma />
      case 'nine_box':
        return <RhNineBox />
      case 'talent_review':
        return <RhTalentReview />
      case 'engajamento':
        return <RhEngajamento />
      case 'cockpit':
        return <RhCockpit />
      case 'adapta':
        return <RhAdapta />
      default: {
        const config =
          RH_SCREEN_CONFIGS[screen] ||
          RH_ENTERPRISE_CONFIGS[screen] ||
          RH_EXTENDED_CONFIGS[screen] ||
          (screen === 'carreira' ? RH_EXTENDED_CONFIGS['plano_carreira'] : undefined)
        if (config) return <RhGenericScreen config={config} />
        return <RhDashboard />
      }
    }
  }

  return <RhLayout title={title}>{renderScreen()}</RhLayout>
}
