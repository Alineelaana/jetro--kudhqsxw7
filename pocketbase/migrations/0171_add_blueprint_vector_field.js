migrate(
  (app) => {
    if (app.hasTable('blueprint_chunks')) {
      var col = app.findCollectionByNameOrId('blueprint_chunks')
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
    }
  },
  (app) => {
    if (app.hasTable('blueprint_chunks')) {
      var col = app.findCollectionByNameOrId('blueprint_chunks')
      if (col.fields.getByName('embedding')) {
        col.fields.removeByName('embedding')
        app.save(col)
      }
    }
  },
)
