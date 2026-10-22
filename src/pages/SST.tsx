import { SstLayout } from '@/components/sst/sst-shared'
import { SstPainelScreen } from '@/components/sst/screens/sst-painel-screen'
import { SstGestaoRiscosPgrScreen } from '@/components/sst/screens/sst-gestao-riscos-pgr-screen'
import { SstSaudeOcupacionalScreen } from '@/components/sst/screens/sst-saude-ocupacional-screen'
import { SstSegurancaPrevencaoScreen } from '@/components/sst/screens/sst-seguranca-prevencao-screen'
import { SstEpisTreinamentosScreen } from '@/components/sst/screens/sst-epis-treinamentos-screen'
import { SstCentralConformidadeScreen } from '@/components/sst/screens/sst-central-conformidade-screen'
import { SstDocumentosObrigacoesScreen } from '@/components/sst/screens/sst-documentos-obrigacoes-screen'
import { SstRelatoriosScreen } from '@/components/sst/screens/sst-relatorios-screen'
import { RhGenericScreen } from '@/components/rh/rh-generic-screen'
import { SST_SCREEN_CONFIGS } from '@/lib/sst-types'
import { SST_ENTERPRISE_SCREEN_CONFIGS } from '@/lib/sst-enterprise-types'

const TITLES: Record<string, string> = {
  painel: 'Painel SST',
  'gestao-riscos-pgr': 'Gestão de Riscos e PGR (NR-1)',
  'saude-ocupacional': 'Saúde Ocupacional',
  'seguranca-prevencao': 'Segurança e Prevenção',
  'epis-treinamentos': 'EPIs e Treinamentos',
  'central-conformidade': 'Central de Conformidade SST',
  'documentos-obrigacoes': 'Documentos e Obrigações',
  'relatorios-sst': 'Relatórios SST',
  // Legados para compatibilidade
  dashboard: 'Painel SST',
  cockpit: 'Painel SST',
  reports: 'Relatórios SST',
  compliance: 'Central de Conformidade SST',
  compliance_dashboard: 'Central de Conformidade SST',
  'nr-catalog': 'Central de Conformidade SST',
  ergonomics: 'Central de Conformidade SST',
  'confined-spaces': 'Central de Conformidade SST',
  'height-work': 'Central de Conformidade SST',
  documents: 'Documentos e Obrigações',
  'obligations-calendar': 'Documentos e Obrigações',
  'esocial-monitor': 'Documentos e Obrigações',
  ltcat: 'Documentos e Obrigações',
  ppp: 'Documentos e Obrigações',
}

export default function SST({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Saúde e Segurança do Trabalho'

  const renderScreen = () => {
    switch (screen) {
      case 'painel':
      case 'dashboard':
      case 'cockpit':
        return <SstPainelScreen />

      case 'gestao-riscos-pgr':
      case 'gro':
      case 'risk_inventory':
      case 'risk-inventory':
      case 'risk_matrix':
      case 'risk-matrix':
      case 'action_plans':
      case 'action-plans':
      case 'work_environments':
      case 'work-environments':
      case 'exposure_groups':
      case 'exposure-groups':
      case 'environmental_assessments':
      case 'environmental-assessments':
      case 'apr':
      case 'moc':
      case 'psychosocial_assessments':
      case 'psychosocial-assessments':
        return <SstGestaoRiscosPgrScreen />

      case 'saude-ocupacional':
      case 'pcmso':
      case 'aso':
      case 'exams':
      case 'medical_records':
      case 'medical-records':
      case 'vaccination':
        return <SstSaudeOcupacionalScreen />

      case 'seguranca-prevencao':
      case 'accidents':
      case 'cat':
      case 'incidents':
      case 'investigations':
      case 'inspections':
      case 'non_conformities':
      case 'non-conformities':
      case 'dds':
      case 'work_permits':
      case 'work-permits':
      case 'lockout':
      case 'emergencies':
      case 'brigade':
      case 'cipa':
        return <SstSegurancaPrevencaoScreen />

      case 'epis-treinamentos':
      case 'epis':
      case 'epcs':
      case 'certificates':
      case 'training_matrix':
      case 'training-matrix':
        return <SstEpisTreinamentosScreen />

      case 'central-conformidade':
      case 'compliance':
      case 'compliance_dashboard':
      case 'nr_catalog':
      case 'nr-catalog':
      case 'ergonomics':
      case 'confined_spaces':
      case 'confined-spaces':
      case 'height_work':
      case 'height-work':
      case 'nr10':
      case 'nr10_electrical':
      case 'nr10-electrical':
      case 'nr11':
      case 'nr11_material_handling':
      case 'nr11-material-handling':
      case 'nr12':
      case 'nr12_machines':
      case 'nr12-machines':
      case 'nr13':
      case 'nr13_boilers':
      case 'nr13-boilers':
      case 'nr15':
      case 'nr15_insalubridade':
      case 'nr15-insalubridade':
      case 'nr16':
      case 'nr16_periculosidade':
      case 'nr16-periculosidade':
      case 'sesmt':
      case 'audit_checklists':
      case 'audit-checklists':
        return <SstCentralConformidadeScreen />

      case 'documentos-obrigacoes':
      case 'ppp':
      case 'ltcat':
      case 'documents':
      case 'esocial_monitor':
      case 'esocial-monitor':
      case 'obligations_calendar':
      case 'obligations-calendar':
        return <SstDocumentosObrigacoesScreen />

      case 'relatorios-sst':
      case 'reports':
        return <SstRelatoriosScreen />

      default: {
        const config = SST_SCREEN_CONFIGS[screen] || SST_ENTERPRISE_SCREEN_CONFIGS[screen]
        if (config) return <RhGenericScreen config={config} />
        return <SstPainelScreen />
      }
    }
  }

  return <SstLayout title={title}>{renderScreen()}</SstLayout>
}
