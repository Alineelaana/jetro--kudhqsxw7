migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    var user = null

    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'veloralog@veloralog.com')
    } catch (_) {}

    if (!user) {
      try {
        user = app.findFirstRecordByData('users', 'username', 'jetrosup')
      } catch (_) {}
    }

    if (!user) {
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', 'jetrosup@jetro.com.br')
      } catch (_) {}
    }

    if (user) {
      user.set('username', 'jetrosup')
      user.setEmail('jetrosup@jetro.com.br')
      user.setPassword('jetroadm')
      user.set('role', 'SUP')
      user.set('active', true)
      user.set('name', 'Jetro Admin')
      user.setVerified(true)
      app.save(user)
    } else {
      var record = new Record(usersCol)
      record.setEmail('jetrosup@jetro.com.br')
      record.setPassword('jetroadm')
      record.setVerified(true)
      record.set('username', 'jetrosup')
      record.set('name', 'Jetro Admin')
      record.set('role', 'SUP')
      record.set('active', true)
      app.save(record)
    }
  },
  (app) => {
    try {
      var user = app.findFirstRecordByData('users', 'username', 'jetrosup')
      if (user) {
        user.set('username', 'veloralog')
        user.setEmail('veloralog@veloralog.com')
        user.setPassword('valoralogadm')
        user.set('name', 'veloralog')
        app.save(user)
      }
    } catch (_) {}
  },
)
