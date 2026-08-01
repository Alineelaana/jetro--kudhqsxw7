migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'veloralog@veloralog.com')
    } catch (_) {
      var admin = new Record(usersCol)
      admin.setEmail('veloralog@veloralog.com')
      admin.setPassword('valoralogadm')
      admin.setVerified(true)
      admin.set('name', 'veloralog')
      app.save(admin)
    }

    var budgetRequestsCol = app.findCollectionByNameOrId('budget_requests')
    budgetRequestsCol.listRule = '@request.auth.email = "veloralog@veloralog.com"'
    budgetRequestsCol.viewRule = '@request.auth.email = "veloralog@veloralog.com"'
    app.save(budgetRequestsCol)
  },
  (app) => {
    var budgetRequestsCol = app.findCollectionByNameOrId('budget_requests')
    budgetRequestsCol.listRule = null
    budgetRequestsCol.viewRule = null
    app.save(budgetRequestsCol)

    try {
      var admin = app.findAuthRecordByEmail('_pb_users_auth_', 'veloralog@veloralog.com')
      app.delete(admin)
    } catch (_) {}
  },
)
