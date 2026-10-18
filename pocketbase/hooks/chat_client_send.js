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
      var trainingContent = ''
      try {
        var trainings = $app.findRecordsByFilter('ai_training', "id != ''", '-created', 50, 0)
        if (trainings.length > 0) {
          trainingContent = '\n\n--- CONTEÚDO DE TREINAMENTO DA EMPRESA ---\n'
          for (var i = 0; i < trainings.length; i++) {
            var t = trainings[i]
            var tType = t.getString('type')
            var tLabel =
              tType === 'qa'
                ? 'Pergunta e Resposta'
                : tType === 'template'
                  ? 'Template de Resposta'
                  : 'Instrução'
            trainingContent +=
              '\n[' + tLabel + '] ' + t.getString('title') + ':\n' + t.getString('content') + '\n'
          }
          trainingContent += '--- FIM DO CONTEÚDO DE TREINAMENTO ---\n'
        }
      } catch (_) {}

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
        'Você é a Jeh, assistente virtual inteligente da plataforma Jetro. Seja educada, simpática e profissional. Responda sempre em português brasileiro de forma breve e clara.'
      systemPrompt +=
        '\n\nVocê atua orientando sobre as soluções e recursos da plataforma Jetro, ajudando a esclarecer dúvidas e apresentar o ecossistema.'
      systemPrompt +=
        '\nSe o cliente perguntar sobre assuntos totalmente fora do escopo da empresa, redirecione educadamente para um atendente humano, informando que um consultor entrará em contato.'
      systemPrompt +=
        '\nMantenha uma persona consistente e profissional, alinhada com a identidade da Jetro.'

      if (trainingContent) {
        systemPrompt +=
          '\n\nUse o conteúdo de treinamento abaixo como base para suas respostas, adaptando-se ao modelo de trabalho e formato de serviço da empresa:'
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
