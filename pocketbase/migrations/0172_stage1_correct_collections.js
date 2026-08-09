migrate(
  (app) => {
    if (app.hasTable('blueprint_volumes')) {
      const col = app.findCollectionByNameOrId('blueprint_volumes')
      let changed = false

      if (!col.fields.getByName('status')) {
        col.fields.add(new TextField({ name: 'status' }))
        changed = true
      }
      if (!col.fields.getByName('order')) {
        col.fields.add(new NumberField({ name: 'order' }))
        changed = true
      }
      if (!col.fields.getByName('data')) {
        col.fields.add(new JSONField({ name: 'data' }))
        changed = true
      }
      if (changed) app.save(col)
    }

    if (app.hasTable('blueprint_chapters')) {
      const col = app.findCollectionByNameOrId('blueprint_chapters')
      let changed = false

      if (!col.fields.getByName('status')) {
        col.fields.add(new TextField({ name: 'status' }))
        changed = true
      }
      if (!col.fields.getByName('order')) {
        col.fields.add(new NumberField({ name: 'order' }))
        changed = true
      }
      if (!col.fields.getByName('data')) {
        col.fields.add(new JSONField({ name: 'data' }))
        changed = true
      }
      if (changed) app.save(col)
    }
  },
  (app) => {},
)
