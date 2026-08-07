migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      usersCol.addIndex('idx_users_empresa_id', false, 'empresa_id', '')
    } catch (_) {}
    try {
      usersCol.addIndex('idx_users_filial_id', false, 'filial_id', '')
    } catch (_) {}
    app.save(usersCol)

    var ORG_COLLECTIONS = [
      { name: 'sales_orders', companyField: 'company' },
      { name: 'purchase_orders', companyField: 'company' },
      { name: 'purchase_requests', companyField: 'company' },
      { name: 'pricing_config', companyField: 'company' },
      { name: 'system_parameters', companyField: 'company' },
      { name: 'integrations', companyField: 'company' },
      { name: 'api_credentials', companyField: 'company' },
    ]

    var fixed = 0
    for (var i = 0; i < ORG_COLLECTIONS.length; i++) {
      var cfg = ORG_COLLECTIONS[i]
      try {
        var col = app.findCollectionByNameOrId(cfg.name)
        var rule =
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.empresa_id = '' || " +
          cfg.companyField +
          " = '' || " +
          cfg.companyField +
          ' = @request.auth.empresa_id)'
        col.listRule = rule
        col.viewRule = rule
        app.save(col)
        fixed++
      } catch (err) {
        console.log('auth foundation: skipping ' + cfg.name + ': ' + String(err))
      }
    }

    try {
      var secCol = app.findCollectionByNameOrId('security_config')
      try {
        app.findFirstRecordByData('security_config', 'key', 'org_scope_enforced')
      } catch (_) {
        var rec = new Record(secCol)
        rec.set('key', 'org_scope_enforced')
        rec.set('value', 'true')
        rec.set('active', true)
        app.save(rec)
      }
    } catch (_) {}

    console.log('BEP-AUTH: updated org scope rules on ' + fixed + ' collections')
  },
  (app) => {
    var collections = [
      'sales_orders',
      'purchase_orders',
      'purchase_requests',
      'pricing_config',
      'system_parameters',
      'integrations',
      'api_credentials',
    ]
    for (var i = 0; i < collections.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(collections[i])
        col.listRule = "@request.auth.id != ''"
        col.viewRule = "@request.auth.id != ''"
        app.save(col)
      } catch (_) {}
    }
    try {
      var rec = app.findFirstRecordByData('security_config', 'key', 'org_scope_enforced')
      app.delete(rec)
    } catch (_) {}
  },
)
