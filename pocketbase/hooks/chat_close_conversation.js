routerAdd(
  'POST',
  '/backend/v1/chat/close',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var conversationId = body.conversation_id || ''
      var userId = e.auth ? e.auth.id : ''

      if (!userId) return e.unauthorizedError('auth required')
      if (!conversationId) return e.badRequestError('conversation_id is required')

      var conv = $app.findRecordById('chat_conversations', conversationId)

      if (!conv.getString('attendant_id')) {
        conv.set('attendant_id', userId)
      }

      conv.set('closed', true)
      conv.set('status', 'closed')
      conv.set('last_message_at', new Date().toISOString())
      $app.save(conv)

      var msgCol = $app.findCollectionByNameOrId('chat_messages')
      var ratingMsg = new Record(msgCol)
      ratingMsg.set('conversation_id', conversationId)
      ratingMsg.set('sender', 'ai')
      ratingMsg.set(
        'content',
        'Olá! Seu atendimento foi encerrado. Para que possamos melhorar continuamente, avalie o atendimento de 1 a 5 e, se desejar, deixe uma observação ou sugestão. Obrigado!',
      )
      ratingMsg.set('author_name', 'Srta. Velora (IA)')
      $app.save(ratingMsg)

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'Erro ao encerrar conversa' })
    }
  },
  $apis.requireAuth(),
)
