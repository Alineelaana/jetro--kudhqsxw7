migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('blueprint_chunks')
    if (!col.fields.getByName('embedding')) {
      col.fields.add(new VectorField({ name: 'embedding', dimensions: 1536, distance: 'cosine' }))
      app.save(col)
    }
    console.log('BLUEPRINT-0171: vector field added to blueprint_chunks')
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('blueprint_chunks')
      if (col.fields.getByName('embedding')) {
        col.fields.remove('embedding')
        app.save(col)
      }
    } catch (e) {}
  },
)
