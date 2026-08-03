routerAdd(
  'POST',
  '/backend/v1/budget-send-log',
  (e) => {
    var body = e.requestInfo().body || {}
    var requestId = body.request_id
    var channel = body.channel
    var recipient = body.recipient || ''
    var sender = body.sender || ''

    if (!requestId || !channel) {
      return e.badRequestError('request_id e channel são obrigatórios')
    }

    try {
      var record = $app.findRecordById('budget_requests', requestId)
      var history = record.get('sending_history') || []
      if (typeof history === 'string') {
        try {
          history = JSON.parse(history)
        } catch (_) {
          history = []
        }
      }

      history.push({
        channel: channel,
        recipient: recipient,
        sender: sender,
        sent_at: new Date().toISOString(),
      })

      record.set('sending_history', history)
      $app.save(record)

      return e.json(200, { success: true })
    } catch (err) {
      $app.logger().error('budget send log failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao registrar envio' })
    }
  },
  $apis.requireAuth(),
)
