onRecordUpdateRequest((e) => {
  var body = e.requestInfo().body || {}

  if (!body.hasOwnProperty('network_id')) {
    e.next()
    return
  }

  var oldNetworkId = e.record.original().getString('network_id') || ''
  var newNetworkId = body.network_id || ''

  if (oldNetworkId === newNetworkId) {
    e.next()
    return
  }

  if (!e.auth) {
    return e.unauthorizedError('Autenticacao necessaria para alterar vinculo de rede')
  }

  var role = e.auth.getString('role') || ''

  if (e.hasSuperuserAuth()) {
    e.next()
    return
  }

  var isLinking = newNetworkId !== '' && oldNetworkId === ''
  var isUnlinking = newNetworkId === '' && oldNetworkId !== ''
  var isSwitching = newNetworkId !== '' && oldNetworkId !== ''

  var requiredPerm = ''
  if (isLinking || isSwitching) requiredPerm = 'network_link_client'
  if (isUnlinking && !isSwitching) requiredPerm = 'network_unlink_client'

  if (!requiredPerm) {
    e.next()
    return
  }

  var allowedRoles = []
  try {
    var param = $app.findFirstRecordByFilter(
      'system_parameters',
      'module = "networks" && key = "' + requiredPerm + '" && active != false',
    )
    if (param) {
      var config = JSON.parse(param.getString('value') || '{}')
      allowedRoles = config.roles || []
    }
  } catch (_) {
    var defaults = {
      network_link_client: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
      network_unlink_client: ['SUP', 'FINANCEIRO', 'COMERCIAL'],
    }
    allowedRoles = defaults[requiredPerm] || []
  }

  if (allowedRoles.indexOf(role) === -1) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('action', 'network_link_blocked')
      log.set('module', 'Cadastros')
      log.set('target_collection', 'partners')
      log.set('target_id', e.record.id)
      log.set(
        'target_summary',
        e.record.getString('full_name') || e.record.getString('company_name') || '',
      )
      log.set(
        'new_value',
        JSON.stringify({
          required_perm: requiredPerm,
          user_role: role,
          old_network: oldNetworkId,
          new_network: newNetworkId,
        }),
      )
      log.set('criticidade', 'Alta')
      log.set('origem', 'Area da Empresa')
      log.set('user_id', e.auth.id)
      log.set('user_name', e.auth.getString('name') || '')
      log.set('user_role', role)
      log.set('is_suspicious', true)
      $app.save(log)
    } catch (_) {}

    var actionLabel = requiredPerm === 'network_link_client' ? 'vincular' : 'desvincular'
    return e.forbiddenError(
      'Sem permissao para ' +
        actionLabel +
        ' cliente a uma Rede/Grupo Economico. Perfis permitidos: ' +
        allowedRoles.join(', '),
    )
  }

  e.next()
}, 'partners')
