onRecordAfterUpdateSuccess((e) => {
  var oldStatus = e.record.original().getString('status') || ''
  var newStatus = e.record.getString('status') || ''

  if (oldStatus === newStatus) return e.next()

  var deliveryNum = e.record.getString('numero_entrega') || ''
  var cliente = e.record.getString('cliente') || ''
  var motorista = e.record.getString('motorista') || ''

  try {
    var users = $app.findRecordsByFilter('users', 'active != false', '', 0, 0)
    var teamRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
    var notifCol = $app.findCollectionByNameOrId('notifications')

    for (var i = 0; i < users.length; i++) {
      var user = users[i]
      var role = user.getString('role')
      if (teamRoles.indexOf(role) === -1) continue

      var notif = new Record(notifCol)
      notif.set('title', 'Entrega atualizada: ' + deliveryNum)
      notif.set('message', cliente + ' | ' + oldStatus + ' -> ' + newStatus)
      notif.set('type', 'other')
      notif.set('recipient', user.id)
      notif.set('read', false)
      notif.set('link', '/admin/logistica/rastreamento')
      $app.save(notif)
    }
  } catch (err) {
    $app.logger().error('delivery notification failed', 'error', String(err))
  }

  try {
    var tracking = $app.findFirstRecordByFilter(
      'logistics_tracking',
      'entrega = "' + deliveryNum + '"',
    )
    if (tracking) {
      var timeline = tracking.get('linha_tempo') || []
      if (typeof timeline === 'string') {
        try {
          timeline = JSON.parse(timeline)
        } catch (_) {
          timeline = []
        }
      }
      timeline.push({
        evento: 'Status: ' + oldStatus + ' -> ' + newStatus,
        data: new Date().toISOString(),
      })
      tracking.set('linha_tempo', timeline)
      tracking.set('status', newStatus)
      $app.save(tracking)
    }
  } catch (_) {}

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('action', 'update')
    log.set('module', 'logistics')
    log.set('target_collection', 'logistics_deliveries')
    log.set('target_id', e.record.id)
    log.set('target_summary', deliveryNum + ' - ' + cliente)
    log.set('previous_value', { status: oldStatus })
    log.set('new_value', { status: newStatus })
    log.set('criticidade', 'Baixa')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'logistics_deliveries')
