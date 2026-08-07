migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')

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
          {
            name: 'product_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'version', type: 'number' },
          { name: 'type', type: 'select', values: ['estrutura', 'formulacao'], maxSelect: 1 },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'ativo', 'inativo'],
            maxSelect: 1,
          },
          { name: 'vigencia_inicial', type: 'text' },
          { name: 'vigencia_final', type: 'text' },
          { name: 'rendimento', type: 'text' },
          { name: 'concentration', type: 'text' },
          { name: 'ph', type: 'text' },
          { name: 'density', type: 'text' },
          { name: 'temperature', type: 'text' },
          { name: 'mixing_sequence', type: 'text' },
          { name: 'tolerances', type: 'text' },
          { name: 'instructions', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'approval_date', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_bom_versions_product ON bom_versions (product_id)',
          'CREATE INDEX idx_bom_versions_status ON bom_versions (status)',
          'CREATE INDEX idx_bom_versions_type ON bom_versions (type)',
          'CREATE INDEX idx_bom_versions_version ON bom_versions (version)',
        ],
      }),
    )
    var bvId = app.findCollectionByNameOrId('bom_versions').id

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
          {
            name: 'bom_version_id',
            type: 'relation',
            collectionId: bvId,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'item_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'quantidade', type: 'text' },
          { name: 'unidade', type: 'text' },
          { name: 'perda_prevista', type: 'text' },
          { name: 'substituto_permitido', type: 'bool' },
          { name: 'substituto_item_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'ordem', type: 'number' },
          { name: 'observations', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_bom_comp_version ON bom_components (bom_version_id)',
          'CREATE INDEX idx_bom_comp_item ON bom_components (item_id)',
        ],
      }),
    )
  },
  (app) => {
    var cols = ['bom_components', 'bom_versions']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
