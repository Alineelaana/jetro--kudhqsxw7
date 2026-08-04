migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('import_export_history')

    if (!col.fields.getByName('module')) {
      col.fields.add(new TextField({ name: 'module' }))
    }
    if (!col.fields.getByName('filters_applied')) {
      col.fields.add(new JSONField({ name: 'filters_applied' }))
    }
    if (!col.fields.getByName('record_count')) {
      col.fields.add(new NumberField({ name: 'record_count' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('import_export_history')

    const moduleField = col.fields.getByName('module')
    if (moduleField) col.fields.remove(moduleField)

    const filtersField = col.fields.getByName('filters_applied')
    if (filtersField) col.fields.remove(filtersField)

    const countField = col.fields.getByName('record_count')
    if (countField) col.fields.remove(countField)

    app.save(col)
  },
)
