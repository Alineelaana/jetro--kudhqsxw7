migrate(
  (app) => {
    if (app.hasTable('blueprint_chapters')) {
      var col = app.findCollectionByNameOrId('blueprint_chapters')
      var changed = false

      if (!col.fields.getByName('embedding')) {
        col.fields.add(
          new VectorField({
            name: 'embedding',
            dimensions: 1536,
            distance: 'cosine',
          }),
        )
        changed = true
      }

      if (!col.fields.getByName('chunk_text')) {
        col.fields.add(new TextField({ name: 'chunk_text' }))
        changed = true
      }

      if (changed) app.save(col)
    }
  },
  (app) => {
    if (app.hasTable('blueprint_chapters')) {
      var col = app.findCollectionByNameOrId('blueprint_chapters')
      var changed = false

      if (col.fields.getByName('embedding')) {
        col.fields.removeByName('embedding')
        changed = true
      }
      if (col.fields.getByName('chunk_text')) {
        col.fields.removeByName('chunk_text')
        changed = true
      }

      if (changed) app.save(col)
    }
  },
)
