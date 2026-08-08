routerAdd(
  'POST',
  '/backend/v1/projection/business-days-config',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')
    const role = auth.getString('role') || 'PADRAO'
    if (['SUP', 'FINANCEIRO', 'COMERCIAL'].indexOf(role) === -1) {
      return e.forbiddenError('Not authorized to configure business days')
    }
    const body = e.requestInfo().body || {}
    const mes = parseInt(body.mes) || new Date().getMonth() + 1
    const ano = parseInt(body.ano) || new Date().getFullYear()
    const total = parseInt(body.total_business_days) || 22
    const empresa = body.empresa || ''
    const filial = body.filial || ''
    const userName = auth.getString('name') || 'Usuario'
    const userId = auth.id
    const nowStr = new Date().toISOString()

    let existing = null
    try {
      existing = $app.findFirstRecordByFilter(
        'business_days_configs',
        'mes = ' +
          mes +
          ' && ano = ' +
          ano +
          ' && empresa = "' +
          empresa +
          '" && filial = "' +
          filial +
          '"',
      )
    } catch (_) {}

    if (existing) {
      existing.set('total_business_days', total)
      existing.set('last_change_date', nowStr)
      existing.set('last_changed_by', userName)
      $app.save(existing)
      return e.json(200, { id: existing.id, updated: true })
    }

    const col = $app.findCollectionByNameOrId('business_days_configs')
    const r = new Record(col)
    r.set('empresa', empresa)
    r.set('filial', filial)
    r.set('mes', mes)
    r.set('ano', ano)
    r.set('total_business_days', total)
    r.set('responsible_user', userId)
    r.set('responsible_user_name', userName)
    r.set('config_date', nowStr)
    r.set('last_change_date', nowStr)
    r.set('last_changed_by', userName)
    $app.save(r)
    return e.json(200, { id: r.id, created: true })
  },
  $apis.requireAuth(),
)
