routerAdd(
  'GET',
  '/backend/v1/cop/health',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var result = {
      timestamp: new Date().toISOString(),
      overall: 'Saudável',
      metrics: {},
      summary: {},
    }
    var hasDown = false
    var hasDegraded = false

    try {
      var userCount = $app.countRecords('users')
      result.metrics.database = {
        status: 'healthy',
        label: 'Banco de Dados',
        value: userCount + ' usuários',
      }
      result.summary.users = userCount
    } catch (err) {
      result.metrics.database = { status: 'down', label: 'Banco de Dados', error: String(err) }
      hasDown = true
    }

    try {
      var empCount = $app.countRecords('empresas')
      var filCount = $app.countRecords('filiais')
      result.metrics.companies = {
        status: 'healthy',
        label: 'Empresas/Filiais',
        value: empCount + '/' + filCount,
      }
      result.summary.empresas = empCount
      result.summary.filiais = filCount
    } catch (_) {}

    try {
      var errorIntegrations = $app.findRecordsByFilter(
        'integrations',
        "status = 'com_erro'",
        '',
        100,
        0,
      )
      if (errorIntegrations.length > 0) {
        result.metrics.integrations = {
          status: 'degraded',
          label: 'Integrações',
          value: errorIntegrations.length + ' com erro',
        }
        hasDegraded = true
      } else {
        result.metrics.integrations = { status: 'healthy', label: 'Integrações', value: 'OK' }
      }
      result.summary.integrations_errors = errorIntegrations.length
    } catch (_) {}

    try {
      var backups = $app.findRecordsByFilter('backups', '', '-created', 1, 0)
      if (backups.length > 0) {
        var age = (Date.now() - new Date(backups[0].getString('created')).getTime()) / 86400000
        if (age > 7) {
          result.metrics.backups = {
            status: 'degraded',
            label: 'Backups',
            value: 'Último há ' + Math.floor(age) + ' dias',
          }
          hasDegraded = true
        } else {
          result.metrics.backups = { status: 'healthy', label: 'Backups', value: 'Recente' }
        }
      } else {
        result.metrics.backups = { status: 'degraded', label: 'Backups', value: 'Nenhum backup' }
        hasDegraded = true
      }
    } catch (_) {}

    try {
      var alerts = $app.findRecordsByFilter(
        'audit_alerts',
        "resolved = false && severity = 'critical'",
        '',
        100,
        0,
      )
      if (alerts.length > 0) {
        result.metrics.alerts = {
          status: 'degraded',
          label: 'Alertas Críticos',
          value: alerts.length + ' não resolvidos',
        }
        hasDegraded = true
      } else {
        result.metrics.alerts = { status: 'healthy', label: 'Alertas', value: 'OK' }
      }
      result.summary.critical_alerts = alerts.length
    } catch (_) {}

    try {
      var downServices = $app.findRecordsByFilter(
        'platform_monitoring',
        "status = 'down'",
        '',
        100,
        0,
      )
      if (downServices.length > 0) {
        result.metrics.monitoring = {
          status: 'down',
          label: 'Monitoramento',
          value: downServices.length + ' serviços down',
        }
        hasDown = true
      } else {
        var degraded = $app.findRecordsByFilter(
          'platform_monitoring',
          "status = 'degraded'",
          '',
          100,
          0,
        )
        if (degraded.length > 0) {
          result.metrics.monitoring = {
            status: 'degraded',
            label: 'Monitoramento',
            value: degraded.length + ' degradados',
          }
          hasDegraded = true
        } else {
          result.metrics.monitoring = { status: 'healthy', label: 'Monitoramento', value: 'OK' }
        }
      }
    } catch (_) {}

    try {
      var oneHourAgo = new Date(Date.now() - 3600000)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 19)
      var recentErrors = $app.findRecordsByFilter(
        'audit_logs',
        "is_suspicious = true && created >= '" + oneHourAgo + "'",
        '-created',
        10,
        0,
      )
      result.metrics.recent_errors = {
        status: recentErrors.length > 5 ? 'degraded' : 'healthy',
        label: 'Erros Recentes (1h)',
        value: recentErrors.length + ' eventos',
      }
      if (recentErrors.length > 5) hasDegraded = true
      result.summary.recent_errors = recentErrors.length
    } catch (_) {}

    if (hasDown) result.overall = 'Indisponível'
    else if (hasDegraded) result.overall = 'Degradado'

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
