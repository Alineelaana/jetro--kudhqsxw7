routerAdd(
  'GET',
  '/backend/v1/adapta-marketing/conversations',
  (e) => {
    try {
      var userId = e.auth ? e.auth.id : ''
      if (!userId) return e.unauthorizedError('auth required')
      var limit = parseInt(e.requestInfo().query?.limit || '20', 10) || 20
      return e.json(
        200,
        $ai.agent('adapta-marketing').listConversations({ user_id: userId, limit: limit }),
      )
    } catch (err) {
      if (err instanceof SkipAiAgentsError) {
        var status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'conversation lookup failed' : err.message })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
