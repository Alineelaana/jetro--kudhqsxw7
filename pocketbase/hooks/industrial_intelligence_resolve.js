routerAdd(
  'POST',
  '/backend/v1/industrial/intelligence/resolve',
  (e) => {
    var body = e.requestInfo().body || {}
    var collection = body.collection || ''
    var recordId = body.id || ''
    var action = body.action || ''
    var note = body.note || ''

    if (!collection || !recordId || !action) {
      return e.badRequestError('collection, id, and action are required')
    }

    var validCollections = [
      'industrial_intelligence_alerts',
      'industrial_intelligence_recommendations',
      'industrial_intelligence_predictions',
      'industrial_intelligence_insights',
    ]
    if (validCollections.indexOf(collection) === -1) {
      return e.badRequestError('invalid collection')
    }

    var statusMap = {
      resolve: 'resolved',
      acknowledge: 'acknowledged',
      dismiss: 'dismissed',
      accept: 'accepted',
      reject: 'rejected',
      implement: 'implemented',
    }
    var newStatus = statusMap[action] || action

    try {
      var record = $app.findRecordById(collection, recordId)
      record.set('status', newStatus)

      if (collection === 'industrial_intelligence_alerts') {
        record.set('resolved', action === 'resolve' || action === 'dismiss')
        record.set('resolved_by', e.auth ? e.auth.id : '')
        record.set('resolved_at', new Date().toISOString())
        record.set('resolution_note', note)
      }
      if (collection === 'industrial_intelligence_recommendations') {
        record.set('action_taken', note || action)
      }

      $app.save(record)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var audit = new Record(auditCol)
        audit.set('user_id', e.auth ? e.auth.id : '')
        audit.set('user_name', e.auth ? e.auth.getString('name') || '' : '')
        audit.set('user_role', e.auth ? e.auth.getString('role') || '' : '')
        audit.set('action', 'update')
        audit.set('module', 'industrial_intelligence')
        audit.set('target_collection', collection)
        audit.set('target_id', recordId)
        audit.set('target_summary', 'Resolved ' + action + ': ' + (record.getString('title') || ''))
        audit.set('origem', 'Area da Empresa')
        $app.saveNoValidate(audit)
      } catch (_) {}

      return e.json(200, { success: true, status: newStatus })
    } catch (err) {
      $app.logger().error('intelligence resolve failed', 'error', String(err))
      return e.json(500, { error: 'Failed to resolve record' })
    }
  },
  $apis.requireAuth(),
)
