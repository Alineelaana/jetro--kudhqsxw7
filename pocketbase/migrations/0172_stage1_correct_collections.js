migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId('blueprint_volumes')
    } catch (_) {
      var volCol = new Collection({
        name: 'blueprint_volumes',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'chapter', type: 'text' },
          { name: 'metric_name', type: 'text' },
          { name: 'target_value', type: 'text' },
          { name: 'current_value', type: 'text' },
          { name: 'unit', type: 'text' },
          { name: 'period', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'sort_order', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(volCol)
    }

    var colsToCheck = ['blueprint_chapters', 'blueprint_versions']
    for (var i = 0; i < colsToCheck.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(colsToCheck[i])
        if (!col.fields.getByName('status')) {
          col.fields.add(new TextField({ name: 'status' }))
          app.save(col)
        }
        if (!col.fields.getByName('sort_order')) {
          col.fields.add(new NumberField({ name: 'sort_order' }))
          app.save(col)
        }
      } catch (_) {}
    }
  },
  (app) => {},
)
