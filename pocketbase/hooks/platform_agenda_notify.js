onRecordAfterCreateSuccess((e) => {
  if (e.record.collectionName !== 'platform_agenda_events') return e.next()

  try {
    var assignedTo = e.record.getString('assigned_to')
    if (!assignedTo) return e.next()

    var notifCol = $app.findCollectionByNameOrId('notifications')
    var notif = new Record(notifCol)
    notif.set('title', 'Novo Evento na Agenda: ' + e.record.getString('title'))
    notif.set(
      'message',
      'Tipo: ' +
        e.record.getString('event_type') +
        ' | Inicio: ' +
        e.record.getString('start_date'),
    )
    notif.set('type', 'agenda_reminder')
    notif.set('recipient', assignedTo)
    notif.set('read', false)
    notif.set('link', '/admin/platform-layer')
    $app.saveNoValidate(notif)
  } catch (err) {
    $app.logger().error('agenda notification failed', 'error', String(err))
  }

  return e.next()
}, 'platform_agenda_events')
