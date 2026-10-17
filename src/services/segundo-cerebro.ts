import pb from '@/lib/pocketbase/client'
import type {
  SegundoCerebroDoc,
  SegundoCerebroDecision,
  SegundoCerebroOpportunity,
  SegundoCerebroInsight,
  SegundoCerebroSyncLog,
  SegundoCerebroChat,
  SegundoCerebroMessage,
  SegundoCerebroMetrics,
  OpportunityStatus,
} from '@/types/segundo-cerebro'

/**
 * Carrega indicadores consolidados do topo do Segundo Cérebro (dados reais)
 */
export async function getSegundoCerebroMetrics(): Promise<SegundoCerebroMetrics> {
  try {
    const [docs, decisions, opps, syncLogs] = await Promise.all([
      pb.collection('segundo_cerebro_docs').getFullList<SegundoCerebroDoc>({
        fields: 'id,area,project,status',
      }),
      pb.collection('segundo_cerebro_decisions').getFullList<SegundoCerebroDecision>({
        fields: 'id',
      }),
      pb.collection('segundo_cerebro_opportunities').getFullList<SegundoCerebroOpportunity>({
        fields: 'id',
      }),
      pb.collection('segundo_cerebro_sync_logs').getList<SegundoCerebroSyncLog>(1, 1, {
        sort: '-created',
      }),
    ])

    const areasSet = new Set(docs.map((d) => d.area).filter(Boolean))
    const projectsSet = new Set(docs.map((d) => d.project).filter(Boolean))
    const pendingReviews = docs.filter((d) => d.status === 'pendente_revisao').length
    const lastSyncDate = syncLogs.items[0]?.created || null

    return {
      totalDocs: docs.length,
      totalAreas: areasSet.size,
      totalProjects: projectsSet.size,
      totalDecisions: decisions.length,
      totalOpportunities: opps.length,
      pendingReviews,
      lastSyncDate,
    }
  } catch (err) {
    console.error('Erro ao calcular métricas do Segundo Cérebro:', err)
    return {
      totalDocs: 0,
      totalAreas: 0,
      totalProjects: 0,
      totalDecisions: 0,
      totalOpportunities: 0,
      pendingReviews: 0,
      lastSyncDate: null,
    }
  }
}

/**
 * Consulta documentos da biblioteca com filtros de permissão e busca
 */
export async function listSegundoCerebroDocs(filters?: {
  area?: string
  project?: string
  search?: string
  canConfidential?: boolean
  canStrategic?: boolean
}): Promise<SegundoCerebroDoc[]> {
  const filterParts: string[] = ["status != 'arquivado'"]

  if (filters?.area && filters.area !== 'TODAS') {
    filterParts.push(`area = '${filters.area}'`)
  }

  if (filters?.project && filters.project !== 'TODOS') {
    filterParts.push(`project = '${filters.project}'`)
  }

  if (!filters?.canConfidential) {
    filterParts.push("confidentiality != 'Confidencial'")
  }

  if (!filters?.canStrategic) {
    filterParts.push("confidentiality != 'Estrategico'")
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().replace(/'/g, "''")
    filterParts.push(`(title ~ '${q}' || content ~ '${q}' || tags ~ '${q}')`)
  }

  const result = await pb.collection('segundo_cerebro_docs').getFullList<SegundoCerebroDoc>({
    filter: filterParts.join(' && '),
    sort: '-created',
  })

  return result
}

/**
 * Lista as decisões corporativas registradas
 */
export async function listSegundoCerebroDecisions(): Promise<SegundoCerebroDecision[]> {
  return pb.collection('segundo_cerebro_decisions').getFullList<SegundoCerebroDecision>({
    sort: '-date',
  })
}

/**
 * Lista as oportunidades do radar
 */
export async function listSegundoCerebroOpportunities(): Promise<SegundoCerebroOpportunity[]> {
  return pb.collection('segundo_cerebro_opportunities').getFullList<SegundoCerebroOpportunity>({
    sort: '-created',
  })
}

/**
 * Atualiza status de uma oportunidade do Radar (apenas avaliação humana)
 */
export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus,
  notes?: string,
): Promise<SegundoCerebroOpportunity> {
  return pb.collection('segundo_cerebro_opportunities').update<SegundoCerebroOpportunity>(id, {
    status,
    status_notes: notes || '',
    evaluated_at: new Date().toISOString(),
    evaluated_by: pb.authStore.record?.name || pb.authStore.record?.email || 'Usuário',
  })
}

/**
 * Dispara varredura do Radar de Oportunidades no servidor
 */
export async function triggerRadarScan(): Promise<{
  success: boolean
  message: string
  new_opportunities_identified: number
}> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/segundo-cerebro/scan-radar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
    },
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Falha ao executar varredura do Radar')
  }
  return res.json()
}

/**
 * Lista insights estratégicos e análises de processos
 */
export async function listSegundoCerebroInsights(
  department?: string,
): Promise<SegundoCerebroInsight[]> {
  const filter = department && department !== 'TODOS' ? `department = '${department}'` : ''
  return pb.collection('segundo_cerebro_insights').getFullList<SegundoCerebroInsight>({
    filter,
    sort: '-created',
  })
}

/**
 * Lista histórico de sincronizações do Obsidian
 */
export async function listSegundoCerebroSyncLogs(): Promise<SegundoCerebroSyncLog[]> {
  return pb.collection('segundo_cerebro_sync_logs').getFullList<SegundoCerebroSyncLog>({
    sort: '-created',
  })
}

/**
 * Envia mensagem para o Assistente IA do Segundo Cérebro (com auditoria e contexto)
 */
export async function askSegundoCerebro(params: {
  message: string
  conversation_id?: string | null
  mode?: 'geral' | 'conselheiro' | 'projeto'
  project?: string
}): Promise<{
  conversation_id: string
  content: string
  citations: Array<{ id?: string; title?: string; path?: string; area?: string; excerpt?: string }>
  message_id?: string
}> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/segundo-cerebro/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify({
        message: params.message,
        conversation_id: params.conversation_id || null,
        mode: params.mode || 'geral',
        project: params.project || '',
      }),
    },
  )

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Falha ao comunicar com o Segundo Cérebro')
  }

  return res.json()
}

/**
 * Sincroniza notas extraídas do Obsidian via upload individual ou .zip
 */
export async function syncObsidianNotes(payload: {
  notes: Array<{
    title: string
    path: string
    content: string
    area?: string
    category?: string
    project?: string
    tags?: string[]
    wikilinks?: string[]
    confidentiality?: string
    summary?: string
  }>
  source_type: 'obsidian_file' | 'obsidian_zip'
  file_name: string
}): Promise<{
  success: boolean
  total: number
  added: number
  updated: number
  unchanged: number
  errors: string[]
  summary: string
}> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/segundo-cerebro/sync-obsidian`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify(payload),
    },
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Falha na sincronização com o cofre Obsidian')
  }

  return res.json()
}

/**
 * Gerenciamento de conversas locais do usuário
 */
export async function listUserChats(): Promise<SegundoCerebroChat[]> {
  const userId = pb.authStore.record?.id
  if (!userId) return []
  return pb.collection('segundo_cerebro_chats').getFullList<SegundoCerebroChat>({
    filter: `user_id = '${userId}'`,
    sort: '-created',
  })
}

export async function createChat(data: {
  title: string
  mode?: 'geral' | 'conselheiro' | 'projeto'
  subject_or_project?: string
}): Promise<SegundoCerebroChat> {
  const userId = pb.authStore.record?.id
  return pb.collection('segundo_cerebro_chats').create<SegundoCerebroChat>({
    user_id: userId,
    title: data.title,
    mode: data.mode || 'geral',
    subject_or_project: data.subject_or_project || '',
    is_favorite: false,
    message_count: 0,
  })
}

export async function toggleChatFavorite(
  chatId: string,
  currentFav: boolean,
): Promise<SegundoCerebroChat> {
  return pb.collection('segundo_cerebro_chats').update<SegundoCerebroChat>(chatId, {
    is_favorite: !currentFav,
  })
}

export async function listChatMessages(chatId: string): Promise<SegundoCerebroMessage[]> {
  return pb.collection('segundo_cerebro_messages').getFullList<SegundoCerebroMessage>({
    filter: `chat_id = '${chatId}'`,
    sort: 'created',
  })
}

export async function saveChatMessage(data: {
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ id?: string; title?: string; path?: string; area?: string; excerpt?: string }>
}): Promise<SegundoCerebroMessage> {
  const userId = pb.authStore.record?.id
  const msg = await pb.collection('segundo_cerebro_messages').create<SegundoCerebroMessage>({
    chat_id: data.chat_id,
    user_id: userId,
    role: data.role,
    content: data.content,
    citations: data.citations || [],
    is_favorite: false,
  })

  // Atualizar resumo no chat pai
  try {
    const chat = await pb
      .collection('segundo_cerebro_chats')
      .getOne<SegundoCerebroChat>(data.chat_id)
    await pb.collection('segundo_cerebro_chats').update(data.chat_id, {
      last_message: data.content.substring(0, 120),
      message_count: (chat.message_count || 0) + 1,
    })
  } catch {
    /* intentionally ignored */
  }

  return msg
}

export async function toggleMessageFavorite(
  msgId: string,
  currentFav: boolean,
): Promise<SegundoCerebroMessage> {
  return pb.collection('segundo_cerebro_messages').update<SegundoCerebroMessage>(msgId, {
    is_favorite: !currentFav,
  })
}
