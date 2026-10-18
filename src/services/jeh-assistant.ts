import pb from '@/lib/pocketbase/client'

export type JehCategory =
  | 'Institucional'
  | 'O que é o Jetro'
  | 'Funcionalidades'
  | 'Departamentos'
  | 'Implantação'
  | 'Demonstração'
  | 'Contato e Suporte'
  | 'FAQ'
  | 'Comercial'
  | 'Outros'

export const JEH_CATEGORIES: JehCategory[] = [
  'Institucional',
  'O que é o Jetro',
  'Funcionalidades',
  'Departamentos',
  'Implantação',
  'Demonstração',
  'Contato e Suporte',
  'FAQ',
  'Comercial',
  'Outros',
]

export type JehApprovalStatus = 'rascunho' | 'aprovado' | 'revisar' | 'inativo'

export interface JehKnowledgeItem {
  id: string
  title: string
  category: JehCategory
  content: string
  keywords?: string
  approval_status: JehApprovalStatus
  responsible_name?: string
  source_file?: string
  source_type?: string
  created: string
  updated: string
}

export interface JehQaItem {
  id: string
  canonical_question: string
  official_answer: string
  variations: string[]
  category: JehCategory
  approval_status: JehApprovalStatus
  keywords?: string
  hit_count: number
  responsible_name?: string
  created: string
  updated: string
}

export interface JehUnansweredItem {
  id: string
  question: string
  count: number
  identified_topic?: string
  status: 'pendente' | 'em_analise' | 'respondida' | 'descartada'
  assigned_answer?: string
  source?: 'publico' | 'teste'
  last_asked_at?: string
  created: string
  updated: string
}

export interface JehTestEvaluationItem {
  id: string
  user_name?: string
  user_question: string
  assistant_response: string
  rating: 'correta' | 'parcial' | 'incorreta'
  feedback_notes?: string
  suggested_correction?: string
  status?: 'pendente_validacao' | 'aprovada_na_base' | 'rejeitada'
  target_category?: string
  created: string
  updated: string
}

export interface JehOverviewStats {
  totalQuestionsReceived: number
  totalAnswered: number
  totalUnanswered: number
  evaluationsCount: number
  evaluationsCorrect: number
  evaluationsPartial: number
  evaluationsIncorrect: number
  knowledgeCount: number
  qaCount: number
  lastKnowledgeUpdate: string | null
  assistantStatus: 'ativa' | 'inativa'
  topTopics: { topic: string; count: number }[]
}

// -------------------------------------------------------------
// STATUS DA ASSISTENTE (settings: jeh_assistant_status)
// -------------------------------------------------------------

export async function getJehAssistantStatus(): Promise<'ativa' | 'inativa'> {
  try {
    const rec = await pb.collection('settings').getFirstListItem('key="jeh_assistant_status"')
    return (rec.value === 'ativa' ? 'ativa' : 'inativa')
  } catch {
    return 'inativa'
  }
}

export async function updateJehAssistantStatus(newStatus: 'ativa' | 'inativa'): Promise<void> {
  let rec: any = null
  try {
    rec = await pb.collection('settings').getFirstListItem('key="jeh_assistant_status"')
  } catch {
    rec = null
  }

  if (rec) {
    await pb.collection('settings').update(rec.id, { value: newStatus })
  } else {
    await pb.collection('settings').create({
      key: 'jeh_assistant_status',
      value: newStatus,
    })
  }

  // Se ativando ou desativando, também sincroniza floating_chat_visible
  try {
    const floatRec = await pb.collection('settings').getFirstListItem('key="floating_chat_visible"')
    if (floatRec) {
      await pb.collection('settings').update(floatRec.id, {
        value: newStatus === 'ativa' ? 'true' : 'false',
      })
    }
  } catch {
    // Silencioso se settings não existir
  }
}

// -------------------------------------------------------------
// BASE DE CONHECIMENTO (jeh_knowledge)
// -------------------------------------------------------------

export async function listJehKnowledge(params?: {
  category?: string
  approval_status?: string
  search?: string
}): Promise<JehKnowledgeItem[]> {
  const filters: string[] = []
  if (params?.category && params.category !== 'all') {
    filters.push(`category = "${params.category}"`)
  }
  if (params?.approval_status && params.approval_status !== 'all') {
    filters.push(`approval_status = "${params.approval_status}"`)
  }
  if (params?.search && params.search.trim()) {
    const term = params.search.trim().replace(/"/g, '\\"')
    filters.push(`(title ~ "${term}" || content ~ "${term}" || keywords ~ "${term}")`)
  }

  const filter = filters.length > 0 ? filters.join(' && ') : ''

  const records = await pb.collection('jeh_knowledge').getFullList({
    filter: filter || undefined,
    sort: '-updated',
  })

  return records.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as JehCategory,
    content: r.content,
    keywords: r.keywords,
    approval_status: r.approval_status as JehApprovalStatus,
    responsible_name: r.responsible_name,
    source_file: r.source_file,
    source_type: r.source_type,
    created: r.created,
    updated: r.updated,
  }))
}

export async function createJehKnowledge(data: {
  title: string
  category: JehCategory
  content: string
  keywords?: string
  approval_status: JehApprovalStatus
  responsible_name?: string
  source_file?: File | null
  source_type?: string
}): Promise<JehKnowledgeItem> {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('category', data.category)
  formData.append('content', data.content)
  formData.append('approval_status', data.approval_status)
  if (data.keywords) formData.append('keywords', data.keywords)
  if (data.responsible_name) formData.append('responsible_name', data.responsible_name)
  if (data.source_type) formData.append('source_type', data.source_type)
  if (data.source_file) formData.append('source_file', data.source_file)

  const rec = await pb.collection('jeh_knowledge').create(formData)
  return rec as unknown as JehKnowledgeItem
}

export async function updateJehKnowledge(
  id: string,
  data: Partial<JehKnowledgeItem> & { source_file?: File | null },
): Promise<JehKnowledgeItem> {
  if (data.source_file) {
    const formData = new FormData()
    if (data.title) formData.append('title', data.title)
    if (data.category) formData.append('category', data.category)
    if (data.content) formData.append('content', data.content)
    if (data.keywords !== undefined) formData.append('keywords', data.keywords || '')
    if (data.approval_status) formData.append('approval_status', data.approval_status)
    if (data.responsible_name) formData.append('responsible_name', data.responsible_name)
    if (data.source_type) formData.append('source_type', data.source_type)
    formData.append('source_file', data.source_file)
    const rec = await pb.collection('jeh_knowledge').update(id, formData)
    return rec as unknown as JehKnowledgeItem
  }

  const rec = await pb.collection('jeh_knowledge').update(id, data)
  return rec as unknown as JehKnowledgeItem
}

export async function deleteJehKnowledge(id: string): Promise<void> {
  await pb.collection('jeh_knowledge').delete(id)
}

// -------------------------------------------------------------
// EXTRAÇÃO DE DOCUMENTOS (/backend/v1/jeh/extract-document)
// -------------------------------------------------------------

export async function extractDocumentContent(file: File): Promise<{
  fileName: string
  fileSize: number
  text: string
}> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/backend/v1/jeh/extract-document', {
    method: 'POST',
    headers: {
      Authorization: pb.authStore.token || '',
    },
    body: formData,
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData?.error || `Falha ao extrair documento (${res.status})`)
  }

  return await res.json()
}

// -------------------------------------------------------------
// PERGUNTAS E RESPOSTAS CANÔNICAS (jeh_qa)
// -------------------------------------------------------------

export async function listJehQa(params?: {
  category?: string
  approval_status?: string
  search?: string
}): Promise<JehQaItem[]> {
  const filters: string[] = []
  if (params?.category && params.category !== 'all') {
    filters.push(`category = "${params.category}"`)
  }
  if (params?.approval_status && params.approval_status !== 'all') {
    filters.push(`approval_status = "${params.approval_status}"`)
  }
  if (params?.search && params.search.trim()) {
    const term = params.search.trim().replace(/"/g, '\\"')
    filters.push(`(canonical_question ~ "${term}" || official_answer ~ "${term}" || keywords ~ "${term}")`)
  }

  const filter = filters.length > 0 ? filters.join(' && ') : ''

  const records = await pb.collection('jeh_qa').getFullList({
    filter: filter || undefined,
    sort: '-hit_count',
  })

  return records.map((r) => ({
    id: r.id,
    canonical_question: r.canonical_question,
    official_answer: r.official_answer,
    variations: Array.isArray(r.variations) ? r.variations : [],
    category: r.category as JehCategory,
    approval_status: r.approval_status as JehApprovalStatus,
    keywords: r.keywords,
    hit_count: Number(r.hit_count) || 0,
    responsible_name: r.responsible_name,
    created: r.created,
    updated: r.updated,
  }))
}

export async function createJehQa(data: {
  canonical_question: string
  official_answer: string
  variations: string[]
  category: JehCategory
  approval_status: JehApprovalStatus
  keywords?: string
  hit_count?: number
  responsible_name?: string
}): Promise<JehQaItem> {
  const payload = {
    ...data,
    hit_count: data.hit_count ?? 0,
  }
  const rec = await pb.collection('jeh_qa').create(payload)
  return {
    ...rec,
    variations: Array.isArray(rec.variations) ? rec.variations : [],
  } as unknown as JehQaItem
}

export async function updateJehQa(id: string, data: Partial<JehQaItem>): Promise<JehQaItem> {
  const rec = await pb.collection('jeh_qa').update(id, data)
  return {
    ...rec,
    variations: Array.isArray(rec.variations) ? rec.variations : [],
  } as unknown as JehQaItem
}

export async function deleteJehQa(id: string): Promise<void> {
  await pb.collection('jeh_qa').delete(id)
}

// -------------------------------------------------------------
// PERGUNTAS SEM RESPOSTA (jeh_unanswered)
// -------------------------------------------------------------

export async function listJehUnanswered(params?: {
  status?: string
  source?: string
}): Promise<JehUnansweredItem[]> {
  const filters: string[] = []
  if (params?.status && params.status !== 'all') {
    filters.push(`status = "${params.status}"`)
  }
  if (params?.source && params.source !== 'all') {
    filters.push(`source = "${params.source}"`)
  }
  const filter = filters.length > 0 ? filters.join(' && ') : ''

  const records = await pb.collection('jeh_unanswered').getFullList({
    filter: filter || undefined,
    sort: '-count',
  })

  return records.map((r) => ({
    id: r.id,
    question: r.question,
    count: Number(r.count) || 1,
    identified_topic: r.identified_topic || 'Geral',
    status: r.status,
    assigned_answer: r.assigned_answer,
    source: r.source || 'teste',
    last_asked_at: r.last_asked_at,
    created: r.created,
    updated: r.updated,
  }))
}

export async function updateJehUnanswered(
  id: string,
  data: Partial<JehUnansweredItem>,
): Promise<JehUnansweredItem> {
  const rec = await pb.collection('jeh_unanswered').update(id, data)
  return rec as unknown as JehUnansweredItem
}

export async function deleteJehUnanswered(id: string): Promise<void> {
  await pb.collection('jeh_unanswered').delete(id)
}

// -------------------------------------------------------------
// TEST CHAT (/backend/v1/jeh/test-chat)
// -------------------------------------------------------------

export async function sendJehTestChat(params: {
  message: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}): Promise<{ response: string; isUnanswered: boolean }> {
  const res = await fetch('/backend/v1/jeh/test-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token || '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData?.error || `Erro ao consultar teste da Jeh (${res.status})`)
  }

  return await res.json()
}

// -------------------------------------------------------------
// AVALIAÇÕES DE TESTE (jeh_test_evaluations)
// -------------------------------------------------------------

export async function listJehEvaluations(params?: {
  rating?: string
  status?: string
}): Promise<JehTestEvaluationItem[]> {
  const filters: string[] = []
  if (params?.rating && params.rating !== 'all') {
    filters.push(`rating = "${params.rating}"`)
  }
  if (params?.status && params.status !== 'all') {
    filters.push(`status = "${params.status}"`)
  }
  const filter = filters.length > 0 ? filters.join(' && ') : ''

  const records = await pb.collection('jeh_test_evaluations').getFullList({
    filter: filter || undefined,
    sort: '-created',
  })

  return records.map((r) => ({
    id: r.id,
    user_name: r.user_name,
    user_question: r.user_question,
    assistant_response: r.assistant_response,
    rating: r.rating,
    feedback_notes: r.feedback_notes,
    suggested_correction: r.suggested_correction,
    status: r.status,
    target_category: r.target_category,
    created: r.created,
    updated: r.updated,
  }))
}

export async function createJehEvaluation(data: {
  user_name?: string
  user_question: string
  assistant_response: string
  rating: 'correta' | 'parcial' | 'incorreta'
  feedback_notes?: string
  suggested_correction?: string
  target_category?: string
  status?: 'pendente_validacao' | 'aprovada_na_base' | 'rejeitada'
}): Promise<JehTestEvaluationItem> {
  const rec = await pb.collection('jeh_test_evaluations').create({
    ...data,
    status: data.status || 'pendente_validacao',
  })
  return rec as unknown as JehTestEvaluationItem
}

export async function updateJehEvaluation(
  id: string,
  data: Partial<JehTestEvaluationItem>,
): Promise<JehTestEvaluationItem> {
  const rec = await pb.collection('jeh_test_evaluations').update(id, data)
  return rec as unknown as JehTestEvaluationItem
}

// -------------------------------------------------------------
// HISTÓRICO CONSOLIDADO DE ATENDIMENTOS (Origem: Teste x Público)
// -------------------------------------------------------------

export interface JehInteractionItem {
  id: string
  origin: 'teste' | 'publico'
  user_name: string
  question: string
  response: string
  date: string
  rating?: 'correta' | 'parcial' | 'incorreta' | 'nao_avaliada'
  status?: string
}

export async function listJehInteractionsHistory(): Promise<JehInteractionItem[]> {
  const interactions: JehInteractionItem[] = []

  // 1. Origem Teste: jeh_test_evaluations
  try {
    const evals = await pb.collection('jeh_test_evaluations').getFullList({
      sort: '-created',
    })
    for (const ev of evals) {
      interactions.push({
        id: `eval_${ev.id}`,
        origin: 'teste',
        user_name: ev.user_name || 'Usuário em Teste',
        question: ev.user_question,
        response: ev.assistant_response,
        date: ev.created,
        rating: ev.rating,
        status: ev.status,
      })
    }
  } catch {
    // Silencioso se der erro
  }

  // 2. Origem Teste: jeh_unanswered (com source='teste')
  try {
    const unans = await pb.collection('jeh_unanswered').getFullList({
      sort: '-created',
    })
    for (const un of unans) {
      interactions.push({
        id: `unans_${un.id}`,
        origin: (un.source === 'publico' ? 'publico' : 'teste'),
        user_name: un.source === 'publico' ? 'Visitante Externo' : 'Teste de Equipe',
        question: un.question,
        response: un.assigned_answer || 'Não tenho essa informação confirmada no momento...',
        date: un.last_asked_at || un.created,
        rating: 'incorreta',
        status: un.status,
      })
    }
  } catch {
    // Silencioso
  }

  // 3. Origem Público: chat_messages associadas a conversas com a IA
  try {
    const publicMsgs = await pb.collection('chat_messages').getList(1, 100, {
      filter: 'sender = "ai" || sender = "client"',
      sort: '-created',
      expand: 'conversation_id',
    })

    // Agrupar pares pergunta-resposta
    const convMap = new Map<string, { user?: string; clientText?: string; aiText?: string; date?: string }>()
    for (const m of publicMsgs.items) {
      const convId = m.conversation_id
      if (!convMap.has(convId)) {
        convMap.set(convId, {
          user: (m.expand?.conversation_id?.client_name) || 'Visitante Público',
          date: m.created,
        })
      }
      const entry = convMap.get(convId)!
      if (m.sender === 'client' && !entry.clientText) {
        entry.clientText = m.content
      } else if (m.sender === 'ai' && !entry.aiText) {
        entry.aiText = m.content
      }
    }

    convMap.forEach((val, convId) => {
      if (val.clientText) {
        interactions.push({
          id: `conv_${convId}`,
          origin: 'publico',
          user_name: val.user || 'Visitante Externo',
          question: val.clientText,
          response: val.aiText || 'Atendimento em andamento',
          date: val.date || new Date().toISOString(),
          rating: 'nao_avaliada',
          status: 'finalizada',
        })
      }
    })
  } catch {
    // Silencioso
  }

  // Ordenar por data decrescente
  interactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return interactions
}

// -------------------------------------------------------------
// INDICADORES DA VISÃO GERAL (Métricas reais)
// -------------------------------------------------------------

export async function getJehOverviewStats(): Promise<JehOverviewStats> {
  const [
    assistantStatus,
    knowledgeItems,
    qaItems,
    unansweredItems,
    evaluations,
  ] = await Promise.all([
    getJehAssistantStatus(),
    listJehKnowledge(),
    listJehQa(),
    listJehUnanswered(),
    listJehEvaluations(),
  ])

  const totalAnswered = qaItems.length + knowledgeItems.length
  const totalUnanswered = unansweredItems.reduce((acc, curr) => acc + (curr.count || 1), 0)
  const totalQuestionsReceived = totalAnswered + totalUnanswered + evaluations.length

  const evaluationsCount = evaluations.length
  const evaluationsCorrect = evaluations.filter((e) => e.rating === 'correta').length
  const evaluationsPartial = evaluations.filter((e) => e.rating === 'parcial').length
  const evaluationsIncorrect = evaluations.filter((e) => e.rating === 'incorreta').length

  let lastKnowledgeUpdate: string | null = null
  if (knowledgeItems.length > 0) {
    lastKnowledgeUpdate = knowledgeItems[0].updated || knowledgeItems[0].created
  }

  // Assuntos mais frequentes (a partir das categorias de knowledge, qa e unanswered)
  const topicCounts = new Map<string, number>()
  for (const k of knowledgeItems) {
    topicCounts.set(k.category, (topicCounts.get(k.category) || 0) + 1)
  }
  for (const q of qaItems) {
    topicCounts.set(q.category, (topicCounts.get(q.category) || 0) + 1)
  }
  for (const u of unansweredItems) {
    const top = u.identified_topic || 'Outros'
    topicCounts.set(top, (topicCounts.get(top) || 0) + (u.count || 1))
  }

  const topTopics = Array.from(topicCounts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalQuestionsReceived,
    totalAnswered,
    totalUnanswered,
    evaluationsCount,
    evaluationsCorrect,
    evaluationsPartial,
    evaluationsIncorrect,
    knowledgeCount: knowledgeItems.length,
    qaCount: qaItems.length,
    lastKnowledgeUpdate,
    assistantStatus,
    topTopics,
  }
}
