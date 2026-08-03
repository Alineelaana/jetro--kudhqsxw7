onRecordAfterUpdateSuccess((e) => {
  try {
    var oldQuote = e.record.original().getString('quote_created_at') || ''
    var newQuote = e.record.getString('quote_created_at') || ''
    var oldServices = JSON.stringify(e.record.original().get('services') || null)
    var newServices = JSON.stringify(e.record.get('services') || null)

    if (oldQuote === newQuote && oldServices === newServices) return e.next()
    if (!e.record.getString('budget_number')) return e.next()

    var users = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
    var teamRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var budgetNumber = e.record.getString('budget_number') || ''
    var clientName = e.record.getString('client_name') || '—'

    for (var i = 0; i < users.length; i++) {
      var user = users[i]
      var role = user.getString('role')
      if (teamRoles.indexOf(role) === -1) continue

      var notif = new Record(notifCol)
      notif.set('title', 'Orçamento atualizado')
      notif.set('message', 'Orçamento ' + budgetNumber + ' (' + clientName + ') foi salvo')
      notif.set('type', 'budget_saved')
      notif.set('recipient', user.id)
      notif.set('read', false)
      notif.set('link', '/admin')
      $app.save(notif)
    }
  } catch (err) {
    $app.logger().error('budget update notification failed', 'error', String(err))
  }
  return e.next()
}, 'budget_requests')
