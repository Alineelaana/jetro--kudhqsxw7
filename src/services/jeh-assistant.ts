import { pb } from '@/lib/pocketbase/client'

export type JehKnowledgeStatus = 'rascunho' | 'aprovado' | 'revisar' | 'inativo'
export type JehQAStatus = 'ativo' | 'inativo' | 'rascunho'
export type JehUnansweredStatus = 'pendente' | 'em_analise' | 'respondido' | 'descartado'
export type JehAssistantStatus = 'inativa' | 'ativa'
export type JehEvaluationRating = 'correta' | 'parcial' | 'incorreta'

export interface JehKnowledgeItem {
  id: string
  title: string
  category: string
  content: string
  keywords?: string
  status: JehKnowledgeStatus
  responsible?: string
  source_document?: string
  created: string
  updated: string
}

export interface JehQAItem {
  id: string
  question: string
  official_answer: string
  variations: string[]
  category: string
  access_count: number
  status: JehQAStatus
  created: string
  updated: string
}

export interface JehUnansweredItem {
  id: string
  question: string
  date: string
  occurrences: number
  subject?: string
  status: JehUnansweredStatus
  created: string
  updated: string
}

export interface JehTestEvaluationItem {
  id: string
  question: string
  assistant_reply: string
  evaluation: JehEvaluationRating
  notes?: string
  suggested_answer?: string
  created: string
  updated: string
}

export interface JehOverviewStats {
  totalQuestions: number
  answeredCount: number
  unansweredCount: number
  evaluatedCorrectCount: number
  evaluatedImprovementCount: number
  topSubjects: { subject: string; count: number }[]
  lastKnowledgeUpdate: string | null
  assistantStatus: JehAssistantStatus
}

export interface JehSettingsConfig {
  assistant_status: JehAssistantStatus
  unanswered_default_message: string
  contact_channels: {
    channel: string
    value: string
    description?: string
  }[]
}

const SETTING_KEY_STATUS = 'jeh_assistant_status'
const SETTING_KEY_DEFAULT_MSG = 'jeh_unanswered_default_message'
const SETTING_KEY_CONTACT_CHANNELS = 'jeh_contact_channels'

export const JehAssistantService = {
  // ==========================================
  // CONFIGURAÇÕES E STATUS (persistido em settings)
  // ==========================================
  async getAssistantStatus(): Promise<JehAssistantStatus> {
    try {
      const record = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_STATUS}"`)
      return (record.value as JehAssistantStatus) || 'inativa'
    } catch {
      return 'inativa'
    }
  },

  async setAssistantStatus(status: JehAssistantStatus): Promise<boolean> {
    try {
      let record
      try {
        record = await pb.collection('settings').getFirstListItem(`key = "${SETTING_KEY_STATUS}"`)
      } catch {
        record = null
      }

      if (record) {
        await pb.collection('settings').update(record.id, {
          value: status,
          description: 'Status operacional da Assistente Institucional Jeh (ativa/inativa)',
        })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_STATUS,
          value: status,
          description: 'Status operacional da Assistente Institucional Jeh (ativa/inativa)',
        })
      }
      return true
    } catch (err) {
      console.error('Erro ao atualizar status da Jeh:', err)
      throw err
    }
  },

  async getSettings(): Promise<JehSettingsConfig> {
    const status = await this.getAssistantStatus()
    let defaultMsg =
      'Ainda não possuo essa informação em minha base oficial. Nossa equipe institucional pode ajudar diretamente através dos nossos canais oficiais.'
    let channels: { channel: string; value: string; description?: string }[] = [
      { channel: 'E-mail', value: 'contato@jetro.com.br', description: 'Atendimento geral' },
      { channel: 'WhatsApp', value: '+55 11 99999-0000', description: 'Suporte institucional' },
      { channel: 'Site', value: 'https://jetro.com.br', description: 'Portal oficial' },
    ]

    try {
      const msgRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_DEFAULT_MSG}"`)
      if (msgRec?.value) defaultMsg = msgRec.value
    } catch {
      // Usa padrão
    }

    try {
      const chRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_CONTACT_CHANNELS}"`)
      if (chRec?.value) {
        channels = typeof chRec.value === 'string' ? JSON.parse(chRec.value) : chRec.value
      }
    } catch {
      // Usa padrão
    }

    return {
      assistant_status: status,
      unanswered_default_message: defaultMsg,
      contact_channels: channels,
    }
  },

  async saveSettings(config: Partial<JehSettingsConfig>): Promise<void> {
    if (config.assistant_status) {
      await this.setAssistantStatus(config.assistant_status)
    }

    if (config.unanswered_default_message !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_DEFAULT_MSG}"`)
      } catch {
        record = null
      }
      if (record) {
        await pb
          .collection('settings')
          .update(record.id, { value: config.unanswered_default_message })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_DEFAULT_MSG,
          value: config.unanswered_default_message,
          description: 'Mensagem padrão da Jeh quando não encontrar resposta oficial',
        })
      }
    }

    if (config.contact_channels !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_CONTACT_CHANNELS}"`)
      } catch {
        record = null
      }
      const val =
        typeof config.contact_channels === 'string'
          ? config.contact_channels
          : JSON.stringify(config.contact_channels)
      if (record) {
        await pb.collection('settings').update(record.id, { value: val })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_CONTACT_CHANNELS,
          value: val,
          description: 'Canais de contato apresentáveis pela Jeh',
        })
      }
    }
  },

  // ==========================================
  // INDICADORES DE VISÃO GERAL
  // ==========================================
  async getOverviewStats(): Promise<JehOverviewStats> {
    const status = await this.getAssistantStatus()

    let totalQA = 0
    let totalUnanswered = 0
    let evaluatedCorrect = 0
    let evaluatedImprovement = 0
    let lastUpdate: string | null = null
    const subjectMap: Record<string, number> = {}

    try {
      const qaList = await pb.collection('jeh_qa').getList(1, 200, { sort: '-created' })
      totalQA = qaList.totalItems
      for (const item of qaList.items) {
        const cat = (item as any).category || 'Geral'
        subjectMap[cat] = (subjectMap[cat] || 0) + ((item as any).access_count || 1)
      }
    } catch {
      // Coleção vazia ou não acessível
    }

    try {
      const unList = await pb.collection('jeh_unanswered').getList(1, 200, { sort: '-created' })
      totalUnanswered = unList.totalItems
      for (const item of unList.items) {
        const subj = (item as any).subject || 'Não classificado'
        subjectMap[subj] = (subjectMap[subj] || 0) + ((item as any).occurrences || 1)
      }
    } catch {
      // Silencioso
    }

    try {
      const evalList = await pb.collection('jeh_test_evaluations').getList(1, 500)
      for (const item of evalList.items) {
        const r = (item as any).evaluation
        if (r === 'correta') evaluatedCorrect++
        if (r === 'parcial' || r === 'incorreta') evaluatedImprovement++
      }
    } catch {
      // Silencioso
    }

    try {
      const kbList = await pb.collection('jeh_knowledge').getList(1, 1, { sort: '-updated' })
      if (kbList.items.length > 0) {
        lastUpdate = kbList.items[0].updated
      }
    } catch {
      // Silencioso
    }

    const topSubjects = Object.entries(subjectMap)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalQuestions: totalQA + totalUnanswered,
      answeredCount: totalQA,
      unansweredCount: totalUnanswered,
      evaluatedCorrectCount: evaluatedCorrect,
      evaluatedImprovementCount: evaluatedImprovement,
      topSubjects,
      lastKnowledgeUpdate: lastUpdate,
      assistantStatus: status,
    }
  },

  // ==========================================
  // BASE DE CONHECIMENTO (jeh_knowledge)
  // ==========================================
  async listKnowledge(filter?: string, sort = '-updated'): Promise<JehKnowledgeItem[]> {
    try {
      const records = await pb.collection('jeh_knowledge').getFullList({
        filter,
        sort,
      })
      return records.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        content: r.content,
        keywords: r.keywords || '',
        status: r.status,
        responsible: r.responsible || '',
        source_document: r.source_document || '',
        created: r.created,
        updated: r.updated,
      }))
    } catch (err) {
      console.error('Erro ao listar conhecimento Jeh:', err)
      return []
    }
  },

  async createKnowledge(data: {
    title: string
    category: string
    content: string
    keywords?: string
    status?: JehKnowledgeStatus
    responsible?: string
    source_document?: string
  }): Promise<JehKnowledgeItem> {
    const record = await pb.collection('jeh_knowledge').create({
      title: data.title,
      category: data.category,
      content: data.content,
      keywords: data.keywords || '',
      status: data.status || 'rascunho',
      responsible: data.responsible || pb.authStore.record?.email || '',
      source_document: data.source_document || '',
    })
    return {
      id: record.id,
      title: (record as any).title,
      category: (record as any).category,
      content: (record as any).content,
      keywords: (record as any).keywords,
      status: (record as any).status,
      responsible: (record as any).responsible,
      source_document: (record as any).source_document,
      created: record.created,
      updated: record.updated,
    }
  },

  async updateKnowledge(id: string, data: Partial<JehKnowledgeItem>): Promise<JehKnowledgeItem> {
    const record = await pb.collection('jeh_knowledge').update(id, data)
    return {
      id: record.id,
      title: (record as any).title,
      category: (record as any).category,
      content: (record as any).content,
      keywords: (record as any).keywords,
      status: (record as any).status,
      responsible: (record as any).responsible,
      source_document: (record as any).source_document,
      created: record.created,
      updated: record.updated,
    }
  },

  async deleteKnowledge(id: string): Promise<boolean> {
    await pb.collection('jeh_knowledge').delete(id)
    return true
  },

  // ==========================================
  // PERGUNTAS E RESPOSTAS (jeh_qa)
  // ==========================================
  async listQA(filter?: string, sort = '-created'): Promise<JehQAItem[]> {
    try {
      const records = await pb.collection('jeh_qa').getFullList({
        filter,
        sort,
      })
      return records.map((r: any) => {
        let variations: string[] = []
        if (Array.isArray(r.variations)) {
          variations = r.variations
        } else if (typeof r.variations === 'string' && r.variations.trim()) {
          try {
            variations = JSON.parse(r.variations)
          } catch {
            variations = r.variations.split('\n').filter(Boolean)
          }
        }
        return {
          id: r.id,
          question: r.question,
          official_answer: r.official_answer,
          variations,
          category: r.category,
          access_count: r.access_count || 0,
          status: r.status,
          created: r.created,
          updated: r.updated,
        }
      })
    } catch (err) {
      console.error('Erro ao listar Q&A Jeh:', err)
      return []
    }
  },

  async createQA(data: {
    question: string
    official_answer: string
    variations: string[]
    category: string
    status?: JehQAStatus
  }): Promise<JehQAItem> {
    const record = await pb.collection('jeh_qa').create({
      question: data.question,
      official_answer: data.official_answer,
      variations: data.variations,
      category: data.category,
      access_count: 0,
      status: data.status || 'ativo',
    })
    return {
      id: record.id,
      question: (record as any).question,
      official_answer: (record as any).official_answer,
      variations: Array.isArray((record as any).variations) ? (record as any).variations : [],
      category: (record as any).category,
      access_count: (record as any).access_count || 0,
      status: (record as any).status,
      created: record.created,
      updated: record.updated,
    }
  },

  async updateQA(id: string, data: Partial<JehQAItem>): Promise<JehQAItem> {
    const record = await pb.collection('jeh_qa').update(id, data)
    return {
      id: record.id,
      question: (record as any).question,
      official_answer: (record as any).official_answer,
      variations: Array.isArray((record as any).variations) ? (record as any).variations : [],
      category: (record as any).category,
      access_count: (record as any).access_count || 0,
      status: (record as any).status,
      created: record.created,
      updated: record.updated,
    }
  },

  async deleteQA(id: string): Promise<boolean> {
    await pb.collection('jeh_qa').delete(id)
    return true
  },

  // ==========================================
  // PERGUNTAS SEM RESPOSTA (jeh_unanswered)
  // ==========================================
  async listUnanswered(filter?: string, sort = '-occurrences'): Promise<JehUnansweredItem[]> {
    try {
      const records = await pb.collection('jeh_unanswered').getFullList({
        filter,
        sort,
      })
      return records.map((r: any) => ({
        id: r.id,
        question: r.question,
        date: r.date || r.created,
        occurrences: r.occurrences || 1,
        subject: r.subject || '',
        status: r.status,
        created: r.created,
        updated: r.updated,
      }))
    } catch (err) {
      console.error('Erro ao listar perguntas sem resposta Jeh:', err)
      return []
    }
  },

  async updateUnansweredStatus(id: string, status: JehUnansweredStatus): Promise<void> {
    await pb.collection('jeh_unanswered').update(id, { status })
  },

  async convertUnansweredToQA(
    unansweredId: string,
    data: {
      question: string
      official_answer: string
      variations: string[]
      category: string
    },
  ): Promise<JehQAItem> {
    const newQA = await this.createQA({
      ...data,
      status: 'ativo',
    })
    await this.updateUnansweredStatus(unansweredId, 'respondido')
    return newQA
  },

  // ==========================================
  // TESTE INTERNO E AVALIAÇÕES (jeh_test_evaluations + hook test-chat)
  // ==========================================
  async sendTestMessage(message: string): Promise<{ reply: string; sources?: any[] }> {
    try {
      const response = await pb.send('/backend/v1/jeh/test-chat', {
        method: 'POST',
        body: { message },
      })
      return {
        reply: response?.reply || 'Sem resposta retornada pelo agente de teste.',
        sources: response?.sources || [],
      }
    } catch (err: any) {
      console.error('Erro ao chamar teste da Jeh:', err)
      throw new Error(err.message || 'Falha na comunicação com o assistente de teste.')
    }
  },

  async submitEvaluation(data: {
    question: string
    assistant_reply: string
    evaluation: JehEvaluationRating
    notes?: string
    suggested_answer?: string
  }): Promise<JehTestEvaluationItem> {
    const record = await pb.collection('jeh_test_evaluations').create({
      question: data.question,
      assistant_reply: data.assistant_reply,
      evaluation: data.evaluation,
      notes: data.notes || '',
      suggested_answer: data.suggested_answer || '',
    })
    return {
      id: record.id,
      question: (record as any).question,
      assistant_reply: (record as any).assistant_reply,
      evaluation: (record as any).evaluation,
      notes: (record as any).notes,
      suggested_answer: (record as any).suggested_answer,
      created: record.created,
      updated: record.updated,
    }
  },

  async listEvaluations(filter?: string, sort = '-created'): Promise<JehTestEvaluationItem[]> {
    try {
      const records = await pb.collection('jeh_test_evaluations').getFullList({
        filter,
        sort,
      })
      return records.map((r: any) => ({
        id: r.id,
        question: r.question,
        assistant_reply: r.assistant_reply,
        evaluation: r.evaluation,
        notes: r.notes || '',
        suggested_answer: r.suggested_answer || '',
        created: r.created,
        updated: r.updated,
      }))
    } catch (err) {
      console.error('Erro ao listar avaliações Jeh:', err)
      return []
    }
  },

  // ==========================================
  // TREINAMENTO E PROCESSAMENTO DA BASE
  // ==========================================
  async reindexKnowledgeBase(): Promise<{ processedCount: number; timestamp: string }> {
    // Simula validação/indexação de integridade dos registros de conhecimento e Q&A
    const kb = await this.listKnowledge('status = "aprovado"')
    const qa = await this.listQA('status = "ativo"')
    return {
      processedCount: kb.length + qa.length,
      timestamp: new Date().toISOString(),
    }
  },
}
