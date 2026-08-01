routerAdd('GET', '/backend/v1/chat/status/{conversationId}', (e) => {
  var conversationId = e.request.pathValue('conversationId')
  if (!conversationId) return e.badRequestError('ID da conversa e obrigatorio')

  try {
    var conv = $app.findRecordById('chat_conversations', conversationId)
    var closed = false
    try {
      closed = conv.getBool('closed')
    } catch (_) {}
    return e.json(200, { closed: closed, status: conv.getString('status') })
  } catch (err) {
    return e.json(404, { error: 'conversation not found' })
  }
})
