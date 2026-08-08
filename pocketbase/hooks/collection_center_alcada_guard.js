onRecordUpdateRequest((e) => {
  var body = e.requestInfo().body || {}

  if (
    !body.negotiations_log ||
    !Array.isArray(body.negotiations_log) ||
    body.negotiations_log.length === 0
  ) {
    e.next()
    return
  }

  var lastEntry = body.negotiations_log[body.negotiations_log.length - 1]
  if (!lastEntry || (!lastEntry.discount_percent && !lastEntry.discount_value)) {
    e.next()
    return
  }

  if (!e.auth) {
    return e.unauthorizedError('Autenticacao necessaria para negociacao com desconto')
  }

  var discountPercent = parseFloat(lastEntry.discount_percent || '0')
  var role = e.auth.getString('role')

  var profile = 'cobrador'
  if (role === 'SUP') {
    profile = 'gerente'
  } else if (role === 'FINANCEIRO' || role === 'PADRAO') {
    profile = 'supervisor'
  }

  var alcadas = null
  try {
    var param = $app.findFirstRecordByFilter(
      'system_parameters',
      'module = "collection_center" && key = "alcadas_desconto" && active != false',
    )
    if (param) {
      alcadas = JSON.parse(param.getString('value') || '{}')
    }
  } catch (err) {
    alcadas = {
      cobrador: { percent: 5, valor: 5000 },
      supervisor: { percent: 15, valor: 20000 },
      gerente: { percent: 30, valor: 50000 },
    }
  }

  var limit = alcadas[profile] || alcadas['cobrador'] || { percent: 0, valor: 0 }
  var limitPercent = parseFloat(limit.percent || '0')

  if (discountPercent > limitPercent) {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRec = new Record(auditCol)
      auditRec.set('action', 'alcada_bloqueio')
      auditRec.set('module', 'Financeiro')
      auditRec.set('target_collection', 'financial_collections')
      auditRec.set('target_id', e.record.id)
      auditRec.set('target_summary', e.record.getString('cliente'))
      auditRec.set(
        'new_value',
        JSON.stringify({
          discount_percent: discountPercent,
          limit_percent: limitPercent,
          profile: profile,
          user: e.auth.getString('name'),
        }),
      )
      auditRec.set('origem', 'Area da Empresa')
      auditRec.set('criticidade', 'Media')
      auditRec.set('user_id', e.auth.id)
      auditRec.set('user_name', e.auth.getString('name'))
      auditRec.set('user_role', role)
      $app.save(auditRec)
    } catch (auditErr) {
      $app.logger().error('Alcada audit log failed', 'error', String(auditErr))
    }

    return e.forbiddenError(
      'Desconto de ' +
        discountPercent +
        '% excede alcada de ' +
        limitPercent +
        '% para perfil ' +
        profile +
        '. Solicite aprovacao via Workflow.',
    )
  }

  e.next()
}, 'financial_collections')
