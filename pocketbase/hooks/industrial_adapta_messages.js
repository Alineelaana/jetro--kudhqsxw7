routerAdd(
  'GET',
  '/backend/v1/industrial/adapta/messages/{conversationId}',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      var conversationId = e.request.pathValue('conversationId')
      if (!conversationId) return e.badRequestError('conversationId required')

      var result = $ai.agent('logistics-agent').listMessages({
        conversation_id: conversationId,
        user_id: userId,
      })

      var messages = (result.messages || result || [])
        .filter(function (m) {
          if (m.role === 'user') return true
          if (m.role === 'assistant') return typeof m.content === 'string' && m.content.length > 0
          return false
        })
        .map(function (m) {
          return {
            id: m.id,
            role: m.role,
            content: m.content,
            created: m.created,
          }
        })

      return e.json(200, { messages: messages })
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'conversation lookup failed' : err.message })
      }
      return e.json(500, { error: 'Failed to load messages' })
    }
  },
  $apis.requireAuth(),
)
