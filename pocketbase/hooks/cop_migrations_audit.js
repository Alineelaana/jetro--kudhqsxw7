routerAdd(
  'GET',
  '/backend/v1/cop/migrations',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var items = []
    var tableFound = false

    try {
      var rows = []
      $app.db().newQuery('SELECT file, applied FROM _migrations ORDER BY file').all(rows)
      tableFound = true
      for (var i = 0; i < rows.length; i++) {
        items.push({
          name: rows[i].file || '',
          applied: true,
          status: 'applied',
          immutable: true,
          applied_at: rows[i].applied || '',
        })
      }
    } catch (_) {
      try {
        var rows2 = []
        $app.db().newQuery('SELECT file, applied FROM _jsmigrations ORDER BY file').all(rows2)
        tableFound = true
        for (var j = 0; j < rows2.length; j++) {
          items.push({
            name: rows2[j].file || '',
            applied: true,
            status: 'applied',
            immutable: true,
            applied_at: rows2[j].applied || '',
          })
        }
      } catch (_) {}
    }

    return e.json(200, { items: items, total: items.length, table_found: tableFound })
  },
  $apis.requireAuth(),
)
