migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('price_tables')

    var productField = col.fields.getByName('product_id')
    if (productField) {
      productField.required = false
    }

    var tableTypeField = col.fields.getByName('table_type')
    if (tableTypeField) {
      tableTypeField.required = false
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('price_tables')

    var productField = col.fields.getByName('product_id')
    if (productField) {
      productField.required = true
    }

    var tableTypeField = col.fields.getByName('table_type')
    if (tableTypeField) {
      tableTypeField.required = true
    }

    app.save(col)
  },
)
