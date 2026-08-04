routerAdd(
  'POST',
  '/backend/v1/audit/settings',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP pode alterar configuracoes de auditoria')
    }

    var body = e.requestInfo().body || {}
    var json = JSON.stringify(body)

    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
      rec.set('value', json)
      $app.save(rec)
    } catch (_) {
      try {
        var col = $app.findCollectionByNameOrId('settings')
        var newRec = new Record(col)
        newRec.set('key', 'audit_alert_config')
        newRec.set('value', json)
        $app.save(newRec)
      } catch (err) {
        return e.json(500, { error: 'Falha ao salvar configuracoes' })
      }
    }

    $app
      .logger()
      .info('audit settings updated', 'user', e.auth.getString('name') || e.auth.getString('email'))

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
