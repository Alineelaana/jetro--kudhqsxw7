routerAdd(
  'GET',
  '/backend/v1/cop/errors',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var role = authUser.getString('role')
    var perfil = authUser.getString('perfil_acesso')
    var PROFILES = [
      'TI Operacional',
      'Suporte',
      'DevOps',
      'Engenharia',
      'Administrador da Plataforma',
    ]
    if (role !== 'SUP' && PROFILES.indexOf(perfil) === -1) {
      return e.forbiddenError('Not authorized to access COP errors')
    }

    var items = []
    try {
      var filter = 'is_suspicious = true || criticidade = "Crítica" || criticidade = "Alta"'
      var records = $app.findRecordsByFilter('audit_logs', filter, '-created', 50, 0)
      for (var i = 0; i < records.length; i++) {
        var r = records[i]
        items.push({
          id: r.id,
          created: r.getString('created'),
          user_name: r.getString('user_name'),
          user_role: r.getString('user_role'),
          action: r.getString('action'),
          module: r.getString('module'),
          target_summary: r.getString('target_summary'),
          target_id: r.getString('target_id'),
          ip_address: r.getString('ip_address'),
          criticidade: r.getString('criticidade'),
          is_suspicious: r.getBool('is_suspicious'),
          triage_status: r.getString('triage_status'),
          triage_responsible: r.getString('triage_responsible'),
          triage_recurrence_count: r.getInt('triage_recurrence_count'),
        })
      }
    } catch (err) {
      $app.logger().error('cop error list failed', 'error', String(err))
    }

    return e.json(200, { items: items, total: items.length })
  },
  $apis.requireAuth(),
)
