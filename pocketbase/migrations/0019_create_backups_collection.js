migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'backups',
        type: 'base',
        listRule: "@request.auth.role = 'SUP'",
        viewRule: "@request.auth.role = 'SUP'",
        createRule: "@request.auth.role = 'SUP'",
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'version_name', type: 'text', required: true },
          {
            name: 'backup_type',
            type: 'select',
            required: true,
            values: ['full', 'database', 'files', 'config'],
            maxSelect: 1,
          },
          { name: 'backup_data', type: 'text' },
          {
            name: 'file',
            type: 'file',
            maxSelect: 1,
            maxSize: 104857600,
            mimeTypes: ['application/json', 'application/octet-stream', 'text/plain'],
          },
          { name: 'file_size', type: 'number' },
          { name: 'observations', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'created_by_id', type: 'text' },
          { name: 'created_by_name', type: 'text' },
          { name: 'created_by_role', type: 'text' },
          { name: 'auto_generated', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_backups_status ON backups (status)',
          'CREATE INDEX idx_backups_type ON backups (backup_type)',
          'CREATE INDEX idx_backups_created ON backups (created)',
        ],
      }),
    )

    var settingsCol = app.findCollectionByNameOrId('settings')
    var autoSettings = [
      { key: 'auto_backup_daily', value: 'false' },
      { key: 'auto_backup_weekly', value: 'false' },
      { key: 'auto_backup_type', value: 'full' },
      { key: 'auto_backup_last_run', value: 'never' },
    ]
    for (var i = 0; i < autoSettings.length; i++) {
      try {
        app.findFirstRecordByData('settings', 'key', autoSettings[i].key)
      } catch (_) {
        var sRec = new Record(settingsCol)
        sRec.set('key', autoSettings[i].key)
        sRec.set('value', autoSettings[i].value)
        app.save(sRec)
      }
    }

    try {
      app.findFirstRecordByData('backups', 'version_name', 'VeloraLog v1.0')
    } catch (_) {
      var backupCol = app.findCollectionByNameOrId('backups')
      var bRec = new Record(backupCol)
      bRec.set('version_name', 'VeloraLog v1.0')
      bRec.set('backup_type', 'full')
      bRec.set('backup_data', '')
      bRec.set('file_size', 0)
      bRec.set('observations', 'Backup inicial do projeto - ponto de restauração permanente')
      bRec.set('status', 'pending')
      bRec.set('created_by_name', 'Sistema')
      bRec.set('created_by_role', 'SUP')
      bRec.set('auto_generated', true)
      app.save(bRec)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('backups'))
    } catch (_) {}
  },
)
