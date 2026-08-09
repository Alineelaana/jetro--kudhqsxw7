migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId('blueprint_volumes')
      return
    } catch (_) {}

    var chaptersColId = app.findCollectionByNameOrId('blueprint_chapters').id

    var collection = new Collection({
      name: 'blueprint_volumes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'chapter_id',
          type: 'relation',
          required: false,
          collectionId: chaptersColId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'volume_value', type: 'text' },
        { name: 'unit', type: 'text' },
        { name: 'period', type: 'text' },
        { name: 'sort_order', type: 'number' },
        { name: 'status', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_blueprint_volumes_name ON blueprint_volumes (name)'],
    })
    app.save(collection)
  },
  (app) => {
    try {
      var collection = app.findCollectionByNameOrId('blueprint_volumes')
      app.delete(collection)
    } catch (_) {}
  },
)
