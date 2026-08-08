routerAdd(
  'POST',
  '/backend/v1/validity-alerts/action',
  (e) => {
    var body = e.requestInfo().body || {}
    var alertId = body.alert_id || ''
    var action = body.action || ''
    var justification = body.justification || ''
    var snoozeDate = body.snooze_date || ''

    if (!alertId || !action) {
      return e.badRequestError('alert_id and action are required')
    }

    var validActions = ['view', 'treat', 'resolve', 'ignore', 'snooze', 'renew']
    if (validActions.indexOf(action) === -1) {
      return e.badRequestError('invalid action')
    }

    var record = null
    try {
      record = $app.findRecordById('validity_alerts', alertId)
    } catch (_) {
      return e.json(404, { error: 'Alert not found' })
    }

    var userName = 'Sistema'
    var userId = ''
    var userRole = ''
    if (e.auth) {
      userName = e.auth.getString('name') || e.auth.getString('email') || 'Usuario'
      userId = e.auth.id
      userRole = e.auth.getString('role') || ''
    }

    var nowISO = new Date().toISOString()

    var statusMap = {
      view: 'Visualizado',
      treat: 'Em Tratamento',
      resolve: 'Resolvido',
      ignore: 'Ignorado',
      renew: 'Resolvido',
    }

    var newStatus = statusMap[action] || record.getString('status')

    var timeline = []
    try {
      timeline = JSON.parse(record.getString('timeline') || '[]')
    } catch (_) {}

    if (action === 'snooze') {
      if (!snoozeDate) {
        return e.badRequestError('snooze_date is required for snooze action')
      }
      var crit = record.getString('criticidade')
      if (crit === 'Crítico' || crit === 'Vencido') {
        var snoozeUntil = new Date(snoozeDate)
        var maxSnooze = new Date()
        maxSnooze.setDate(maxSnooze.getDate() + 7)
        if (snoozeUntil > maxSnooze) {
          return e.badRequestError('Cannot snooze critical/expired alert more than 7 days')
        }
      }
      record.set('snooze_until', snoozeDate)
    }

    if (action === 'ignore' || action === 'renew') {
      if (!justification) {
        return e.badRequestError('justification is required for ' + action + ' action')
      }
      record.set('justification', justification)
    }

    if (action === 'resolve') {
      record.set('resolution_note', justification)
    }

    if (action === 'renew') {
      record.set('resolution_note', 'Document renewed: ' + justification)
    }

    record.set('status', newStatus)

    timeline.push({
      action: action,
      timestamp: nowISO,
      user: userName,
      user_id: userId,
      justification: justification,
      snooze_date: snoozeDate,
    })
    record.set('timeline', JSON.stringify(timeline))

    $app.save(record)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var audit = new Record(auditCol)
      audit.set('user_id', userId)
      audit.set('user_name', userName)
      audit.set('user_role', userRole)
      audit.set('action', action + '_validity_alert')
      audit.set('module', 'validity_alerts')
      audit.set('target_collection', 'validity_alerts')
      audit.set('target_id', alertId)
      audit.set('target_summary', 'Alert: ' + record.getString('entity_name') + ' — ' + action)
      audit.set('origem', 'Área da Empresa')
      $app.saveNoValidate(audit)
    } catch (_) {}

    return e.json(200, { success: true, id: alertId, status: newStatus })
  },
  $apis.requireAuth(),
)
