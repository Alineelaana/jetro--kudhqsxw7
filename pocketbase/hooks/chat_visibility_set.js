routerAdd(
  'POST',
  '/backend/v1/chat-visibility',
  (e) => {
    const body = e.requestInfo().body || {}
    const visible = body.visible
    if (typeof visible !== 'boolean') return e.badRequestError('visible must be a boolean')

    try {
      let record
      try {
        record = $app.findFirstRecordByData('settings', 'key', 'floating_chat_visible')
      } catch (_) {
        const col = $app.findCollectionByNameOrId('settings')
        record = new Record(col)
        record.set('key', 'floating_chat_visible')
        record.set('value', 'true')
      }
      record.set('value', visible ? 'true' : 'false')
      $app.save(record)
      return e.json(200, { visible: visible })
    } catch (err) {
      return e.json(500, { error: 'Failed to update chat visibility' })
    }
  },
  $apis.requireAuth(),
)
