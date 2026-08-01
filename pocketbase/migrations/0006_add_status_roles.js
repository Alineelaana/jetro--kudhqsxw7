migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          required: false,
          values: ['SUP', 'PADRAO'],
          maxSelect: 1,
        }),
      )
    }
    usersCol.listRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || id = @request.auth.id)"
    usersCol.viewRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || id = @request.auth.id)"
    usersCol.createRule = ''
    usersCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || id = @request.auth.id)"
    usersCol.deleteRule = "@request.auth.role = 'SUP'"
    usersCol.addIndex('idx_users_role', false, 'role', '')
    app.save(usersCol)

    var brCol = app.findCollectionByNameOrId('budget_requests')
    if (!brCol.fields.getByName('status')) {
      brCol.fields.add(new TextField({ name: 'status' }))
    }
    if (!brCol.fields.getByName('status_history')) {
      brCol.fields.add(new JSONField({ name: 'status_history' }))
    }
    brCol.listRule = "@request.auth.id != ''"
    brCol.viewRule = "@request.auth.id != ''"
    brCol.createRule = ''
    brCol.updateRule = "@request.auth.id != ''"
    brCol.deleteRule = "@request.auth.role = 'SUP'"
    brCol.addIndex('idx_budget_requests_status', false, 'status', '')
    app.save(brCol)

    try {
      var admin = app.findAuthRecordByEmail('_pb_users_auth_', 'veloralog@veloralog.com')
      admin.set('role', 'SUP')
      app.save(admin)
    } catch (_) {}

    var records = app.findRecordsByFilter('budget_requests', "id != ''", '-created', 1000, 0)
    for (var i = 0; i < records.length; i++) {
      records[i].set('status', 'PENDENTE')
      records[i].set('status_history', [])
      app.save(records[i])
    }
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.createRule = ''
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    usersCol.removeIndex('idx_users_role')
    app.save(usersCol)

    var brCol = app.findCollectionByNameOrId('budget_requests')
    brCol.listRule = '@request.auth.email = "veloralog@veloralog.com"'
    brCol.viewRule = '@request.auth.email = "veloralog@veloralog.com"'
    brCol.createRule = ''
    brCol.updateRule = null
    brCol.deleteRule = null
    brCol.removeIndex('idx_budget_requests_status')
    app.save(brCol)
  },
)
