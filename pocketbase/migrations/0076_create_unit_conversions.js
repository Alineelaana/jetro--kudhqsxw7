migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var umCol = app.findCollectionByNameOrId('unidades_medida')

    if (!umCol.fields.getByName('is_industrial')) {
      umCol.fields.add(new BoolField({ name: 'is_industrial' }))
    }
    app.save(umCol)

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
          { name: 'from_unit', type: 'text', required: true },
          { name: 'to_unit', type: 'text', required: true },
          { name: 'factor', type: 'number', required: true },
          { name: 'scope', type: 'select', values: ['global', 'item'], maxSelect: 1 },
          { name: 'item_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'version', type: 'number' },
          { name: 'vigencia_inicial', type: 'text' },
          { name: 'vigencia_final', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_unit_conv_scope ON unit_conversions (scope)',
          'CREATE INDEX idx_unit_conv_item ON unit_conversions (item_id)',
          'CREATE INDEX idx_unit_conv_active ON unit_conversions (active)',
          'CREATE INDEX idx_unit_conv_units ON unit_conversions (from_unit, to_unit)',
        ],
      }),
    )
  },
  (app) => {
    try {
      var umCol = app.findCollectionByNameOrId('unidades_medida')
      var f = umCol.fields.getByName('is_industrial')
      if (f) umCol.fields.remove(f)
      app.save(umCol)
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('unit_conversions'))
    } catch (_) {}
  },
)
