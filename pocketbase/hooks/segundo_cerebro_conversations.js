routerAdd(
  'GET',
  '/backend/v1/segundo-cerebro/conversations',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      var limit = parseInt(e.requestInfo().query.limit || '30', 10) || 30
      return e.json(
        200,
        $ai.agent('segundo-cerebro').listConversations({ user_id: userId, limit: limit }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        return e.json(err.status || 500, { error: err.message })
      }
      return e.json(500, { error: 'Falha ao listar conversas' })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/segundo-cerebro/conversations/{conversationId}/messages',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      var convId = e.request.pathValue('conversationId')
      return e.json(
        200,
        $ai.agent('segundo-cerebro').listMessages({
          conversation_id: convId,
          user_id: userId,
          limit: 100,
        }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        return e.json(err.status || 500, { error: err.message })
      }
      return e.json(500, { error: 'Falha ao recuperar histórico' })
    }
  },
  $apis.requireAuth(),
)
