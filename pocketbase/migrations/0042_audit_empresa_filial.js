migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('audit_logs')

    if (!col.fields.getByName('empresa')) {
      col.fields.add(new TextField({ name: 'empresa' }))
    }
    if (!col.fields.getByName('filial')) {
      col.fields.add(new TextField({ name: 'filial' }))
    }

    col.addIndex('idx_audit_logs_empresa', false, 'empresa', '')
    col.addIndex('idx_audit_logs_filial', false, 'filial', '')

    app.save(col)

    var alertsCol = app.findCollectionByNameOrId('audit_alerts')
    alertsCol.updateRule = "@request.auth.role = 'SUP'"
    app.save(alertsCol)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('audit_logs')
    try {
      var f1 = col.fields.getByName('empresa')
      if (f1) col.fields.remove(f1)
    } catch (_) {}
    try {
      var f2 = col.fields.getByName('filial')
      if (f2) col.fields.remove(f2)
    } catch (_) {}
    col.removeIndex('idx_audit_logs_empresa')
    col.removeIndex('idx_audit_logs_filial')
    app.save(col)

    var alertsCol = app.findCollectionByNameOrId('audit_alerts')
    alertsCol.updateRule = null
    app.save(alertsCol)
  },
)
