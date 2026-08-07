migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('mfa_secret')) {
      usersCol.fields.add(new TextField({ name: 'mfa_secret' }))
    }
    if (!usersCol.fields.getByName('mfa_enabled')) {
      usersCol.fields.add(new BoolField({ name: 'mfa_enabled' }))
    }
    if (!usersCol.fields.getByName('mfa_verified_at')) {
      usersCol.fields.add(new TextField({ name: 'mfa_verified_at' }))
    }
    app.save(usersCol)

    var secCol = null
    try {
      secCol = app.findCollectionByNameOrId('security_config')
    } catch (_) {
      return
    }

    try {
      app.findFirstRecordByData('security_config', 'key', 'mfa_required_for_admins')
    } catch (_) {
      var rec = new Record(secCol)
      rec.set('key', 'mfa_required_for_admins')
      rec.set('value', 'false')
      rec.set('active', true)
      app.save(rec)
    }
  },
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    var f1 = usersCol.fields.getByName('mfa_secret')
    if (f1) usersCol.fields.remove(f1)
    var f2 = usersCol.fields.getByName('mfa_enabled')
    if (f2) usersCol.fields.remove(f2)
    var f3 = usersCol.fields.getByName('mfa_verified_at')
    if (f3) usersCol.fields.remove(f3)
    app.save(usersCol)

    try {
      var rec = app.findFirstRecordByData('security_config', 'key', 'mfa_required_for_admins')
      app.delete(rec)
    } catch (_) {}
  },
)
