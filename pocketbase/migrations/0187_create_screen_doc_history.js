migrate(
  (app) => {
    const collection = new Collection({
      name: 'screen_doc_history',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'screen_route', type: 'text', required: true },
        { name: 'screen_title', type: 'text', required: true },
        { name: 'module_group', type: 'text', required: true },
        { name: 'changed_item', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'previous_version', type: 'text' },
        { name: 'current_version', type: 'text', required: true },
        { name: 'update_origin', type: 'text' },
        { name: 'author', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_screen_doc_history_route ON screen_doc_history (screen_route)',
        'CREATE INDEX idx_screen_doc_history_created ON screen_doc_history (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('screen_doc_history')
    if (collection) {
      app.delete(collection)
    }
  },
)
