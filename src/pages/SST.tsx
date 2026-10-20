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
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard SST',
  reports: 'Relatórios SST',
  cockpit: 'Cockpit Executivo SST',
  esocial_monitor: 'Monitor eSocial SST',
  compliance_dashboard: 'Compliance por NR',
  training_matrix: 'Matriz de Treinamento',
  adapta: 'ADAPTA SST',
  ppp: 'PPP — Perfil Profissiográfico Previdenciário',
  investigations: 'Investigações de Acidentes',
  obligations_calendar: 'Calendário de Obrigações',
  audit_checklists: 'Auditorias SST',
  nr10: 'NR-10 Segurança em Eletricidade',
  nr10_electrical: 'NR-10 Segurança em Eletricidade',
  nr11: 'NR-11 Transporte e Movimentação de Materiais',
  nr11_material_handling: 'NR-11 Transporte e Movimentação de Materiais',
  nr12: 'NR-12 Segurança em Máquinas e Equipamentos',
  nr12_machines: 'NR-12 Segurança em Máquinas e Equipamentos',
  nr13: 'NR-13 Caldeiras, Vasos de Pressão e Tubulações',
  nr13_boilers: 'NR-13 Caldeiras, Vasos de Pressão e Tubulações',
  nr15: 'NR-15 Atividades e Operações Insalubres',
  nr15_insalubridade: 'NR-15 Atividades e Operações Insalubres',
  nr16: 'NR-16 Atividades e Operações Perigosas',
  nr16_periculosidade: 'NR-16 Atividades e Operações Perigosas',
}

export default function SST({ screen }: { screen: string }) {
  const normalizedKey =
    screen === 'nr10'
      ? 'nr10_electrical'
      : screen === 'nr11'
        ? 'nr11_material_handling'
        : screen === 'nr12'
          ? 'nr12_machines'
          : screen === 'nr13'
            ? 'nr13_boilers'
            : screen === 'nr15'
              ? 'nr15_insalubridade'
              : screen === 'nr16'
                ? 'nr16_periculosidade'
                : screen

  const title =
    TITLES[screen] ||
    TITLES[normalizedKey] ||
    SST_SCREEN_CONFIGS[screen]?.title ||
    SST_ENTERPRISE_SCREEN_CONFIGS[normalizedKey]?.title ||
    'SST'

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
        const config =
          SST_SCREEN_CONFIGS[screen] ||
          SST_ENTERPRISE_SCREEN_CONFIGS[screen] ||
          SST_ENTERPRISE_SCREEN_CONFIGS[normalizedKey]
        if (config) return <RhGenericScreen config={config} />
        return <SstDashboard />
      }
    }
  }

  return <SstLayout title={title}>{renderScreen()}</SstLayout>
}
