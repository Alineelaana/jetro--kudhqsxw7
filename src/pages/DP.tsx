import { DpLayout } from '@/components/dp/dp-shared'
import { DpDashboard } from '@/components/dp/dp-dashboard'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DpReports } from '@/components/dp/dp-reports'
import { DpPayroll } from '@/components/dp/dp-payroll'
import { RhTimeControl } from '@/components/rh/rh-time-control'
import { RhVacations } from '@/components/rh/rh-vacations'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard DP',
  payroll: 'Folha de Pagamento',
  time_control: 'Controle de Ponto',
  vacations: 'Férias',
  reports: 'Relatórios DP',
}

export default function DP({ screen }: { screen: string }) {
  const title = TITLES[screen] || DP_SCREEN_CONFIGS[screen]?.title || 'DP'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <DpDashboard />
      case 'payroll':
        return <DpPayroll />
      case 'time_control':
        return <RhTimeControl />
      case 'vacations':
        return <RhVacations />
      case 'reports':
        return <DpReports />
      default: {
        const config = DP_SCREEN_CONFIGS[screen]
        if (config) return <DpGenericScreen config={config} />
        return <DpDashboard />
      }
    }
  }

  return <DpLayout title={title}>{renderScreen()}</DpLayout>
}
