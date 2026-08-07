onRecordCreateRequest(
  (e) => {
    var ip = ''
    var ua = ''
    var authUser = null
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}
    try {
      authUser = e.auth
    } catch (_) {}

    var collection = e.record.collectionName
    var SA_COLLECTIONS = [
      'supplier_allowance_agreements',
      'supplier_allowance_accounts',
      'supplier_allowance_movements',
      'supplier_allowance_accruals',
      'supplier_allowance_appropriations',
      'supplier_allowance_settlements',
      'supplier_allowance_consumptions',
    ]
    if (SA_COLLECTIONS.indexOf(collection) === -1) {
      e.next()
      return
    }

    e.next()

    try {
      var summary = e.record.id
      var summaryFields = [
        'agreement_type',
        'competence_period',
        'movement_type',
        'settlement_type',
        'document_number',
      ]
      for (var fi = 0; fi < summaryFields.length; fi++) {
        try {
          var sv = e.record.getString(summaryFields[fi])
          if (sv) {
            summary = sv
            break
          }
        } catch (_) {}
      }

      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', authUser ? authUser.id : '')
      log.set('user_name', authUser ? authUser.getString('name') || authUser.email || '' : '')
      log.set('user_role', authUser ? authUser.getString('role') : '')
      log.set('action', 'create')
      log.set('module', 'supplier_allowance')
      log.set('target_collection', collection)
      log.set('target_id', e.record.id)
      log.set('target_summary', summary)
      log.set('new_value', { id: e.record.id })
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      log.set('criticidade', 'Média')
      log.set('origem', 'Área da Empresa')
      $app.save(log)
    } catch (err) {
      $app.logger().error('SA audit create failed', 'error', String(err))
    }
  },
  'supplier_allowance_agreements',
  'supplier_allowance_accounts',
  'supplier_allowance_movements',
  'supplier_allowance_accruals',
  'supplier_allowance_appropriations',
  'supplier_allowance_settlements',
  'supplier_allowance_consumptions',
)
