routerAdd(
  'GET',
  '/backend/v1/industrial/adapta/conversations/{conversationId}/messages',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      return e.json(
        200,
        $ai.agent('industrial-adapta').listMessages({
          conversation_id: e.request.pathValue('conversationId'),
          user_id: userId,
        }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'falha ao buscar mensagens' : err.message })
      }
      $app.logger().error('industrial adapta messages failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao buscar mensagens' })
    }
  },
  $apis.requireAuth(),
)
