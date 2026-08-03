migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('products')

    if (!col.fields.getByName('stock')) {
      col.fields.add(new NumberField({ name: 'stock', min: 0, onlyInt: true }))
      app.save(col)
    }

    app.db().newQuery('UPDATE products SET stock = 0 WHERE stock IS NULL').execute()
  },
  (app) => {
    var col = app.findCollectionByNameOrId('products')
    var stockField = col.fields.getByName('stock')
    if (stockField) {
      col.fields.remove(stockField.id)
      app.save(col)
    }
  },
)
