migrate(
  (app) => {
    var user = null

    // 1. Try finding by current username 'jetrosup'
    try {
      user = app.findFirstRecordByData('users', 'username', 'jetrosup')
    } catch (_) {}

    // 2. Try finding by email 'jetrosup@jetro.com.br'
    if (!user) {
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', 'jetrosup@jetro.com.br')
      } catch (_) {}
    }

    // 3. Try finding by already updated username 'Alineelaana'
    if (!user) {
      try {
        user = app.findFirstRecordByData('users', 'username', 'Alineelaana')
      } catch (_) {}
    }

    // 4. Try finding by legacy email 'veloralog@veloralog.com'
    if (!user) {
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', 'veloralog@veloralog.com')
      } catch (_) {}
    }

    if (user) {
      user.set('username', 'Alineelaana')
      user.setPassword('jetrosup')
      user.setVerified(true)
      user.set('active', true)
      // preserve all other fields (name, role, avatar, etc.) intact
      app.save(user)
      console.log(
        'Successfully updated user credentials to username=Alineelaana, password=jetrosup for user id=' +
          user.id,
      )
    } else {
      // If record not found, create it with role SUP and active true
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var record = new Record(usersCol)
      record.setEmail('jetrosup@jetro.com.br')
      record.setPassword('jetrosup')
      record.setVerified(true)
      record.set('username', 'Alineelaana')
      record.set('name', 'Jetro Admin')
      record.set('role', 'SUP')
      record.set('active', true)
      app.save(record)
      console.log('Created user record with username=Alineelaana, password=jetrosup')
    }
  },
  (app) => {
    try {
      var user = app.findFirstRecordByData('users', 'username', 'Alineelaana')
      if (user) {
        user.set('username', 'jetrosup')
        user.setPassword('jetroadm')
        app.save(user)
      }
    } catch (_) {}
  },
)
