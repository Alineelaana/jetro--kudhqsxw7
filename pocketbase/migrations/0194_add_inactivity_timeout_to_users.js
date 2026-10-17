migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('inactivity_timeout_minutes')) {
      usersCol.fields.add(
        new NumberField({
          name: 'inactivity_timeout_minutes',
          min: 1,
          max: 480,
          onlyInt: true,
        }),
      )
      app.save(usersCol)
    }

    // Backfill idempotent: fill existing records without value or null with 5 minutes
    try {
      var records = app.findRecordsByFilter(
        'users',
        'inactivity_timeout_minutes = null || inactivity_timeout_minutes <= 0',
        '',
        10000,
        0,
      )
      for (var i = 0; i < records.length; i++) {
        records[i].set('inactivity_timeout_minutes', 5)
        app.save(records[i])
      }
    } catch (e) {
      console.log('Error backfilling inactivity_timeout_minutes: ' + e)
    }
  },
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var field = usersCol.fields.getByName('inactivity_timeout_minutes')
      if (field) {
        usersCol.fields.remove(field)
        app.save(usersCol)
      }
    } catch (_) {}
  },
)
