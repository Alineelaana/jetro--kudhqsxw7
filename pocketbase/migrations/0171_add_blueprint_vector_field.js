migrate(
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('blueprint_chapters')
      if (!col.fields.getByName('embedding')) {
        col.fields.add(
          new VectorField({
            name: 'embedding',
            dimensions: 1536,
            distance: 'cosine',
          }),
        )
        app.save(col)
      }
    } catch (_) {}

    try {
      var volCol = app.findCollectionByNameOrId('blueprint_volumes')
      if (!volCol.fields.getByName('embedding')) {
        volCol.fields.add(
          new VectorField({
            name: 'embedding',
            dimensions: 1536,
            distance: 'cosine',
          }),
        )
        app.save(volCol)
      }
    } catch (_) {}
  },
  (app) => {
    var colNames = ['blueprint_chapters', 'blueprint_volumes']
    for (var i = 0; i < colNames.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(colNames[i])
        var field = col.fields.getByName('embedding')
        if (field) {
          col.fields.remove(field.id)
          app.save(col)
        }
      } catch (_) {}
    }
  },
)
