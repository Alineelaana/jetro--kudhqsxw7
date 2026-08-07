migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var bomCol = app.findCollectionByNameOrId('bom_versions')
    var routeCol = app.findCollectionByNameOrId('production_routes')

    app.save(
      new Collection({
        name: 'production_orders',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'order_number', type: 'text', required: true },
          {
            name: 'status',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['rascunho', 'planejada', 'em_producao', 'concluida', 'cancelada'],
          },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'bom_version_id', type: 'relation', collectionId: bomCol.id, maxSelect: 1 },
          { name: 'route_id', type: 'relation', collectionId: routeCol.id, maxSelect: 1 },
          { name: 'quantity', type: 'text', required: true },
          { name: 'unit', type: 'text' },
          { name: 'lot_number', type: 'text' },
          { name: 'start_date', type: 'text' },
          { name: 'end_date', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_prod_orders_status ON production_orders (status)',
          'CREATE INDEX idx_prod_orders_created ON production_orders (created)',
          'CREATE INDEX idx_prod_orders_product ON production_orders (product_id)',
          'CREATE INDEX idx_prod_orders_number ON production_orders (order_number)',
        ],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('production_orders'))
    } catch (_) {}
  },
)
