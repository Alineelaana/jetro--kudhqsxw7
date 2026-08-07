migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    app.save(
      new Collection({
        name: 'industrial_threshold_config',
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: SA,
        updateRule: SA,
        deleteRule: SA,
        fields: [
          { name: 'key', type: 'text', required: true },
          { name: 'label', type: 'text', required: true },
          { name: 'value', type: 'text', required: true },
          { name: 'unit', type: 'text' },
          { name: 'description', type: 'text' },
          {
            name: 'category',
            type: 'select',
            values: ['quality', 'capacity', 'cost', 'stock', 'production', 'planning'],
            maxSelect: 1,
          },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_threshold_key ON industrial_threshold_config (key)',
          'CREATE INDEX idx_threshold_category ON industrial_threshold_config (category)',
        ],
      }),
    )

    var col = app.findCollectionByNameOrId('industrial_threshold_config')
    var defaults = [
      {
        key: 'loss_threshold',
        label: 'Perda por Fase (unidades)',
        value: '10',
        unit: 'units',
        category: 'quality',
        description: 'Limite de perdas em uma fase antes de gerar alerta',
      },
      {
        key: 'total_loss_threshold',
        label: 'Perda Total (unidades)',
        value: '50',
        unit: 'units',
        category: 'quality',
        description: 'Perda acumulada para gerar predição de tendência',
      },
      {
        key: 'capacity_saturation',
        label: 'Saturação de Capacidade (ops)',
        value: '5',
        unit: 'ops',
        category: 'capacity',
        description: 'Operações agendadas para considerar recurso saturado',
      },
      {
        key: 'bottleneck_ops',
        label: 'Gargalo (ops)',
        value: '3',
        unit: 'ops',
        category: 'capacity',
        description: 'Operações para identificar gargalo',
      },
      {
        key: 'critical_delay_days',
        label: 'Atraso Crítico (dias)',
        value: '7',
        unit: 'days',
        category: 'production',
        description: 'Dias de atraso para classificar como crítico',
      },
      {
        key: 'at_risk_days',
        label: 'Risco de Atraso (dias)',
        value: '3',
        unit: 'days',
        category: 'production',
        description: 'Dias restantes para considerar OP em risco',
      },
      {
        key: 'wip_threshold',
        label: 'WIP Elevado (ordens)',
        value: '10',
        unit: 'orders',
        category: 'production',
        description: 'Ordens em andamento para alertar WIP elevado',
      },
      {
        key: 'cost_deviation',
        label: 'Desvio de Custo (R$)',
        value: '10000',
        unit: 'BRL',
        category: 'cost',
        description: 'Custo acima do qual gerar alerta',
      },
      {
        key: 'low_productivity',
        label: 'Baixa Produtividade (unidades)',
        value: '10',
        unit: 'units',
        category: 'production',
        description: 'Produção abaixo deste valor gera alerta',
      },
      {
        key: 'high_productivity',
        label: 'Alta Produtividade (unidades)',
        value: '50',
        unit: 'units',
        category: 'production',
        description: 'Produção acima deste valor destaca equipe',
      },
      {
        key: 'idle_ratio',
        label: 'Proporção de Ociosidade',
        value: '0.4',
        unit: 'ratio',
        category: 'capacity',
        description: 'Proporção de máquinas ociosas para alertar',
      },
      {
        key: 'min_oee',
        label: 'OEE Mínimo (%)',
        value: '60',
        unit: '%',
        category: 'quality',
        description: 'OEE abaixo do qual gerar alerta',
      },
    ]

    for (var i = 0; i < defaults.length; i++) {
      try {
        app.findFirstRecordByData('industrial_threshold_config', 'key', defaults[i].key)
      } catch (_) {
        var r = new Record(col)
        r.set('key', defaults[i].key)
        r.set('label', defaults[i].label)
        r.set('value', defaults[i].value)
        r.set('unit', defaults[i].unit)
        r.set('description', defaults[i].description)
        r.set('category', defaults[i].category)
        r.set('active', true)
        app.save(r)
      }
    }

    console.log('0104: threshold calibration collection created and seeded')
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('industrial_threshold_config'))
    } catch (_) {}
  },
)
