migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var prCol = app.findCollectionByNameOrId('production_resources')

    if (!app.hasTable('bom_versions')) {
      app.save(
        new Collection({
          name: 'bom_versions',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new RelationField({
              name: 'product_id',
              collectionId: prodCol.id,
              maxSelect: 1,
              required: true,
            }),
            new NumberField({ name: 'version' }),
            new SelectField({ name: 'type', values: ['estrutura', 'formulacao'], maxSelect: 1 }),
            new SelectField({
              name: 'status',
              values: ['rascunho', 'ativo', 'inativo'],
              maxSelect: 1,
            }),
            new TextField({ name: 'vigencia_inicial' }),
            new TextField({ name: 'vigencia_final' }),
            new TextField({ name: 'rendimento' }),
            new TextField({ name: 'concentration' }),
            new TextField({ name: 'ph' }),
            new TextField({ name: 'density' }),
            new TextField({ name: 'temperature' }),
            new TextField({ name: 'mixing_sequence' }),
            new TextField({ name: 'tolerances' }),
            new TextField({ name: 'instructions' }),
            new TextField({ name: 'responsible' }),
            new TextField({ name: 'approval_date' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_bom_versions_product ON bom_versions (product_id)',
            'CREATE INDEX idx_bom_versions_status ON bom_versions (status)',
            'CREATE INDEX idx_bom_versions_type ON bom_versions (type)',
            'CREATE INDEX idx_bom_versions_version ON bom_versions (version)',
          ],
        }),
      )
      if (!app.hasTable('bom_versions'))
        throw new Error('Post-save check failed: bom_versions not persisted')
    }
    var bvId = app.findCollectionByNameOrId('bom_versions').id

    if (!app.hasTable('bom_components')) {
      app.save(
        new Collection({
          name: 'bom_components',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new RelationField({
              name: 'bom_version_id',
              collectionId: bvId,
              maxSelect: 1,
              required: true,
            }),
            new RelationField({
              name: 'item_id',
              collectionId: prodCol.id,
              maxSelect: 1,
              required: true,
            }),
            new TextField({ name: 'quantidade' }),
            new TextField({ name: 'unidade' }),
            new TextField({ name: 'perda_prevista' }),
            new BoolField({ name: 'substituto_permitido' }),
            new RelationField({
              name: 'substituto_item_id',
              collectionId: prodCol.id,
              maxSelect: 1,
            }),
            new NumberField({ name: 'ordem' }),
            new TextField({ name: 'observations' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_bom_comp_version ON bom_components (bom_version_id)',
            'CREATE INDEX idx_bom_comp_item ON bom_components (item_id)',
          ],
        }),
      )
      if (!app.hasTable('bom_components'))
        throw new Error('Post-save check failed: bom_components not persisted')
    }

    if (!app.hasTable('production_routes')) {
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
            new RelationField({
              name: 'product_id',
              collectionId: prodCol.id,
              maxSelect: 1,
              required: true,
            }),
            new NumberField({ name: 'version' }),
            new TextField({ name: 'name', required: true }),
            new TextField({ name: 'description' }),
            new SelectField({
              name: 'status',
              values: ['rascunho', 'ativo', 'inativo'],
              maxSelect: 1,
            }),
            new TextField({ name: 'vigencia_inicial' }),
            new TextField({ name: 'vigencia_final' }),
            new TextField({ name: 'responsible' }),
            new TextField({ name: 'approval_date' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_prod_routes_product ON production_routes (product_id)',
            'CREATE INDEX idx_prod_routes_status ON production_routes (status)',
            'CREATE INDEX idx_prod_routes_version ON production_routes (version)',
          ],
        }),
      )
      if (!app.hasTable('production_routes'))
        throw new Error('Post-save check failed: production_routes not persisted')
    }
    var routeId = app.findCollectionByNameOrId('production_routes').id

    if (!app.hasTable('production_route_operations')) {
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
            new RelationField({
              name: 'route_id',
              collectionId: routeId,
              maxSelect: 1,
              required: true,
            }),
            new NumberField({ name: 'order' }),
            new TextField({ name: 'name', required: true }),
            new TextField({ name: 'description' }),
            new RelationField({ name: 'resource_id', collectionId: prCol.id, maxSelect: 1 }),
            new JSONField({ name: 'materials_consumed' }),
            new TextField({ name: 'tempo_setup' }),
            new TextField({ name: 'tempo_operacao' }),
            new TextField({ name: 'perda_prevista' }),
            new TextField({ name: 'responsible' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_route_ops_route ON production_route_operations (route_id)',
            'CREATE INDEX idx_route_ops_order ON production_route_operations (order)',
          ],
        }),
      )
      if (!app.hasTable('production_route_operations'))
        throw new Error('Post-save check failed: production_route_operations not persisted')
    }
  },
  (app) => {
    var cols = [
      'production_route_operations',
      'production_routes',
      'bom_components',
      'bom_versions',
    ]
    for (var i = 0; i < cols.length; i++) {
      if (app.hasTable(cols[i])) {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      }
    }
  },
)
