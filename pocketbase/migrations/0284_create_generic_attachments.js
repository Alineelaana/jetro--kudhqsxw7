migrate(
  (app) => {
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    var rules = {
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
    }

    try {
      app.findCollectionByNameOrId('generic_attachments')
    } catch (_) {
      var col = new Collection({
        name: 'generic_attachments',
        type: 'base',
        listRule: rules.listRule,
        viewRule: rules.viewRule,
        createRule: rules.createRule,
        updateRule: rules.updateRule,
        deleteRule: rules.deleteRule,
        fields: [
          { name: 'module', type: 'text', required: true },
          { name: 'record_id', type: 'text', required: true },
          { name: 'file_name', type: 'text', required: true },
          { name: 'file_size', type: 'number' },
          { name: 'file_type', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'empresa', type: 'text' },
          { name: 'uploaded_by_name', type: 'text' },
          { name: 'file', type: 'file', maxSelect: 1, maxSize: 52428800 },
        ].concat(ad),
        indexes: [
          'CREATE INDEX idx_gen_att_record ON generic_attachments (record_id)',
          'CREATE INDEX idx_gen_att_module ON generic_attachments (module)',
          'CREATE INDEX idx_gen_att_empresa ON generic_attachments (empresa)',
        ],
      })
      app.save(col)
    }

    console.log('0284: generic_attachments criada com sucesso')
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('generic_attachments')
      app.delete(col)
    } catch (_) {}
  },
)
