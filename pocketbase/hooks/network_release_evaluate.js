onRecordAfterUpdateSuccess((e) => {
  var oldStatus = e.record.original().getString('status') || ''
  var newStatus = e.record.getString('status') || ''
  if (oldStatus === newStatus) return e.next()
  if (newStatus !== 'Recebido' && newStatus !== 'Parcialmente Recebido') return e.next()

  var cliente = e.record.getString('cliente') || ''
  if (!cliente) return e.next()

  var partner = null
  try {
    partner = $app.findFirstRecordByFilter(
      'partners',
      'full_name ~ "' + cliente + '" || company_name ~ "' + cliente + '"',
    )
  } catch (_) {
    return e.next()
  }

  if (!partner.getBool('financial_restriction')) return e.next()
  if (partner.getString('network_restriction_origin_partner_id')) return e.next()

  var stillOverdue = false
  try {
    var recs = $app.findRecordsByFilter(
      'financial_receivables',
      'cliente ~ "' + cliente + '" && status != "Recebido" && status != "Cancelado"',
      '',
      500,
      0,
    )
    for (var i = 0; i < recs.length; i++) {
      var venc = recs[i].getString('data_vencimento')
      if (venc) {
        var days = Math.floor((Date.now() - new Date(venc).getTime()) / 86400000)
        if (days > 0) {
          stillOverdue = true
          break
        }
      }
    }
  } catch (_) {}

  if (!stillOverdue) {
    partner.set('financial_restriction', false)
    partner.set('restriction_reason', '')
    $app.saveNoValidate(partner)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('action', 'network_restriction_auto_released')
      log.set('module', 'Financeiro')
      log.set('target_collection', 'partners')
      log.set('target_id', partner.id)
      log.set('target_summary', cliente)
      log.set(
        'new_value',
        JSON.stringify({ reason: 'Debt settled - no overdue receivables remaining' }),
      )
      log.set('criticidade', 'Media')
      log.set('origem', 'Automação')
      $app.save(log)
    } catch (_) {}
  }

  return e.next()
}, 'financial_receivables')
