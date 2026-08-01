routerAdd('POST', '/backend/v1/chat/send', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const convId = body.conversation_id || ''
    const clientName = body.client_name || 'Visitante'
    const clientEmail = body.client_email || ''
    const clientPhone = body.client_phone || ''
    const message = (body.message || '').trim()

    if (!message) return e.badRequestError('Mensagem é obrigatória')

    let conversation = null

    if (convId) {
      try {
        conversation = $app.findRecordById('chat_conversations', convId)
      } catch (_) {
        conversation = null
      }
    }

    const now = new Date().toISOString()

    if (!conversation) {
      const convCol = $app.findCollectionByNameOrId('chat_conversations')
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

    const msgCol = $app.findCollectionByNameOrId('chat_messages')
    const clientMsg = new Record(msgCol)
    clientMsg.set('conversation_id', conversation.id)
    clientMsg.set('sender', 'client')
    clientMsg.set('content', message)
    clientMsg.set('author_name', clientName)
    $app.save(clientMsg)

    let hasOnlineAttendant = false
    try {
      const onlineAttendants = $app.findRecordsByFilter(
        'users',
        "attendant_status = 'Online'",
        '',
        1,
        0,
      )
      hasOnlineAttendant = onlineAttendants.length > 0
    } catch (_) {}

    if (!hasOnlineAttendant) {
      try {
        const reply = $ai.chat({
          model: 'fast',
          messages: [
            {
              role: 'system',
              content:
                'Você é a Srta. Velora, atendente virtual da VeloraLog, empresa de operações logísticas no Espírito Santo. No momento não há atendentes humanos disponíveis. Seja educada, simpática e acolhedora. Informe que não há atendentes disponíveis no momento, mas que o cliente pode deixar seu contato (nome, telefone ou e-mail) que retornaremos assim que possível. Responda sempre em português brasileiro de forma breve. Se o cliente já deixou contato, agradeça e diga que retornaremos em breve.',
            },
            { role: 'user', content: message },
          ],
        })

        const aiContent = reply.choices[0].message.content
        const aiMsg = new Record(msgCol)
        aiMsg.set('conversation_id', conversation.id)
        aiMsg.set('sender', 'ai')
        aiMsg.set('content', aiContent)
        aiMsg.set('author_name', 'Srta. Velora (IA)')
        $app.save(aiMsg)
      } catch (err) {
        const fallbackMsg = new Record(msgCol)
        fallbackMsg.set('conversation_id', conversation.id)
        fallbackMsg.set('sender', 'ai')
        fallbackMsg.set(
          'content',
          'Olá! No momento não temos atendentes disponíveis. Mas pode deixar seu nome e telefone ou e-mail que retornaremos assim que possível. Obrigado!',
        )
        fallbackMsg.set('author_name', 'Srta. Velora (IA)')
        $app.save(fallbackMsg)
      }
    }

    return e.json(200, { conversation_id: conversation.id })
  } catch (err) {
    return e.json(500, { error: 'Erro ao processar mensagem' })
  }
})
