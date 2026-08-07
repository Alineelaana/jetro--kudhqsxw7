migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')
    var resCol = app.findCollectionByNameOrId('production_resources')
    var poCol = app.findCollectionByNameOrId('production_orders')
    var qpCol = app.findCollectionByNameOrId('quality_parameters')
    var bvCol = app.findCollectionByNameOrId('bom_versions')

    app.save(
      new Collection({
        name: 'industrial_calendars',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'resource_id', type: 'relation', collectionId: resCol.id, maxSelect: 1 },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
          { name: 'work_days', type: 'json' },
          { name: 'active', type: 'bool' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_ind_cal_resource ON industrial_calendars (resource_id)'],
      }),
    )

    app.save(
      new Collection({
        name: 'industrial_shifts',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          {
            name: 'calendar_id',
            type: 'relation',
            collectionId: app.findCollectionByNameOrId('industrial_calendars').id,
            maxSelect: 1,
            required: true,
          },
          { name: 'name', type: 'text', required: true },
          { name: 'start_time', type: 'text' },
          { name: 'end_time', type: 'text' },
          { name: 'break_start', type: 'text' },
          { name: 'break_end', type: 'text' },
          { name: 'capacity_hours', type: 'number' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_ind_shift_calendar ON industrial_shifts (calendar_id)'],
      }),
    )

    app.save(
      new Collection({
        name: 'industrial_apontamentos',
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
            collectionId: poCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'product_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'resource_id', type: 'relation', collectionId: resCol.id, maxSelect: 1 },
          { name: 'operator_name', type: 'text' },
          { name: 'operation_name', type: 'text' },
          {
            name: 'type',
            type: 'select',
            values: ['inicio', 'pausa', 'retomada', 'producao', 'fim'],
            maxSelect: 1,
          },
          { name: 'quantity_produced', type: 'number' },
          { name: 'quantity_rejected', type: 'number' },
          { name: 'start_time', type: 'date' },
          { name: 'end_time', type: 'date' },
          { name: 'duration_minutes', type: 'number' },
          { name: 'notes', type: 'text' },
          { name: 'lot_number', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_ind_apont_order ON industrial_apontamentos (production_order_id)',
          'CREATE INDEX idx_ind_apont_type ON industrial_apontamentos (type)',
          'CREATE INDEX idx_ind_apont_created ON industrial_apontamentos (created)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'quality_checklists',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'product_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'bom_version_id', type: 'relation', collectionId: bvCol.id, maxSelect: 1 },
          { name: 'items', type: 'json' },
          { name: 'active', type: 'bool' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_qc_product ON quality_checklists (product_id)'],
      }),
    )

    app.save(
      new Collection({
        name: 'quality_non_conformities',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'production_order_id', type: 'relation', collectionId: poCol.id, maxSelect: 1 },
          { name: 'product_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'parameter_id', type: 'relation', collectionId: qpCol.id, maxSelect: 1 },
          { name: 'description', type: 'text', required: true },
          {
            name: 'severity',
            type: 'select',
            values: ['baixa', 'media', 'alta', 'critica'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: ['aberta', 'em_analise', 'acao_definida', 'resolvida', 'cancelada'],
            maxSelect: 1,
          },
          { name: 'quantity_affected', type: 'number' },
          { name: 'root_cause', type: 'text' },
          { name: 'corrective_action', type: 'text' },
          { name: 'lot_number', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'resolution_date', type: 'date' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_nc_order ON quality_non_conformities (production_order_id)',
          'CREATE INDEX idx_nc_status ON quality_non_conformities (status)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'industrial_kpis',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'resource_id', type: 'relation', collectionId: resCol.id, maxSelect: 1 },
          { name: 'production_order_id', type: 'relation', collectionId: poCol.id, maxSelect: 1 },
          { name: 'period', type: 'text' },
          { name: 'oee', type: 'number' },
          { name: 'availability', type: 'number' },
          { name: 'performance', type: 'number' },
          { name: 'quality_rate', type: 'number' },
          { name: 'efficiency', type: 'number' },
          { name: 'productivity', type: 'number' },
          { name: 'lead_time_minutes', type: 'number' },
          { name: 'setup_time_minutes', type: 'number' },
          { name: 'planned_quantity', type: 'number' },
          { name: 'produced_quantity', type: 'number' },
          { name: 'rejected_quantity', type: 'number' },
          { name: 'cost_per_unit', type: 'text' },
          { name: 'responsible', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_kpi_resource ON industrial_kpis (resource_id)',
          'CREATE INDEX idx_kpi_period ON industrial_kpis (period)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'maintenance_schedules',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          {
            name: 'resource_id',
            type: 'relation',
            collectionId: resCol.id,
            maxSelect: 1,
            required: true,
          },
          {
            name: 'type',
            type: 'select',
            values: ['preventiva', 'corretiva', 'preditiva'],
            maxSelect: 1,
          },
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'frequency_days', type: 'number' },
          { name: 'last_maintenance', type: 'date' },
          { name: 'next_maintenance', type: 'date' },
          {
            name: 'status',
            type: 'select',
            values: ['agendada', 'em_andamento', 'concluida', 'atrasada', 'cancelada'],
            maxSelect: 1,
          },
          {
            name: 'impact_on_production',
            type: 'select',
            values: ['nenhum', 'baixo', 'medio', 'alto', 'critico'],
            maxSelect: 1,
          },
          { name: 'estimated_downtime_hours', type: 'number' },
          { name: 'responsible', type: 'text' },
          { name: 'cost', type: 'text' },
          { name: 'notes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_maint_resource ON maintenance_schedules (resource_id)',
          'CREATE INDEX idx_maint_status ON maintenance_schedules (status)',
          'CREATE INDEX idx_maint_next ON maintenance_schedules (next_maintenance)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'industrial_traceability',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'production_order_id', type: 'relation', collectionId: poCol.id, maxSelect: 1 },
          { name: 'product_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'raw_material_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'lot_number', type: 'text' },
          { name: 'serial_number', type: 'text' },
          { name: 'operator_name', type: 'text' },
          { name: 'resource_id', type: 'relation', collectionId: resCol.id, maxSelect: 1 },
          { name: 'inspection_id', type: 'text' },
          { name: 'quantity', type: 'number' },
          { name: 'direction', type: 'select', values: ['entrada', 'saida'], maxSelect: 1 },
          { name: 'timestamp', type: 'date' },
          { name: 'notes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_trace_order ON industrial_traceability (production_order_id)',
          'CREATE INDEX idx_trace_lot ON industrial_traceability (lot_number)',
          'CREATE INDEX idx_trace_product ON industrial_traceability (product_id)',
        ],
      }),
    )
  },
  (app) => {
    var cols = [
      'industrial_traceability',
      'maintenance_schedules',
      'industrial_kpis',
      'quality_non_conformities',
      'quality_checklists',
      'industrial_apontamentos',
      'industrial_shifts',
      'industrial_calendars',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
