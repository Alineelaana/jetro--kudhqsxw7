import pb from '@/lib/pocketbase/client'

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

export type JehUnansweredClassification =
  | 'sem_conteudo_base'
  | 'resposta_incompleta'
  | 'encaminhamento_desnecessario'
  | 'falha_recuperacao'
  | 'pergunta_frequente'
  | 'coberta_pela_base'
  | 'geral'

export interface JehUnansweredItem {
  id: string
  question: string
  date: string
  occurrences: number
  subject?: string
  classification?: JehUnansweredClassification
  provided_answer?: string
  approved_correction?: string
  resolution_date?: string
  source?: 'publico' | 'teste'
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
  lead_source?: string
  greeting_message?: string
  notification_recipients?: string
  notification_events?: string
  notification_mode?: string
  lgpd_notice?: string
}

const SETTING_KEY_STATUS = 'jeh_assistant_status'
const SETTING_KEY_DEFAULT_MSG = 'jeh_unanswered_default_message'
const SETTING_KEY_CONTACT_CHANNELS = 'jeh_contact_channels'
const SETTING_KEY_LEAD_SOURCE = 'jeh_lead_source'
const SETTING_KEY_GREETING_MSG = 'jeh_greeting_message'
const SETTING_KEY_NOTIF_RECIPIENTS = 'jeh_notification_recipients'
const SETTING_KEY_NOTIF_EVENTS = 'jeh_notification_events'
const SETTING_KEY_NOTIF_MODE = 'jeh_notification_mode'
const SETTING_KEY_LGPD_NOTICE = 'jeh_lgpd_notice'

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
      '[Nome], ainda não tenho essa informação confirmada. Nossa equipe pode verificar esse ponto e orientar você pelo WhatsApp: https://wa.me/5531991297619'
    let channels: { channel: string; value: string; description?: string }[] = [
      {
        channel: 'WhatsApp Oficial',
        value: 'https://wa.me/5531991297619',
        description: 'Atendimento comercial, demonstração, dúvidas e cotações',
      },
    ]
    let leadSource = 'Jeh — Site Jetro'
    let greetingMsg =
      'Olá! Sou a Jeh, assistente virtual do Jetro. 😊 Para começarmos, me informe seu nome, telefone com DDD e melhor e-mail. Esses dados serão utilizados para registrar seu atendimento e permitir que nossa equipe retorne seu contato.'

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

    try {
      const srcRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_LEAD_SOURCE}"`)
      if (srcRec?.value) leadSource = srcRec.value
    } catch {
      // Usa padrão
    }

    try {
      const grtRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_GREETING_MSG}"`)
      if (grtRec?.value) greetingMsg = grtRec.value
    } catch {
      // Usa padrão
    }

    let notifRecipients = 'comercial@jetro.com.br'
    let notifEvents = 'lead_captured,demo_requested'
    let notifMode = 'imediato'
    let lgpdNotice =
      'Seus dados são protegidos e tratados para atendimento comercial do Jetro de acordo com a LGPD.'

    try {
      const nrRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_NOTIF_RECIPIENTS}"`)
      if (nrRec?.value) notifRecipients = nrRec.value
    } catch {
      /* intentionally ignored */
    }

    try {
      const neRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_NOTIF_EVENTS}"`)
      if (neRec?.value) notifEvents = neRec.value
    } catch {
      /* intentionally ignored */
    }

    try {
      const nmRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_NOTIF_MODE}"`)
      if (nmRec?.value) notifMode = nmRec.value
    } catch {
      /* intentionally ignored */
    }

    try {
      const lgRec = await pb
        .collection('settings')
        .getFirstListItem(`key = "${SETTING_KEY_LGPD_NOTICE}"`)
      if (lgRec?.value) lgpdNotice = lgRec.value
    } catch {
      /* intentionally ignored */
    }

    return {
      assistant_status: status,
      unanswered_default_message: defaultMsg,
      contact_channels: channels,
      lead_source: leadSource,
      greeting_message: greetingMsg,
      notification_recipients: notifRecipients,
      notification_events: notifEvents,
      notification_mode: notifMode,
      lgpd_notice: lgpdNotice,
    }
  },

  async getRecentNotifications(limit = 20): Promise<any[]> {
    try {
      return await pb.collection('jeh_notifications').getFullList({
        sort: '-created',
        requestKey: null,
      })
    } catch {
      return []
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

    if (config.lead_source !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_LEAD_SOURCE}"`)
      } catch {
        record = null
      }
      if (record) {
        await pb.collection('settings').update(record.id, { value: config.lead_source })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_LEAD_SOURCE,
          value: config.lead_source,
          description: 'Origem padrão para leads cadastrados pela Jeh',
        })
      }
    }

    if (config.greeting_message !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_GREETING_MSG}"`)
      } catch {
        record = null
      }
      if (record) {
        await pb.collection('settings').update(record.id, { value: config.greeting_message })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_GREETING_MSG,
          value: config.greeting_message,
          description: 'Mensagem de abertura mandatória da Jeh para identificação',
        })
      }
    }

    if (config.notification_recipients !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_NOTIF_RECIPIENTS}"`)
      } catch {
        /* intentionally ignored */
      }
      if (record) {
        await pb.collection('settings').update(record.id, { value: config.notification_recipients })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_NOTIF_RECIPIENTS,
          value: config.notification_recipients,
          description: 'E-mails destinatários das notificações de novos leads da Jeh',
        })
      }
    }

    if (config.notification_events !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_NOTIF_EVENTS}"`)
      } catch {
        /* intentionally ignored */
      }
      if (record) {
        await pb.collection('settings').update(record.id, { value: config.notification_events })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_NOTIF_EVENTS,
          value: config.notification_events,
          description: 'Eventos que disparam notificações da Jeh',
        })
      }
    }

    if (config.notification_mode !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_NOTIF_MODE}"`)
      } catch {
        /* intentionally ignored */
      }
      if (record) {
        await pb.collection('settings').update(record.id, { value: config.notification_mode })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_NOTIF_MODE,
          value: config.notification_mode,
          description: 'Modo de envio das notificações (imediato ou consolidado)',
        })
      }
    }

    if (config.lgpd_notice !== undefined) {
      let record = null
      try {
        record = await pb
          .collection('settings')
          .getFirstListItem(`key = "${SETTING_KEY_LGPD_NOTICE}"`)
      } catch {
        /* intentionally ignored */
      }
      if (record) {
        await pb.collection('settings').update(record.id, { value: config.lgpd_notice })
      } else {
        await pb.collection('settings').create({
          key: SETTING_KEY_LGPD_NOTICE,
          value: config.lgpd_notice,
          description: 'Aviso LGPD de privacidade no chat da Jeh',
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
        subjectMap[cat] =
          (subjectMap[cat] || 0) + ((item as any).hit_count || (item as any).access_count || 1)
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
        const r = (item as any).rating || (item as any).evaluation
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
      // Mapear filtro caso passe status = ... para approval_status = ...
      const backendFilter = filter ? filter.replace(/\bstatus\b/g, 'approval_status') : undefined
      const records = await pb.collection('jeh_knowledge').getFullList({
        filter: backendFilter,
        sort,
      })
      return records.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        content: r.content,
        keywords: r.keywords || '',
        status: (r.approval_status || r.status || 'rascunho') as JehKnowledgeStatus,
        responsible: r.responsible_name || r.responsible || '',
        source_document: r.source_file || r.source_document || '',
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
    const statusVal = data.status || 'rascunho'
    const record = await pb.collection('jeh_knowledge').create({
      title: data.title,
      category: data.category,
      content: data.content,
      keywords: data.keywords || '',
      approval_status: statusVal,
      responsible_name: data.responsible || pb.authStore.record?.email || 'Administrador',
      source_type: data.source_document ? 'manual' : '',
    })
    return {
      id: record.id,
      title: (record as any).title,
      category: (record as any).category,
      content: (record as any).content,
      keywords: (record as any).keywords,
      status: ((record as any).approval_status ||
        (record as any).status ||
        statusVal) as JehKnowledgeStatus,
      responsible: (record as any).responsible_name || (record as any).responsible,
      source_document: (record as any).source_file || (record as any).source_document,
      created: record.created,
      updated: record.updated,
    }
  },

  async updateKnowledge(id: string, data: Partial<JehKnowledgeItem>): Promise<JehKnowledgeItem> {
    const payload: any = { ...data }
    if (data.status) {
      payload.approval_status = data.status
    }
    if (data.responsible) {
      payload.responsible_name = data.responsible
    }
    const record = await pb.collection('jeh_knowledge').update(id, payload)
    return {
      id: record.id,
      title: (record as any).title,
      category: (record as any).category,
      content: (record as any).content,
      keywords: (record as any).keywords,
      status: ((record as any).approval_status ||
        (record as any).status ||
        'rascunho') as JehKnowledgeStatus,
      responsible: (record as any).responsible_name || (record as any).responsible,
      source_document: (record as any).source_file || (record as any).source_document,
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
      // Converter status = 'ativo' para approval_status = 'aprovado' no filtro se necessário
      let backendFilter = filter
      if (backendFilter) {
        backendFilter = backendFilter
          .replace(/status\s*=\s*['"]ativo['"]/g, "approval_status = 'aprovado'")
          .replace(/status\s*=\s*['"]inativo['"]/g, "approval_status = 'inativo'")
          .replace(/status\s*=\s*['"]rascunho['"]/g, "approval_status = 'rascunho'")
      }

      const records = await pb.collection('jeh_qa').getFullList({
        filter: backendFilter,
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
        const canonQ = r.canonical_question || r.question || ''
        const rawStatus = r.approval_status || r.status || 'aprovado'
        const mappedStatus: JehQAStatus =
          rawStatus === 'aprovado' ? 'ativo' : rawStatus === 'inativo' ? 'inativo' : 'rascunho'

        return {
          id: r.id,
          question: canonQ,
          official_answer: r.official_answer || '',
          variations,
          category: r.category || 'Geral',
          access_count: r.hit_count ?? r.access_count ?? 0,
          status: mappedStatus,
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
    const rawStatus = data.status || 'ativo'
    const approvalStatus =
      rawStatus === 'ativo' ? 'aprovado' : rawStatus === 'inativo' ? 'inativo' : 'rascunho'
    const record = await pb.collection('jeh_qa').create({
      canonical_question: data.question,
      official_answer: data.official_answer,
      variations: data.variations || [],
      category: data.category || 'FAQ',
      hit_count: 0,
      approval_status: approvalStatus,
      keywords: data.question.toLowerCase(),
      responsible_name: pb.authStore.record?.email || 'Administrador',
    })
    return {
      id: record.id,
      question: (record as any).canonical_question || (record as any).question,
      official_answer: (record as any).official_answer,
      variations: Array.isArray((record as any).variations) ? (record as any).variations : [],
      category: (record as any).category,
      access_count: (record as any).hit_count || 0,
      status: rawStatus,
      created: record.created,
      updated: record.updated,
    }
  },

  async updateQA(id: string, data: Partial<JehQAItem>): Promise<JehQAItem> {
    const payload: any = {}
    if (data.question !== undefined) payload.canonical_question = data.question
    if (data.official_answer !== undefined) payload.official_answer = data.official_answer
    if (data.variations !== undefined) payload.variations = data.variations
    if (data.category !== undefined) payload.category = data.category
    if (data.access_count !== undefined) payload.hit_count = data.access_count
    if (data.status !== undefined) {
      payload.approval_status =
        data.status === 'ativo' ? 'aprovado' : data.status === 'inativo' ? 'inativo' : 'rascunho'
    }
    const record = await pb.collection('jeh_qa').update(id, payload)
    const rawStatus = (record as any).approval_status || (record as any).status || 'aprovado'
    const mappedStatus: JehQAStatus =
      rawStatus === 'aprovado' ? 'ativo' : rawStatus === 'inativo' ? 'inativo' : 'rascunho'

    return {
      id: record.id,
      question: (record as any).canonical_question || (record as any).question,
      official_answer: (record as any).official_answer,
      variations: Array.isArray((record as any).variations) ? (record as any).variations : [],
      category: (record as any).category,
      access_count: (record as any).hit_count ?? (record as any).access_count ?? 0,
      status: mappedStatus,
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
  async listUnanswered(filter?: string, sort = '-created'): Promise<JehUnansweredItem[]> {
    try {
      const records = await pb.collection('jeh_unanswered').getFullList({
        filter,
        sort: sort === '-occurrences' ? '-count' : sort,
      })
      return records.map((r: any) => {
        const rawStatus = r.status || 'pendente'
        const mappedStatus: JehUnansweredStatus =
          rawStatus === 'respondida' ? 'respondido' : (rawStatus as JehUnansweredStatus)
        return {
          id: r.id,
          question: r.question,
          date: r.last_asked_at || r.created,
          occurrences: r.count || r.occurrences || 1,
          subject: r.identified_topic || r.subject || 'Geral',
          classification: (r.classification || 'sem_conteudo_base') as JehUnansweredClassification,
          provided_answer: r.provided_answer || '',
          approved_correction: r.approved_correction || '',
          resolution_date: r.resolution_date || '',
          source: r.source || 'publico',
          status: mappedStatus,
          created: r.created,
          updated: r.updated,
        }
      })
    } catch (err) {
      console.error('Erro ao listar perguntas sem resposta Jeh:', err)
      return []
    }
  },

  async updateUnansweredStatus(
    id: string,
    status: JehUnansweredStatus,
    extra?: {
      classification?: JehUnansweredClassification
      approved_correction?: string
    },
  ): Promise<void> {
    const backendStatus = status === 'respondido' ? 'respondida' : status
    const payload: any = { status: backendStatus }
    if (extra?.classification) payload.classification = extra.classification
    if (extra?.approved_correction) payload.approved_correction = extra.approved_correction
    if (status === 'respondido') payload.resolution_date = new Date().toISOString()
    await pb.collection('jeh_unanswered').update(id, payload)
  },

  async updateUnansweredClassification(
    id: string,
    classification: JehUnansweredClassification,
  ): Promise<void> {
    await pb.collection('jeh_unanswered').update(id, { classification })
  },

  async convertUnansweredToQA(
    unansweredId: string,
    data: {
      question: string
      official_answer: string
      variations: string[]
      category: string
      classification?: JehUnansweredClassification
    },
  ): Promise<JehQAItem> {
    const newQA = await this.createQA({
      question: data.question,
      official_answer: data.official_answer,
      variations: data.variations,
      category: data.category,
      status: 'ativo',
    })
    await this.updateUnansweredStatus(unansweredId, 'respondido', {
      classification: data.classification,
      approved_correction: data.official_answer,
    })
    return newQA
  },

  // ==========================================
  // TESTE INTERNO E AVALIAÇÕES (jeh_test_evaluations + hook test-chat)
  // ==========================================
  async sendTestMessage(
    message: string,
    history: any[] = [],
  ): Promise<{ reply: string; sources?: any[] }> {
    try {
      const response = await pb.send('/backend/v1/jeh/test-chat', {
        method: 'POST',
        body: { message, history },
      })
      return {
        reply:
          response?.response || response?.reply || 'Sem resposta retornada pelo agente de teste.',
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
      user_name: pb.authStore.record?.name || pb.authStore.record?.email || 'Administrador',
      user_question: data.question,
      assistant_response: data.assistant_reply,
      rating: data.evaluation,
      feedback_notes: data.notes || '',
      suggested_correction: data.suggested_answer || '',
      status: 'pendente_validacao',
    })
    return {
      id: record.id,
      question: (record as any).user_question || (record as any).question,
      assistant_reply: (record as any).assistant_response || (record as any).assistant_reply,
      evaluation: ((record as any).rating || (record as any).evaluation) as JehEvaluationRating,
      notes: (record as any).feedback_notes || (record as any).notes,
      suggested_answer: (record as any).suggested_correction || (record as any).suggested_answer,
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
        question: r.user_question || r.question || '',
        assistant_reply: r.assistant_response || r.assistant_reply || '',
        evaluation: (r.rating || r.evaluation || 'correta') as JehEvaluationRating,
        notes: r.feedback_notes || r.notes || '',
        suggested_answer: r.suggested_correction || r.suggested_answer || '',
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
    // Validação/indexação de integridade dos registros de conhecimento e Q&A aprovados
    const kb = await this.listKnowledge("approval_status = 'aprovado'")
    const qa = await this.listQA("approval_status = 'aprovado'")
    return {
      processedCount: kb.length + qa.length,
      timestamp: new Date().toISOString(),
    }
  },
}
