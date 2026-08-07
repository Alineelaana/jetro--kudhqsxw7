migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var poCol = app.findCollectionByNameOrId('production_orders')
    var resCol = app.findCollectionByNameOrId('production_resources')
    var prodCol = app.findCollectionByNameOrId('products')

    if (!poCol.fields.getByName('production_scenario'))
      poCol.fields.add(
        new SelectField({
          name: 'production_scenario',
          values: [
            'made_to_order',
            'make_to_stock',
            'batch',
            'continuous',
            'serial',
            'partial_outsourcing',
            'complete_outsourcing',
            'subassembly',
            'semi_finished',
            'multi_level',
          ],
          maxSelect: 1,
        }),
      )
    if (!poCol.fields.getByName('parent_order_id'))
      poCol.fields.add(new TextField({ name: 'parent_order_id' }))
    if (!poCol.fields.getByName('demand_id')) poCol.fields.add(new TextField({ name: 'demand_id' }))
    if (!poCol.fields.getByName('outsourcing_partner_id'))
      poCol.fields.add(new TextField({ name: 'outsourcing_partner_id' }))
    app.save(poCol)

    app.save(
      new Collection({
        name: 'industrial_demand',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'demand_number', type: 'text', required: true },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'quantity', type: 'number', required: true },
          { name: 'unit', type: 'text' },
          {
            name: 'demand_type',
            type: 'select',
            values: ['forecast', 'order', 'internal'],
            maxSelect: 1,
          },
          {
            name: 'scenario',
            type: 'select',
            values: ['made_to_order', 'make_to_stock', 'batch', 'continuous', 'serial'],
            maxSelect: 1,
          },
          { name: 'source', type: 'text' },
          { name: 'due_date', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['open', 'planned', 'fulfilled', 'cancelled'],
            maxSelect: 1,
          },
          { name: 'production_order_id', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_ind_demand_product ON industrial_demand (product_id)',
          'CREATE INDEX idx_ind_demand_status ON industrial_demand (status)',
        ],
      }),
    )

    var poId = app.findCollectionByNameOrId('production_orders').id
    var resId = app.findCollectionByNameOrId('production_resources').id

    app.save(
      new Collection({
        name: 'industrial_phases',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          {
            name: 'production_order_id',
            type: 'relation',
            collectionId: poId,
            maxSelect: 1,
            required: true,
          },
          { name: 'sequence', type: 'number', required: true },
          { name: 'operation_name', type: 'text', required: true },
          { name: 'work_center', type: 'text' },
          { name: 'resource_id', type: 'relation', collectionId: resId, maxSelect: 1 },
          { name: 'team_name', type: 'text' },
          { name: 'operator_name', type: 'text' },
          { name: 'expected_time_minutes', type: 'number' },
          { name: 'actual_time_minutes', type: 'number' },
          { name: 'setup_time_minutes', type: 'number' },
          {
            name: 'status',
            type: 'select',
            values: ['pending', 'in_progress', 'paused', 'completed', 'rework', 'skipped'],
            maxSelect: 1,
          },
          { name: 'consumption', type: 'json' },
          { name: 'losses', type: 'json' },
          {
            name: 'quality_status',
            type: 'select',
            values: ['pending', 'approved', 'rejected', 'rework', 'conditional'],
            maxSelect: 1,
          },
          { name: 'cost_summary', type: 'json' },
          { name: 'attachments', type: 'json' },
          { name: 'observations', type: 'text' },
          { name: 'started_at', type: 'text' },
          { name: 'completed_at', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_ind_phases_order ON industrial_phases (production_order_id)',
          'CREATE INDEX idx_ind_phases_status ON industrial_phases (status)',
          'CREATE INDEX idx_ind_phases_seq ON industrial_phases (production_order_id, sequence)',
        ],
      }),
    )

    var phaseId = app.findCollectionByNameOrId('industrial_phases').id

    app.save(
      new Collection({
        name: 'industrial_phase_costs',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          {
            name: 'phase_id',
            type: 'relation',
            collectionId: phaseId,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'cost_type',
            type: 'select',
            values: [
              'labor',
              'machine',
              'energy',
              'tools',
              'consumption',
              'materials',
              'services',
              'third_party',
              'losses',
              'reworks',
              'indirect',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'amount', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_ind_pcosts_phase ON industrial_phase_costs (phase_id)',
          'CREATE INDEX idx_ind_pcosts_type ON industrial_phase_costs (cost_type)',
        ],
      }),
    )

    console.log('0100: industrial GR flow schema created')
  },
  (app) => {
    var cols = ['industrial_phase_costs', 'industrial_phases', 'industrial_demand']
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
