import pb from '@/lib/pocketbase/client'
import type {
  AiAgent,
  AiAutomation,
  AiSmartFlow,
  AiKnowledgeItem,
  AiInteraction,
  AiApproval,
  AiTrainingV2,
  AiModuleSettings,
  AiErrorMonitor,
} from '@/lib/ai-types'

export const getAgents = () =>
  pb.collection('ai_agents').getFullList({ sort: '-created' }) as Promise<AiAgent[]>
export const getAgent = (id: string) => pb.collection('ai_agents').getOne(id) as Promise<AiAgent>
export const createAgent = (data: Record<string, unknown>) =>
  pb.collection('ai_agents').create(data) as Promise<AiAgent>
export const updateAgent = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_agents').update(id, data) as Promise<AiAgent>

export const getAutomations = () =>
  pb.collection('ai_automations').getFullList({ sort: '-created' }) as Promise<AiAutomation[]>
export const createAutomation = (data: Record<string, unknown>) =>
  pb.collection('ai_automations').create(data) as Promise<AiAutomation>
export const updateAutomation = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_automations').update(id, data) as Promise<AiAutomation>

export const getSmartFlows = () =>
  pb.collection('ai_smart_flows').getFullList({ sort: '-created' }) as Promise<AiSmartFlow[]>
export const createSmartFlow = (data: Record<string, unknown>) =>
  pb.collection('ai_smart_flows').create(data) as Promise<AiSmartFlow>
export const updateSmartFlow = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_smart_flows').update(id, data) as Promise<AiSmartFlow>

export const getKnowledgeBase = () =>
  pb.collection('ai_knowledge_base').getFullList({ sort: '-created' }) as Promise<AiKnowledgeItem[]>
export const createKnowledgeItem = (data: Record<string, unknown>) =>
  pb.collection('ai_knowledge_base').create(data) as Promise<AiKnowledgeItem>
export const updateKnowledgeItem = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_knowledge_base').update(id, data) as Promise<AiKnowledgeItem>

export const getInteractions = (page = 1, perPage = 25, filter?: string) =>
  pb.collection('ai_interactions').getList(page, perPage, { sort: '-created', filter })
export const createInteraction = (data: Record<string, unknown>) =>
  pb.collection('ai_interactions').create(data) as Promise<AiInteraction>
export const updateInteraction = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_interactions').update(id, data) as Promise<AiInteraction>

export const getApprovals = (filter?: string) =>
  pb.collection('ai_approvals').getFullList({ sort: '-created', filter }) as Promise<AiApproval[]>
export const createApproval = (data: Record<string, unknown>) =>
  pb.collection('ai_approvals').create(data) as Promise<AiApproval>
export const updateApproval = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_approvals').update(id, data) as Promise<AiApproval>

export const getTrainingV2 = () =>
  pb.collection('ai_training_v2').getFullList({ sort: '-created' }) as Promise<AiTrainingV2[]>
export const createTrainingV2 = (data: Record<string, unknown>) =>
  pb.collection('ai_training_v2').create(data) as Promise<AiTrainingV2>
export const updateTrainingV2 = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_training_v2').update(id, data) as Promise<AiTrainingV2>

export const getAiSettings = async (): Promise<AiModuleSettings | null> => {
  try {
    const list = await pb.collection('ai_module_settings').getFullList()
    return (list[0] as AiModuleSettings) || null
  } catch {
    return null
  }
}
export const updateAiSettings = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_module_settings').update(id, data) as Promise<AiModuleSettings>

export const getErrors = () =>
  pb.collection('ai_error_monitor').getFullList({ sort: '-created' }) as Promise<AiErrorMonitor[]>
export const updateError = (id: string, data: Record<string, unknown>) =>
  pb.collection('ai_error_monitor').update(id, data) as Promise<AiErrorMonitor>

export async function getAiDashboardStats() {
  try {
    const [agents, automations, flows, kb, interactions, approvals, errors] = await Promise.all([
      getAgents().catch(() => []),
      getAutomations().catch(() => []),
      getSmartFlows().catch(() => []),
      getKnowledgeBase().catch(() => []),
      getInteractions(1, 1).catch(() => ({ totalItems: 0 })),
      getApprovals().catch(() => []),
      getErrors().catch(() => []),
    ])
    const activeAgents = agents.filter((a) => a.status === 'Ativo').length
    const inactiveAgents = agents.filter((a) =>
      ['Inativo', 'Pausado', 'Com Erro'].includes(a.status),
    ).length
    const activeAutomations = automations.filter((a) => a.status === 'Ativa').length
    const errorAutomations = automations.filter((a) => a.status === 'Com Erro').length
    const executedFlows = flows.filter((f) => f.execution_history?.length > 0).length
    const pendingFlows = flows.filter((f) => f.status === 'Em Teste').length
    const activeKb = kb.filter((k) => k.status === 'Ativo').length
    const pendingKb = kb.filter((k) => k.status === 'Aguardando Processamento').length
    const pendingApprovals = approvals.filter((a) => a.status === 'Aguardando').length
    const resolvedErrors = errors.filter((e) => e.status === 'Resolvido').length
    return {
      totalInteractions: (interactions as { totalItems: number }).totalItems || 0,
      activeAgents,
      inactiveAgents,
      activeAutomations,
      errorAutomations,
      executedFlows,
      pendingFlows,
      responsesGenerated: (interactions as { totalItems: number }).totalItems || 0,
      pendingApprovals,
      activeKb,
      pendingKb,
      openErrors: errors.length - resolvedErrors,
      totalErrors: errors.length,
    }
  } catch {
    return {
      totalInteractions: 0,
      activeAgents: 0,
      inactiveAgents: 0,
      activeAutomations: 0,
      errorAutomations: 0,
      executedFlows: 0,
      pendingFlows: 0,
      responsesGenerated: 0,
      pendingApprovals: 0,
      activeKb: 0,
      pendingKb: 0,
      openErrors: 0,
      totalErrors: 0,
    }
  }
}
