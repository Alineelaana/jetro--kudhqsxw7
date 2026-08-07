routerAdd(
  'POST',
  '/backend/v1/industrial/bom-revision/approve',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var bomId = body.bom_id || ''
      var action = body.action || ''
      if (!bomId) return e.badRequestError('bom_id required')
      if (action !== 'approve' && action !== 'reject')
        return e.badRequestError('action must be approve or reject')

      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can approve revisions')

      var bom = $app.findRecordById('bom_versions', bomId)
      var currentStatus = bom.getString('revision_status') || ''

      if (currentStatus !== 'rascunho' && currentStatus !== 'em_aprovacao')
        return e.badRequestError('Revision is not in a submittable state: ' + currentStatus)

      var newStatus = action === 'approve' ? 'aprovada' : 'rejeitada'
      bom.set('revision_status', newStatus)
      bom.set('approved_by', authUser.getString('name') || authUser.email)
      bom.set('approval_date', new Date().toISOString().split('T')[0])

      if (action === 'approve') {
        bom.set('status', 'ativo')
        var parentId = bom.getString('parent_version_id') || ''
        if (parentId) {
          try {
            var parent = $app.findRecordById('bom_versions', parentId)
            parent.set('revision_status', 'obsoleta')
            parent.set('status', 'inativo')
            parent.set('obsolete_date', new Date().toISOString().split('T')[0])
            $app.save(parent)
          } catch (_) {}
        }
      }

      $app.save(bom)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', action === 'approve' ? 'bom_revision_approved' : 'bom_revision_rejected')
        log.set('module', 'industrial')
        log.set('target_collection', 'bom_versions')
        log.set('target_id', bomId)
        log.set('target_summary', 'BOM Revision ' + newStatus)
        $app.save(log)
      } catch (_) {}

      return e.json(200, { id: bomId, revision_status: newStatus })
    } catch (err) {
      $app.logger().error('BOM revision approve failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao processar aprovacao' })
    }
  },
  $apis.requireAuth(),
)
