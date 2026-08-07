migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var svCol = app.findCollectionByNameOrId('spec_values')
    var bvCol = app.findCollectionByNameOrId('bom_versions')
    var rtCol = app.findCollectionByNameOrId('production_routes')

    if (!app.hasTable('quality_parameters')) {
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
            new TextField({ name: 'name', required: true }),
            new TextField({ name: 'description' }),
            new SelectField({
              name: 'modulo_origem',
              values: [
                'recebimento',
                'producao',
                'expedicao',
                'devolucao',
                'transporte',
                'engenharia',
              ],
              maxSelect: 1,
            }),
            new RelationField({ name: 'spec_value_id', collectionId: svCol.id, maxSelect: 1 }),
            new TextField({ name: 'min_value' }),
            new TextField({ name: 'max_value' }),
            new TextField({ name: 'target_value' }),
            new TextField({ name: 'unit' }),
            new BoolField({ name: 'active' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_quality_params_modulo ON quality_parameters (modulo_origem)',
            'CREATE INDEX idx_quality_params_active ON quality_parameters (active)',
          ],
        }),
      )
      if (!app.hasTable('quality_parameters'))
        throw new Error('Post-save check failed: quality_parameters not persisted')
    }
    var qpId = app.findCollectionByNameOrId('quality_parameters').id

    if (!app.hasTable('quality_inspections')) {
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
            new RelationField({ name: 'item_id', collectionId: prodCol.id, maxSelect: 1 }),
            new TextField({ name: 'batch_id' }),
            new RelationField({ name: 'parameter_id', collectionId: qpId, maxSelect: 1 }),
            new RelationField({ name: 'spec_value_id', collectionId: svCol.id, maxSelect: 1 }),
            new TextField({ name: 'result_value' }),
            new SelectField({
              name: 'status',
              values: ['aprovado', 'reprovado', 'aprovado_restricao', 'nova_analise'],
              maxSelect: 1,
            }),
            new SelectField({
              name: 'modulo_origem',
              values: [
                'recebimento',
                'producao',
                'expedicao',
                'devolucao',
                'transporte',
                'engenharia',
              ],
              maxSelect: 1,
            }),
            new TextField({ name: 'responsible' }),
            new TextField({ name: 'observations' }),
            new TextField({ name: 'inspection_date' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_quality_insp_item ON quality_inspections (item_id)',
            'CREATE INDEX idx_quality_insp_status ON quality_inspections (status)',
            'CREATE INDEX idx_quality_insp_modulo ON quality_inspections (modulo_origem)',
            'CREATE INDEX idx_quality_insp_batch ON quality_inspections (batch_id)',
          ],
        }),
      )
      if (!app.hasTable('quality_inspections'))
        throw new Error('Post-save check failed: quality_inspections not persisted')
    }

    if (!app.hasTable('industrial_costs')) {
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
            new RelationField({
              name: 'item_id',
              collectionId: prodCol.id,
              maxSelect: 1,
              required: true,
            }),
            new RelationField({ name: 'bom_version_id', collectionId: bvCol.id, maxSelect: 1 }),
            new RelationField({ name: 'route_version_id', collectionId: rtCol.id, maxSelect: 1 }),
            new SelectField({ name: 'cost_type', values: ['padrao', 'realizado'], maxSelect: 1 }),
            new NumberField({ name: 'version' }),
            new TextField({ name: 'cost_materia_prima' }),
            new TextField({ name: 'cost_embalagem' }),
            new TextField({ name: 'cost_mao_obra' }),
            new TextField({ name: 'cost_recurso' }),
            new TextField({ name: 'cost_energia' }),
            new TextField({ name: 'cost_perdas' }),
            new TextField({ name: 'cost_indiretos' }),
            new TextField({ name: 'cost_cambio' }),
            new TextField({ name: 'cost_landing' }),
            new TextField({ name: 'total_cost' }),
            new TextField({ name: 'unit_cost' }),
            new JSONField({ name: 'deviations' }),
            new TextField({ name: 'responsible' }),
            new TextField({ name: 'calculation_date' }),
            new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
            new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
          ],
          indexes: [
            'CREATE INDEX idx_ind_costs_item ON industrial_costs (item_id)',
            'CREATE INDEX idx_ind_costs_type ON industrial_costs (cost_type)',
            'CREATE INDEX idx_ind_costs_version ON industrial_costs (version)',
          ],
        }),
      )
      if (!app.hasTable('industrial_costs'))
        throw new Error('Post-save check failed: industrial_costs not persisted')
    }
  },
  (app) => {
    var cols = ['industrial_costs', 'quality_inspections', 'quality_parameters']
    for (var i = 0; i < cols.length; i++) {
      if (app.hasTable(cols[i])) {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      }
    }
  },
)
