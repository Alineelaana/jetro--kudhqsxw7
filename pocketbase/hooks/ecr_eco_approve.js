routerAdd(
  'POST',
  '/backend/v1/industrial/engineering-change/approve',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')

      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can approve changes')

      var changeType = body.change_type || 'ecr'
      var id = body.id || ''
      var action = body.action || 'approve'
      if (!id) return e.badRequestError('id required')

      var colName =
        changeType === 'ecr' ? 'engineering_change_requests' : 'engineering_change_orders'
      var record = $app.findRecordById(colName, id)
      var currentStatus = record.getString('status') || ''

      if (
        currentStatus !== 'rascunho' &&
        currentStatus !== 'em_analise' &&
        currentStatus !== 'em_aprovacao'
      )
        return e.badRequestError('Record is not in an approvable state: ' + currentStatus)

      var newStatus = action === 'approve' ? 'aprovado' : 'rejeitado'
      record.set('status', newStatus)

      if (changeType === 'ecr') {
        record.set('analyzed_by', authUser.getString('name') || authUser.email)
        if (body.analysis_notes) record.set('analysis_notes', body.analysis_notes)
      } else {
        record.set('approved_by', authUser.getString('name') || authUser.email)
        record.set('approval_date', new Date().toISOString().split('T')[0])
        if (action === 'approve') {
          record.set(
            'effective_date',
            body.effective_date || new Date().toISOString().split('T')[0],
          )
        }
      }

      $app.save(record)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', changeType + '_' + (action === 'approve' ? 'approved' : 'rejected'))
        log.set('module', 'industrial')
        log.set('target_collection', colName)
        log.set('target_id', id)
        log.set('target_summary', newStatus)
        $app.save(log)
      } catch (_) {}

      return e.json(200, { id: id, status: newStatus })
    } catch (err) {
      $app.logger().error('Engineering change approve failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao aprovar cambio' })
    }
  },
  $apis.requireAuth(),
)
