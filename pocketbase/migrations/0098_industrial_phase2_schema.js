migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var prodCol = app.findCollectionByNameOrId('products')

    var poCol = app.findCollectionByNameOrId('production_orders')
    if (!poCol.fields.getByName('order_type')) {
      poCol.fields.add(
        new SelectField({
          name: 'order_type',
          values: ['producao', 'rework', 'piloto', 'complementar', 'terceirizada'],
          maxSelect: 1,
        }),
      )
    }
    var poStatus = poCol.fields.getByName('status')
    if (poStatus) poCol.fields.remove(poStatus)
    poCol.fields.add(
      new SelectField({
        name: 'status',
        values: [
          'rascunho',
          'planejada',
          'liberada',
          'em_producao',
          'parcial',
          'inspecao',
          'concluida',
          'fechada',
          'cancelada',
        ],
        maxSelect: 1,
        required: true,
      }),
    )
    if (!poCol.fields.getByName('released_by'))
      poCol.fields.add(new TextField({ name: 'released_by' }))
    if (!poCol.fields.getByName('released_at'))
      poCol.fields.add(new TextField({ name: 'released_at' }))
    if (!poCol.fields.getByName('closed_by')) poCol.fields.add(new TextField({ name: 'closed_by' }))
    if (!poCol.fields.getByName('closed_at')) poCol.fields.add(new TextField({ name: 'closed_at' }))
    if (!poCol.fields.getByName('inspection_result'))
      poCol.fields.add(
        new SelectField({
          name: 'inspection_result',
          values: ['aprovado', 'reprovado', 'aprovado_restricao'],
          maxSelect: 1,
        }),
      )
    app.save(poCol)

    var apCol = app.findCollectionByNameOrId('industrial_apontamentos')
    var apType = apCol.fields.getByName('type')
    if (apType) apCol.fields.remove(apType)
    apCol.fields.add(
      new SelectField({
        name: 'type',
        values: [
          'inicio',
          'pausa',
          'retomada',
          'producao',
          'fim',
          'consumo',
          'parada',
          'manutencao',
          'refugo',
          'perda',
          'qualidade',
          'rework',
        ],
        maxSelect: 1,
      }),
    )
    if (!apCol.fields.getByName('team_name')) apCol.fields.add(new TextField({ name: 'team_name' }))
    if (!apCol.fields.getByName('stoppage_reason'))
      apCol.fields.add(new TextField({ name: 'stoppage_reason' }))
    if (!apCol.fields.getByName('attachments'))
      apCol.fields.add(new JSONField({ name: 'attachments' }))
    app.save(apCol)

    var kpiCol = app.findCollectionByNameOrId('industrial_kpis')
    var kpiNumFields = [
      'mtbf_hours',
      'mttr_hours',
      'machine_efficiency',
      'line_efficiency',
      'cell_efficiency',
      'forecast_production',
      'actual_production',
      'operator_efficiency',
      'avg_production_time',
      'bottleneck_count',
    ]
    for (var k = 0; k < kpiNumFields.length; k++) {
      if (!kpiCol.fields.getByName(kpiNumFields[k]))
        kpiCol.fields.add(new NumberField({ name: kpiNumFields[k] }))
    }
    if (!kpiCol.fields.getByName('cost_per_order'))
      kpiCol.fields.add(new TextField({ name: 'cost_per_order' }))
    app.save(kpiCol)

    var bvCol = app.findCollectionByNameOrId('bom_versions')
    if (!bvCol.fields.getByName('revision_number'))
      bvCol.fields.add(new NumberField({ name: 'revision_number' }))
    if (!bvCol.fields.getByName('revision_status'))
      bvCol.fields.add(
        new SelectField({
          name: 'revision_status',
          values: ['rascunho', 'em_aprovacao', 'aprovada', 'rejeitada', 'obsoleta'],
          maxSelect: 1,
        }),
      )
    if (!bvCol.fields.getByName('approved_by'))
      bvCol.fields.add(new TextField({ name: 'approved_by' }))
    if (!bvCol.fields.getByName('approval_date'))
      bvCol.fields.add(new TextField({ name: 'approval_date' }))
    if (!bvCol.fields.getByName('parent_version_id'))
      bvCol.fields.add(new TextField({ name: 'parent_version_id' }))
    if (!bvCol.fields.getByName('obsolete_date'))
      bvCol.fields.add(new TextField({ name: 'obsolete_date' }))
    if (!bvCol.fields.getByName('company')) bvCol.fields.add(new TextField({ name: 'company' }))
    if (!bvCol.fields.getByName('branch')) bvCol.fields.add(new TextField({ name: 'branch' }))
    if (!bvCol.fields.getByName('change_reason'))
      bvCol.fields.add(new TextField({ name: 'change_reason' }))
    app.save(bvCol)

    var roCol = app.findCollectionByNameOrId('production_route_operations')
    if (!roCol.fields.getByName('requires_inspection'))
      roCol.fields.add(new BoolField({ name: 'requires_inspection' }))
    if (!roCol.fields.getByName('requires_apontamento'))
      roCol.fields.add(new BoolField({ name: 'requires_apontamento' }))
    if (!roCol.fields.getByName('closing_behavior'))
      roCol.fields.add(
        new SelectField({
          name: 'closing_behavior',
          values: ['automatica', 'manual', 'com_inspecao'],
          maxSelect: 1,
        }),
      )
    if (!roCol.fields.getByName('tool_id')) roCol.fields.add(new TextField({ name: 'tool_id' }))
    if (!roCol.fields.getByName('device_id')) roCol.fields.add(new TextField({ name: 'device_id' }))
    app.save(roCol)

    var bcCol = app.findCollectionByNameOrId('bom_components')
    if (!bcCol.fields.getByName('equivalence_item_id'))
      bcCol.fields.add(
        new RelationField({ name: 'equivalence_item_id', collectionId: prodCol.id, maxSelect: 1 }),
      )
    if (!bcCol.fields.getByName('alternative_item_id'))
      bcCol.fields.add(
        new RelationField({ name: 'alternative_item_id', collectionId: prodCol.id, maxSelect: 1 }),
      )
    if (!bcCol.fields.getByName('is_obsolete'))
      bcCol.fields.add(new BoolField({ name: 'is_obsolete' }))
    if (!bcCol.fields.getByName('obsolete_date'))
      bcCol.fields.add(new TextField({ name: 'obsolete_date' }))
    app.save(bcCol)

    app.save(
      new Collection({
        name: 'engineering_change_requests',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'ecr_number', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'reason', type: 'text' },
          {
            name: 'type',
            type: 'select',
            values: ['melhoria', 'correcao', 'novo_produto', 'obsolescencia', 'seguranca', 'custo'],
            maxSelect: 1,
          },
          {
            name: 'priority',
            type: 'select',
            values: ['baixa', 'media', 'alta', 'critica'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            values: [
              'rascunho',
              'em_analise',
              'aprovado',
              'rejeitado',
              'implementado',
              'cancelado',
            ],
            maxSelect: 1,
          },
          { name: 'product_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'bom_version_id', type: 'text' },
          { name: 'requested_by', type: 'text' },
          { name: 'analyzed_by', type: 'text' },
          { name: 'analysis_notes', type: 'text' },
          { name: 'impact_assessment', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_ecr_status ON engineering_change_requests (status)',
          'CREATE INDEX idx_ecr_product ON engineering_change_requests (product_id)',
          'CREATE INDEX idx_ecr_number ON engineering_change_requests (ecr_number)',
        ],
      }),
    )
    var ecrId = app.findCollectionByNameOrId('engineering_change_requests').id

    app.save(
      new Collection({
        name: 'engineering_change_orders',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'eco_number', type: 'text', required: true },
          { name: 'ecr_id', type: 'relation', collectionId: ecrId, maxSelect: 1 },
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'change_details', type: 'json' },
          {
            name: 'status',
            type: 'select',
            values: [
              'rascunho',
              'em_aprovacao',
              'aprovado',
              'rejeitado',
              'em_implementacao',
              'implementado',
              'cancelado',
            ],
            maxSelect: 1,
          },
          { name: 'approved_by', type: 'text' },
          { name: 'approval_date', type: 'text' },
          { name: 'implemented_by', type: 'text' },
          { name: 'implementation_date', type: 'text' },
          { name: 'effective_date', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_eco_status ON engineering_change_orders (status)',
          'CREATE INDEX idx_eco_ecr ON engineering_change_orders (ecr_id)',
          'CREATE INDEX idx_eco_number ON engineering_change_orders (eco_number)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'engineering_documents',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'product_id', type: 'relation', collectionId: prodCol.id, maxSelect: 1 },
          { name: 'bom_version_id', type: 'text' },
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          {
            name: 'doc_type',
            type: 'select',
            values: ['desenho', 'especificacao', 'procedimento', 'manual', 'certificado', 'outro'],
            maxSelect: 1,
          },
          { name: 'file_url', type: 'text' },
          { name: 'version', type: 'text' },
          { name: 'uploaded_by', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_eng_docs_product ON engineering_documents (product_id)',
          'CREATE INDEX idx_eng_docs_type ON engineering_documents (doc_type)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'master_production_plans',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'plan_number', type: 'text', required: true },
          {
            name: 'product_id',
            type: 'relation',
            collectionId: prodCol.id,
            maxSelect: 1,
            required: true,
          },
          { name: 'period', type: 'text' },
          { name: 'forecast_quantity', type: 'number' },
          { name: 'actual_quantity', type: 'number' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'aprovado', 'em_execucao', 'concluido', 'cancelado'],
            maxSelect: 1,
          },
          { name: 'items', type: 'json' },
          { name: 'responsible', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_mpp_product ON master_production_plans (product_id)',
          'CREATE INDEX idx_mpp_status ON master_production_plans (status)',
          'CREATE INDEX idx_mpp_period ON master_production_plans (period)',
        ],
      }),
    )

    var poId = app.findCollectionByNameOrId('production_orders').id
    var resId = app.findCollectionByNameOrId('production_resources').id
    app.save(
      new Collection({
        name: 'aps_schedules',
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
          { name: 'resource_id', type: 'relation', collectionId: resId, maxSelect: 1 },
          { name: 'operation_name', type: 'text' },
          { name: 'scheduled_start', type: 'date' },
          { name: 'scheduled_end', type: 'date' },
          { name: 'duration_minutes', type: 'number' },
          {
            name: 'status',
            type: 'select',
            values: [
              'planejado',
              'confirmado',
              'em_execucao',
              'concluido',
              'reagendado',
              'cancelado',
            ],
            maxSelect: 1,
          },
          { name: 'sequence', type: 'number' },
          { name: 'constraints', type: 'json' },
          { name: 'simulation_id', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_aps_order ON aps_schedules (production_order_id)',
          'CREATE INDEX idx_aps_resource ON aps_schedules (resource_id)',
          'CREATE INDEX idx_aps_status ON aps_schedules (status)',
          'CREATE INDEX idx_aps_start ON aps_schedules (scheduled_start)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'production_simulations',
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
            name: 'scenario_type',
            type: 'select',
            values: ['capacidade', 'cronograma', 'custo', 'recurso', 'demanda'],
            maxSelect: 1,
          },
          { name: 'parameters', type: 'json' },
          { name: 'results', type: 'json' },
          {
            name: 'status',
            type: 'select',
            values: ['rascunho', 'executando', 'concluido', 'erro'],
            maxSelect: 1,
          },
          { name: 'responsible', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_sim_status ON production_simulations (status)',
          'CREATE INDEX idx_sim_type ON production_simulations (scenario_type)',
        ],
      }),
    )

    console.log('0098: industrial phase2 schema created')
  },
  (app) => {
    var cols = [
      'production_simulations',
      'aps_schedules',
      'master_production_plans',
      'engineering_documents',
      'engineering_change_orders',
      'engineering_change_requests',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
