onRecordUpdateRequest((e) => {
  var oldStatus = e.record.original().getString('status') || ''
  var newStatus = e.record.getString('status') || ''
  if (oldStatus === newStatus) {
    e.next()
    return
  }
  if (newStatus !== 'Recebido' && newStatus !== 'Parcialmente Recebido') {
    e.next()
    return
  }

  var cliente = e.record.getString('cliente') || ''
  var authUser = e.auth

  e.next()

  if (!cliente) return

  var partner = null
  try {
    partner = $app.findFirstRecordByFilter(
      'partners',
      'full_name ~ "' + cliente + '" || company_name ~ "' + cliente + '"',
    )
  } catch (_) {
    return
  }

  if (!partner.getBool('financial_restriction')) return
  if (partner.getString('network_restriction_origin_partner_id')) return

  var networkId = partner.getString('network_id') || ''
  var partnerId = partner.id

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
    var autoJustification = 'dívida responsável regularizada — reavaliação automática da Rede'

    partner.set('financial_restriction', false)
    partner.set('restriction_reason', '')
    $app.saveNoValidate(partner)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', authUser ? authUser.id : '')
      log.set(
        'user_name',
        authUser ? authUser.getString('name') || authUser.email || '' : 'Automação',
      )
      log.set('user_role', authUser ? authUser.getString('role') || '' : '')
      log.set('action', 'network_restriction_auto_released')
      log.set('module', 'Financeiro')
      log.set('target_collection', 'partners')
      log.set('target_id', partnerId)
      log.set('target_summary', cliente)
      log.set('new_value', JSON.stringify({ reason: autoJustification }))
      log.set('criticidade', 'Média')
      log.set('origem', authUser ? 'Área da Empresa' : 'Automação')
      log.set('justification', autoJustification)
      $app.save(log)
    } catch (_) {}

    if (networkId) {
      var restrictedMembers = []
      try {
        restrictedMembers = $app.findRecordsByFilter(
          'partners',
          'network_id = "' +
            networkId +
            '" && network_restriction_origin_partner_id = "' +
            partnerId +
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
          aLog.set('user_id', authUser ? authUser.id : '')
          aLog.set(
            'user_name',
            authUser ? authUser.getString('name') || authUser.email || '' : 'Automação',
          )
          aLog.set('user_role', authUser ? authUser.getString('role') || '' : '')
          aLog.set('action', 'network_restriction_released')
          aLog.set('module', 'Financeiro')
          aLog.set('target_collection', 'partners')
          aLog.set('target_id', rm.id)
          aLog.set(
            'target_summary',
            rm.getString('full_name') || rm.getString('company_name') || '',
          )
          aLog.set('new_value', JSON.stringify({ origin: cliente, network_id: networkId }))
          aLog.set('criticidade', 'Média')
          aLog.set('origem', authUser ? 'Área da Empresa' : 'Automação')
          aLog.set('justification', autoJustification)
          $app.save(aLog)
        } catch (_) {}
      }
    }
  }

  return
}, 'financial_receivables')
