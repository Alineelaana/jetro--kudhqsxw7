onRecordUpdateRequest((e) => {
  var body = e.requestInfo().body || {}
  var newStatus = body.status || ''
  if (
    newStatus !== 'Aprovado' &&
    newStatus !== 'Estoque Reservado' &&
    newStatus !== 'Faturado Totalmente'
  ) {
    e.next()
    return
  }

  var clientId = e.record.getString('client_id') || body.client_id || ''
  if (!clientId) {
    e.next()
    return
  }

  var partner = null
  try {
    partner = $app.findRecordById('partners', clientId)
  } catch (_) {
    e.next()
    return
  }

  if (!partner.getBool('financial_restriction')) {
    e.next()
    return
  }

  var networkId = partner.getString('network_id') || ''
  var policy = 'alert'
  if (networkId) {
    try {
      var network = $app.findRecordById('client_networks', networkId)
      policy = network.getString('restriction_policy') || 'alert'
    } catch (_) {}
  }

  var authUser = e.auth
  var role = authUser ? authUser.getString('role') || '' : ''
  var isSuperuser = e.hasSuperuserAuth()
  var justification = body.justification || ''

  if (policy === 'block') {
    if ((isSuperuser || role === 'SUP') && justification.trim()) {
      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser ? authUser.id : '')
        log.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : '')
        log.set('user_role', role)
        log.set('action', 'network_exceptional_approval')
        log.set('module', 'Vendas')
        log.set('target_collection', 'sales_orders')
        log.set('target_id', e.record.id)
        log.set('target_summary', e.record.getString('client_name') || '')
        log.set(
          'new_value',
          JSON.stringify({ policy: policy, restricted: true, exceptional: true }),
        )
        log.set('criticidade', 'Alta')
        log.set('origem', 'Área da Empresa')
        log.set('justification', justification.trim())
        $app.save(log)
      } catch (_) {}

      e.next()
      return
    }

    if ((isSuperuser || role === 'SUP') && !justification.trim()) {
      return e.badRequestError(
        'Justificativa é obrigatória para aprovação excepcional de cliente com restrição',
      )
    }

    return e.forbiddenError(
      'Cliente com restrição de crédito ativa — não é possível aprovar o pedido',
    )
  }

  if (policy === 'require_approval') {
    e.record.set('status', 'Aguardando Aprovação')
  }

  try {
    var aCol = $app.findCollectionByNameOrId('audit_logs')
    var aLog = new Record(aCol)
    aLog.set('user_id', authUser ? authUser.id : '')
    aLog.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : '')
    aLog.set('user_role', role)
    aLog.set('action', 'order_restriction_check')
    aLog.set('module', 'Vendas')
    aLog.set('target_collection', 'sales_orders')
    aLog.set('target_id', e.record.id)
    aLog.set('target_summary', e.record.getString('client_name') || '')
    aLog.set('new_value', JSON.stringify({ policy: policy, restricted: true }))
    aLog.set('criticidade', 'Alta')
    aLog.set('origem', 'Área da Empresa')
    aLog.set('justification', 'Verificação de restrição ao atualizar pedido — Política: ' + policy)
    $app.save(aLog)
  } catch (_) {}

  e.next()
}, 'sales_orders')
