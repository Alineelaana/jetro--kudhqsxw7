migrate(
  (app) => {
    try {
      app.findFirstRecordByData('settings', 'key', 'system_migration_version')
    } catch (_) {
      try {
        const col = app.findCollectionByNameOrId('settings')
        const record = new Record(col)
        record.set('key', 'system_migration_version')
        record.set('value', '0072')
        app.save(record)
      } catch (_) {}
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('settings', 'key', 'system_migration_version')
      app.delete(record)
    } catch (_) {}
  },
)
