import { useParams } from 'react-router-dom'
import { AtendimentoLayout } from '@/components/atendimento/atendimento-layout'
import { AtendimentoDashboard } from '@/components/atendimento/atendimento-dashboard'
import { AtendimentoForm } from '@/components/atendimento/atendimento-form'
import { AtendimentoList } from '@/components/atendimento/atendimento-list'
import { AtendimentoDetail } from '@/components/atendimento/atendimento-detail'
import { AtendimentoMotivos } from '@/components/atendimento/atendimento-motivos'
import { AtendimentoSetores } from '@/components/atendimento/atendimento-setores'
import { AtendimentoSla } from '@/components/atendimento/atendimento-sla'
import { AtendimentoFluxos } from '@/components/atendimento/atendimento-fluxos'
import { AtendimentoRelatorios } from '@/components/atendimento/atendimento-relatorios'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard da Central de Atendimento',
  novo: 'Novo Atendimento',
  abertos: 'Atendimentos Abertos',
  andamento: 'Atendimentos Em Andamento',
  pendentes: 'Atendimentos Pendentes',
  finalizados: 'Atendimentos Finalizados',
  motivos: 'Motivos de Atendimento',
  setores: 'Setores Responsáveis',
  sla: 'Monitoramento de SLA',
  fluxos: 'Fluxos Inteligentes de Atendimento',
  relatorios: 'Relatórios da Central de Atendimento',
  detalhe: 'Detalhe do Atendimento',
}

export default function Atendimento({ screen }: { screen: string }) {
  const { id } = useParams<{ id: string }>()
  const title = TITLES[screen] || 'Central de Atendimento'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <AtendimentoDashboard />
      case 'novo':
        return <AtendimentoForm />
      case 'abertos':
        return <AtendimentoList statusFilter="Aberto" />
      case 'andamento':
        return <AtendimentoList statusFilter="Em Atendimento" />
      case 'pendentes':
        return <AtendimentoList statusFilter="pendente" />
      case 'finalizados':
        return <AtendimentoList statusFilter="Finalizado" />
      case 'motivos':
        return <AtendimentoMotivos />
      case 'setores':
        return <AtendimentoSetores />
      case 'sla':
        return <AtendimentoSla />
      case 'fluxos':
        return <AtendimentoFluxos />
      case 'relatorios':
        return <AtendimentoRelatorios />
      case 'detalhe':
        return <AtendimentoDetail id={id || ''} />
      default:
        return <AtendimentoDashboard />
    }
  }

  return <AtendimentoLayout title={title}>{renderScreen()}</AtendimentoLayout>
}
