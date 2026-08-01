migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('active')) {
      usersCol.fields.add(
        new BoolField({
          name: 'active',
          required: false,
        }),
      )
    }

    app.save(usersCol)

    try {
      app
        .db()
        .newQuery("UPDATE users SET active = 1 WHERE active IS NULL OR active = '' OR active = 0")
        .execute()
    } catch (_) {}
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      try {
        usersCol.fields.removeByName('active')
      } catch (_) {}
      app.save(usersCol)
    } catch (_) {}
  },
)
