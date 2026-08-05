import { CrmLayout } from '@/components/crm/crm-layout'
import { CrmDashboard } from '@/components/crm/crm-dashboard'
import { CrmLeads } from '@/components/crm/crm-leads'
import { CrmOpportunities } from '@/components/crm/crm-opportunities'
import { CrmFunnel } from '@/components/crm/crm-funnel'
import { CrmAgenda } from '@/components/crm/crm-agenda'
import { CrmProposals } from '@/components/crm/crm-proposals'
import { CrmHistory } from '@/components/crm/crm-history'
import { CrmActivities } from '@/components/crm/crm-activities'
import { CrmGenericScreen } from '@/components/crm/crm-generic-screen'
import { CrmReports } from '@/components/crm/crm-reports'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard do CRM',
  leads: 'Gestão de Leads',
  oportunidades: 'Oportunidades',
  funil: 'Funil de Vendas',
  agenda: 'Agenda Comercial',
  propostas: 'Propostas',
  historico: 'Histórico de Atendimento',
  atividades: 'Atividades Comerciais',
  'motivos-perda': 'Motivos de Perda',
  metas: 'Metas Comerciais',
  automacao: 'Automação Comercial',
  relatorios: 'Relatórios do CRM',
}

export default function CRM({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'CRM'
  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <CrmDashboard />
      case 'leads':
        return <CrmLeads />
      case 'oportunidades':
        return <CrmOpportunities />
      case 'funil':
        return <CrmFunnel />
      case 'agenda':
        return <CrmAgenda />
      case 'propostas':
        return <CrmProposals />
      case 'historico':
        return <CrmHistory />
      case 'atividades':
        return <CrmActivities />
      case 'motivos-perda':
        return <CrmGenericScreen collection="crm_loss_reasons" label="Motivo de Perda" />
      case 'metas':
        return <CrmGenericScreen collection="crm_goals" label="Meta Comercial" />
      case 'automacao':
        return <CrmGenericScreen collection="crm_automation_rules" label="Regra de Automação" />
      case 'relatorios':
        return <CrmReports />
      default:
        return <CrmDashboard />
    }
  }
  return <CrmLayout title={title}>{renderScreen()}</CrmLayout>
}
