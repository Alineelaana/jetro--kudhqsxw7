import { AiLayout } from '@/components/ai-module/ai-layout'
import { AiDashboard } from '@/components/ai-module/ai-dashboard'
import { AiAssistant } from '@/components/ai-module/ai-assistant'
import { AiAgents } from '@/components/ai-module/ai-agents'
import { AiAutomations } from '@/components/ai-module/ai-automations'
import { AiSmartFlows } from '@/components/ai-module/ai-smart-flows'
import { AiKnowledgeBase } from '@/components/ai-module/ai-knowledge-base'
import { AiTrainingV2Panel } from '@/components/ai-module/ai-training-v2'
import { AiInteractionHistory } from '@/components/ai-module/ai-interaction-history'
import { AiApprovals } from '@/components/ai-module/ai-approvals'
import { AiSettingsPanel } from '@/components/ai-module/ai-settings'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard de IA',
  assistant: 'Assistente IA',
  agents: 'Agentes',
  automations: 'Automações',
  flows: 'Fluxos Inteligentes',
  knowledge: 'Base de Conhecimento',
  training: 'Treinamento da IA',
  history: 'Histórico de Interações',
  approvals: 'Aprovações da IA',
  settings: 'Configurações da IA',
}

export default function AIModule({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Inteligência Artificial'
  return (
    <AiLayout title={title}>
      {screen === 'dashboard' && <AiDashboard />}
      {screen === 'assistant' && <AiAssistant />}
      {screen === 'agents' && <AiAgents />}
      {screen === 'automations' && <AiAutomations />}
      {screen === 'flows' && <AiSmartFlows />}
      {screen === 'knowledge' && <AiKnowledgeBase />}
      {screen === 'training' && <AiTrainingV2Panel />}
      {screen === 'history' && <AiInteractionHistory />}
      {screen === 'approvals' && <AiApprovals />}
      {screen === 'settings' && <AiSettingsPanel />}
    </AiLayout>
  )
}
