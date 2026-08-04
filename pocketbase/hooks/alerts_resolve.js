routerAdd(
  'POST',
  '/backend/v1/alerts/resolve',
  (e) => {
    var body = e.requestInfo().body || {}
    var alertType = body.alert_type || ''
    var alertId = body.alert_id || ''

    if (!alertId || (alertType !== 'stock' && alertType !== 'price')) {
      return e.badRequestError('Invalid alert type or ID')
    }

    var collectionName = alertType === 'stock' ? 'stock_alerts' : 'pricing_alerts'
    var resolverName = 'Sistema'
    if (e.auth) {
      resolverName = e.auth.getString('name') || e.auth.getString('email') || 'Usuario'
    }

    try {
      var record = $app.findRecordById(collectionName, alertId)
      record.set('resolved', true)
      record.set('resolved_by', resolverName)
      record.set('resolved_at', new Date().toISOString())
      $app.save(record)
      return e.json(200, { success: true, id: alertId, type: alertType })
    } catch (err) {
      return e.json(404, { error: 'Alert not found' })
    }
  },
  $apis.requireAuth(),
)
