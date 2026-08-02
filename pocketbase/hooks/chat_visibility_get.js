routerAdd('GET', '/backend/v1/chat-visibility', (e) => {
  try {
    const record = $app.findFirstRecordByData('settings', 'key', 'floating_chat_visible')
    return e.json(200, { visible: record.getString('value') !== 'false' })
  } catch (_) {
    return e.json(200, { visible: true })
  }
})
