migrate(
  (app) => {
    // 1. Seed admin user
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com')
    } catch (_) {
      const admin = new Record(usersCol)
      admin.setEmail('alineelaana@gmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Administrador VeloraLog')
      app.save(admin)
    }

    // 2. Seed company_whatsapp setting
    const settingsCol = app.findCollectionByNameOrId('settings')
    const settingsToSeed = [
      { key: 'company_whatsapp', value: '5531991297619' },
      { key: 'whatsapp_number', value: '5531991297619' },
    ]

    for (var i = 0; i < settingsToSeed.length; i++) {
      var item = settingsToSeed[i]
      try {
        var existing = app.findFirstRecordByData('settings', 'key', item.key)
        existing.set('value', item.value)
        app.save(existing)
      } catch (_) {
        var newSetting = new Record(settingsCol)
        newSetting.set('key', item.key)
        newSetting.set('value', item.value)
        app.save(newSetting)
      }
    }

    // 3. Update budget_form_fields options for servico_interesse
    try {
      var field = app.findFirstRecordByData('budget_form_fields', 'name', 'servico_interesse')
      field.set('options', [
        'Armazenagem de Produtos em Estoque',
        'Transporte de Cargas',
        'Distribuição Urbana e Delivery',
        'Armazenagem e Centro de Distribuição',
        'Logística Portuária',
        'Cross Docking',
        'Gestão de Frota e Rastreamento',
        'Logística Integrada',
      ])
      app.save(field)
    } catch (_) {}
  },
  (app) => {
    try {
      var u = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com')
      app.delete(u)
    } catch (_) {}
  },
)
