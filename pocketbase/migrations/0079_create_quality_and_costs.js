migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var svCol = app.findCollectionByNameOrId('spec_values')

    app.save(
      new Collection({
        name: 'quality_parameters',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'modulo_origem',
            type: 'select',
            values: [
              'recebimento',
              'producao',
              'expedicao',
              'devolucao',
              'transporte',
              'engenharia',
            ],
            maxSelect: 1,
          },
          { name: 'spec_value_id', type: 'relation', collectionId: svCol.id, maxSelect: 1 },
          { name: 'min_value', type: 'text' },
          { name: 'max_value', type: 'text' },
          { name: 'target_value', type: 'text' },
          { name: 'unit', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_quality_params_modulo ON quality_parameters (modulo_origem)',
          'CREATE INDEX idx_quality_params_active ON quality_parameters (active)',
        ],
      }),
    )
    var qpId = app.findCollectionByNameOrId('quality_parameters').id

    app.save(
      new Collection({
        name: 'quality_inspections',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'item_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'batch_id', type: 'text' },
          { name: 'parameter_id', type: 'relation', collectionId: qpId, maxSelect: 1 },
          { name: 'spec_value_id', type: 'relation', collectionId: svCol.id, maxSelect: 1 },
          { name: 'result_value', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['aprovado', 'reprovado', 'aprovado_restricao', 'nova_analise'],
            maxSelect: 1,
          },
          {
            name: 'modulo_origem',
            type: 'select',
            values: [
              'recebimento',
              'producao',
              'expedicao',
              'devolucao',
              'transporte',
              'engenharia',
            ],
            maxSelect: 1,
          },
          { name: 'responsible', type: 'text' },
          { name: 'observations', type: 'text' },
          { name: 'inspection_date', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_quality_insp_item ON quality_inspections (item_id)',
          'CREATE INDEX idx_quality_insp_status ON quality_inspections (status)',
          'CREATE INDEX idx_quality_insp_modulo ON quality_inspections (modulo_origem)',
          'CREATE INDEX idx_quality_insp_batch ON quality_inspections (batch_id)',
        ],
      }),
    )

    var bvCol = app.findCollectionByNameOrId('bom_versions')
    var rtCol = app.findCollectionByNameOrId('production_routes')

    app.save(
      new Collection({
        name: 'industrial_costs',
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
          { name: 'bom_version_id', type: 'relation', collectionId: bvCol.id, maxSelect: 1 },
          { name: 'route_version_id', type: 'relation', collectionId: rtCol.id, maxSelect: 1 },
          { name: 'cost_type', type: 'select', values: ['padrao', 'realizado'], maxSelect: 1 },
          { name: 'version', type: 'number' },
          { name: 'cost_materia_prima', type: 'text' },
          { name: 'cost_embalagem', type: 'text' },
          { name: 'cost_mao_obra', type: 'text' },
          { name: 'cost_recurso', type: 'text' },
          { name: 'cost_energia', type: 'text' },
          { name: 'cost_perdas', type: 'text' },
          { name: 'cost_indiretos', type: 'text' },
          { name: 'cost_cambio', type: 'text' },
          { name: 'cost_landing', type: 'text' },
          { name: 'total_cost', type: 'text' },
          { name: 'unit_cost', type: 'text' },
          { name: 'deviations', type: 'json' },
          { name: 'responsible', type: 'text' },
          { name: 'calculation_date', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_ind_costs_item ON industrial_costs (item_id)',
          'CREATE INDEX idx_ind_costs_type ON industrial_costs (cost_type)',
          'CREATE INDEX idx_ind_costs_version ON industrial_costs (version)',
        ],
      }),
    )
  },
  (app) => {
    var cols = ['industrial_costs', 'quality_inspections', 'quality_parameters']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
