routerAdd('POST', '/backend/v1/chat/rate', (e) => {
  try {
    var body = e.requestInfo().body || {}
    var conversationId = body.conversation_id || ''
    var rating = parseInt(body.rating, 10)
    var comment = body.comment || ''

    if (!conversationId) return e.badRequestError('conversation_id is required')
    if (isNaN(rating) || rating < 1 || rating > 5)
      return e.badRequestError('rating must be between 1 and 5')

    var conv = $app.findRecordById('chat_conversations', conversationId)
    var attendantId = conv.getString('attendant_id')
    if (!attendantId) return e.badRequestError('no attendant linked to this conversation')

    try {
      var existing = $app.findRecordsByFilter(
        'chat_ratings',
        "conversation = '" + conversationId + "'",
        '',
        1,
        0,
      )
      if (existing.length > 0) return e.badRequestError('conversation already rated')
    } catch (_) {}

    var ratingCol = $app.findCollectionByNameOrId('chat_ratings')
    var ratingRecord = new Record(ratingCol)
    ratingRecord.set('conversation', conversationId)
    ratingRecord.set('attendant', attendantId)
    ratingRecord.set('rating', rating)
    ratingRecord.set('comment', comment)
    $app.save(ratingRecord)

    var msgCol = $app.findCollectionByNameOrId('chat_messages')
    var thankMsg = new Record(msgCol)
    thankMsg.set('conversation_id', conversationId)
    thankMsg.set('sender', 'ai')
    thankMsg.set(
      'content',
      'Muito obrigado pela sua avaliação! Seu feedback é muito importante para nós. \u2764\ufe0f',
    )
    thankMsg.set('author_name', 'Srta. Velora (IA)')
    $app.save(thankMsg)

    conv.set('last_message_at', new Date().toISOString())
    $app.save(conv)

    return e.json(200, { success: true })
  } catch (err) {
    return e.json(500, { error: 'Erro ao salvar avaliação' })
  }
})
