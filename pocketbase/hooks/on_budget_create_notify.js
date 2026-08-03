onRecordAfterCreateSuccess((e) => {
  try {
    var users = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
    var teamRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
    var notifCol = $app.findCollectionByNameOrId('notifications')
    var clientName = e.record.getString('client_name') || '—'
    var budgetNumber = e.record.getString('budget_number') || ''

    for (var i = 0; i < users.length; i++) {
      var user = users[i]
      var role = user.getString('role')
      if (teamRoles.indexOf(role) === -1) continue

      var notif = new Record(notifCol)
      notif.set('title', 'Novo orçamento solicitado')
      notif.set('message', 'Cliente: ' + clientName + (budgetNumber ? ' • Nº ' + budgetNumber : ''))
      notif.set('type', 'budget_created')
      notif.set('recipient', user.id)
      notif.set('read', false)
      notif.set('link', '/admin')
      $app.save(notif)
    }
  } catch (err) {
    $app.logger().error('budget create notification failed', 'error', String(err))
  }
  return e.next()
}, 'budget_requests')
