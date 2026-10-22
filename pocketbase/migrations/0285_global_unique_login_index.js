migrate(
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return

      const existingIndexes = usersCol.indexes || []

      // 1. Remover o antigo índice composto por empresa_id + login (idx_users_empresa_login)
      const filteredIndexes = existingIndexes.filter(
        (idx) =>
          idx.indexOf('idx_users_empresa_login') === -1 &&
          idx.indexOf('(`empresa_id`, `login`)') === -1 &&
          idx.indexOf('idx_users_login') === -1,
      )

      // 2. Adicionar o índice único GLOBAL para login (case-insensitive e ignorando logins vazios)
      // CREATE UNIQUE INDEX `idx_users_global_login` ON `users` (`login`) WHERE `login` != ''
      const globalLoginIndex =
        "CREATE UNIQUE INDEX `idx_users_global_login` ON `users` (`login`) WHERE `login` != ''"

      filteredIndexes.push(globalLoginIndex)
      usersCol.indexes = filteredIndexes
      app.save(usersCol)
    } catch (err) {
      console.log('Migration 0285 error:', err)
      throw err
    }
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      if (!usersCol) return
      const existingIndexes = usersCol.indexes || []
      usersCol.indexes = existingIndexes.filter(
        (idx) => idx.indexOf('idx_users_global_login') === -1,
      )
      app.save(usersCol)
    } catch (_) {}
  },
)
