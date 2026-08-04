onRecordAfterCreateSuccess((e) => {
  var action = e.record.getString('action')
  var module = e.record.getString('module')
  var userId = e.record.getString('user_id')
  var sessionId = e.record.getString('session_id')
  var criticidade = e.record.getString('criticidade')
  var logId = e.record.id

  var alertType = ''
  var severity = 'warning'
  var description = ''

  function fmtDate(ms) {
    var d = new Date(Date.now() - ms)
    return d.toISOString().replace('T', ' ').substring(0, 19)
  }

  if (action === 'login_failed') {
    var failed = $app.findRecordsByFilter(
      'audit_logs',
      'action = "login_failed" && created >= "' + fmtDate(300000) + '"',
      '-created',
      10,
      0,
    )
    if (failed.length >= 5) {
      alertType = 'many_failed_logins'
      description = 'Múltiplas tentativas de login inválidas (' + failed.length + ' em 5 min)'
    }
  } else if (action === 'login' && userId) {
    var recentLogins = $app.findRecordsByFilter(
      'audit_logs',
      'action = "login" && user_id = "' + userId + '" && created >= "' + fmtDate(3600000) + '"',
      '-created',
      10,
      0,
    )
    if (recentLogins.length >= 3) {
      alertType = 'frequent_logins'
      description = 'Múltiplos logins em uma hora pelo mesmo usuário'
    }
  }

  if (criticidade === 'Crítica' && !alertType) {
    alertType = 'critical_action'
    severity = 'critical'
    description = 'Ação crítica: ' + action + ' em ' + module
  }

  if ((action === 'update' || action === 'create') && userId && !alertType) {
    var recentChanges = $app.findRecordsByFilter(
      'audit_logs',
      'user_id = "' +
        userId +
        '" && (action = "update" || action = "create") && created >= "' +
        fmtDate(900000) +
        '"',
      '-created',
      50,
      0,
    )
    if (recentChanges.length >= 20) {
      alertType = 'many_consecutive_changes'
      description = 'Muitas alterações consecutivas (' + recentChanges.length + ' em 15 min)'
    }
  }

  if (alertType) {
    try {
      var logRec = $app.findRecordById('audit_logs', logId)
      logRec.set('is_suspicious', true)
      $app.save(logRec)
    } catch (_) {}

    try {
      var alertCol = $app.findCollectionByNameOrId('audit_alerts')
      var alert = new Record(alertCol)
      alert.set('alert_type', alertType)
      alert.set('severity', severity)
      alert.set('description', description)
      alert.set('audit_log_id', logId)
      alert.set('session_id', sessionId)
      alert.set('user_id', userId)
      alert.set('resolved', false)
      $app.save(alert)
    } catch (err) {
      $app.logger().error('audit alert creation failed', 'error', String(err))
    }
  }

  e.next()
}, 'audit_logs')
