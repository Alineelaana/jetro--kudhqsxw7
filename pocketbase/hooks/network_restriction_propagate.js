onRecordAfterUpdateSuccess((e) => {
  var oldRestriction = e.record.original().getBool('financial_restriction')
  var newRestriction = e.record.getBool('financial_restriction')
  if (oldRestriction === newRestriction) return e.next()

  var networkId = e.record.getString('network_id') || ''
  if (!networkId) return e.next()

  var wasOrigin = !e.record.original().getString('network_restriction_origin_partner_id')

  if (newRestriction && wasOrigin) {
    var originName = e.record.getString('full_name') || e.record.getString('company_name') || ''
    var originCnpj = e.record.getString('cnpj') || ''
    var overdueAmount = 0
    var maxDays = 0
    try {
      var recs = $app.findRecordsByFilter(
        'financial_receivables',
        'cliente ~ "' + originName + '" && status != "Recebido" && status != "Cancelado"',
        '',
        500,
        0,
      )
      for (var ri = 0; ri < recs.length; ri++) {
        var saldo =
          parseFloat(recs[ri].getString('valor_original') || '0') -
          parseFloat(recs[ri].getString('valor_recebido') || '0')
        var venc = recs[ri].getString('data_vencimento')
        if (venc) {
          var days = Math.floor((Date.now() - new Date(venc).getTime()) / 86400000)
          if (days > 0) {
            overdueAmount += saldo
            if (days > maxDays) maxDays = days
          }
        }
      }
    } catch (_) {}

    var members = []
    try {
      members = $app.findRecordsByFilter(
        'partners',
        'network_id = "' + networkId + '" && id != "' + e.record.id + '"',
        '',
        500,
        0,
      )
    } catch (_) {}

    for (var mi = 0; mi < members.length; mi++) {
      var m = members[mi]
      if (m.getBool('financial_restriction')) continue
      m.set('financial_restriction', true)
      m.set('network_restriction_source', 'Restrição por Grupo Econômico')
      m.set('network_restriction_origin_partner_id', e.record.id)
      m.set('network_restriction_origin_name', originName)
      m.set('network_restriction_origin_cnpj', originCnpj)
      m.set('network_restriction_origin_amount', String(overdueAmount))
      m.set('network_restriction_origin_days', String(maxDays))
      $app.saveNoValidate(m)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('action', 'network_restriction_applied')
        log.set('module', 'Financeiro')
        log.set('target_collection', 'partners')
        log.set('target_id', m.id)
        log.set('target_summary', m.getString('full_name') || m.getString('company_name') || '')
        log.set(
          'new_value',
          JSON.stringify({
            origin: originName,
            origin_cnpj: originCnpj,
            amount: overdueAmount,
            days: maxDays,
          }),
        )
        log.set('criticidade', 'Alta')
        log.set('origem', 'Automação')
        $app.save(log)
      } catch (_) {}
    }
  }

  if (!newRestriction && wasOrigin) {
    var restrictedMembers = []
    try {
      restrictedMembers = $app.findRecordsByFilter(
        'partners',
        'network_id = "' +
          networkId +
          '" && network_restriction_origin_partner_id = "' +
          e.record.id +
          '"',
        '',
        500,
        0,
      )
    } catch (_) {}

    for (var rmi = 0; rmi < restrictedMembers.length; rmi++) {
      var rm = restrictedMembers[rmi]
      rm.set('financial_restriction', false)
      rm.set('network_restriction_source', '')
      rm.set('network_restriction_origin_partner_id', '')
      rm.set('network_restriction_origin_name', '')
      rm.set('network_restriction_origin_cnpj', '')
      rm.set('network_restriction_origin_amount', '')
      rm.set('network_restriction_origin_days', '')
      $app.saveNoValidate(rm)

      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var aLog = new Record(aCol)
        aLog.set('action', 'network_restriction_released')
        aLog.set('module', 'Financeiro')
        aLog.set('target_collection', 'partners')
        aLog.set('target_id', rm.id)
        aLog.set('target_summary', rm.getString('full_name') || rm.getString('company_name') || '')
        aLog.set('criticidade', 'Media')
        aLog.set('origem', 'Automação')
        $app.save(aLog)
      } catch (_) {}
    }
  }

  return e.next()
}, 'partners')
