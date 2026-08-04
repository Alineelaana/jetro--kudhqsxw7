onRecordAfterCreateSuccess((e) => {
  var criticidade = e.record.getString('criticidade')
  if (criticidade !== 'Crítica') {
    e.next()
    return
  }

  var action = e.record.getString('action')
  var module = e.record.getString('module')
  var targetSummary = e.record.getString('target_summary') || ''
  var logId = e.record.id

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
    var title = 'Evento Crítico de Auditoria'
    var message = action + ' em ' + module
    if (targetSummary) message += ' — ' + targetSummary

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

  e.next()
}, 'audit_logs')
