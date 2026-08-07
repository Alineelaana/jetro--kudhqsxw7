routerAdd(
  'POST',
  '/backend/v1/supplier-allowance/workflow-transition',
  (e) => {
    var body = e.requestInfo().body || {}
    var entityCollection = body.entity_collection || ''
    var entityId = body.entity_id || ''
    var action = body.action || ''
    var notes = body.notes || ''

    if (!entityCollection || !entityId || !action)
      return e.badRequestError('entity_collection, entity_id, and action are required')

    var STATUS_MAP = {
      supplier_allowance_accruals: { approve: 'aprovado', reject: 'rejeitado' },
      supplier_allowance_settlements: { approve: 'liquidado', reject: 'rejeitado' },
      supplier_allowance_appropriations: { approve: 'aprovado', reject: 'rejeitado' },
      supplier_allowance_consumptions: { approve: 'aprovado', reject: 'rejeitado' },
      supplier_allowance_agreements: {
        activate: 'ativo',
        pause: 'pausado',
        close: 'encerrado',
        cancel: 'cancelado',
      },
    }

    var statusMap = STATUS_MAP[entityCollection]
    if (!statusMap) return e.badRequestError('Unsupported entity collection: ' + entityCollection)

    var newStatus = statusMap[action]
    if (!newStatus) return e.badRequestError('Unsupported action: ' + action)

    try {
      var entity = $app.findRecordById(entityCollection, entityId)
      var oldStatus = entity.getString('status')
      entity.set('status', newStatus)

      if (entityCollection === 'supplier_allowance_accruals') {
        entity.set('approved_by', e.auth ? e.auth.getString('name') || e.auth.email : 'sistema')
        entity.set('approved_at', new Date().toISOString())
      }

      $app.save(entity)

      try {
        var workflows = $app.findRecordsByFilter(
          'platform_workflows',
          'entity_id = "' + entityId + '" && entity_type = "' + entityCollection + '"',
          '-created',
          1,
          0,
        )
        if (workflows.length > 0) {
          var wf = workflows[0]
          var history = wf.get('history') || []
          if (typeof history === 'string') {
            try {
              history = JSON.parse(history)
            } catch (_) {
              history = []
            }
          }
          if (!Array.isArray(history)) history = []
          history.push({
            step: wf.getString('current_step'),
            action: action,
            user: e.auth ? e.auth.getString('name') || e.auth.email : 'sistema',
            date: new Date().toISOString(),
            notes: notes || 'Status: ' + oldStatus + ' -> ' + newStatus,
          })
          wf.set('history', history)
          wf.set('status', action === 'reject' ? 'rejected' : 'in_progress')
          $app.save(wf)
        }
      } catch (err) {
        $app
          .logger()
          .error('SA workflow transition: failed to update workflow', 'error', String(err))
      }

      try {
        var notifCol = $app.findCollectionByNameOrId('notifications')
        var notif = new Record(notifCol)
        notif.set('title', 'Transicao de Workflow - Verbas')
        notif.set(
          'message',
          entityCollection.replace('supplier_allowance_', '') +
            ' ' +
            entityId.substring(0, 8) +
            ': ' +
            oldStatus +
            ' -> ' +
            newStatus,
        )
        notif.set('type', 'workflow_step')
        notif.set('read', false)
        notif.set('link', '/admin/verbas')
        $app.save(notif)
      } catch (_) {}

      return e.json(200, {
        status: 'ok',
        entity_id: entityId,
        old_status: oldStatus,
        new_status: newStatus,
      })
    } catch (err) {
      return e.json(500, { error: 'Workflow transition failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)
