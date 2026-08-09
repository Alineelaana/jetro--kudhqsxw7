migrate(
  (app) => {
    if (!app.hasTable('blueprint_chapters')) return

    const col = app.findCollectionByNameOrId('blueprint_chapters')
    if (col.fields.getByName('embedding')) return

    col.fields.add(
      new VectorField({
        name: 'embedding',
        dimensions: 1536,
        distance: 'cosine',
      }),
    )
    app.save(col)
  },
  (app) => {
    if (!app.hasTable('blueprint_chapters')) return

    const col = app.findCollectionByNameOrId('blueprint_chapters')
    if (!col.fields.getByName('embedding')) return

    col.fields.remove('embedding')
    app.save(col)
  },
)
