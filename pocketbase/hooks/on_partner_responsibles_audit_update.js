onRecordUpdateRequest((e) => {
  const FIELDS = [
    { name: 'rca_id', label: 'RCA' },
    { name: 'televendas_id', label: 'Televendas' },
    { name: 'responsavel_comercial_digital_id', label: 'Responsavel Comercial Digital' },
  ]

  const oldValues = {}
  const newValues = {}
  for (let i = 0; i < FIELDS.length; i++) {
    const f = FIELDS[i]
    oldValues[f.name] = e.record.original().getString(f.name)
    newValues[f.name] = e.record.getString(f.name)
  }

  const hasChange = FIELDS.some(function (f) {
    return oldValues[f.name] !== newValues[f.name]
  })
  if (!hasChange) {
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
      if (oldValues[f.name] === newValues[f.name]) continue
      const audit = new Record(auditCol)
      audit.set('user_id', userId)
      audit.set('user_name', userName)
      audit.set('user_role', userRole)
      audit.set('action', 'update_commercial_responsible')
      audit.set('module', 'Cadastros')
      audit.set('target_collection', 'partners')
      audit.set('target_id', e.record.id)
      audit.set('target_summary', f.label)
      audit.set('previous_value', JSON.stringify({ field: f.name, value: oldValues[f.name] }))
      audit.set(
        'new_value',
        JSON.stringify({ field: f.name, value: newValues[f.name], role: f.label }),
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
    $app.logger().error('audit failed for partner responsibles update', 'error', String(err))
  }
}, 'partners')
