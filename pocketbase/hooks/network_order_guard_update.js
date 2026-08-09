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

  if (policy === 'block') {
    return e.forbiddenError(
      'Cliente com restrição de crédito ativa — não é possível aprovar o pedido',
    )
  }

  if (policy === 'require_approval') {
    e.record.set('status', 'Aguardando Aprovação')
  }

  e.next()
}, 'sales_orders')
