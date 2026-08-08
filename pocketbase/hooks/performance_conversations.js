routerAdd(
  'GET',
  '/backend/v1/performance/conversations',
  (e) => {
    var userId = e.auth ? e.auth.id : ''
    if (!userId) return e.unauthorizedError('auth required')
    var limit = parseInt((e.requestInfo().query && e.requestInfo().query.limit) || '20', 10) || 20
    return e.json(
      200,
      $ai.agent('performance-intelligence').listConversations({ user_id: userId, limit: limit }),
    )
  },
  $apis.requireAuth(),
)
