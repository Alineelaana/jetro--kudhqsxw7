routerAdd(
  'GET',
  '/backend/v1/cop/security',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var role = authUser.getString('role')
    var perfil = authUser.getString('perfil_acesso')
    var SECURITY_PROFILES = ['Segurança', 'Administrador da Plataforma']
    if (role !== 'SUP' && SECURITY_PROFILES.indexOf(perfil) === -1) {
      return e.forbiddenError('Not authorized to access security data')
    }

    var sessions = []
    try {
      var sessRecords = $app.findRecordsByFilter('audit_sessions', '', '-created', 20, 0)
      for (var i = 0; i < sessRecords.length; i++) {
        var s = sessRecords[i]
        sessions.push({
          id: s.id,
          user_name: s.getString('user_name'),
          ip_address: s.getString('ip_address'),
          browser: s.getString('browser'),
          os: s.getString('os'),
          device: s.getString('device'),
          login_time: s.getString('login_time'),
          logout_time: s.getString('logout_time'),
          status: s.getString('status'),
          origin: s.getString('origin'),
        })
      }
    } catch (_) {}

    var alerts = []
    try {
      var alertRecords = $app.findRecordsByFilter(
        'audit_alerts',
        'resolved = false',
        '-created',
        20,
        0,
      )
      for (var j = 0; j < alertRecords.length; j++) {
        var a = alertRecords[j]
        alerts.push({
          id: a.id,
          alert_type: a.getString('alert_type'),
          severity: a.getString('severity'),
          description: a.getString('description'),
          user_id: a.getString('user_id'),
          created: a.getString('created'),
          resolved: a.getBool('resolved'),
        })
      }
    } catch (_) {}

    var failedLogins = 0
    try {
      var oneHourAgo = new Date(Date.now() - 3600000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19)
      var failedRecords = $app.findRecordsByFilter(
        'audit_logs',
        'action = "login_failed" && created >= "' + oneHourAgo + '"',
        '-created',
        100,
        0,
      )
      failedLogins = failedRecords.length
    } catch (_) {}

    return e.json(200, { sessions: sessions, alerts: alerts, failedLogins: failedLogins })
  },
  $apis.requireAuth(),
)
