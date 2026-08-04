import { RhLayout } from '@/components/rh/rh-shared'
import { RhDashboard } from '@/components/rh/rh-dashboard'
import { RhEmployees } from '@/components/rh/rh-employees'
import { RhTimeControl } from '@/components/rh/rh-time-control'
import { RhVacations } from '@/components/rh/rh-vacations'
import { RhPayroll } from '@/components/rh/rh-payroll'
import { RhReports } from '@/components/rh/rh-reports'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { RH_SCREEN_CONFIGS } from '@/lib/rh-types'

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
      default: {
        const config = RH_SCREEN_CONFIGS[screen]
        if (config) return <RhGenericScreen config={config} />
        return <RhDashboard />
      }
    }
  }

  return <RhLayout title={title}>{renderScreen()}</RhLayout>
}
