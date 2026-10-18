routerAdd('POST', '/backend/v1/chat/send', (e) => {
  try {
    // 1. Verificar se a assistente Jeh está ativa no banco de dados
    var jehStatus = 'inativa'
    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'jeh_assistant_status')
      if (rec) {
        jehStatus = rec.getString('value') || 'inativa'
      }
    } catch (_) {}

    if (jehStatus !== 'ativa') {
      return e.json(403, {
        error: 'A assistente Jeh está temporariamente inativa para atendimento externo.',
        status: 'inativa',
      })
    }

    var body = e.requestInfo().body || {}
    var convId = body.conversation_id || ''
    var clientName = body.client_name || 'Visitante'
    var clientEmail = body.client_email || ''
    var clientPhone = body.client_phone || ''
    var message = (body.message || '').trim()

    if (!message) return e.badRequestError('Mensagem é obrigatória')

    var aiFulltimeActive = false
    try {
      var aiSetting = $app.findFirstRecordByData('settings', 'key', 'ai_fulltime_active')
      if (aiSetting && aiSetting.getString('value') === 'true') {
        aiFulltimeActive = true
      }
    } catch (_) {}

    var conversation = null

    if (convId) {
      try {
        conversation = $app.findRecordById('chat_conversations', convId)
      } catch (_) {
        conversation = null
      }
    }

    var now = new Date().toISOString()

    if (!conversation) {
      var convCol = $app.findCollectionByNameOrId('chat_conversations')
      conversation = new Record(convCol)
      conversation.set('client_name', clientName)
      conversation.set('client_email', clientEmail)
      conversation.set('client_phone', clientPhone)
      conversation.set('status', 'active')
      conversation.set('last_message_at', now)
      $app.save(conversation)
    } else {
      conversation.set('last_message_at', now)
      if (conversation.getString('status') !== 'active') {
        conversation.set('status', 'active')
      }
      $app.save(conversation)
    }

    var msgCol = $app.findCollectionByNameOrId('chat_messages')
    var clientMsg = new Record(msgCol)
    clientMsg.set('conversation_id', conversation.id)
    clientMsg.set('sender', 'client')
    clientMsg.set('content', message)
    clientMsg.set('author_name', clientName)
    $app.save(clientMsg)

    var shouldAiRespond = false

    if (aiFulltimeActive) {
      shouldAiRespond = true
    } else {
      var hasOnlineAttendant = false
      try {
        var onlineAttendants = $app.findRecordsByFilter(
          'users',
          "attendant_status = 'Online'",
          '',
          1,
          0,
        )
        hasOnlineAttendant = onlineAttendants.length > 0
      } catch (_) {}
      if (!hasOnlineAttendant) shouldAiRespond = true
    }

    if (shouldAiRespond) {
      // 1. Coletar Base de Conhecimento e Q&As aprovados da Jeh
      var trainingContent = ''
      try {
        var qas = $app.findRecordsByFilter(
          'jeh_qa',
          "approval_status = 'aprovado'",
          '-updated',
          50,
          0,
        )
        var knows = $app.findRecordsByFilter(
          'jeh_knowledge',
          "approval_status = 'aprovado'",
          '-updated',
          50,
          0,
        )

        var snippets = []
        for (var qi = 0; qi < qas.length; qi++) {
          var q = qas[qi]
          snippets.push(
            '[P&R: ' + q.getString('canonical_question') + ']: ' + q.getString('official_answer'),
          )
        }
        for (var ki = 0; ki < knows.length; ki++) {
          var k = knows[ki]
          snippets.push('[' + k.getString('title') + ']: ' + k.getString('content'))
        }
        if (snippets.length > 0) {
          trainingContent =
            '\n\n--- BASE DE CONHECIMENTO OFICIAL E RESPOSTAS APROVADAS ---\n' +
            snippets.join('\n\n') +
            '\n--- FIM DA BASE OFICIAL ---\n'
        }
      } catch (_) {}

      // Fallback para ai_training se jeh_* não estiver populado
      if (!trainingContent) {
        try {
          var trainings = $app.findRecordsByFilter('ai_training', "id != ''", '-created', 30, 0)
          if (trainings.length > 0) {
            trainingContent = '\n\n--- CONTEÚDO DE TREINAMENTO DA EMPRESA ---\n'
            for (var i = 0; i < trainings.length; i++) {
              var t = trainings[i]
              trainingContent +=
                '\n[' + t.getString('title') + ']:\n' + t.getString('content') + '\n'
            }
            trainingContent += '--- FIM DO CONTEÚDO DE TREINAMENTO ---\n'
          }
        } catch (_) {}
      }

      var historyMessages = []
      try {
        var recentMsgs = $app.findRecordsByFilter(
          'chat_messages',
          "conversation_id = '" + conversation.id + "'",
          '-created',
          11,
          0,
        )
        recentMsgs.reverse()
        for (var j = 0; j < recentMsgs.length; j++) {
          var hm = recentMsgs[j]
          if (hm.id === clientMsg.id) continue
          var role = hm.getString('sender') === 'client' ? 'user' : 'assistant'
          historyMessages.push({ role: role, content: hm.getString('content') })
        }
      } catch (_) {}

      var systemPrompt =
        'QUEM VOCÊ É\n' +
        'Você é a Jeh, assistente virtual do Jetro — Plataforma Inteligente de Gestão Empresarial.\n' +
        'Atenda em português do Brasil, com educação, simpatia e objetividade. Explique termos técnicos quando necessário e adapte a resposta à necessidade do cliente.\n\n' +
        'REGRAS OBRIGATÓRIAS:\n' +
        '1. IDENTIFICAÇÃO ANTES DO ATENDIMENTO: Solicite nome, telefone com DDD e melhor e-mail antes de apresentar o sistema ou responder perguntas.\n' +
        '2. O QUE É O JETRO: Plataforma inteligente de gestão empresarial modular que conecta informações, reduz tarefas manuais e apoia decisões com indicadores para serviços, distribuidoras, atacadistas, indústrias, comércio e multicompanhia.\n' +
        '3. QUANDO PERGUNTAREM O QUE O JETRO FAZ: responder "O Jetro reúne áreas como financeiro, vendas e CRM, compras, estoque, produção, gestão de pessoas, marketing, atendimento e indicadores em uma plataforma modular. A proposta é conectar os setores e facilitar a gestão. Qual é o segmento da sua empresa e qual área você precisa organizar primeiro?"\n' +
        '4. IDENTIDADE E ORIGEM DO NOME JETRO (Êxodo 18):\n' +
        '- Inspirado no sogro e conselheiro de Moisés. Observou a sobrecarga de Moisés e recomendou ensinar princípios, escolher pessoas confiáveis e distribuir responsabilidades, deixando com Moisés os casos difíceis. Não afirmar que criou a administração moderna.\n' +
        '- Jetro vem do hebraico Yitrô (excelência ou abundância). Gestão, organização e liderança são valores da marca, não traduções literais.\n' +
        '- Assinatura: "Jetro — Sabedoria para gerir. Estrutura para crescer."\n' +
        '5. TRANSPARÊNCIA DE IA E GUIA DE ESTILO: Você é uma assistente virtual inteligente. Se perguntarem se é IA, seja transparente e confirme com simplicidade. Responda à pergunta antes de detalhar. Frases simples, sem textos decorados ou emojis excessivos. NUNCA use linguagem religiosa para pregar: o Jetro atende empresas de qualquer crença.\n' +
        '6. QUANDO NÃO SOUBER: "[Nome], ainda não tenho essa informação confirmada. Nossa equipe pode verificar esse ponto e orientar você pelo WhatsApp: https://wa.me/5531991297619"\n' +
        '7. LIMITES E SEGURANÇA: Não invente preços, planos, descontos, prazos ou garantias. Não confunda módulo de logística com serviços físicos. Não solicite senhas ou dados bancários. Você NUNCA tem acesso a dados internos confidenciais do ERP.'

      if (trainingContent) {
        systemPrompt += trainingContent
      }

      var aiMessages = [{ role: 'system', content: systemPrompt }]
      for (var k = 0; k < historyMessages.length; k++) {
        aiMessages.push(historyMessages[k])
      }
      aiMessages.push({ role: 'user', content: message })

      try {
        var reply = $ai.chat({ model: 'fast', messages: aiMessages })
        var aiContent = reply.choices[0].message.content
        var aiMsg = new Record(msgCol)
        aiMsg.set('conversation_id', conversation.id)
        aiMsg.set('sender', 'ai')
        aiMsg.set('content', aiContent)
        aiMsg.set('author_name', 'Jeh (IA)')
        $app.save(aiMsg)
      } catch (err) {
        var fallbackMsg = new Record(msgCol)
        fallbackMsg.set('conversation_id', conversation.id)
        fallbackMsg.set('sender', 'ai')
        fallbackMsg.set(
          'content',
          'Olá! Recebi sua mensagem. No momento estamos processando sua solicitação. Um de nossos atendentes entrará em contato em breve. Obrigado!',
        )
        fallbackMsg.set('author_name', 'Jeh (IA)')
        $app.save(fallbackMsg)
      }
    }

    return e.json(200, { conversation_id: conversation.id })
  } catch (err) {
    return e.json(500, { error: 'Erro ao processar mensagem' })
  }
})
