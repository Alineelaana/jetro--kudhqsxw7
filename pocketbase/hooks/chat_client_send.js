/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook público /backend/v1/chat/send
 * Atendimento ao visitante do site institucional Jetro pela assistente virtual Jeh.
 *
 * Regras Obrigatórias:
 * 1. STATUS DINÂMICO: lê 'jeh_assistant_status' da coleção settings a cada requisição. Se !== 'ativa', retorna 403.
 * 2. IDENTIFICAÇÃO E LEADS:
 *    - Se faltar nome, telefone ou e-mail, solicita os dados faltantes usando a abertura obrigatória.
 *    - Quando os 3 dados estiverem presentes (informados no body ou extraídos da conversa), cadastra/atualiza em crm_leads:
 *      * origem: "Jeh — Site Jetro" (lida de settings jeh_lead_source ou fallback)
 *      * data e horário de entrada
 *      * segmento, interesse e resumo da conversa
 *      * anti-duplicidade: localiza por e-mail ou telefone e atualiza lead existente
 *      * SÓ confirma cadastro após sucesso real no banco (nunca confirmação falsa em caso de falha)
 * 3. ISOLAMENTO TOTAL:
 *    - NÃO acessa coleções internas restritas do ERP (clientes, pedidos, faturamento, financeiro, fiscal, estoque, folha)
 *    - Apenas crm_leads (criar/atualizar), chat_conversations, chat_messages e a base oficial (jeh_knowledge e jeh_qa aprovados)
 * 4. RAG OFICIAL:
 *    - Base de Conhecimento (jeh_knowledge) aprovada (13 blocos oficiais + identidade Êxodo 18 + varredura do ERP)
 *    - Perguntas e Respostas (jeh_qa) aprovadas
 *    - Anti-alucinação: não inventa preços, prazos ou integrações; encaminha para WhatsApp oficial https://wa.me/5531991297619
 */

function extractContactInfo(text, current) {
  var name = current.name || ''
  var email = current.email || ''
  var phone = current.phone || ''

  if (!email) {
    var emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch) email = emailMatch[0].toLowerCase().trim()
  }

  if (!phone) {
    // Procura padrão de telefone com DDD (ex: (27) 99999-9999, 27 99999-9999, 27999999999, (31) 99129-7619)
    var phoneMatch = text.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}[-\s]?\d{4}/)
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      phone = phoneMatch[0].trim()
    }
  }

  // Tenta extrair nome se o usuário disse "Meu nome é X", "Sou o X", "Me chamo X"
  if (!name || name === 'Visitante') {
    var nameMatch = text.match(
      /(?:meu\s+nome\s+(?:é|e)|sou\s+(?:o|a)|me\s+chamo)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{2,40})/i,
    )
    if (nameMatch && nameMatch[1]) {
      var candidate = nameMatch[1].trim().split(/\s+/).slice(0, 4).join(' ')
      // Evitar pegar palavras como "apenas", "aqui", "interessado"
      if (!/^(apenas|aqui|um|uma|cliente|interessado)$/i.test(candidate)) {
        name = candidate
      }
    }
  }

  return { name: name, email: email, phone: phone }
}

function syncLeadRecord(app, contact, leadSource, segment, interest, summary) {
  var leadsCol = app.findCollectionByNameOrId('crm_leads')
  var existing = null

  // 1. Tentar localizar por e-mail
  if (contact.email) {
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

  // 2. Se não achou por e-mail, tentar por telefone ou whatsapp
  if (!existing && contact.phone) {
    try {
      var digits = contact.phone.replace(/\D/g, '')
      if (digits.length >= 8) {
        var cleanPhone = contact.phone.replace(/'/g, "\\'")
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

  if (existing) {
    // Atualiza lead existente evitando duplicidade
    if (
      contact.name &&
      (!existing.getString('name') || existing.getString('name') === 'Visitante')
    ) {
      existing.set('name', contact.name)
    }
    if (contact.phone && !existing.getString('phone')) {
      existing.set('phone', contact.phone)
      existing.set('whatsapp', contact.phone)
    }
    if (contact.email && !existing.getString('email')) {
      existing.set('email', contact.email)
    }
    if (segment && !existing.getString('segment')) {
      existing.set('segment', segment)
    }
    if (interest && !existing.getString('product_interest')) {
      existing.set('product_interest', interest)
    }
    if (summary) {
      var prevObs = existing.getString('observations') || ''
      existing.set(
        'observations',
        (prevObs ? prevObs + '\n' : '') + '[' + nowIso + '] Atendimento Jeh: ' + summary,
      )
    }
    app.save(existing)
    return {
      success: true,
      lead_id: existing.id,
      lead_number: existing.getString('lead_number'),
      created: false,
    }
  }

  // Criar novo lead com numeração sequencial
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
  newLead.set('person_type', 'PJ')
  newLead.set('lead_source', leadSource || 'Jeh — Site Jetro')
  newLead.set('entry_date', todayStr)
  newLead.set('status', 'Novo')
  newLead.set('temperature', 'Morno')
  newLead.set('company', 'Jetro Logística')
  newLead.set('filial', 'Matriz')
  if (segment) newLead.set('segment', segment)
  if (interest) newLead.set('product_interest', interest)
  if (summary) {
    newLead.set(
      'observations',
      '[' + nowIso + '] Atendimento via Jeh (Site Institucional): ' + summary,
    )
  }

  app.save(newLead)
  return { success: true, lead_id: newLead.id, lead_number: nextNumStr, created: true }
}

routerAdd('POST', '/backend/v1/chat/send', (e) => {
  try {
    // 1. Leitura dinâmica do status operacional da Jeh no banco (coleção settings)
    var jehStatus = 'inativa'
    var greetingMsgSetting = ''
    var defaultMsgSetting = ''
    var leadSourceSetting = 'Jeh — Site Jetro'

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

    try {
      var recSrc = $app.findFirstRecordByData('settings', 'key', 'jeh_lead_source')
      if (recSrc && recSrc.getString('value')) leadSourceSetting = recSrc.getString('value')
    } catch (_) {}

    // Bloqueio rigoroso se estiver inativa (retorna 403 dinamicamente)
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
    var message = (body.message || '').trim()

    if (!message) return e.badRequestError('Mensagem é obrigatória')

    // Gerenciar conversa em chat_conversations
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

    // Registrar mensagem do visitante
    var msgCol = $app.findCollectionByNameOrId('chat_messages')
    var clientMsg = new Record(msgCol)
    clientMsg.set('conversation_id', conversation.id)
    clientMsg.set('sender', 'client')
    clientMsg.set('content', message)
    clientMsg.set('author_name', clientName || conversation.getString('client_name') || 'Visitante')
    $app.save(clientMsg)

    // Recuperar histórico da conversa para contexto de identificação e diálogo
    var historyMessages = []
    var allConvoText = message
    try {
      var recentMsgs = $app.findRecordsByFilter(
        'chat_messages',
        "conversation_id = '" + conversation.id + "'",
        '-created',
        15,
        0,
      )
      recentMsgs.reverse()
      for (var j = 0; j < recentMsgs.length; j++) {
        var hm = recentMsgs[j]
        if (hm.id === clientMsg.id) continue
        var role = hm.getString('sender') === 'client' ? 'user' : 'assistant'
        var content = hm.getString('content') || ''
        historyMessages.push({ role: role, content: content })
        allConvoText += ' ' + content
      }
    } catch (_) {}

    // Extração / atualização contínua dos dados de contato do visitante
    var contact = extractContactInfo(allConvoText, {
      name: clientName || conversation.getString('client_name'),
      email: clientEmail || conversation.getString('client_email'),
      phone: clientPhone || conversation.getString('client_phone'),
    })

    if (
      contact.name &&
      contact.name !== 'Visitante' &&
      conversation.getString('client_name') !== contact.name
    ) {
      conversation.set('client_name', contact.name)
      $app.save(conversation)
    }
    if (contact.email && conversation.getString('client_email') !== contact.email) {
      conversation.set('client_email', contact.email)
      $app.save(conversation)
    }
    if (contact.phone && conversation.getString('client_phone') !== contact.phone) {
      conversation.set('client_phone', contact.phone)
      $app.save(conversation)
    }

    var hasAllThree = !!(
      contact.name &&
      contact.name !== 'Visitante' &&
      contact.email &&
      contact.phone
    )

    // Sincronizar com a área de Leads do ERP se todos os dados estiverem completos
    var leadSyncResult = null
    if (hasAllThree) {
      try {
        leadSyncResult = syncLeadRecord(
          $app,
          contact,
          leadSourceSetting,
          '',
          '',
          'Conversa via chat público do site iniciada em ' + nowIso,
        )
      } catch (leadErr) {
        console.log('Erro ao sincronizar lead:', leadErr)
        leadSyncResult = { success: false, error: String(leadErr) }
      }
    }

    // 2. Coletar RAG Oficial da Base da Jeh (jeh_knowledge + jeh_qa aprovados)
    var trainingSnippets = []
    try {
      var qas = $app.findRecordsByFilter(
        'jeh_qa',
        "approval_status = 'aprovado'",
        '-updated',
        50,
        0,
      )
      for (var qi = 0; qi < qas.length; qi++) {
        var q = qas[qi]
        trainingSnippets.push(
          '[P&R Oficial - ' +
            q.getString('category') +
            ']:\nPergunta: "' +
            q.getString('canonical_question') +
            '"\nResposta Oficial: "' +
            q.getString('official_answer') +
            '"',
        )
      }

      var knows = $app.findRecordsByFilter(
        'jeh_knowledge',
        "approval_status = 'aprovado'",
        '-updated',
        60,
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

    var officialGreetingFallback =
      greetingMsgSetting ||
      'Olá! Sou a Jeh, assistente virtual do Jetro. 😊 Antes de começarmos, me informe seu nome, telefone com DDD e melhor e-mail. Vamos usar esses dados para registrar seu atendimento e retornar seu contato sobre a plataforma.'

    var officialFallbackMsg =
      defaultMsgSetting ||
      '[Nome], para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619'

    // Status da identificação do cliente para instruir o prompt
    var missingItems = []
    if (!contact.name || contact.name === 'Visitante') missingItems.push('seu nome')
    if (!contact.phone) missingItems.push('seu telefone com DDD')
    if (!contact.email) missingItems.push('seu melhor e-mail')

    var identificationInstruction = ''
    if (missingItems.length > 0) {
      // Se for a primeira mensagem ou faltarem itens, solicita de forma educada
      identificationInstruction =
        'STATUS DE IDENTIFICAÇÃO DO VISITANTE:\n' +
        'O visitante AINDA NÃO informou todos os 3 dados obrigatórios. Faltam: ' +
        missingItems.join(', ') +
        '.\n' +
        'REGRAS:\n' +
        '1. Se for a primeira interação, utilize exatamente ou com máxima fidelidade a abertura oficial: "' +
        officialGreetingFallback +
        '"\n' +
        '2. Se o visitante já informou parte dos dados, agradeça o que ele já informou e solicite APENAS o que estiver faltando (' +
        missingItems.join(', ') +
        ').\n' +
        '3. Se o visitante expressamente se recusar a fornecer dados ("não quero passar", "responda direto"), não insista de forma inconveniente: ofereça atendimento direto pelo WhatsApp oficial https://wa.me/5531991297619.\n' +
        '4. NÃO avance em detalhes comerciais específicos de contratação/propostas antes da identificação.'
    } else {
      var leadConfirmStatus =
        leadSyncResult && leadSyncResult.success
          ? 'DADOS GRAVADOS COM SUCESSO na área de Leads do ERP (' +
            (leadSyncResult.lead_number || 'Lead registrado') +
            '). Você PODE confirmar cordialmente que o contato foi registrado para atendimento da nossa equipe.'
          : 'ATENÇÃO: A gravação automática do Lead não pôde ser confirmada pelo sistema. NUNCA faça confirmação falsa de cadastro.'

      identificationInstruction =
        'STATUS DE IDENTIFICAÇÃO DO VISITANTE:\n' +
        'Identificação COMPLETA: Nome = ' +
        contact.name +
        ', Telefone = ' +
        contact.phone +
        ', E-mail = ' +
        contact.email +
        '.\n' +
        leadConfirmStatus +
        '\n' +
        'Agora você pode atender as dúvidas sobre o ERP Jetro normalmente com base na base oficial.'
    }

    // Montar System Prompt com script oficial
    var systemPrompt =
      'IDENTIDADE E POSICIONAMENTO:\n' +
      'Você é a Jeh, inteligência artificial do ERP Jetro — Plataforma Inteligente de Gestão Empresarial. ' +
      'O Jetro tem a proposta de oferecer uma gestão ampla, integrada e inteligente, conectando processos, pessoas, informações e decisões. ' +
      'Nosso posicionamento é oferecer uma plataforma completa e em evolução contínua, com IA nativa, Segundo Cérebro, auditoria e rastreabilidade.\n' +
      'REGRA: não afirmar como fato comprovado que somos "o sistema mais completo, atualizado ou seguro do mercado" sem evidências comparativas; demonstre diferenciais pelas entregas documentadas.\n\n' +
      'PÚBLICOS ATENDIDOS:\n' +
      'Indústrias, operações logísticas, atacadistas, distribuidoras, empresas comerciais, empresas de venda e prestação de serviços, operações com múltiplas empresas/filiais/unidades. ' +
      'Ao conversar, entender segmento e necessidade principal; apresentar primeiro as soluções relacionadas à realidade do cliente.\n\n' +
      identificationInstruction +
      '\n\n' +
      'COMUNICAÇÃO NATURAL E TRANSPARÊNCIA:\n' +
      '- Proximidade, clareza e atenção ao contexto; evite respostas mecânicas, textos repetitivos e listas longas.\n' +
      '- Não finja ser pessoa humana; identifique-se como assistente virtual inteligente do Jetro; nunca invente experiências pessoais ou conversas com fundadores.\n' +
      '- Mantenha a base sobre a origem bíblica do nome (Êxodo 18, conselho de Jetro a Moisés: organização, orientação e distribuição de responsabilidades para evitar sobrecarga). Não use linguagem religiosa para pregar.\n\n' +
      'ENCAMINHAMENTO AO WHATSAPP (QUANDO NÃO SOUBER OU PRECISAR DE PROPOSTA/DEMONSTRAÇÃO):\n' +
      'Quando não souber, não houver confirmação na base oficial, ou o cliente precisar de proposta, demonstração personalizada ou avaliação específica para sua operação:\n' +
      '"[Nome], para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619"\n' +
      'SEMPRE com link clicável. NUNCA invente preços, prazos, integrações ou condições comerciais.\n\n' +
      'ISOLAMENTO E SEGURANÇA TOTAL:\n' +
      'Você é a assistente pública do site. Você NÃO tem acesso a pedidos, estoque interno, notas fiscais, faturamento, financeiro ou dados sigilosos das empresas que usam o ERP. Se o visitante perguntar por dados internos de uma empresa, esclareça com simpatia que o chat público não acessa dados operacionais restritos e forneça o canal de login ou WhatsApp oficial.\n\n' +
      '--- BASE DE CONHECIMENTO OFICIAL E RESPOSTAS APROVADAS (RAG) ---\n' +
      (trainingSnippets.length > 0
        ? trainingSnippets.join('\n\n')
        : 'Base de conhecimento vazia.') +
      '\n--- FIM DA BASE OFICIAL ---'

    var aiMessages = [{ role: 'system', content: systemPrompt }]
    for (var k = 0; k < historyMessages.length; k++) {
      aiMessages.push(historyMessages[k])
    }
    aiMessages.push({ role: 'user', content: message })

    var aiContent = ''
    try {
      var reply = $ai.chat({ model: 'fast', messages: aiMessages })
      aiContent = reply?.choices?.[0]?.message?.content || ''
    } catch (chatErr) {
      console.log('Erro ao chamar $ai.chat:', chatErr)
      aiContent = officialFallbackMsg.replace('[Nome]', contact.name || 'Visitante')
    }

    if (!aiContent) {
      aiContent = officialFallbackMsg.replace('[Nome]', contact.name || 'Visitante')
    }

    var aiMsg = new Record(msgCol)
    aiMsg.set('conversation_id', conversation.id)
    aiMsg.set('sender', 'ai')
    aiMsg.set('content', aiContent)
    aiMsg.set('author_name', 'Jeh')
    $app.save(aiMsg)

    // Se a resposta caiu em desconhecimento, registrar em jeh_unanswered
    var isUnanswered =
      aiContent.includes('não tenho essa informação confirmada') ||
      aiContent.includes('ainda não tenho essa informação') ||
      aiContent.includes('fale com nossa equipe pelo WhatsApp')

    if (isUnanswered) {
      try {
        var unCol = $app.findCollectionByNameOrId('jeh_unanswered')
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
          $app.save(uRec)
        } else {
          var newUn = new Record(unCol)
          newUn.set('question', message)
          newUn.set('count', 1)
          newUn.set('identified_topic', 'Geral')
          newUn.set('status', 'pendente')
          newUn.set('source', 'publico')
          newUn.set('last_asked_at', nowIso)
          $app.save(newUn)
        }
      } catch (_) {}
    }

    return e.json(200, {
      conversation_id: conversation.id,
      response: aiContent,
      lead_created: leadSyncResult?.success || false,
    })
  } catch (err) {
    return e.json(500, { error: 'Erro ao processar atendimento da Jeh: ' + String(err) })
  }
})
