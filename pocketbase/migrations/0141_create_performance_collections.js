migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    app.save(
      new Collection({
        name: 'performance_kpis',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'code', type: 'text', required: true },
          { name: 'name', type: 'text', required: true },
          {
            name: 'module',
            type: 'select',
            values: [
              'comercial',
              'financeiro',
              'fiscal',
              'compras',
              'estoque',
              'logistica',
              'producao',
              'marketing',
              'rh',
              'ti',
              'administrativo',
              'estrategico',
              'geral',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'category', type: 'text' },
          { name: 'formula_source', type: 'text' },
          { name: 'unit', type: 'text' },
          {
            name: 'direction',
            type: 'select',
            values: ['higher_is_better', 'lower_is_better'],
            maxSelect: 1,
          },
          { name: 'weight', type: 'number' },
          {
            name: 'periodicity',
            type: 'select',
            values: ['diaria', 'semanal', 'mensal', 'anual'],
            maxSelect: 1,
          },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_kpis_module ON performance_kpis (module)',
          'CREATE INDEX idx_perf_kpis_code ON performance_kpis (code)',
          'CREATE INDEX idx_perf_kpis_active ON performance_kpis (active)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_scores',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          {
            name: 'entity_type',
            type: 'select',
            values: [
              'empresa',
              'filial',
              'departamento',
              'equipe',
              'cargo',
              'gestor',
              'colaborador',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_name', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'period', type: 'date' },
          { name: 'score', type: 'number', min: 0, max: 100 },
          { name: 'components', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_scores_entity ON performance_scores (entity_type)',
          'CREATE INDEX idx_perf_scores_eid ON performance_scores (entity_id)',
          'CREATE INDEX idx_perf_scores_period ON performance_scores (period)',
          'CREATE INDEX idx_perf_scores_co ON performance_scores (company)',
          'CREATE INDEX idx_perf_scores_br ON performance_scores (branch)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_alerts',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: R,
        deleteRule: SA,
        fields: [
          { name: 'module', type: 'text' },
          { name: 'entity_type', type: 'text' },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_name', type: 'text' },
          {
            name: 'severity',
            type: 'select',
            values: ['info', 'warning', 'critical'],
            maxSelect: 1,
          },
          { name: 'message', type: 'text' },
          { name: 'reason', type: 'text' },
          { name: 'suggested_action', type: 'text' },
          { name: 'resolved', type: 'bool' },
          { name: 'resolved_by', type: 'text' },
          { name: 'resolved_at', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_alerts_module ON performance_alerts (module)',
          'CREATE INDEX idx_perf_alerts_sev ON performance_alerts (severity)',
          'CREATE INDEX idx_perf_alerts_res ON performance_alerts (resolved)',
          'CREATE INDEX idx_perf_alerts_cr ON performance_alerts (created DESC)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_predictions',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'scenario', type: 'text', required: true },
          { name: 'entity_type', type: 'text' },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_name', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'period', type: 'date' },
          { name: 'metric', type: 'text' },
          { name: 'predicted_value', type: 'text' },
          { name: 'current_value', type: 'text' },
          { name: 'impact', type: 'json' },
          { name: 'assumptions', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_pred_scen ON performance_predictions (scenario)',
          'CREATE INDEX idx_perf_pred_et ON performance_predictions (entity_type)',
          'CREATE INDEX idx_perf_pred_cr ON performance_predictions (created DESC)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_gamification',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          {
            name: 'type',
            type: 'select',
            values: [
              'medalha',
              'conquista',
              'nivel',
              'campanha',
              'desafio',
              'ranking',
              'reconhecimento_equipe',
              'reconhecimento_individual',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'icon', type: 'text' },
          { name: 'rules', type: 'json' },
          { name: 'entity_type', type: 'text' },
          { name: 'entity_id', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_game_type ON performance_gamification (type)',
          'CREATE INDEX idx_perf_game_act ON performance_gamification (active)',
          'CREATE INDEX idx_perf_game_co ON performance_gamification (company)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_config',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'indicators', type: 'json' },
          { name: 'weights', type: 'json' },
          { name: 'goals', type: 'json' },
          { name: 'formulas', type: 'json' },
          { name: 'periodicity', type: 'text' },
          { name: 'departments', type: 'json' },
          { name: 'roles', type: 'json' },
          { name: 'permissions', type: 'json' },
          { name: 'dashboards', type: 'json' },
          { name: 'alerts', type: 'json' },
          { name: 'ai_rules', type: 'json' },
          { name: 'gamification_enabled', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_perf_cfg_co ON performance_config (company)'],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_benchmarks',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'entity_type', type: 'text' },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_name', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'period', type: 'date' },
          { name: 'metric', type: 'text' },
          { name: 'value', type: 'text' },
          { name: 'percentile', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_bench_et ON performance_benchmarks (entity_type)',
          'CREATE INDEX idx_perf_bench_met ON performance_benchmarks (metric)',
          'CREATE INDEX idx_perf_bench_per ON performance_benchmarks (period)',
        ],
      }),
    )

    app.save(
      new Collection({
        name: 'performance_ai_analysis',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'entity_type', type: 'text' },
          { name: 'entity_id', type: 'text' },
          { name: 'entity_name', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'branch', type: 'text' },
          { name: 'period', type: 'date' },
          { name: 'conclusion', type: 'text' },
          { name: 'reason', type: 'text' },
          { name: 'suggested_actions', type: 'json' },
          {
            name: 'risk_level',
            type: 'select',
            values: ['baixo', 'medio', 'alto', 'critico'],
            maxSelect: 1,
          },
          { name: 'embedding', type: 'vector', dimensions: 1536, distance: 'cosine' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_perf_ai_et ON performance_ai_analysis (entity_type)',
          'CREATE INDEX idx_perf_ai_rl ON performance_ai_analysis (risk_level)',
          'CREATE INDEX idx_perf_ai_cr ON performance_ai_analysis (created DESC)',
        ],
      }),
    )
  },
  (app) => {
    var cols = [
      'performance_ai_analysis',
      'performance_benchmarks',
      'performance_config',
      'performance_gamification',
      'performance_predictions',
      'performance_alerts',
      'performance_scores',
      'performance_kpis',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
