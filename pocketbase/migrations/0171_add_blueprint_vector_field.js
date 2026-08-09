migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('blueprint_chapters')
    if (!col.fields.getByName('embedding')) {
      col.fields.add(new VectorField({ name: 'embedding', dimensions: 1536, distance: 'cosine' }))
    }
    app.save(col)
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('blueprint_chapters')
      if (col.fields.getByName('embedding')) {
        col.fields.removeByName('embedding')
        app.save(col)
      }
    } catch (_) {}
  },
)
