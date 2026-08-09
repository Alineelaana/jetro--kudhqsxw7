migrate(
  (app) => {
    var auditCol = app.findCollectionByNameOrId('audit_logs')
    if (!auditCol.fields.getByName('triage_responsible'))
      auditCol.fields.add(new TextField({ name: 'triage_responsible' }))
    if (!auditCol.fields.getByName('triage_status'))
      auditCol.fields.add(
        new SelectField({
          name: 'triage_status',
          values: ['Novo', 'Em análise', 'Atribuído', 'Resolvido', 'Recorrente'],
          maxSelect: 1,
        }),
      )
    if (!auditCol.fields.getByName('triage_recurrence_count'))
      auditCol.fields.add(new NumberField({ name: 'triage_recurrence_count' }))
    if (!auditCol.fields.getByName('triage_resolved_by'))
      auditCol.fields.add(new TextField({ name: 'triage_resolved_by' }))
    if (!auditCol.fields.getByName('triage_resolved_at'))
      auditCol.fields.add(new TextField({ name: 'triage_resolved_at' }))
    auditCol.addIndex('idx_audit_triage_status', false, 'triage_status', '')
    app.save(auditCol)

    var alertsCol = app.findCollectionByNameOrId('audit_alerts')
    if (!alertsCol.fields.getByName('triage_responsible'))
      alertsCol.fields.add(new TextField({ name: 'triage_responsible' }))
    if (!alertsCol.fields.getByName('triage_status'))
      alertsCol.fields.add(
        new SelectField({
          name: 'triage_status',
          values: ['Novo', 'Em análise', 'Atribuído', 'Resolvido', 'Recorrente'],
          maxSelect: 1,
        }),
      )
    if (!alertsCol.fields.getByName('triage_recurrence_count'))
      alertsCol.fields.add(new NumberField({ name: 'triage_recurrence_count' }))
    if (!alertsCol.fields.getByName('triage_resolved_by'))
      alertsCol.fields.add(new TextField({ name: 'triage_resolved_by' }))
    if (!alertsCol.fields.getByName('triage_resolved_at'))
      alertsCol.fields.add(new TextField({ name: 'triage_resolved_at' }))
    alertsCol.addIndex('idx_alerts_triage_status', false, 'triage_status', '')
    app.save(alertsCol)

    var R = "@request.auth.id != ''"
    var SUP = "@request.auth.role = 'SUP'"
    app.save(
      new Collection({
        name: 'cop_releases',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SUP,
        fields: [
          { name: 'version', type: 'text', required: true },
          {
            name: 'environment',
            type: 'select',
            required: true,
            values: ['Desenvolvimento', 'Homologação', 'Produção'],
            maxSelect: 1,
          },
          { name: 'build_commit', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'associated_migrations', type: 'json' },
          { name: 'features', type: 'json' },
          { name: 'bug_fixes', type: 'json' },
          { name: 'risks', type: 'text' },
          { name: 'rollback_available', type: 'bool' },
          { name: 'status', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_cop_rel_env ON cop_releases (environment)',
          'CREATE INDEX idx_cop_rel_status ON cop_releases (status)',
          'CREATE INDEX idx_cop_rel_version ON cop_releases (version)',
        ],
      }),
    )

    var relCol = app.findCollectionByNameOrId('cop_releases')
    var seeds = [
      {
        version: 'v1.0.0',
        environment: 'Produção',
        build_commit: 'a1b2c3d4',
        responsible: 'DevOps Team',
        risks: 'Initial release',
        rollback_available: true,
        status: 'promoted',
      },
      {
        version: 'v1.1.0',
        environment: 'Homologação',
        build_commit: 'e5f6g7h8',
        responsible: 'DevOps Team',
        risks: 'New features, low risk',
        rollback_available: true,
        status: 'testing',
      },
      {
        version: 'v1.2.0',
        environment: 'Desenvolvimento',
        build_commit: 'i9j0k1l2',
        responsible: 'Dev Team',
        risks: 'COP module MVP',
        rollback_available: true,
        status: 'created',
      },
    ]
    for (var i = 0; i < seeds.length; i++) {
      try {
        app.findFirstRecordByData('cop_releases', 'version', seeds[i].version)
      } catch (_) {
        var rec = new Record(relCol)
        rec.set('version', seeds[i].version)
        rec.set('environment', seeds[i].environment)
        rec.set('build_commit', seeds[i].build_commit)
        rec.set('responsible', seeds[i].responsible)
        rec.set('risks', seeds[i].risks)
        rec.set('rollback_available', seeds[i].rollback_available)
        rec.set('status', seeds[i].status)
        rec.set('associated_migrations', [])
        rec.set('features', [])
        rec.set('bug_fixes', [])
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('cop_releases'))
    } catch (_) {}
    var auditCol = app.findCollectionByNameOrId('audit_logs')
    ;[
      'triage_responsible',
      'triage_status',
      'triage_recurrence_count',
      'triage_resolved_by',
      'triage_resolved_at',
    ].forEach(function (f) {
      var field = auditCol.fields.getByName(f)
      if (field) auditCol.fields.remove(field)
    })
    try {
      auditCol.removeIndex('idx_audit_triage_status')
    } catch (_) {}
    app.save(auditCol)
    var alertsCol = app.findCollectionByNameOrId('audit_alerts')
    ;[
      'triage_responsible',
      'triage_status',
      'triage_recurrence_count',
      'triage_resolved_by',
      'triage_resolved_at',
    ].forEach(function (f) {
      var field = alertsCol.fields.getByName(f)
      if (field) alertsCol.fields.remove(field)
    })
    try {
      alertsCol.removeIndex('idx_alerts_triage_status')
    } catch (_) {}
    app.save(alertsCol)
  },
)
