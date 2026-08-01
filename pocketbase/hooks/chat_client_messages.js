routerAdd('GET', '/backend/v1/chat/messages/{conversationId}', (e) => {
  const conversationId = e.request.pathValue('conversationId')
  if (!conversationId) return e.badRequestError('ID da conversa é obrigatório')

  try {
    const messages = $app.findRecordsByFilter(
      'chat_messages',
      "conversation_id = '" + conversationId + "'",
      'created',
      200,
      0,
    )

    const result = messages.map(function (m) {
      return {
        id: m.id,
        conversation_id: m.getString('conversation_id'),
        sender: m.getString('sender'),
        content: m.getString('content'),
        author_name: m.getString('author_name'),
        created: m.getString('created'),
      }
    })

    return e.json(200, result)
  } catch (err) {
    return e.json(200, [])
  }
})
