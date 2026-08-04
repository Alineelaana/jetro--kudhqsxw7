routerAdd(
  'POST',
  '/backend/v1/audit-alerts/resolve',
  (e) => {
    var body = e.requestInfo().body || {}
    var alertId = body.alert_id || ''

    if (!alertId) {
      return e.badRequestError('Alert ID is required')
    }

    var resolverName = 'Sistema'
    if (e.auth) {
      resolverName = e.auth.getString('name') || e.auth.getString('email') || 'Usuario'
    }

    try {
      var record = $app.findRecordById('audit_alerts', alertId)
      record.set('resolved', true)
      record.set('resolved_by', resolverName)
      record.set('resolved_at', new Date().toISOString())
      $app.save(record)
      return e.json(200, { success: true, id: alertId })
    } catch (err) {
      return e.json(404, { error: 'Alert not found' })
    }
  },
  $apis.requireAuth(),
)
