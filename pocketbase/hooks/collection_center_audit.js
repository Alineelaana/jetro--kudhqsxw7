onRecordAfterUpdateSuccess((e) => {
  var changes = []
  var fields = [
    'status',
    'promise_status',
    'promise_value',
    'promise_date',
    'dispute_status',
    'dispute_reason',
    'next_action_type',
    'next_action_date',
    'collection_priority',
    'risk_classification',
    'responsavel_cobranca',
  ]
  for (var i = 0; i < fields.length; i++) {
    var f = fields[i]
    var oldVal = e.record.original().getString(f)
    var newVal = e.record.getString(f)
    if (oldVal !== newVal) {
      changes.push({ field: f, old: oldVal, new: newVal })
    }
  }
  if (changes.length === 0) return e.next()

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var auditRec = new Record(auditCol)
    auditRec.set('action', 'collection_update')
    auditRec.set('module', 'Financeiro')
    auditRec.set('target_collection', 'financial_collections')
    auditRec.set('target_id', e.record.id)
    auditRec.set('target_summary', e.record.getString('cliente'))
    auditRec.set('new_value', JSON.stringify(changes))
    auditRec.set('origem', 'Automação')
    $app.save(auditRec)
  } catch (err) {
    $app.logger().error('Collection audit failed', 'error', String(err))
  }

  return e.next()
}, 'financial_collections')
