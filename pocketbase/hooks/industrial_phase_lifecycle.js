routerAdd(
  'POST',
  '/backend/v1/industrial/phase/transition',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      var phaseId = body.phase_id || ''
      var targetStatus = body.target_status || ''
      if (!phaseId || !targetStatus) return e.badRequestError('phase_id and target_status required')

      var phase = $app.findRecordById('industrial_phases', phaseId)
      var currentStatus = phase.getString('status') || 'pending'
      var TRANSITIONS = {
        pending: ['in_progress', 'skipped'],
        in_progress: ['paused', 'completed', 'rework'],
        paused: ['in_progress'],
        completed: ['rework'],
        rework: ['in_progress'],
        skipped: [],
      }
      var allowed = TRANSITIONS[currentStatus] || []
      if (allowed.indexOf(targetStatus) === -1)
        return e.badRequestError('Invalid transition from ' + currentStatus + ' to ' + targetStatus)

      if (targetStatus === 'in_progress' && currentStatus === 'pending') {
        var orderId = phase.getString('production_order_id') || ''
        var seq = phase.getInt('sequence') || 0
        if (seq > 1) {
          try {
            var prev = $app.findRecordsByFilter(
              'industrial_phases',
              'production_order_id = "' + orderId + '" && sequence < ' + seq,
              '-sequence',
              1,
              0,
            )
            if (prev.length > 0) {
              var ps = prev[0].getString('status') || ''
              if (ps !== 'completed' && ps !== 'skipped')
                return e.badRequestError('Previous phase must be completed first')
            }
          } catch (_) {}
        }
      }

      if (targetStatus === 'completed') {
        var qs = phase.getString('quality_status') || ''
        if (qs === 'rejected')
          return e.badRequestError('Cannot complete phase with rejected quality')
      }

      if (targetStatus === 'skipped' && role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can skip phases')
      if (
        targetStatus === 'rework' &&
        currentStatus === 'completed' &&
        role !== 'SUP' &&
        role !== 'PADRAO'
      )
        return e.forbiddenError('Only SUP or PADRAO can rework completed phases')

      phase.set('status', targetStatus)
      if (targetStatus === 'in_progress' && !phase.getString('started_at'))
        phase.set('started_at', new Date().toISOString())
      if (targetStatus === 'completed') phase.set('completed_at', new Date().toISOString())
      if (body.actual_time_minutes) phase.set('actual_time_minutes', body.actual_time_minutes)
      if (body.observations) phase.set('observations', body.observations)
      $app.save(phase)

      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', 'phase_transition')
        log.set('module', 'industrial')
        log.set('target_collection', 'industrial_phases')
        log.set('target_id', phaseId)
        log.set('target_summary', currentStatus + ' -> ' + targetStatus)
        $app.save(log)
      } catch (_) {}

      return e.json(200, { id: phaseId, status: targetStatus, previous_status: currentStatus })
    } catch (err) {
      $app.logger().error('Phase transition failed', 'error', String(err))
      return e.json(500, { error: 'Falha na transicao de fase' })
    }
  },
  $apis.requireAuth(),
)
