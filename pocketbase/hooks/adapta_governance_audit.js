routerAdd(
  'POST',
  '/backend/v1/adapta-governance/audit',
  (e) => {
    var body = e.requestInfo().body || {}
    var auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', auth.id)
      log.set('user_name', auth.getString('name') || auth.email || '')
      log.set('user_role', auth.getString('role') || '')
      log.set('action', 'ai_interaction')
      log.set('module', 'ai_governance')
      log.set('target_collection', 'adapta_governance')
      log.set('target_summary', (body.question || '').substring(0, 200))
      log.set('origem', 'Inteligencia Artificial')
      log.set('criticidade', 'Baixa')
      log.set('empresa', auth.getString('empresa_id') || '')
      log.set('filial', auth.getString('filial_id') || '')

      var detail = {
        question: (body.question || '').substring(0, 1000),
        response: (body.response || '').substring(0, 2000),
        modules_consulted: body.modules_consulted || [],
        response_time_ms: body.response_time_ms || 0,
        records_analyzed: body.records_analyzed || 0,
        export_occurred: body.export_occurred || false,
        simulation_occurred: body.simulation_occurred || false,
        recommendation_generated: body.recommendation_generated || false,
      }
      log.set('new_value', JSON.stringify(detail))

      $app.save(log)
      return e.json(200, { logged: true, audit_id: log.id })
    } catch (err) {
      $app.logger().error('AI governance audit failed', 'error', String(err))
      return e.json(500, { error: 'Failed to log AI interaction' })
    }
  },
  $apis.requireAuth(),
)
