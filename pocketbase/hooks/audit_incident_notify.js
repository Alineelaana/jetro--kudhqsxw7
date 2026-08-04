onRecordAfterCreateSuccess((e) => {
  var criticidade = e.record.getString('criticidade')
  if (criticidade !== 'Critica') {
    e.next()
    return
  }

  var action = e.record.getString('action')
  var module = e.record.getString('module')
  var targetSummary = e.record.getString('target_summary') || ''
  var logId = e.record.id
  var userName = e.record.getString('user_name') || 'Desconhecido'
  var ipAddress = e.record.getString('ip_address') || '---'
  var browser = e.record.getString('browser') || '---'
  var os = e.record.getString('os') || '---'
  var sessionId = e.record.getString('session_id') || '---'

  var emailEnabled = false
  var notifyEmail = ''
  try {
    var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
    var config = JSON.parse(rec.getString('value'))
    emailEnabled = config.email_notifications_enabled === true
    notifyEmail = config.notification_email || ''
  } catch (_) {}

  try {
    var supUsers = $app.findRecordsByFilter(
      'users',
      "role = 'SUP' && active = true",
      '-created',
      100,
      0,
    )

    if (supUsers.length === 0) {
      e.next()
      return
    }

    var notifCol = $app.findCollectionByNameOrId('notifications')
    var title = 'Evento Critico de Auditoria'
    var message = action + ' em ' + module
    if (targetSummary) message += ' - ' + targetSummary
    message += '\nUsuario: ' + userName
    message += '\nIP: ' + ipAddress
    message += '\nNavegador: ' + browser + ' / ' + os
    message += '\nSessao: ' + sessionId

    for (var i = 0; i < supUsers.length; i++) {
      try {
        var notif = new Record(notifCol)
        notif.set('title', title)
        notif.set('message', message)
        notif.set('recipient', supUsers[i].id)
        notif.set('read', false)
        notif.set('link', '/admin?tab=auditoria&log=' + logId)
        $app.saveNoValidate(notif)
      } catch (_) {}
    }
  } catch (err) {
    $app.logger().error('incident notification failed', 'error', String(err))
  }

  if (emailEnabled && notifyEmail) {
    $app
      .logger()
      .info(
        'critical incident email notification queued',
        'email',
        notifyEmail,
        'action',
        action,
        'module',
        module,
        'log_id',
        logId,
      )
  }

  e.next()
}, 'audit_logs')
