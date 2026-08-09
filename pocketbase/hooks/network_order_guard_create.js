onRecordCreateRequest((e) => {
  var clientId = e.record.getString('client_id') || ''
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
    var originName = partner.getString('network_restriction_origin_name') || ''
    var originCnpj = partner.getString('network_restriction_origin_cnpj') || ''
    var msg = 'Cliente com restrição de crédito ativa'
    if (originName) {
      msg +=
        ' — Restrição por Grupo Econômico (Origem: ' + originName + ', CNPJ: ' + originCnpj + ')'
    }
    return e.forbiddenError(msg)
  }

  if (policy === 'require_approval') {
    e.record.set('status', 'Aguardando Aprovação')
  }

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('action', 'order_restriction_check')
    log.set('module', 'Vendas')
    log.set('target_collection', 'sales_orders')
    log.set('target_id', e.record.id)
    log.set('target_summary', e.record.getString('client_name') || '')
    log.set('new_value', JSON.stringify({ policy: policy, restricted: true }))
    log.set('criticidade', 'Alta')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  e.next()
}, 'sales_orders')
