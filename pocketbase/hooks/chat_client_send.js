/// <reference path="../pb_data/types.d.ts" />

/**
 * Endpoint de chat público do site com a assistente Jeh (/backend/v1/chat/send)
 * 
 * Regras Obrigatórias e Diretrizes Oficiais do Treinamento Jeh:
 * 1. REGRA PRINCIPAL: Utilize primeiro as informações confirmadas da base de conhecimento
 *    para responder à pergunta. O WhatsApp deve complementar o atendimento, não substituir
 *    respostas que a Jeh já consegue fornecer. Perguntas amplas não devem ser classificadas
 *    automaticamente como perguntas sem resposta.
 * 2. FLUXO OFICIAL DE ATENDIMENTO:
 *    - Se ainda não houver identificação, solicite nome, telefone com DDD e melhor e-mail.
 *    - Preserve a pergunta original enquanto coleta os dados.
 *    - Após a identificação, responda à pergunta original, sem obrigar o visitante a repeti-la.
 *    - Utilize as informações disponíveis sobre o Jetro.
 *    - Faça uma pergunta breve para entender a necessidade do cliente.
 *    - Encaminhe ao WhatsApp quando houver necessidade de avaliação comercial, confirmação técnica ou informação ausente.
 * 3. INDEPENDÊNCIA DA RESPOSTA E CADASTRO DE LEAD:
 *    - Não condicione a explicação do sistema ao sucesso técnico do cadastro do lead.
 *    - Se a gravação falhar, informe a dificuldade sem afirmar que salvou os dados e continue
 *      respondendo com o conhecimento disponível após a identificação.
 * 4. QUANDO RESPONDER PARCIALMENTE E ENCAMINHAR:
 *    - Se souber parte da resposta, explique primeiro essa parte e indique exatamente o que precisa de confirmação.
 * 5. QUANDO ENCAMINHAR À EQUIPE (SOMENTE NESTES CASOS):
 *    - Preços e condições comerciais; agendamento de demonstração; confirmação de integração específica;
 *      avaliação de personalização; prazos de implantação; suporte que exija acesso à conta; informação não documentada.
 *    - Nunca invente informações para evitar o encaminhamento.
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
    var phoneMatch = text.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}[-\s]?\d{4}/)
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      phone = phoneMatch[0].trim()
    }
  }

  if (!name || name === 'Visitante') {
    var nameMatch = text.match(
      /(?:meu\s+nome\s+(?:é|e)|sou\s+(?:o|a)|me\s+chamo)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{2,40})/i,
    )
    if (nameMatch && nameMatch[1]) {
      var candidate = nameMatch[1].trim().split(/\s+/).slice(0, 4).join(' ')
      if (!/^(apenas|aqui|um|uma|cliente|interessado)$/i.test(candidate)) {
        name = candidate
      }
    }
  }

  return { name: name, email: email, phone: phone }
}

function syncLeadRecord(app, contact, leadSource, segment, interest, summary) {
  var leadsCol = app.findCollectionByNameOrId('crm_leads')
  if (!leadsCol) return { success: false, error: 'Coleção crm_leads ausente' }

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

  // 2. Se não achou por e-mail, tentar por telefone
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

  if (existing) {
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

    // Bloqueio rigoroso se estiver inativa
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

    // Recuperar histórico da conversa
    var historyMessages = []
    var allConvoText = message
    var priorUserQuestions = []
    try {
      var recentMsgs = $app.findRecordsByFilter(
        'chat_messages',
        "conversation_id = '" + conversation.id + "'",
        '-created',
        20,
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
        if (role === 'user') {
          priorUserQuestions.push(content)
        }
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

    // Sincronizar lead se tiver os 3 dados
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

    // Coletar Base de Conhecimento Oficial e Q&As aprovados
    var trainingSnippets = []
    try {
      var qas = $app.findRecordsByFilter(
        'jeh_qa',
        "approval_status = 'aprovado'",
        '-updated',
        60,
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

    // Status da identificação do visitante
    var missingItems = []
    if (!contact.name || contact.name === 'Visitante') missingItems.push('seu nome')
    if (!contact.phone) missingItems.push('seu telefone com DDD')
    if (!contact.email) missingItems.push('seu melhor e-mail')

    var identificationInstruction = ''
    if (missingItems.length > 0) {
      identificationInstruction =
        'STATUS DE IDENTIFICAÇÃO DO VISITANTE:\n' +
        'O visitante AINDA NÃO informou todos os 3 dados obrigatórios. Faltam exatamente: ' +
        missingItems.join(', ') +
        '.\n' +
        'DIRETRIZES MANDATÓRIAS:\n' +
        '1. Se for o primeiro contato ou se a pergunta do usuário ainda não tiver sido respondida por falta de dados, solicite educadamente APENAS os dados que faltam (' +
        missingItems.join(', ') +
        ').\n' +
        '2. Mantenha a abertura oficial ou variação acolhedora: "' +
        officialGreetingFallback +
        '".\n' +
        '3. PRESERVE A PERGUNTA ORIGINAL DO VISITANTE: Avise que logo após a identificação você responderá à pergunta feita (' +
        JSON.stringify(message) +
        '), sem obrigar o visitante a ter que repeti-la!\n' +
        '4. Não avance em respostas comerciais ou explicações completas antes da identificação, a menos que o visitante expressamente se recuse a fornecer dados ("não quero passar", "responda logo"). Se o visitante se recusar, não seja inconveniente: forneça o WhatsApp oficial https://wa.me/5531991297619.'
    } else {
      var leadMsgState = ''
      if (leadSyncResult && leadSyncResult.success) {
        leadMsgState =
          'REGISTRO DE LEAD: O contato foi salvo com sucesso (' +
          (leadSyncResult.lead_number || 'Lead registrado') +
          '). Você pode confirmar cordialmente que o contato foi registrado para atendimento da nossa equipe.'
      } else {
        leadMsgState =
          'REGISTRO DE LEAD: A gravação técnica do lead falhou ou não pôde ser confirmada. ' +
          'REGRA TEXTUAL: Não condicione a explicação do sistema ao sucesso técnico do cadastro do lead. ' +
          'Se a gravação falhar, informe a dificuldade sem afirmar que salvou os dados e continue respondendo com o conhecimento disponível após a identificação.'
      }

      var previousQuestionNote = ''
      if (priorUserQuestions.length > 0) {
        previousQuestionNote =
          'PERGUNTAS ANTERIORES DO VISITANTE NO HISTÓRICO: ' +
          JSON.stringify(priorUserQuestions) +
          '. Se o visitante acabou de se identificar e já havia feito uma pergunta anteriormente (ex: "como funciona o sistema?"), RETOME e RESPONDA IMEDIATAMENTE a essa pergunta original agora, sem obrigá-lo a perguntar de novo!\n'
      }

      identificationInstruction =
        'STATUS DE IDENTIFICAÇÃO DO VISITANTE: IDENTIFICAÇÃO COMPLETA!\n' +
        'Nome: ' +
        contact.name +
        ' | Telefone: ' +
        contact.phone +
        ' | E-mail: ' +
        contact.email +
        '\n' +
        leadMsgState +
        '\n' +
        previousQuestionNote +
        'Agora atenda com total prioridade utilizando a Base de Conhecimento Oficial.'
    }

    // System Prompt com todas as regras oficiais do dono
    var systemPrompt =
      'IDENTIDADE E POSICIONAMENTO:\n' +
      'Você é a Jeh, inteligência artificial do ERP Jetro — Plataforma Inteligente de Gestão Empresarial.\n' +
      'O Jetro tem a proposta de oferecer uma gestão ampla, integrada e inteligente, conectando processos, pessoas, informações e decisões.\n' +
      'Nosso posicionamento é oferecer uma plataforma completa e em evolução contínua, com IA nativa, Segundo Cérebro, auditoria e rastreabilidade.\n' +
      'REGRA: nunca afirme como fato comprovado que somos "o sistema mais completo, atualizado ou seguro do mercado" sem evidências comparativas; demonstre diferenciais pelas entregas documentadas.\n\n' +
      'REGRA PRINCIPAL (DIRETRIZ OFICIAL):\n' +
      '"Utilize primeiro as informações confirmadas da base de conhecimento para responder à pergunta. O WhatsApp deve complementar o atendimento, não substituir respostas que a Jeh já consegue fornecer. Perguntas amplas não devem ser classificadas automaticamente como perguntas sem resposta."\n\n' +
      'FLUXO OFICIAL DE ATENDIMENTO:\n' +
      '1. Se ainda não houver identificação, solicite nome, telefone com DDD e melhor e-mail, conforme a regra existente.\n' +
      '2. Preserve a pergunta original enquanto coleta os dados.\n' +
      '3. Após a identificação, responda à pergunta original, sem obrigar o visitante a repeti-la.\n' +
      '4. Utilize as informações disponíveis sobre o Jetro.\n' +
      '5. Faça uma pergunta breve para entender a necessidade do cliente.\n' +
      '6. Encaminhe ao WhatsApp quando houver necessidade de avaliação comercial, confirmação técnica ou informação ausente.\n\n' +
      'RESPOSTA OFICIAL PARA "COMO FUNCIONA O SISTEMA?" (e variações como "Olá, como funciona o sistema?", "Como o Jetro funciona?", etc.):\n' +
      '"' +
      contact.name +
      ', o Jetro é um sistema de gestão empresarial que reúne diferentes áreas da empresa em uma única plataforma, como vendas, financeiro, compras, estoque, produção, logística e gestão de pessoas.\n\n' +
      'Ele funciona de forma modular: a estrutura é definida conforme as necessidades da sua operação e os recursos contratados. A proposta é conectar as informações dos setores, organizar os processos e facilitar o acompanhamento dos resultados.\n\n' +
      'Entre os diferenciais estão a IA nativa Jeh, o Segundo Cérebro, as telas de auditoria e o controle de validades e vencimentos de produtos, documentos e contratos.\n\n' +
      'Atendemos indústrias, operações logísticas, atacadistas, distribuidoras e empresas de serviços. Qual é o segmento da sua empresa e o que você mais precisa organizar hoje?"\n\n' +
      'ADAPTAÇÃO E OBJETIVIDADE:\n' +
      'Adapte o tamanho da resposta ao contexto. Não envie toda a base de conhecimento de uma vez.\n\n' +
      'QUANDO RESPONDER PARCIALMENTE E ENCAMINHAR:\n' +
      'Se souber parte da resposta, explique primeiro essa parte e indique exatamente o que precisa de confirmação. ' +
      'Exemplo oficial: "O Jetro possui uma área financeira que contempla contas a pagar e receber e fluxo de caixa. Sobre a integração com o seu banco específico, preciso que nossa equipe confirme: https://wa.me/5531991297619". ' +
      'Não descarte toda a pergunta porque um detalhe específico está fora da base.\n\n' +
      'QUANDO ENCAMINHAR À EQUIPE (SOMENTE NESTES CASOS):\n' +
      'Encaminhe para https://wa.me/5531991297619 SOMENTE quando o cliente precisar de:\n' +
      '- Preços e condições comerciais;\n' +
      '- Agendamento de demonstração;\n' +
      '- Confirmação de integração específica;\n' +
      '- Avaliação de personalização;\n' +
      '- Prazos de implantação;\n' +
      '- Suporte que exija acesso à conta;\n' +
      '- Informação não documentada.\n' +
      'Nunca invente informações para evitar o encaminhamento.\n\n' +
      'ISOLAMENTO E SEGURANÇA TOTAL:\n' +
      'Você é a assistente pública do site. Você NÃO tem acesso a pedidos, estoque interno, notas fiscais, faturamento, financeiro ou dados sigilosos das empresas que usam o ERP.\n\n' +
      identificationInstruction +
      '\n\n' +
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

    // Se a resposta caiu em desconhecimento real, registrar em jeh_unanswered
    // IMPORTANTE: Perguntas cobertas como "como funciona o sistema" NÃO devem ser registradas como sem resposta
    var lowerMsg = message.toLowerCase()
    var isBroadSystemQuestion =
      lowerMsg.includes('como funciona') ||
      lowerMsg.includes('o que é o jetro') ||
      lowerMsg.includes('quais áreas') ||
      lowerMsg.includes('atende distribuidora')

    var isUnanswered =
      !isBroadSystemQuestion &&
      (aiContent.includes('não tenho essa informação confirmada') ||
        aiContent.includes('ainda não tenho essa informação') ||
        (aiContent.includes('fale com nossa equipe pelo WhatsApp') &&
          !aiContent.includes('O Jetro é um sistema de gestão empresarial')))

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
          uRec.set('provided_answer', aiContent)
          $app.save(uRec)
        } else {
          var newUn = new Record(unCol)
          newUn.set('question', message)
          newUn.set('count', 1)
          newUn.set('identified_topic', 'Geral')
          newUn.set('status', 'pendente')
          newUn.set('source', 'publico')
          newUn.set('classification', 'sem_conteudo_base')
          newUn.set('provided_answer', aiContent)
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
