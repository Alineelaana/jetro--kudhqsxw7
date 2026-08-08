import { DpLayout } from '@/components/dp/dp-shared'
import { DpDashboard } from '@/components/dp/dp-dashboard'
import { DpGenericScreen } from '@/components/dp/dp-generic-screen'
import { DpReports } from '@/components/dp/dp-reports'
import { DpPayroll } from '@/components/dp/dp-payroll'
import { DpBankHoursLedger } from '@/components/dp/dp-bank-hours-ledger'
import { DpEsocialMonitor } from '@/components/dp/dp-esocial-monitor'
import { DpFgtsDigital } from '@/components/dp/dp-fgts-digital'
import { DpReinstatementFlow } from '@/components/dp/dp-reinstatement-flow'
import { DpAdapta } from '@/components/dp/dp-adapta'
import { RhTimeControl } from '@/components/rh/rh-time-control'
import { RhVacations } from '@/components/rh/rh-vacations'
import { DP_SCREEN_CONFIGS } from '@/lib/dp-types'
import { DP_ENTERPRISE_CONFIGS } from '@/lib/dp-enterprise-types'

const ALL_DP_CONFIGS = { ...DP_SCREEN_CONFIGS, ...DP_ENTERPRISE_CONFIGS }

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard DP',
  payroll: 'Folha de Pagamento',
  time_control: 'Controle de Ponto',
  vacations: 'Férias',
  reports: 'Relatórios DP',
  bank_hours: 'Banco de Horas',
  esocial_monitor: 'Monitor eSocial',
  fgts_digital: 'FGTS Digital',
  reinstatement: 'Reintegração',
  adapta: 'ADAPTA DP',
}

export default function DP({ screen }: { screen: string }) {
  const title = TITLES[screen] || ALL_DP_CONFIGS[screen]?.title || 'DP'

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
      case 'bank_hours':
        return <DpBankHoursLedger />
      case 'esocial_monitor':
        return <DpEsocialMonitor />
      case 'fgts_digital':
        return <DpFgtsDigital />
      case 'reinstatement':
        return <DpReinstatementFlow />
      case 'adapta':
        return <DpAdapta />
      default: {
        const config = ALL_DP_CONFIGS[screen]
        if (config) return <DpGenericScreen config={config} />
        return <DpDashboard />
      }
    }
  }

  return <DpLayout title={title}>{renderScreen()}</DpLayout>
}
