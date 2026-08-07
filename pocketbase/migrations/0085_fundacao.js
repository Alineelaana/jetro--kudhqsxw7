migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    var prodCol = app.findCollectionByNameOrId('products')

    if (!prodCol.fields.getByName('item_type')) {
      prodCol.fields.add(
        new SelectField({
          name: 'item_type',
          values: [
            'Não Classificado',
            'Matéria-prima',
            'Embalagem',
            'Produto Acabado',
            'Insumo',
            'Componente',
            'Subproduto',
          ],
          maxSelect: 1,
        }),
      )
    }
    if (!prodCol.fields.getByName('is_industrial')) {
      prodCol.fields.add(new BoolField({ name: 'is_industrial' }))
    }
    app.save(prodCol)

    var prodCheck = app.findCollectionByNameOrId('products')
    if (!prodCheck.fields.getByName('item_type'))
      throw new Error('Post-save check failed: item_type missing on products')
    if (!prodCheck.fields.getByName('is_industrial'))
      throw new Error('Post-save check failed: is_industrial missing on products')

    var umCol = app.findCollectionByNameOrId('unidades_medida')
    if (!umCol.fields.getByName('is_industrial')) {
      umCol.fields.add(new BoolField({ name: 'is_industrial' }))
    }
    app.save(umCol)

    if (!app.hasTable('spec_groups')) {
      app.save(
        new Collection({
          name: 'spec_groups',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new TextField({ name: 'name', required: true }),
            new TextField({ name: 'item_category' }),
            new TextField({ name: 'description' }),
            new BoolField({ name: 'active' }),
            new TextField({ name: 'responsible' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_spec_groups_name ON spec_groups (name)',
            'CREATE INDEX idx_spec_groups_active ON spec_groups (active)',
          ],
        }),
      )
      if (!app.hasTable('spec_groups'))
        throw new Error('Post-save check failed: spec_groups not persisted')
    }
    var sgId = app.findCollectionByNameOrId('spec_groups').id

    if (!app.hasTable('spec_attributes')) {
      app.save(
        new Collection({
          name: 'spec_attributes',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new RelationField({ name: 'group_id', collectionId: sgId, maxSelect: 1 }),
            new TextField({ name: 'name', required: true }),
            new TextField({ name: 'label', required: true }),
            new SelectField({
              name: 'type',
              values: ['text', 'number', 'boolean', 'select', 'date'],
              maxSelect: 1,
            }),
            new TextField({ name: 'unit' }),
            new BoolField({ name: 'required' }),
            new JSONField({ name: 'options' }),
            new NumberField({ name: 'order' }),
            new BoolField({ name: 'active' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_spec_attrs_group ON spec_attributes (group_id)',
            'CREATE INDEX idx_spec_attrs_active ON spec_attributes (active)',
          ],
        }),
      )
      if (!app.hasTable('spec_attributes'))
        throw new Error('Post-save check failed: spec_attributes not persisted')
    }
    var saId = app.findCollectionByNameOrId('spec_attributes').id

    if (!app.hasTable('spec_values')) {
      app.save(
        new Collection({
          name: 'spec_values',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new RelationField({
              name: 'item_id',
              collectionId: prodCol.id,
              maxSelect: 1,
              required: true,
            }),
            new RelationField({
              name: 'attribute_id',
              collectionId: saId,
              maxSelect: 1,
              required: true,
            }),
            new TextField({ name: 'value' }),
            new NumberField({ name: 'version' }),
            new TextField({ name: 'vigencia_inicial' }),
            new TextField({ name: 'vigencia_final' }),
            new SelectField({
              name: 'status',
              values: ['rascunho', 'ativo', 'inativo'],
              maxSelect: 1,
            }),
            new TextField({ name: 'responsible' }),
            new TextField({ name: 'approval_date' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_spec_values_item ON spec_values (item_id)',
            'CREATE INDEX idx_spec_values_attr ON spec_values (attribute_id)',
            'CREATE INDEX idx_spec_values_status ON spec_values (status)',
            'CREATE INDEX idx_spec_values_version ON spec_values (version)',
          ],
        }),
      )
      if (!app.hasTable('spec_values'))
        throw new Error('Post-save check failed: spec_values not persisted')
    }

    if (!app.hasTable('production_resources')) {
      app.save(
        new Collection({
          name: 'production_resources',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new TextField({ name: 'code' }),
            new TextField({ name: 'name', required: true }),
            new SelectField({
              name: 'tipo',
              values: [
                'linha_producao',
                'maquina',
                'equipamento',
                'celula',
                'estacao',
                'centro_produtivo',
              ],
              maxSelect: 1,
            }),
            new TextField({ name: 'description' }),
            new NumberField({ name: 'capacity_per_hour' }),
            new BoolField({ name: 'active' }),
            new TextField({ name: 'responsible_user' }),
            new TextField({ name: 'modulo_origem' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_prod_res_tipo ON production_resources (tipo)',
            'CREATE INDEX idx_prod_res_active ON production_resources (active)',
            "CREATE UNIQUE INDEX idx_prod_res_code ON production_resources (code) WHERE code != ''",
          ],
        }),
      )
      if (!app.hasTable('production_resources'))
        throw new Error('Post-save check failed: production_resources not persisted')
    }

    if (!app.hasTable('unit_conversions')) {
      app.save(
        new Collection({
          name: 'unit_conversions',
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: [
            new TextField({ name: 'from_unit', required: true }),
            new TextField({ name: 'to_unit', required: true }),
            new NumberField({ name: 'factor', required: true }),
            new SelectField({ name: 'scope', values: ['global', 'item'], maxSelect: 1 }),
            new RelationField({ name: 'item_id', collectionId: prodCol.id, maxSelect: 1 }),
            new NumberField({ name: 'version' }),
            new TextField({ name: 'vigencia_inicial' }),
            new TextField({ name: 'vigencia_final' }),
            new BoolField({ name: 'active' }),
            new TextField({ name: 'responsible' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_unit_conv_scope ON unit_conversions (scope)',
            'CREATE INDEX idx_unit_conv_item ON unit_conversions (item_id)',
            'CREATE INDEX idx_unit_conv_active ON unit_conversions (active)',
            'CREATE INDEX idx_unit_conv_units ON unit_conversions (from_unit, to_unit)',
          ],
        }),
      )
      if (!app.hasTable('unit_conversions'))
        throw new Error('Post-save check failed: unit_conversions not persisted')
    }
  },
  (app) => {
    var cols = [
      'unit_conversions',
      'spec_values',
      'spec_attributes',
      'spec_groups',
      'production_resources',
    ]
    for (var i = 0; i < cols.length; i++) {
      if (app.hasTable(cols[i])) {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      }
    }
  },
)
