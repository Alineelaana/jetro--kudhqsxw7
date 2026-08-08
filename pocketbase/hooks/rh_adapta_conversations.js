routerAdd(
  'GET',
  '/backend/v1/rh-adapta/conversations',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')
    return e.json(200, $ai.agent('adapta-rh').listConversations({ user_id: userId, limit: 20 }))
  },
  $apis.requireAuth(),
)
