migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    if (!usersCol.fields.getByName('force_password_change')) {
      usersCol.fields.add(
        new BoolField({
          name: 'force_password_change',
        }),
      )
    }

    if (!usersCol.fields.getByName('must_change_password')) {
      usersCol.fields.add(
        new BoolField({
          name: 'must_change_password',
        }),
      )
    }

    app.save(usersCol)
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      if (usersCol.fields.getByName('force_password_change')) {
        usersCol.fields.removeByName('force_password_change')
      }
      if (usersCol.fields.getByName('must_change_password')) {
        usersCol.fields.removeByName('must_change_password')
      }
      app.save(usersCol)
    } catch (_) {}
  },
)
