/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const productsCol = app.findCollectionByNameOrId('products')

    const costAverageField = productsCol.fields.getByName('cost_average')
    if (!costAverageField) {
      productsCol.fields.add(
        new TextField({
          name: 'cost_average',
          required: false,
        }),
      )
      app.save(productsCol)
    }

    // Backfill inicial para cost_average receber cost_price ou last_cost onde estiver vazio
    try {
      const existingProducts = app.findRecordsByFilter('products', '1 = 1', '-created', 5000, 0)
      for (const p of existingProducts) {
        if (!p.getString('cost_average')) {
          const costVal = p.getString('cost_price') || p.getString('last_cost') || '0'
          p.set('cost_average', costVal)
          app.save(p)
        }
      }
    } catch (err) {
      console.log('Aviso no backfill de cost_average:', err)
    }
  },
  (app) => {
    try {
      const productsCol = app.findCollectionByNameOrId('products')
      const costAverageField = productsCol.fields.getByName('cost_average')
      if (costAverageField) {
        productsCol.fields.removeByName('cost_average')
        app.save(productsCol)
      }
    } catch (_) {}
  },
)
