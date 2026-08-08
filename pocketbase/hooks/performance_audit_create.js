onRecordAfterCreateSuccess(
  (e) => {
    try {
      var col = $app.findCollectionByNameOrId('audit_logs')
      var rec = new Record(col)
      rec.set('user_id', e.auth ? e.auth.id : '')
      rec.set('user_name', e.auth ? e.auth.getString('name') : 'system')
      rec.set('user_role', e.auth ? e.auth.getString('role') : '')
      rec.set('action', 'create')
      rec.set('module', 'performance')
      rec.set('target_collection', 'performance_config')
      rec.set('target_id', e.record.id)
      rec.set('target_summary', e.record.getString('company') || e.record.getString('name') || '')
      rec.set('new_value', JSON.stringify(e.record))
      rec.set('origem', 'Área da Empresa')
      $app.save(rec)
    } catch (_) {}
    return e.next()
  },
  'performance_config',
  'performance_gamification',
)
