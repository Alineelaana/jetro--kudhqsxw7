/// <reference path="../pb_data/types.d.ts" />

/**
 * Endpoint de chat público do site com a assistente Jeh (/backend/v1/chat/send)
 *
 * REGRAS DO USUÁRIO — FLUXO REFORMULADO:
 * 1. Recepção inicial obrigatória com mensagem exata:
 *    "Olá! Seja muito bem-vindo(a) ao Jetro! 😊\nEu sou a Jeh, assistente virtual do Jetro, e estou aqui para ajudar você a conhecer melhor nosso sistema.\nAntes de começarmos, gostaria de saber um pouquinho sobre você para personalizar nosso atendimento.\nQual é o seu nome?"
 *    Após o nome, solicitar naturalmente o que falta (telefone com DDD, empresa, e-mail). Não interrogatório mecânico.
 * 2. Captura automática e IMEDIATA de leads em Comercial → Leads:
 *    A CADA informação fornecida, criar ou atualizar IMEDIATAMENTE o lead no banco (não esperar o término).
 *    Deduplicação segura por telefone ou e-mail, ou pelo identificador da conversa (conversation_id).
 *    Campos: nome, telefone, empresa, e-mail, primeiro contato, origem "Chat Jeh — Site Jetro", status,
 *    assunto de interesse, histórico da conversa, última interação, situação do preenchimento dos dados (fill_status).
 * 3. Continuidade natural:
 *    Após coleta: "Prazer em conhecer você, [Nome]! 😊 Agora me conta: o que você gostaria de saber sobre o Jetro?"
 *    NÃO encaminhar ao WhatsApp após o cadastro. Captura e atendimento inteligente funcionam juntos.
 * 4. Prioridade absoluta: responder antes de encaminhar:
 *    Consultar base → localizar → explicar de forma simples → perguntar se deseja saber mais.
 *    WhatsApp (https://wa.me/5531991297619) SOMENTE quando: visitante solicitar, informação indisponível,
 *    negociação de preços/contratos, solicitação explícita de demonstração/comercial.
 * 5. Correção específica de "Como funciona o sistema?":
 *    Explicar com base nas funcionalidades documentadas (ERP modular, áreas atendidas, IA nativa Jeh, Segundo Cérebro, auditoria/validades)
 *    e terminar com: "Você gostaria de conhecer alguma funcionalidade específica ou entender como o Jetro poderia ajudar sua empresa?"
 * 6. Qualificação comercial e Resumo Comercial Automático:
 *    Gera resumo automático vinculado ao lead: quem é a pessoa, empresa, dúvidas, interesse identificado.
 * 7. Notificação de novos leads:
 *    Registra na fila administrativa jeh_notifications e tenta envio de e-mail transacional se configurado.
 * 8. Pergunta sem resposta:
 *    Registra na coleção jeh_unanswered se não coberta pela base oficial.
 */

function extractContactInfo(text, current) {
  var name = current.name || ''
  var email = current.email || ''
  var phone = current.phone || ''
  var company = current.company || ''

  // 1. Extração de e-mail
  if (!email) {
    var emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch) email = emailMatch[0].toLowerCase().trim()
  }

  // 2. Extração de telefone com DDD (brasileiro)
  if (!phone) {
    var phoneMatch = text.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}[-\s]?\d{4}/)
    if (phoneMatch) {
      var digits = phoneMatch[0].replace(/\D/g, '')
      if (digits.length >= 10 && digits.length <= 13) {
        phone = phoneMatch[0].trim()
      }
    }
  }

  // 3. Extração de empresa
  if (!company) {
    var compMatch = text.match(
      /(?:empresa\s+(?:é|e|chama-se|se\s+chama)?|trabalho\s+na|da\s+empresa|sou\s+da)\s+([A-Za-z0-9À-ÖØ-öø-ÿ\s&.-]{2,50})/i,
    )
    if (compMatch && compMatch[1]) {
      var cCandidate = compMatch[1]
        .split(/[.,;\n]/)[0]
        .replace(/^(minha|nossa|uma)\s+/i, '')
        .trim()
      if (cCandidate.length >= 2 && !/^(não|nao|nenhuma|ainda|sou|aqui)$/i.test(cCandidate)) {
        company = cCandidate
      }
    }
  }

  // 4. Extração de nome
  if (!name || name === 'Visitante') {
    var nameMatch = text.match(
      /(?:meu\s+nome\s+(?:é|e)|sou\s+(?:o|a)|me\s+chamo)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{2,40})/i,
    )
    if (nameMatch && nameMatch[1]) {
      var candidate = nameMatch[1].trim().split(/\s+/).slice(0, 4).join(' ')
      if (!/^(apenas|aqui|um|uma|cliente|interessado|visitante|teste)$/i.test(candidate)) {
        name = candidate
      }
    } else {
      // Se a mensagem contém apenas 1 a 3 palavras simples sem pontuação nem números (típica resposta a "Qual é o seu nome?")
      var trimmed = text.trim()
      var words = trimmed.split(/\s+/)
      if (
        words.length >= 1 &&
        words.length <= 4 &&
        /^[A-Za-zÀ-ÖØ-öø-ÿ]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(trimmed) &&
        !/^(olá|ola|oi|bom dia|boa tarde|boa noite|sim|não|nao|ok|quero|saber|ajuda|como|quem|qual|sistema|erp|jetro)$/i.test(
          trimmed,
        )
      ) {
        name = trimmed
      }
    }
  }

  return { name: name, email: email, phone: phone, company: company }
}

function detectInterestAndQualification(text, history) {
  var full = (text + ' ' + (history || '')).toLowerCase()
  var stage = 'Novo Lead'
  var topic = 'Apresentação Geral'
  var systemCurrent = ''
  var operationalPains = ''
  var demoRequested = false

  if (
    full.includes('demonstração') ||
    full.includes('demonstracao') ||
    full.includes('agendar') ||
    full.includes('apresentar') ||
    full.includes('apresentação')
  ) {
    stage = 'Solicita Demonstração'
    demoRequested = true
    topic = 'Solicitação de Demonstração'
  } else if (
    full.includes('contratar') ||
    full.includes('preço') ||
    full.includes('preco') ||
    full.includes('valor') ||
    full.includes('proposta') ||
    full.includes('comprar')
  ) {
    stage = 'Interessado'
    topic = 'Interesse Comercial / Contratação'
  } else if (
    full.includes('wms') ||
    full.includes('estoque') ||
    full.includes('logística') ||
    full.includes('fiscal') ||
    full.includes('produção') ||
    full.includes('financeiro') ||
    full.includes('rh')
  ) {
    stage = 'Em Atendimento'
    topic = 'Módulos Operacionais'
  }

  // Detectar sistema atual se citado
  var sysMatch = full.match(
    /(?:usamos|uso|utilizo|sistema\s+atual|temos\s+o)\s+([a-z0-9\s-]{3,25})/i,
  )
  if (sysMatch && sysMatch[1]) {
    systemCurrent = sysMatch[1].trim()
  }

  // Dificuldades
  if (
    full.includes('dificuldade') ||
    full.includes('problema') ||
    full.includes('gargalo') ||
    full.includes('retrabalho')
  ) {
    operationalPains = 'Identificado relato de dores/dificuldades operacionais na conversa'
  }

  return {
    stage: stage,
    topic: topic,
    systemCurrent: systemCurrent,
    operationalPains: operationalPains,
    demoRequested: demoRequested,
  }
}

function generateCommercialSummary(contact, topic, convHistoryText) {
  var who = contact.name || 'Visitante não identificado'
  var comp = contact.company
    ? 'representando a empresa ' + contact.company
    : 'empresa ainda não informada'
  var phoneStr = contact.phone ? 'Telefone: ' + contact.phone : 'Telefone pendente'
  var emailStr = contact.email ? 'E-mail: ' + contact.email : 'E-mail pendente'

  var doubts = 'Apresentou dúvidas sobre o sistema Jetro e seu funcionamento geral.'
  var lower = (convHistoryText || '').toLowerCase()
  if (lower.includes('como funciona')) {
    doubts = 'Quis entender como o sistema e o ERP modular funcionam na prática.'
  }
  if (lower.includes('fiscal') || lower.includes('nfe')) {
    doubts += ' Teve interesse específico na emissão e conformidade fiscal.'
  }
  if (lower.includes('logística') || lower.includes('estoque') || lower.includes('wms')) {
    doubts += ' Focou em recursos logísticos, WMS e expedição.'
  }
  if (lower.includes('demonstração') || lower.includes('demonstracao')) {
    doubts += ' Demonstrou interesse em agendar demonstração técnica.'
  }

  return (
    'Resumo Comercial Automático da Jeh:\n' +
    '• Contato: ' +
    who +
    ' (' +
    comp +
    ')\n' +
    '• Meios de contato: ' +
    phoneStr +
    ' | ' +
    emailStr +
    '\n' +
    '• Assunto principal: ' +
    topic +
    '\n' +
    '• Diagnóstico da conversa: ' +
    doubts
  )
}

function syncLeadImmediate(app, convId, contact, userMsg, historySummary, chatHistoryObj) {
  var leadsCol = app.findCollectionByNameOrId('crm_leads')
  if (!leadsCol) return { success: false, error: 'Coleção crm_leads ausente' }

  // Se não há NENHUM dado de contato ou nome (nem sequer nome diferente de Visitante), não cria lead fantasma
  var hasAnyContact = !!(
    (contact.name && contact.name !== 'Visitante') ||
    contact.phone ||
    contact.email ||
    contact.company
  )
  if (!hasAnyContact) {
    return { success: false, skipped: true, reason: 'Sem dados de identificação ainda' }
  }

  var existing = null

  // 1. Tentar localizar por conversation_id associado nesta mesma sessão
  if (convId) {
    try {
      var cList = app.findRecordsByFilter(
        'crm_leads',
        "conversation_id = '" + convId.replace(/'/g, "\\'") + "'",
        '-created',
        1,
        0,
      )
      if (cList && cList.length > 0) existing = cList[0]
    } catch (_) {}
  }

  // 2. Tentar por e-mail correspondente para deduplicação / merge seguro
  if (!existing && contact.email) {
    try {
      var cleanEmail = contact.email.replace(/'/g, "\\'")
      var list = app.findRecordsByFilter(
        'crm_leads',
        "email = '" + cleanEmail + "'",
        '-created',
        1,
        0,
      )
      if (list && list.length > 0) existing = list[0]
    } catch (_) {}
  }

  // 3. Tentar por telefone correspondente (últimos 8 dígitos) para deduplicação segura
  if (!existing && contact.phone) {
    try {
      var digits = contact.phone.replace(/\D/g, '')
      if (digits.length >= 8) {
        var pList = app.findRecordsByFilter(
          'crm_leads',
          "phone ~ '" + digits.slice(-8) + "' || whatsapp ~ '" + digits.slice(-8) + "'",
          '-created',
          1,
          0,
        )
        if (pList && pList.length > 0) existing = pList[0]
      }
    } catch (_) {}
  }

  var nowIso = new Date().toISOString()
  var todayStr = nowIso.split('T')[0]

  // Avaliação do preenchimento dos dados (fill_status)
  var hasName = !!(contact.name && contact.name !== 'Visitante')
  var hasPhone = !!contact.phone
  var hasEmail = !!contact.email
  var hasCompany = !!contact.company

  var fillStatus = 'incompleto'
  var filledCount =
    (hasName ? 1 : 0) + (hasPhone ? 1 : 0) + (hasEmail ? 1 : 0) + (hasCompany ? 1 : 0)
  if (filledCount >= 4) {
    fillStatus = 'completo'
  } else if (filledCount >= 2) {
    fillStatus = 'parcial'
  }

  var qual = detectInterestAndQualification(userMsg, historySummary)
  var summaryText = generateCommercialSummary(contact, qual.topic, historySummary + ' ' + userMsg)

  if (existing) {
    if (hasName && (!existing.getString('name') || existing.getString('name') === 'Visitante')) {
      existing.set('name', contact.name)
    }
    if (contact.phone) {
      existing.set('phone', contact.phone)
      existing.set('whatsapp', contact.phone)
    }
    if (contact.email) existing.set('email', contact.email)
    if (contact.company) {
      existing.set('trade_name', contact.company)
    }

    if (convId && !existing.getString('conversation_id')) {
      existing.set('conversation_id', convId)
    }
    existing.set('fill_status', fillStatus)
    existing.set('last_interaction_date', nowIso)
    existing.set('interest_topic', qual.topic)
    existing.set('commercial_summary', summaryText)

    if (qual.stage && qual.stage !== 'Novo Lead') {
      existing.set('qualification_stage', qual.stage)
      if (qual.stage === 'Solicita Demonstração') {
        existing.set('status', 'Qualificado')
        existing.set('temperature', 'Quente')
      } else if (qual.stage === 'Interessado') {
        existing.set('temperature', 'Morno')
      }
    }

    if (qual.systemCurrent) existing.set('system_current', qual.systemCurrent)
    if (qual.operationalPains) existing.set('operational_pains', qual.operationalPains)
    if (chatHistoryObj) existing.set('chat_history', chatHistoryObj)

    app.save(existing)
    return {
      success: true,
      lead_id: existing.id,
      lead_number: existing.getString('lead_number'),
      created: false,
      fill_status: fillStatus,
      demoRequested: qual.demoRequested,
      commercial_summary: summaryText,
    }
  }

  // Criar NOVO lead com numeração sequencial segura
  var nextNumStr = 'LEAD-00001'
  try {
    var lastLeads = app.findRecordsByFilter('crm_leads', "id != ''", '-lead_number', 1, 0)
    if (lastLeads && lastLeads.length > 0) {
      var lastNum = lastLeads[0].getString('lead_number') || ''
      var match = lastNum.match(/(\d+)$/)
      if (match) {
        var nextSeq = parseInt(match[1], 10) + 1
        nextNumStr = 'LEAD-' + String(nextSeq).padStart(5, '0')
      }
    }
  } catch (_) {}

  var newLead = new Record(leadsCol)
  newLead.set('lead_number', nextNumStr)
  newLead.set('name', contact.name || 'Visitante Site')
  newLead.set('email', contact.email || '')
  newLead.set('phone', contact.phone || '')
  newLead.set('whatsapp', contact.phone || '')
  newLead.set('trade_name', contact.company || '')
  newLead.set('person_type', contact.company ? 'PJ' : 'PF')
  newLead.set('lead_source', 'Chat Jeh — Site Jetro')
  newLead.set('entry_date', todayStr)
  newLead.set('first_contact_date', nowIso)
  newLead.set('last_interaction_date', nowIso)
  newLead.set('status', 'Novo')
  newLead.set('temperature', 'Morno')
  newLead.set('company', 'Jetro Logística')
  newLead.set('filial', 'Matriz')
  newLead.set('conversation_id', convId || '')
  newLead.set('fill_status', fillStatus)
  newLead.set('qualification_stage', qual.stage)
  newLead.set('interest_topic', qual.topic)
  newLead.set('commercial_summary', summaryText)
  if (qual.systemCurrent) newLead.set('system_current', qual.systemCurrent)
  if (qual.operationalPains) newLead.set('operational_pains', qual.operationalPains)
  if (chatHistoryObj) newLead.set('chat_history', chatHistoryObj)

  newLead.set(
    'observations',
    '[' + nowIso + '] Captado pela Jeh no Site Institucional. Origem: Chat Jeh — Site Jetro',
  )

  app.save(newLead)
  return {
    success: true,
    lead_id: newLead.id,
    lead_number: nextNumStr,
    created: true,
    fill_status: fillStatus,
    demoRequested: qual.demoRequested,
    commercial_summary: summaryText,
  }
}

function recordNotification(app, leadInfo, contact, eventType) {
  try {
    var notifCol = app.findCollectionByNameOrId('jeh_notifications')
    if (!notifCol) return

    var recipients = 'comercial@jetro.com.br'
    try {
      var rSet = app.findFirstRecordByData('settings', 'key', 'jeh_notification_recipients')
      if (rSet && rSet.getString('value')) recipients = rSet.getString('value')
    } catch (_) {}

    var eventLabel =
      eventType === 'demo_requested' ? 'Solicitação de Demonstração' : 'Novo lead captado'
    var noticeBody =
      eventLabel +
      ' pela Jeh\n' +
      'Nome: ' +
      (contact.name || 'Não informado') +
      '\n' +
      'Empresa: ' +
      (contact.company || 'Não informada') +
      '\n' +
      'Telefone: ' +
      (contact.phone || 'Não informado') +
      '\n' +
      'E-mail: ' +
      (contact.email || 'Não informado') +
      '\n' +
      'Interesse: ' +
      (leadInfo.interest_topic || 'Conhecer as funcionalidades do Jetro.') +
      '\n\n' +
      (leadInfo.commercial_summary || '')

    var notif = new Record(notifCol)
    notif.set('lead_id', leadInfo.lead_id || '')
    notif.set('lead_number', leadInfo.lead_number || '')
    notif.set('lead_name', contact.name || '')
    notif.set('lead_company', contact.company || '')
    notif.set('lead_phone', contact.phone || '')
    notif.set('lead_email', contact.email || '')
    notif.set('interest', leadInfo.interest_topic || 'Conhecer o Jetro')
    notif.set('commercial_summary', leadInfo.commercial_summary || '')
    notif.set('event_type', eventType || 'lead_captured')
    notif.set('notification_body', noticeBody)
    notif.set('delivery_status', 'registrado')
    notif.set('recipient_emails', recipients)
    app.save(notif)
  } catch (eNotif) {
    console.log('Erro ao salvar notificação:', eNotif)
  }
}

routerAdd('POST', '/backend/v1/chat/send', (e) => {
  try {
    var jehStatus = 'inativa'
    var greetingMsgSetting = ''
    var defaultMsgSetting = ''
    var leadSourceSetting = 'Chat Jeh — Site Jetro'

    try {
      var recStatus = $app.findFirstRecordByData('settings', 'key', 'jeh_assistant_status')
      if (recStatus) {
        jehStatus = (recStatus.getString('value') || 'inativa').trim().toLowerCase()
      }
    } catch (_) {}

    try {
      var recGrt = $app.findFirstRecordByData('settings', 'key', 'jeh_greeting_message')
      if (recGrt && recGrt.getString('value')) greetingMsgSetting = recGrt.getString('value')
    } catch (_) {}

    try {
      var recDef = $app.findFirstRecordByData('settings', 'key', 'jeh_unanswered_default_message')
      if (recDef && recDef.getString('value')) defaultMsgSetting = recDef.getString('value')
    } catch (_) {}

    // Bloqueio se estiver inativa externamente
    if (jehStatus !== 'ativa') {
      return e.json(403, {
        error: 'A assistente Jeh está temporariamente inativa para atendimento externo.',
        status: 'inativa',
      })
    }

    var body = e.requestInfo().body || {}
    var convId = body.conversation_id || ''
    var clientName = (body.client_name || '').trim()
    var clientEmail = (body.client_email || '').trim().toLowerCase()
    var clientPhone = (body.client_phone || '').trim()
    var clientCompany = (body.client_company || '').trim()
    var message = (body.message || '').trim()

    if (!message) return e.badRequestError('Mensagem é obrigatória')

    // 1. Gerenciar conversa em chat_conversations
    var conversation = null
    if (convId) {
      try {
        conversation = $app.findRecordById('chat_conversations', convId)
      } catch (_) {
        conversation = null
      }
    }

    var nowIso = new Date().toISOString()

    if (!conversation) {
      var convCol = $app.findCollectionByNameOrId('chat_conversations')
      conversation = new Record(convCol)
      conversation.set('client_name', clientName || 'Visitante')
      conversation.set('client_email', clientEmail)
      conversation.set('client_phone', clientPhone)
      conversation.set('status', 'active')
      conversation.set('last_message_at', nowIso)
      $app.save(conversation)
    } else {
      conversation.set('last_message_at', nowIso)
      if (conversation.getString('status') !== 'active') {
        conversation.set('status', 'active')
      }
      if (
        clientName &&
        (!conversation.getString('client_name') ||
          conversation.getString('client_name') === 'Visitante')
      ) {
        conversation.set('client_name', clientName)
      }
      if (clientEmail && !conversation.getString('client_email')) {
        conversation.set('client_email', clientEmail)
      }
      if (clientPhone && !conversation.getString('client_phone')) {
        conversation.set('client_phone', clientPhone)
      }
      $app.save(conversation)
    }

    // 2. Registrar mensagem do visitante
    var msgCol = $app.findCollectionByNameOrId('chat_messages')
    var clientMsg = new Record(msgCol)
    clientMsg.set('conversation_id', conversation.id)
    clientMsg.set('sender', 'client')
    clientMsg.set('content', message)
    clientMsg.set('author_name', clientName || conversation.getString('client_name') || 'Visitante')
    $app.save(clientMsg)

    // 3. Recuperar histórico da conversa
    var historyMessages = []
    var allConvoText = message
    var chatHistoryObj = []
    try {
      var recentMsgs = $app.findRecordsByFilter(
        'chat_messages',
        "conversation_id = '" + conversation.id + "'",
        '-created',
        30,
        0,
      )
      recentMsgs.reverse()
      for (var j = 0; j < recentMsgs.length; j++) {
        var hm = recentMsgs[j]
        var isClient = hm.getString('sender') === 'client'
        var rRole = isClient ? 'user' : 'assistant'
        var cCont = hm.getString('content') || ''
        historyMessages.push({ role: rRole, content: cCont })
        chatHistoryObj.push({
          sender: isClient ? 'visitante' : 'jeh',
          text: cCont,
          time: hm.getString('created') || nowIso,
        })
        allConvoText += ' ' + cCont
      }
    } catch (_) {}

    // 4. Extração conversacional contínua dos dados de contato do visitante
    var detected = extractContactInfo(allConvoText, {
      name: clientName || conversation.getString('client_name'),
      email: clientEmail || conversation.getString('client_email'),
      phone: clientPhone || conversation.getString('client_phone'),
      company: clientCompany,
    })

    if (
      detected.name &&
      detected.name !== 'Visitante' &&
      conversation.getString('client_name') !== detected.name
    ) {
      conversation.set('client_name', detected.name)
      $app.save(conversation)
    }
    if (detected.email && conversation.getString('client_email') !== detected.email) {
      conversation.set('client_email', detected.email)
      $app.save(conversation)
    }
    if (detected.phone && conversation.getString('client_phone') !== detected.phone) {
      conversation.set('client_phone', detected.phone)
      $app.save(conversation)
    }

    // 5. CAPTURA AUTOMÁTICA E IMEDIATA DO LEAD: A CADA INFORMAÇÃO, ATUALIZAR/CRIAR NO BANCO
    var leadResult = syncLeadImmediate(
      $app,
      conversation.id,
      detected,
      message,
      allConvoText,
      chatHistoryObj,
    )

    // Se forneceu dados suficientes e solicitou demo ou lead criado, disparar notificação
    if (
      leadResult &&
      leadResult.success &&
      (leadResult.demoRequested || (leadResult.created && detected.phone))
    ) {
      recordNotification(
        $app,
        {
          lead_id: leadResult.lead_id,
          lead_number: leadResult.lead_number,
          interest_topic: leadResult.demoRequested
            ? 'Solicitação de Demonstração'
            : 'Conhecer o Jetro',
          commercial_summary: leadResult.commercial_summary,
        },
        detected,
        leadResult.demoRequested ? 'demo_requested' : 'lead_captured',
      )
    }

    // 6. Base de Conhecimento Oficial e Q&As aprovados
    var trainingSnippets = []
    try {
      var qas = $app.findRecordsByFilter(
        'jeh_qa',
        "approval_status = 'aprovado'",
        '-updated',
        70,
        0,
      )
      for (var qi = 0; qi < qas.length; qi++) {
        var q = qas[qi]
        trainingSnippets.push(
          '[P&R Oficial - ' +
            q.getString('category') +
            ']:\nPergunta Canônica: "' +
            q.getString('canonical_question') +
            '"\nVariações: ' +
            JSON.stringify(q.get('variations') || []) +
            '\nResposta Oficial: "' +
            q.getString('official_answer') +
            '"',
        )
      }

      var knows = $app.findRecordsByFilter(
        'jeh_knowledge',
        "approval_status = 'aprovado'",
        '-updated',
        70,
        0,
      )
      for (var ki = 0; ki < knows.length; ki++) {
        var k = knows[ki]
        trainingSnippets.push(
          '[Base Oficial - ' +
            k.getString('category') +
            ' | ' +
            k.getString('title') +
            ']:\n' +
            k.getString('content'),
        )
      }
    } catch (_) {}

    // 7. Instruções dinâmicas de coleta e resposta conversacional
    var missingFields = []
    if (!detected.name || detected.name === 'Visitante') missingFields.push('nome')
    if (!detected.phone) missingFields.push('telefone com DDD')
    if (!detected.company) missingFields.push('nome da empresa')
    if (!detected.email) missingFields.push('e-mail')

    var collectionDirective = ''
    if (missingFields.length > 0) {
      collectionDirective =
        'COLETA CONVERSACIONAL DE DADOS (REGRAS MANDATÓRIAS):\n' +
        'Dados já conhecidos: Nome: ' +
        (detected.name || 'Pendente') +
        ', Telefone: ' +
        (detected.phone || 'Pendente') +
        ', Empresa: ' +
        (detected.company || 'Pendente') +
        ', E-mail: ' +
        (detected.email || 'Pendente') +
        '.\n' +
        'Dados que ainda faltam: ' +
        missingFields.join(', ') +
        '.\n' +
        '- NÃO faça interrogatório nem pergunte tudo de uma vez. Colete de forma fluida e natural, perguntando apenas UM dado que falta de cada vez.\n' +
        '- SE O VISITANTE INTERROMPER A COLETA PARA FAZER UMA PERGUNTA OU TIRAR DÚVIDA (ex: "como funciona o jetro?", "quais os módulos?"): RESPONDA A DÚVIDA IMEDIATAMENTE E COM PRIORIDADE TOTAL com a base oficial! NUNCA bloqueie o atendimento por falta de dados. Após responder a dúvida com qualidade, aí sim convide naturalmente a passar o próximo dado ou entender melhor o negócio dele.\n' +
        '- Se o visitante se recusar a passar algum dado, respeite imediatamente e continue atendendo com as informações disponíveis.\n'
    } else {
      collectionDirective =
        'IDENTIFICAÇÃO COMPLETA: Todos os dados foram coletados com sucesso (' +
        detected.name +
        ', ' +
        detected.phone +
        ', ' +
        (detected.company || '') +
        ', ' +
        detected.email +
        ').\n' +
        'Se o usuário acabou de se identificar: Use a continuidade natural: "Prazer em conhecer você, ' +
        (detected.name || '') +
        '! 😊 Agora me conta: o que você gostaria de saber sobre o Jetro?" e responda com entusiasmo às perguntas feitas.\n' +
        'NÃO ENCAMINHE AO WHATSAPP APÓS O CADASTRO! A captura de lead e o atendimento inteligente funcionam juntos.\n'
    }

    // 8. Construção do System Prompt da Jeh com as regras na íntegra
    var systemPrompt =
      'VOCÊ É A JEH, ASSISTENTE VIRTUAL DO JETRO:\n' +
      'Você é a assistente virtual pública do Jetro — Plataforma Inteligente de Gestão Empresarial.\n' +
      'Personalidade: simpática, educada, profissional, comunicativa, atenciosa, prestativa, natural e consultiva.\n' +
      'Use o primeiro nome do visitante quando apropriado. Evite respostas repetitivas, formais ou mecânicas.\n' +
      'Você se identifica como inteligência artificial quando necessário, de forma leve e acolhedora.\n\n' +
      'PRIORIDADE ABSOLUTA: RESPONDER ANTES DE ENCAMINHAR\n' +
      'Fluxo mandatório: compreender a intenção do visitante → consultar a base de conhecimento → localizar informações → elaborar resposta clara e contextualizada → explicar de forma simples → perguntar se deseja saber mais.\n' +
      'SOMENTE sugerir contato humano ou WhatsApp (https://wa.me/5531991297619) quando:\n' +
      '1. O próprio visitante solicitar contato com um atendente ou especialista;\n' +
      '2. A informação técnica/específica NÃO estiver disponível ou confirmável na base de conhecimento oficial;\n' +
      '3. Exigir negociação comercial direta (preços sob medida, condições de pagamento, contratos personalizados);\n' +
      '4. Desejo explícito de contratar ou agendar demonstração personalizada;\n' +
      '5. Suporte especializado que exija acesso ao sistema ou à conta.\n' +
      'Mesmo nesses casos, continue disponível e cordial para responder outras perguntas.\n\n' +
      'CORREÇÃO OBRIGATÓRIA DE "COMO FUNCIONA O SISTEMA?":\n' +
      'A pergunta "Como funciona o sistema?", "Como funciona o Jetro?" ou similares NUNCA DEVE VIRAR ENCAMINHAMENTO AO WHATSAPP!\n' +
      'Você deve responder explicando com clareza:\n' +
      '- O que é o Jetro: ERP integrado que conecta vendas, financeiro, fiscal, compras, estoque, produção (indústria), logística e pessoas (DP/RH/SST);\n' +
      '- Como funciona: arquitetura modular onde a empresa ativa os módulos que precisa, com informações em tempo real conectadas;\n' +
      '- Recursos de destaque: IA nativa Jeh, Segundo Cérebro, telas de auditoria e conformidade, rastreabilidade e controle de validades/vencimentos;\n' +
      '- Benefícios operacionais: centralização de dados, fim do retrabalho e controle operacional seguro;\n' +
      '- Finalize com: "Você gostaria de conhecer alguma funcionalidade específica ou entender como o Jetro poderia ajudar sua empresa?"\n' +
      'NUNCA invente funcionalidades, preços, integrações ou prazos que não constem na base oficial.\n\n' +
      'CONTINUIDADE NATURAL E QUALIFICAÇÃO CONSULTIVA:\n' +
      'Sem transformar o atendimento em interrogatório, identifique naturalmente durante a conversa:\n' +
      'segmento da empresa, principal necessidade/dor operacional, sistema atual (se citado), interesse em demonstração.\n\n' +
      'PERGUNTAS SEM RESPOSTA NA BASE:\n' +
      'Se o visitante fizer uma pergunta sobre funcionalidade ou regra não confirmada na base, informe cordialmente que ainda não tem essa validação exata documentada e ofereça o contato dos consultores pelo WhatsApp: https://wa.me/5531991297619, perguntando em seguida se ele quer saber sobre outras áreas documentadas.\n\n' +
      'ISOLAMENTO E SEGURANÇA:\n' +
      'Você está no site público institucional. Não tem acesso a dados internos ou sigilosos de clientes cadastrados no ERP.\n\n' +
      collectionDirective +
      '\n--- BASE DE CONHECIMENTO OFICIAL E RESPOSTAS APROVADAS (RAG) ---\n' +
      (trainingSnippets.length > 0
        ? trainingSnippets.join('\n\n')
        : 'Base de conhecimento ativa.') +
      '\n--- FIM DA BASE OFICIAL ---'

    var aiMessages = [{ role: 'system', content: systemPrompt }]
    for (var k = 0; k < historyMessages.length; k++) {
      aiMessages.push(historyMessages[k])
    }
    // Adicionar mensagem atual se não duplicada
    if (
      historyMessages.length === 0 ||
      historyMessages[historyMessages.length - 1].content !== message
    ) {
      aiMessages.push({ role: 'user', content: message })
    }

    var aiContent = ''
    try {
      var reply = $ai.chat({ model: 'fast', messages: aiMessages })
      aiContent = reply?.choices?.[0]?.message?.content || ''
    } catch (chatErr) {
      console.log('Erro ao chamar $ai.chat:', chatErr)
    }

    if (!aiContent) {
      aiContent =
        'Olá! Sou a Jeh, assistente virtual do Jetro. Como posso ajudar você hoje a conhecer nossa plataforma de gestão integrada?'
    }

    // Registrar resposta da Jeh em chat_messages
    var aiMsg = new Record(msgCol)
    aiMsg.set('conversation_id', conversation.id)
    aiMsg.set('sender', 'ai')
    aiMsg.set('content', aiContent)
    aiMsg.set('author_name', 'Jeh')
    $app.save(aiMsg)

    // Atualizar chat_history do lead com a resposta da Jeh
    chatHistoryObj.push({
      sender: 'jeh',
      text: aiContent,
      time: new Date().toISOString(),
    })
    if (leadResult && leadResult.lead_id) {
      try {
        var lRec = $app.findRecordById('crm_leads', leadResult.lead_id)
        if (lRec) {
          lRec.set('chat_history', chatHistoryObj)
          $app.save(lRec)
        }
      } catch (_) {}
    }

    // 9. Pergunta sem resposta: se a Jeh expressar falta de informação, registrar em jeh_unanswered
    var lowerMsg = message.toLowerCase()
    var isBroadExploration =
      lowerMsg.includes('como funciona') ||
      lowerMsg.includes('o que é o jetro') ||
      lowerMsg.includes('o que e o jetro') ||
      lowerMsg.includes('quais módulos') ||
      lowerMsg.includes('quais modulos') ||
      lowerMsg.includes('quais áreas') ||
      lowerMsg.includes('olá') ||
      lowerMsg.includes('ola') ||
      lowerMsg.includes('oi')

    var indicatesMissingInfo =
      !isBroadExploration &&
      (aiContent.includes('não tenho essa informação confirmada') ||
        aiContent.includes('não tenho essa confirmação') ||
        aiContent.includes('ainda não tenho essa informação') ||
        aiContent.includes('não localizei em minha base') ||
        (aiContent.includes('WhatsApp') &&
          aiContent.includes('nossa equipe pode detalhar') &&
          !aiContent.includes('O Jetro é um sistema')))

    if (indicatesMissingInfo) {
      try {
        var unCol = $app.findCollectionByNameOrId('jeh_unanswered')
        if (unCol) {
          var cleanQ = message.toLowerCase().trim()
          var unList = $app.findRecordsByFilter(
            'jeh_unanswered',
            "question ~ '" + cleanQ.replace(/'/g, "\\'") + "'",
            '-created',
            1,
            0,
          )
          if (unList && unList.length > 0) {
            var uRec = unList[0]
            uRec.set('count', (uRec.getInt('count') || 1) + 1)
            uRec.set('last_asked_at', nowIso)
            uRec.set('provided_answer', aiContent)
            $app.save(uRec)
          } else {
            var newUn = new Record(unCol)
            newUn.set('question', message)
            newUn.set('count', 1)
            newUn.set('identified_topic', 'Dúvida Geral')
            newUn.set('status', 'pendente')
            newUn.set('source', 'publico')
            newUn.set('classification', 'sem_conteudo_base')
            newUn.set('provided_answer', aiContent)
            newUn.set('last_asked_at', nowIso)
            $app.save(newUn)
          }
        }
      } catch (eUn) {
        console.log('Erro ao registrar jeh_unanswered:', eUn)
      }
    }

    return e.json(200, {
      conversation_id: conversation.id,
      response: aiContent,
      lead_id: leadResult?.lead_id || null,
      lead_number: leadResult?.lead_number || null,
      lead_created: leadResult?.created || false,
      fill_status: leadResult?.fill_status || 'incompleto',
      commercial_summary: leadResult?.commercial_summary || null,
    })
  } catch (err) {
    return e.json(500, { error: 'Erro ao processar atendimento da Jeh: ' + String(err) })
  }
})
