migrate(
  (app) => {
    const collection = new Collection({
      name: 'certification_artifacts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'domain', type: 'text', required: true },
        { name: 'build_number', type: 'number', required: true, onlyInt: true },
        { name: 'build_name', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'em_elaboracao', 'em_revisao', 'concluido'],
          maxSelect: 1,
        },
        { name: 'content', type: 'json' },
        { name: 'review_checklist', type: 'json' },
        { name: 'review_notes', type: 'text' },
        { name: 'completed_at', type: 'text' },
        { name: 'reviewer', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_cert_artifacts_domain_build ON certification_artifacts (domain, build_number)',
        'CREATE INDEX idx_cert_artifacts_status ON certification_artifacts (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('certification_artifacts'))
    } catch (_) {}
  },
)
