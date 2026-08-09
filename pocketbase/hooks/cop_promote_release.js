routerAdd(
  'POST',
  '/backend/v1/cop/releases/{id}/promote',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var role = authUser.getString('role')
    var perfil = authUser.getString('perfil_acesso')
    var canPromote =
      role === 'SUP' || perfil === 'DevOps' || perfil === 'Administrador da Plataforma'
    if (!canPromote) return e.forbiddenError('Not authorized to promote releases')

    var body = e.requestInfo().body || {}
    var justification = String(body.justification || '').trim()
    if (!justification) return e.badRequestError('Justification is required')

    var id = e.request.pathValue('id')
    var record = $app.findRecordById('cop_releases', id)

    var beforeEnv = record.getString('environment')
    var beforeStatus = record.getString('status')

    record.set('environment', 'Produção')
    record.set('status', 'promoted')
    $app.save(record)

    try {
      var aCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(aCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', role)
      log.set('action', 'promote_release')
      log.set('module', 'cop')
      log.set('target_collection', 'cop_releases')
      log.set('target_id', id)
      log.set('target_summary', 'Release ' + record.getString('version') + ' promoted to Produção')
      log.set('previous_value', { environment: beforeEnv, status: beforeStatus })
      log.set('new_value', { environment: 'Produção', status: 'promoted' })
      log.set('criticidade', 'Alta')
      log.set('origem', 'Área da Empresa')
      log.set('justification', justification)
      log.set('is_suspicious', false)
      log.set('archived', false)
      $app.save(log)
    } catch (_) {}

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
