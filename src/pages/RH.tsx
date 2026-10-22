import { Navigate } from 'react-router-dom'
import { RhLayout } from '@/components/rh/rh-shared'
import { RhPainelScreen } from '@/components/rh/screens/rh-painel-screen'
import { RhGestaoTalentosScreen } from '@/components/rh/screens/rh-gestao-talentos-screen'
import { RhCarreiraDesenvolvimentoScreen } from '@/components/rh/screens/rh-carreira-desenvolvimento-screen'
import { RhClimaEngajamentoScreen } from '@/components/rh/screens/rh-clima-engajamento-screen'
import { RhEstruturaOrganizacionalScreen } from '@/components/rh/screens/rh-estrutura-organizacional-screen'
import { RhJornadaColaboradorScreen } from '@/components/rh/screens/rh-jornada-colaborador-screen'
import { RhAprovacoesScreen } from '@/components/rh/screens/rh-aprovacoes-screen'

const TITLES: Record<string, string> = {
  painel: 'Painel RH',
  'gestao-talentos': 'Gestão de Talentos',
  'carreira-desenvolvimento': 'Carreira e Desenvolvimento',
  'clima-engajamento': 'Clima e Engajamento',
  'estrutura-organizacional': 'Estrutura Organizacional',
  'jornada-colaborador': 'Jornada do Colaborador',
  aprovacoes: 'Aprovações RH',
  // Legados para exibição
  cockpit: 'Painel RH',
  dashboard: 'Painel RH',
  nine_box: 'Gestão de Talentos',
  talent_review: 'Gestão de Talentos',
  organograma: 'Estrutura Organizacional',
  engajamento: 'Clima e Engajamento',
}

export default function RH({ screen }: { screen: string }) {
  // REDIRECIONAMENTOS DE DUPLICIDADES PARA O MÓDULO DP (conforme especificação aprovada)
  if (screen === 'employees' || screen === 'colaboradores') {
    return <Navigate to="/admin/dp/colaboradores-contratos" replace />
  }
  if (screen === 'vacations' || screen === 'ferias') {
    return <Navigate to="/admin/dp/ferias-afastamentos" replace />
  }
  if (
    screen === 'payroll' ||
    screen === 'folha' ||
    screen === 'benefits' ||
    screen === 'beneficios'
  ) {
    return <Navigate to="/admin/dp/folha-beneficios" replace />
  }
  if (screen === 'time_control' || screen === 'ponto') {
    return <Navigate to="/admin/dp/jornada-ponto" replace />
  }
  if (screen === 'documents' || screen === 'documentos') {
    return <Navigate to="/admin/dp/colaboradores-contratos" replace />
  }
  if (screen === 'reports' || screen === 'relatorios') {
    return <Navigate to="/admin/dp/obrigacoes-esocial" replace />
  }

  const title = TITLES[screen] || 'Gestão de Pessoas (RH)'

  const renderScreen = () => {
    switch (screen) {
      case 'painel':
      case 'cockpit':
      case 'dashboard':
        return <RhPainelScreen />

      case 'gestao-talentos':
      case 'competencias':
      case 'avaliacao_competencias':
      case 'calibracao':
      case 'feedback':
      case 'pdi':
      case 'nine_box':
      case 'talent_review':
      case 'sucessao':
        return <RhGestaoTalentosScreen />

      case 'carreira-desenvolvimento':
      case 'carreira':
      case 'plano_carreira':
      case 'trainings':
      case 'treinamentos':
      case 'reconhecimento':
        return <RhCarreiraDesenvolvimentoScreen />

      case 'clima-engajamento':
      case 'engajamento':
        return <RhClimaEngajamentoScreen />

      case 'estrutura-organizacional':
      case 'organograma':
      case 'cargos':
      case 'positions':
      case 'posicoes':
      case 'departamentos':
      case 'departments':
        return <RhEstruturaOrganizacionalScreen />

      case 'jornada-colaborador':
      case 'onboarding':
      case 'offboarding':
        return <RhJornadaColaboradorScreen />

      case 'aprovacoes':
      case 'approvals':
      default:
        return <RhAprovacoesScreen />
    }
  }

  return <RhLayout title={title}>{renderScreen()}</RhLayout>
}
