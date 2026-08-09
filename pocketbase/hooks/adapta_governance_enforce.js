routerAdd(
  'POST',
  '/backend/v1/adapta-governance/enforce',
  (e) => {
    var body = e.requestInfo().body || {}
    var auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')

    var modulePerms = {}
    var actionPerms = {}
    var dataTypePerms = {}
    var policies = {}
    var enforceOrg = true
    var enforceAudit = true

    try {
      var records = $app.findRecordsByFilter('adapta_governance', 'active = true', '-created', 1, 0)
      if (records.length > 0) {
        var config = records[0]
        try {
          modulePerms = JSON.parse(config.getString('module_perms') || '{}')
        } catch (_) {}
        try {
          actionPerms = JSON.parse(config.getString('action_perms') || '{}')
        } catch (_) {}
        try {
          dataTypePerms = JSON.parse(config.getString('data_type_perms') || '{}')
        } catch (_) {}
        try {
          policies = JSON.parse(config.getString('corporate_policies') || '{}')
        } catch (_) {}
        enforceOrg = config.getBool('enforce_org_scope')
        enforceAudit = config.getBool('enforce_audit')
      }
    } catch (_) {}

    var blocked = []

    if (body.module && modulePerms[body.module] !== true) {
      blocked.push('Modulo "' + body.module + '" nao permitido para a IA')
    }

    if (body.action && actionPerms[body.action] !== true) {
      blocked.push('Acao "' + body.action + '" nao permitida para a IA')
    }

    if (body.data_types && Array.isArray(body.data_types)) {
      for (var i = 0; i < body.data_types.length; i++) {
        var dt = body.data_types[i]
        if (dataTypePerms[dt] === false) {
          blocked.push('Tipo de dado "' + dt + '" bloqueado para a IA')
        }
      }
    }

    if (body.policy_keys && Array.isArray(body.policy_keys)) {
      for (var j = 0; j < body.policy_keys.length; j++) {
        var pk = body.policy_keys[j]
        if (policies[pk] === false) {
          blocked.push('Politica corporativa "' + pk + '" bloqueada para a IA')
        }
      }
    }

    if (enforceOrg) {
      var userEmpresa = auth.getString('empresa_id') || ''
      var userFilial = auth.getString('filial_id') || ''
      if (body.empresa && userEmpresa && body.empresa !== userEmpresa) {
        blocked.push('IA nao pode acessar dados de outra empresa')
      }
      if (body.filial && userFilial && body.filial !== userFilial) {
        blocked.push('IA nao pode acessar dados de outra filial')
      }
    }

    return e.json(200, {
      allowed: blocked.length === 0,
      blocked_reasons: blocked,
      enforce_audit: enforceAudit,
      config_snapshot: {
        module_perms: modulePerms,
        action_perms: actionPerms,
        data_type_perms: dataTypePerms,
        corporate_policies: policies,
        enforce_org_scope: enforceOrg,
      },
    })
  },
  $apis.requireAuth(),
)
