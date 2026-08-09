onRecordCreateRequest((e) => {
  var authUser = e.auth
  var body = e.requestInfo().body || {}
  var justification = body.justification || 'Criação de rede/grupo econômico'

  e.next()

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser ? authUser.id : '')
    log.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : '')
    log.set('user_role', authUser ? authUser.getString('role') || '' : '')
    log.set('action', 'network_created')
    log.set('module', 'Cadastros')
    log.set('target_collection', 'client_networks')
    log.set('target_id', e.record.id)
    log.set('target_summary', e.record.getString('name') || '')
    log.set(
      'new_value',
      JSON.stringify({
        name: e.record.getString('name'),
        corporate_name: e.record.getString('corporate_name'),
        restriction_policy: e.record.getString('restriction_policy'),
        credit_limit: e.record.getString('credit_limit'),
      }),
    )
    log.set('criticidade', 'Média')
    log.set('origem', 'Área da Empresa')
    log.set('justification', justification)
    $app.save(log)
  } catch (_) {}

  return
}, 'client_networks')
