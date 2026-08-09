routerAdd(
  'GET',
  '/backend/v1/industrial/adapta/conversations',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      var limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
      return e.json(
        200,
        $ai.agent('industrial-adapta').listConversations({ user_id: userId, limit }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'falha ao listar conversas' : err.message })
      }
      $app.logger().error('industrial adapta conversations failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao listar conversas' })
    }
  },
  $apis.requireAuth(),
)
