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
      var justification = body.justification || ''
      if (!orderId || !targetStatus) return e.badRequestError('order_id and target_status required')

      var order = $app.findRecordById('production_orders', orderId)
      var currentStatus = order.getString('status') || 'rascunho'

      var WORKFLOW = {
        rascunho: ['planejada', 'cancelada'],
        planejada: ['aprovada', 'cancelada'],
        aprovada: ['liberada', 'cancelada'],
        liberada: ['setup', 'cancelada'],
        setup: ['em_producao', 'cancelada'],
        em_producao: ['qualidade', 'parcial', 'cancelada'],
        parcial: ['em_producao', 'qualidade', 'cancelada'],
        qualidade: ['concluida', 'rework', 'cancelada'],
        rework: ['em_producao', 'cancelada'],
        concluida: ['encerrada'],
        encerrada: [],
        cancelada: [],
      }

      var allowed = WORKFLOW[currentStatus] || []
      if (allowed.indexOf(targetStatus) === -1) {
        return e.badRequestError('Transicao invalida: ' + currentStatus + ' -> ' + targetStatus)
      }

      if (targetStatus === 'aprovada' && role !== 'SUP' && role !== 'PADRAO') {
        return e.forbiddenError('Apenas SUP ou PADRAO podem aprovar ordens')
      }
      if (targetStatus === 'cancelada' && role !== 'SUP' && role !== 'PADRAO') {
        return e.forbiddenError('Apenas SUP ou PADRAO podem cancelar ordens')
      }
      if (targetStatus === 'encerrada' && role !== 'SUP' && role !== 'PADRAO') {
        return e.forbiddenError('Apenas SUP ou PADRAO podem encerrar ordens')
      }

      order.set('status', targetStatus)

      var history = []
      try {
        var raw = order.get('transition_history')
        if (raw && typeof raw === 'object') history = raw
        else if (typeof raw === 'string') history = JSON.parse(raw)
      } catch (_) {}

      history.push({
        from: currentStatus,
        to: targetStatus,
        user: authUser.getString('name') || authUser.email,
        user_id: authUser.id,
        role: role,
        justification: justification,
        timestamp: new Date().toISOString(),
      })
      order.set('transition_history', JSON.stringify(history))
      if (justification) order.set('justification', justification)

      if (targetStatus === 'em_producao' && !order.getString('start_date')) {
        order.set('start_date', new Date().toISOString().split('T')[0])
      }
      if (targetStatus === 'concluida') {
        order.set('end_date', new Date().toISOString().split('T')[0])
      }

      $app.save(order)

      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', 'order_transition')
        log.set('module', 'industrial')
        log.set('target_collection', 'production_orders')
        log.set('target_id', orderId)
        log.set(
          'target_summary',
          currentStatus + ' -> ' + targetStatus + (justification ? ' (' + justification + ')' : ''),
        )
        log.set('origem', 'Area da Empresa')
        $app.save(log)
      } catch (_) {}

      return e.json(200, {
        id: orderId,
        status: targetStatus,
        previous_status: currentStatus,
        transition_recorded: true,
      })
    } catch (err) {
      $app.logger().error('order transition failed', 'error', String(err))
      return e.json(500, { error: 'Falha na transicao de ordem' })
    }
  },
  $apis.requireAuth(),
)
