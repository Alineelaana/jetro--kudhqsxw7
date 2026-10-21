migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return

      // Garantir campo login
      if (!usersCol.fields.getByName('login')) {
        usersCol.fields.add(
          new TextField({
            name: 'login',
            required: false,
          }),
        )
      }

      // Garantir índice único condicional no campo login (ignora vazios)
      const indexDefinition =
        "CREATE UNIQUE INDEX `idx_users_login` ON `users` (`login`) WHERE `login` != ''"

      const existingIndexes = usersCol.indexes || []
      let indexExists = false
      for (let i = 0; i < existingIndexes.length; i++) {
        if (
          existingIndexes[i].indexOf('idx_users_login') !== -1 ||
          existingIndexes[i].indexOf('(`login`)') !== -1
        ) {
          indexExists = true
          break
        }
      }

      if (!indexExists) {
        existingIndexes.push(indexDefinition)
        usersCol.indexes = existingIndexes
      }

      app.save(usersCol)
    } catch (err) {
      console.log('Migration 0273 notice/error:', err)
    }
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return
      usersCol.indexes = (usersCol.indexes || []).filter(
        (idx) => idx.indexOf('idx_users_login') === -1,
      )
      app.save(usersCol)
    } catch (_) {}
  },
)
