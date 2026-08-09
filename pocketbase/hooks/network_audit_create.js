onRecordAfterCreateSuccess((e) => {
  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
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
    log.set('criticidade', 'Media')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'client_networks')
