routerAdd(
  'POST',
  '/backend/v1/industrial/order/transition',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''

      var orderId = body.order_id || ''
      var targetStatus = body.target_status || ''
      if (!orderId || !targetStatus) return e.badRequestError('order_id and target_status required')

      var order = $app.findRecordById('production_orders', orderId)
      var currentStatus = order.getString('status') || ''

      var TRANSITIONS = {
        rascunho: ['planejada', 'cancelada'],
        planejada: ['liberada', 'cancelada'],
        liberada: ['em_producao', 'cancelada'],
        em_producao: ['parcial', 'inspecao', 'concluida', 'cancelada'],
        parcial: ['em_producao', 'inspecao', 'concluida', 'cancelada'],
        inspecao: ['concluida', 'em_producao', 'cancelada'],
        concluida: ['fechada'],
        fechada: [],
        cancelada: [],
      }

      var allowed = TRANSITIONS[currentStatus] || []
      if (allowed.indexOf(targetStatus) === -1)
        return e.badRequestError('Invalid transition from ' + currentStatus + ' to ' + targetStatus)

      if (targetStatus === 'liberada' && role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can release orders')
      if (targetStatus === 'fechada' && role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can close orders')
      if (targetStatus === 'cancelada' && role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can cancel orders')

      order.set('status', targetStatus)

      if (targetStatus === 'liberada') {
        order.set('released_by', authUser.getString('name') || authUser.email)
        order.set('released_at', new Date().toISOString())
      }
      if (targetStatus === 'fechada') {
        order.set('closed_by', authUser.getString('name') || authUser.email)
        order.set('closed_at', new Date().toISOString())
      }
      if (targetStatus === 'inspecao' && body.inspection_result) {
        order.set('inspection_result', body.inspection_result)
      }

      $app.save(order)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', 'order_transition')
        log.set('module', 'industrial')
        log.set('target_collection', 'production_orders')
        log.set('target_id', orderId)
        log.set('target_summary', currentStatus + ' -> ' + targetStatus)
        $app.save(log)
      } catch (_) {}

      return e.json(200, { id: orderId, status: targetStatus, previous_status: currentStatus })
    } catch (err) {
      $app.logger().error('Order transition failed', 'error', String(err))
      return e.json(500, { error: 'Falha na transicao de ordem' })
    }
  },
  $apis.requireAuth(),
)
