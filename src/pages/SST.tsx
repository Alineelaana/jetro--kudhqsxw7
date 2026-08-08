import { SstLayout } from '@/components/sst/sst-shared'
import { SstDashboard } from '@/components/sst/sst-dashboard'
import { SstReports } from '@/components/sst/sst-reports'
import { SstCockpit } from '@/components/sst/sst-cockpit'
import { SstEsocialMonitor } from '@/components/sst/sst-esocial-monitor'
import { SstComplianceDashboard } from '@/components/sst/sst-compliance-dashboard'
import { SstTrainingMatrix } from '@/components/sst/sst-training-matrix'
import { SstAdapta } from '@/components/sst/sst-adapta'
import { SstPpp } from '@/components/sst/sst-ppp'
import { SstInvestigations } from '@/components/sst/sst-investigations'
import { SstObligationsCalendar } from '@/components/sst/sst-obligations-calendar'
import { SstAuditChecklists } from '@/components/sst/sst-audit-checklists'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard SST',
  reports: 'Relatórios SST',
  cockpit: 'Cockpit Executivo SST',
  esocial_monitor: 'Monitor eSocial SST',
  compliance_dashboard: 'Compliance por NR',
  training_matrix: 'Matriz de Treinamento',
  adapta: 'ADAPTA SST',
  ppp: 'PPP — Perfil Profissiográfico',
  investigations: 'Investigações de Acidentes',
  obligations_calendar: 'Calendário de Obrigações',
  audit_checklists: 'Auditorias SST',
}

export default function SST({ screen }: { screen: string }) {
  const title = TITLES[screen] || SST_SCREEN_CONFIGS[screen]?.title || 'SST'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <SstDashboard />
      case 'reports':
        return <SstReports />
      case 'cockpit':
        return <SstCockpit />
      case 'esocial_monitor':
        return <SstEsocialMonitor />
      case 'compliance_dashboard':
        return <SstComplianceDashboard />
      case 'training_matrix':
        return <SstTrainingMatrix />
      case 'adapta':
        return <SstAdapta />
      case 'ppp':
        return <SstPpp />
      case 'investigations':
        return <SstInvestigations />
      case 'obligations_calendar':
        return <SstObligationsCalendar />
      case 'audit_checklists':
        return <SstAuditChecklists />
      default: {
        const config = SST_SCREEN_CONFIGS[screen]
        if (config) return <RhGenericScreen config={config} />
        return <SstDashboard />
      }
    }
  }

  return <SstLayout title={title}>{renderScreen()}</SstLayout>
}
