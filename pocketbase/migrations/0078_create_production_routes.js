migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var prCol = app.findCollectionByNameOrId('production_resources')

    app.save(
      new Collection({
        name: 'production_routes',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          {
            name: 'product_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'version', type: 'number' },
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'ativo', 'inativo'],
            maxSelect: 1,
          },
          { name: 'vigencia_inicial', type: 'text' },
          { name: 'vigencia_final', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'approval_date', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_prod_routes_product ON production_routes (product_id)',
          'CREATE INDEX idx_prod_routes_status ON production_routes (status)',
          'CREATE INDEX idx_prod_routes_version ON production_routes (version)',
        ],
      }),
    )
    var routeId = app.findCollectionByNameOrId('production_routes').id

    app.save(
      new Collection({
        name: 'production_route_operations',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          {
            name: 'route_id',
            type: 'relation',
            collectionId: routeId,
            maxSelect: 1,
            required: true,
          },
          { name: 'order', type: 'number' },
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'resource_id', type: 'relation', collectionId: prCol.id, maxSelect: 1 },
          { name: 'materials_consumed', type: 'json' },
          { name: 'tempo_setup', type: 'text' },
          { name: 'tempo_operacao', type: 'text' },
          { name: 'perda_prevista', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_route_ops_route ON production_route_operations (route_id)',
          'CREATE INDEX idx_route_ops_order ON production_route_operations (order)',
        ],
      }),
    )
  },
  (app) => {
    var cols = ['production_route_operations', 'production_routes']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
