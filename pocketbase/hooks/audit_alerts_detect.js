onRecordAfterCreateSuccess((e) => {
  var action = e.record.getString('action')
  var module = e.record.getString('module')
  var userId = e.record.getString('user_id')
  var sessionId = e.record.getString('session_id')
  var criticidade = e.record.getString('criticidade')
  var origem = e.record.getString('origem')
  var logId = e.record.id

  var config = {
    max_failed_logins: 5,
    max_failed_logins_window_min: 5,
    max_logins_per_hour: 3,
    max_changes_per_15min: 20,
    max_exports_per_hour: 10,
    max_imports_per_hour: 10,
    allowed_hours_start: '06:00',
    allowed_hours_end: '22:00',
  }
  try {
    var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
    var parsed = JSON.parse(rec.getString('value'))
    for (var k in parsed) {
      config[k] = parsed[k]
    }
  } catch (_) {}

  function fmtDate(ms) {
    var d = new Date(Date.now() - ms)
    return d.toISOString().replace('T', ' ').substring(0, 19)
  }

  var alertType = ''
  var severity = 'warning'
  var description = ''

  var now = new Date()
  var hour = now.getHours()
  var startH = parseInt((config.allowed_hours_start || '06:00').split(':')[0], 10)
  var endH = parseInt((config.allowed_hours_end || '22:00').split(':')[0], 10)

  if (action === 'login' && (hour < startH || hour >= endH)) {
    alertType = 'login_outside_hours'
    description =
      'Login fora do horario permitido (' +
      config.allowed_hours_start +
      ' - ' +
      config.allowed_hours_end +
      ')'
  }

  if (action === 'login_failed' && !alertType) {
    var windowMs = (config.max_failed_logins_window_min || 5) * 60000
    var failed = $app.findRecordsByFilter(
      'audit_logs',
      'action = "login_failed" && created >= "' + fmtDate(windowMs) + '"',
      '-created',
      10,
      0,
    )
    if (failed.length >= (config.max_failed_logins || 5)) {
      alertType = 'many_failed_logins'
      description =
        'Multiplas tentativas de login invalidas (' +
        failed.length +
        ' em ' +
        (config.max_failed_logins_window_min || 5) +
        ' min)'
    }
  }

  if (action === 'login' && userId && !alertType) {
    var recentLogins = $app.findRecordsByFilter(
      'audit_logs',
      'action = "login" && user_id = "' + userId + '" && created >= "' + fmtDate(3600000) + '"',
      '-created',
      10,
      0,
    )
    if (recentLogins.length >= (config.max_logins_per_hour || 3)) {
      alertType = 'frequent_logins'
      description = 'Multiplos logins em uma hora pelo mesmo usuario'
    }
  }

  if (criticidade === 'Critica' && !alertType) {
    alertType = 'critical_action'
    severity = 'critical'
    description = 'Acao critica: ' + action + ' em ' + module
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
    if (recentChanges.length >= (config.max_changes_per_15min || 20)) {
      alertType = 'many_consecutive_changes'
      description = 'Muitas alteracoes consecutivas (' + recentChanges.length + ' em 15 min)'
    }
  }

  if (origem === 'Exportacao' && userId && !alertType) {
    var recentExports = $app.findRecordsByFilter(
      'audit_logs',
      'user_id = "' +
        userId +
        '" && origem = "Exportacao" && created >= "' +
        fmtDate(3600000) +
        '"',
      '-created',
      50,
      0,
    )
    if (recentExports.length >= (config.max_exports_per_hour || 10)) {
      alertType = 'many_exports'
      description = 'Muitas exportacoes de dados (' + recentExports.length + ' em 1h)'
    }
  }

  if (origem === 'Importacao' && userId && !alertType) {
    var recentImports = $app.findRecordsByFilter(
      'audit_logs',
      'user_id = "' +
        userId +
        '" && origem = "Importacao" && created >= "' +
        fmtDate(3600000) +
        '"',
      '-created',
      50,
      0,
    )
    if (recentImports.length >= (config.max_imports_per_hour || 10)) {
      alertType = 'many_imports'
      description = 'Muitas importacoes de dados (' + recentImports.length + ' em 1h)'
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
