onRecordCreateRequest((e) => {
  const FIELDS = [
    { name: 'rca_id', label: 'RCA' },
    { name: 'televendas_id', label: 'Televendas' },
    { name: 'responsavel_comercial_digital_id', label: 'Responsavel Comercial Digital' },
  ]

  const values = {}
  for (let i = 0; i < FIELDS.length; i++) {
    const f = FIELDS[i]
    values[f.name] = e.record.getString(f.name)
  }

  const hasValue = FIELDS.some(function (f) {
    return values[f.name] && values[f.name].length > 0
  })
  if (!hasValue) {
    e.next()
    return
  }

  let userId = ''
  let userName = 'Sistema'
  let userRole = ''
  let empresa = ''
  let filial = ''
  try {
    const auth = e.requestInfo().auth
    if (auth) {
      userId = auth.id || ''
      userName = auth.getString('name') || auth.getString('email') || 'Sistema'
      userRole = auth.getString('role') || ''
      empresa = auth.getString('empresa_id') || ''
      filial = auth.getString('filial_id') || ''
    }
  } catch (_) {}

  e.next()

  try {
    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    for (let i = 0; i < FIELDS.length; i++) {
      const f = FIELDS[i]
      if (!values[f.name] || values[f.name].length === 0) continue
      const audit = new Record(auditCol)
      audit.set('user_id', userId)
      audit.set('user_name', userName)
      audit.set('user_role', userRole)
      audit.set('action', 'create_commercial_responsible')
      audit.set('module', 'Cadastros')
      audit.set('target_collection', 'partners')
      audit.set('target_id', e.record.id)
      audit.set('target_summary', f.label)
      audit.set('previous_value', JSON.stringify({}))
      audit.set(
        'new_value',
        JSON.stringify({ field: f.name, value: values[f.name], role: f.label }),
      )
      audit.set('criticidade', 'Media')
      audit.set('origem', 'Area da Empresa')
      audit.set('is_suspicious', false)
      audit.set('archived', false)
      audit.set('empresa', empresa)
      audit.set('filial', filial)
      $app.save(audit)
    }
  } catch (err) {
    $app.logger().error('audit failed for partner responsibles create', 'error', String(err))
  }
}, 'partners')
