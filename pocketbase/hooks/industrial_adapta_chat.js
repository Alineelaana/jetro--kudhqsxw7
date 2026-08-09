routerAdd(
  'POST',
  '/backend/v1/industrial/adapta/chat',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      var message = (body.message || '').trim()
      if (!message) return e.badRequestError('message is required')

      var conversationId = body.conversation_id || null

      var result = $ai.agent('industrial-adapta').chat({
        user_id: userId,
        conversation_id: conversationId,
        message: message,
      })

      return e.json(200, {
        conversation_id: result.conversation_id,
        content: result.content,
        message_id: result.message_id,
        citations: result.citations || [],
      })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'IA temporariamente indisponivel' })
      }
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'falha no agente' : err.message })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'IA temporariamente indisponivel' })
      }
      $app.logger().error('industrial adapta chat failed', 'error', String(err))
      return e.json(500, { error: 'Falha no chat industrial' })
    }
  },
  $apis.requireAuth(),
)
