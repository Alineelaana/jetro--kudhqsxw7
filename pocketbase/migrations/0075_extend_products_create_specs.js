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
    app
      .db()
      .newQuery("UPDATE products SET item_type = 'Não Classificado' WHERE item_type IS NULL")
      .execute()
    app.db().newQuery('UPDATE products SET is_industrial = 0 WHERE is_industrial IS NULL').execute()

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
          { name: 'name', type: 'text', required: true },
          { name: 'item_category', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_spec_groups_name ON spec_groups (name)',
          'CREATE INDEX idx_spec_groups_active ON spec_groups (active)',
        ],
      }),
    )
    var sgId = app.findCollectionByNameOrId('spec_groups').id

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
          { name: 'group_id', type: 'relation', collectionId: sgId, maxSelect: 1 },
          { name: 'name', type: 'text', required: true },
          { name: 'label', type: 'text', required: true },
          {
            name: 'type',
            type: 'select',
            values: ['text', 'number', 'boolean', 'select', 'date'],
            maxSelect: 1,
          },
          { name: 'unit', type: 'text' },
          { name: 'required', type: 'bool' },
          { name: 'options', type: 'json' },
          { name: 'order', type: 'number' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_spec_attrs_group ON spec_attributes (group_id)',
          'CREATE INDEX idx_spec_attrs_active ON spec_attributes (active)',
        ],
      }),
    )
    var saId = app.findCollectionByNameOrId('spec_attributes').id

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
          {
            name: 'item_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'attribute_id',
            type: 'relation',
            collectionId: saId,
            maxSelect: 1,
            required: true,
          },
          { name: 'value', type: 'text' },
          { name: 'version', type: 'number' },
          { name: 'vigencia_inicial', type: 'text' },
          { name: 'vigencia_final', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'ativo', 'inativo'],
            maxSelect: 1,
          },
          { name: 'responsible', type: 'text' },
          { name: 'approval_date', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_spec_values_item ON spec_values (item_id)',
          'CREATE INDEX idx_spec_values_attr ON spec_values (attribute_id)',
          'CREATE INDEX idx_spec_values_status ON spec_values (status)',
          'CREATE INDEX idx_spec_values_version ON spec_values (version)',
        ],
      }),
    )

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
          { name: 'code', type: 'text' },
          { name: 'name', type: 'text', required: true },
          {
            name: 'tipo',
            type: 'select',
            values: [
              'linha_producao',
              'maquina',
              'equipamento',
              'celula',
              'estacao',
              'centro_produtivo',
            ],
            maxSelect: 1,
          },
          { name: 'description', type: 'text' },
          { name: 'capacity_per_hour', type: 'number' },
          { name: 'active', type: 'bool' },
          { name: 'responsible_user', type: 'text' },
          { name: 'modulo_origem', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_prod_res_tipo ON production_resources (tipo)',
          'CREATE INDEX idx_prod_res_active ON production_resources (active)',
          "CREATE UNIQUE INDEX idx_prod_res_code ON production_resources (code) WHERE code != ''",
        ],
      }),
    )

    try {
      var settingsCol = app.findCollectionByNameOrId('settings')
      try {
        app.findFirstRecordByData('settings', 'key', 'item_type_options')
      } catch (_) {
        var r = new Record(settingsCol)
        r.set('key', 'item_type_options')
        r.set(
          'value',
          JSON.stringify([
            'Não Classificado',
            'Matéria-prima',
            'Embalagem',
            'Produto Acabado',
            'Insumo',
            'Componente',
            'Subproduto',
          ]),
        )
        app.save(r)
      }
    } catch (_) {}
  },
  (app) => {
    var prodCol = app.findCollectionByNameOrId('products')
    var itField = prodCol.fields.getByName('item_type')
    if (itField) prodCol.fields.remove(itField)
    var iiField = prodCol.fields.getByName('is_industrial')
    if (iiField) prodCol.fields.remove(iiField)
    app.save(prodCol)
    var cols = ['spec_values', 'spec_attributes', 'spec_groups', 'production_resources']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
