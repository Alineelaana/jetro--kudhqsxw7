routerAdd(
  'POST',
  '/backend/v1/chat/reply',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var conversationId = body.conversation_id || ''
      var content = (body.content || '').trim()
      var userId = e.auth ? e.auth.id : ''

      if (!userId) return e.unauthorizedError('auth required')
      if (!conversationId) return e.badRequestError('conversation_id is required')
      if (!content) return e.badRequestError('content is required')

      var conv = $app.findRecordById('chat_conversations', conversationId)

      if (!conv.getString('attendant_id')) {
        conv.set('attendant_id', userId)
      }

      var msgCol = $app.findCollectionByNameOrId('chat_messages')
      var msg = new Record(msgCol)
      msg.set('conversation_id', conversationId)
      msg.set('sender', 'attendant')
      msg.set('content', content)
      msg.set('author_name', 'Srta. Velora')
      $app.save(msg)

      conv.set('last_message_at', new Date().toISOString())
      if (conv.getString('status') !== 'active') {
        conv.set('status', 'active')
      }
      $app.save(conv)

      return e.json(200, { success: true })
    } catch (err) {
      return e.json(500, { error: 'Erro ao enviar resposta' })
    }
  },
  $apis.requireAuth(),
)
