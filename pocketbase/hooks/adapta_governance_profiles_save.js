routerAdd(
  'POST',
  '/backend/v1/adapta-governance/profiles/save',
  (e) => {
    var auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')
    if (auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP pode salvar perfis da ADAPTA')
    }

    var body = e.requestInfo().body || {}
    var profCol = $app.findCollectionByNameOrId('adapta_ai_profiles')
    var profile = null

    if (body.id) {
      try {
        profile = $app.findRecordById('adapta_ai_profiles', body.id)
      } catch (_) {}
    }

    if (!profile) {
      profile = new Record(profCol)
      profile.set('active', true)
    }

    if (body.profile_name) profile.set('profile_name', body.profile_name)
    if (body.profile_key) profile.set('profile_key', body.profile_key)
    if (body.description !== undefined) profile.set('description', body.description)
    if (body.module_perms) profile.set('module_perms', JSON.stringify(body.module_perms))
    if (body.data_type_perms) profile.set('data_type_perms', JSON.stringify(body.data_type_perms))
    if (body.action_perms) profile.set('action_perms', JSON.stringify(body.action_perms))
    if (body.corporate_policies)
      profile.set('corporate_policies', JSON.stringify(body.corporate_policies))
    if (body.allowed_agents) profile.set('allowed_agents', JSON.stringify(body.allowed_agents))
    if (typeof body.active === 'boolean') profile.set('active', body.active)

    $app.save(profile)

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', auth.id)
      log.set('user_name', auth.getString('name') || auth.email || '')
      log.set('user_role', auth.getString('role') || '')
      log.set('action', 'governance_profile_update')
      log.set('module', 'ai_governance')
      log.set('target_collection', 'adapta_ai_profiles')
      log.set('target_id', profile.id)
      log.set('target_summary', profile.getString('profile_name') || 'Perfil ADAPTA')
      log.set('origem', 'Area da Empresa')
      log.set('criticidade', 'Alta')
      $app.save(log)
    } catch (err) {
      $app.logger().error('profile audit log failed', 'error', String(err))
    }

    return e.json(200, { success: true, id: profile.id })
  },
  $apis.requireAuth(),
)
