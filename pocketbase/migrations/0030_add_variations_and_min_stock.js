migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('products')

    if (!col.fields.getByName('variations')) {
      col.fields.add(new JSONField({ name: 'variations' }))
    }

    if (!col.fields.getByName('min_stock')) {
      col.fields.add(new NumberField({ name: 'min_stock', min: 0, onlyInt: true }))
    }

    app.save(col)

    app.db().newQuery('UPDATE products SET min_stock = 0 WHERE min_stock IS NULL').execute()
    app.db().newQuery("UPDATE products SET variations = '[]' WHERE variations IS NULL").execute()
  },
  (app) => {
    var col = app.findCollectionByNameOrId('products')

    var variationsField = col.fields.getByName('variations')
    if (variationsField) {
      col.fields.remove(variationsField.id)
    }

    var minStockField = col.fields.getByName('min_stock')
    if (minStockField) {
      col.fields.remove(minStockField.id)
    }

    app.save(col)
  },
)
