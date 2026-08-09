routerAdd(
  'POST',
  '/backend/v1/adapta-governance/save',
  (e) => {
    var auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')
    if (auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP pode salvar configuracoes de governanca')
    }

    var body = e.requestInfo().body || {}

    var govCol = $app.findCollectionByNameOrId('adapta_governance')
    var config = null

    try {
      var records = $app.findRecordsByFilter('adapta_governance', 'active = true', '-created', 1, 0)
      if (records.length > 0) config = records[0]
    } catch (_) {}

    if (!config) {
      config = new Record(govCol)
      config.set('active', true)
    }

    if (body.module_perms) config.set('module_perms', JSON.stringify(body.module_perms))
    if (body.data_type_perms) config.set('data_type_perms', JSON.stringify(body.data_type_perms))
    if (body.action_perms) config.set('action_perms', JSON.stringify(body.action_perms))
    if (body.corporate_policies)
      config.set('corporate_policies', JSON.stringify(body.corporate_policies))
    if (body.default_mode) config.set('default_mode', body.default_mode)
    if (typeof body.enforce_org_scope === 'boolean')
      config.set('enforce_org_scope', body.enforce_org_scope)
    if (typeof body.enforce_audit === 'boolean') config.set('enforce_audit', body.enforce_audit)
    if (typeof body.traceability_enabled === 'boolean')
      config.set('traceability_enabled', body.traceability_enabled)

    $app.save(config)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', auth.id)
      log.set('user_name', auth.getString('name') || auth.email || '')
      log.set('user_role', auth.getString('role') || '')
      log.set('action', 'governance_config_update')
      log.set('module', 'ai_governance')
      log.set('target_collection', 'adapta_governance')
      log.set('target_id', config.id)
      log.set('target_summary', 'Configuracao de governanca da ADAPTA atualizada')
      log.set('origem', 'Area da Empresa')
      log.set('criticidade', 'Alta')
      log.set(
        'new_value',
        JSON.stringify({ default_mode: body.default_mode || config.getString('default_mode') }),
      )
      $app.save(log)
    } catch (err) {
      $app.logger().error('governance audit log failed', 'error', String(err))
    }

    return e.json(200, { success: true, id: config.id })
  },
  $apis.requireAuth(),
)
