migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('supplier_allowance_movements')
    if (!col.fields.getByName('related_movement')) {
      col.fields.add(new TextField({ name: 'related_movement' }))
    }
    app.save(col)
    console.log('0114: related_movement field added to supplier_allowance_movements')
  },
  (app) => {
    var col = app.findCollectionByNameOrId('supplier_allowance_movements')
    if (col.fields.getByName('related_movement')) {
      col.fields.removeByName('related_movement')
    }
    app.save(col)
  },
)
