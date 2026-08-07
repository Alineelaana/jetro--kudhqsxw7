routerAdd(
  'POST',
  '/backend/v1/industrial/quality/check',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'PADRAO')
        return e.forbiddenError('Only SUP or PADRAO can perform quality checks')

      var phaseId = body.phase_id || ''
      var result = body.result || ''
      if (!phaseId || !result) return e.badRequestError('phase_id and result required')
      if (['approved', 'rejected', 'conditional', 'rework'].indexOf(result) === -1)
        return e.badRequestError('result must be approved, rejected, conditional or rework')

      var phase = $app.findRecordById('industrial_phases', phaseId)
      var prevQuality = phase.getString('quality_status') || 'pending'
      phase.set('quality_status', result)

      if (result === 'rejected') {
        phase.set('status', 'paused')
        if (body.notes) phase.set('observations', body.notes)
        try {
          var ncCol = $app.findCollectionByNameOrId('quality_non_conformities')
          var nc = new Record(ncCol)
          nc.set(
            'description',
            body.notes || 'Reprovado na fase ' + phase.getString('operation_name'),
          )
          nc.set('severity', body.severity || 'alta')
          nc.set('status', 'aberta')
          nc.set('quantity_affected', body.quantity_affected || 0)
          nc.set('root_cause', body.root_cause || '')
          nc.set('corrective_action', body.corrective_action || '')
          nc.set('responsible', authUser.getString('name') || authUser.email)
          $app.save(nc)
        } catch (_) {}
      }

      if (result === 'rework') {
        phase.set('status', 'rework')
      }

      $app.save(phase)

      try {
        var aCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(aCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', role)
        log.set('action', 'quality_check')
        log.set('module', 'industrial')
        log.set('target_collection', 'industrial_phases')
        log.set('target_id', phaseId)
        log.set('target_summary', prevQuality + ' -> ' + result)
        $app.save(log)
      } catch (_) {}

      return e.json(200, {
        phase_id: phaseId,
        quality_status: result,
        previous_quality: prevQuality,
        phase_status: phase.getString('status'),
      })
    } catch (err) {
      $app.logger().error('Quality check failed', 'error', String(err))
      return e.json(500, { error: 'Falha na verificacao de qualidade' })
    }
  },
  $apis.requireAuth(),
)
