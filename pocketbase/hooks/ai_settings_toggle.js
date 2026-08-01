routerAdd(
  'POST',
  '/backend/v1/ai-settings',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var active = body.active === true
      var auth = e.auth
      if (!auth) return e.unauthorizedError('auth required')
      if (auth.getString('role') !== 'SUP') {
        return e.forbiddenError('Apenas gestores (SUP) podem alterar esta configuração')
      }

      var setting = null
      try {
        setting = $app.findFirstRecordByData('settings', 'key', 'ai_fulltime_active')
      } catch (_) {}

      if (!setting) {
        var settingsCol = $app.findCollectionByNameOrId('settings')
        setting = new Record(settingsCol)
        setting.set('key', 'ai_fulltime_active')
      }
      setting.set('value', active ? 'true' : 'false')
      $app.save(setting)

      return e.json(200, { active: active })
    } catch (err) {
      return e.json(500, { error: 'Erro ao salvar configuração' })
    }
  },
  $apis.requireAuth(),
)
