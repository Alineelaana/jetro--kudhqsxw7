migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId('blueprint_volumes')
    } catch (_) {
      const col = new Collection({
        name: 'blueprint_volumes',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'chapter', type: 'text' },
          { name: 'metric_name', type: 'text' },
          { name: 'target_value', type: 'text' },
          { name: 'current_value', type: 'text' },
          { name: 'unit', type: 'text' },
          { name: 'period', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'sort_order', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(col)
    }

    const volumesCol = app.findCollectionByNameOrId('blueprint_volumes')

    var seedVolumes = [
      {
        name: 'Volume de Carga Mensal',
        description: 'Volume total de carga movimentada por mes no ES',
        chapter: 'Operacoes',
        metric_name: 'Carga Movimentada',
        target_value: '15000',
        current_value: '12500',
        unit: 'toneladas',
        period: 'Mensal',
        category: 'Operacional',
        sort_order: 1,
      },
      {
        name: 'Capacidade de Armazenagem',
        description: 'Capacidade total dos galpoes logisticos',
        chapter: 'Infraestrutura',
        metric_name: 'Armazenagem',
        target_value: '50000',
        current_value: '48000',
        unit: 'm3',
        period: 'Anual',
        category: 'Estrategico',
        sort_order: 2,
      },
      {
        name: 'Frota Operacional',
        description: 'Numero de veiculos na frota operacional',
        chapter: 'Transporte',
        metric_name: 'Frota Ativa',
        target_value: '120',
        current_value: '98',
        unit: 'veiculos',
        period: 'Mensal',
        category: 'Operacional',
        sort_order: 3,
      },
      {
        name: 'Entregas por Dia',
        description: 'Media de entregas realizadas por dia no ES',
        chapter: 'Operacoes',
        metric_name: 'Entregas Diarias',
        target_value: '500',
        current_value: '420',
        unit: 'entregas',
        period: 'Diario',
        category: 'Operacional',
        sort_order: 4,
      },
      {
        name: 'Rotas Ativas',
        description: 'Numero de rotas ativas no Espirito Santo',
        chapter: 'Transporte',
        metric_name: 'Rotas Ativas',
        target_value: '85',
        current_value: '72',
        unit: 'rotas',
        period: 'Mensal',
        category: 'Operacional',
        sort_order: 5,
      },
      {
        name: 'Indice de Pontualidade',
        description: 'Percentual de entregas no prazo',
        chapter: 'Qualidade',
        metric_name: 'Pontualidade',
        target_value: '98',
        current_value: '94',
        unit: '%',
        period: 'Mensal',
        category: 'Estrategico',
        sort_order: 6,
      },
    ]

    for (var i = 0; i < seedVolumes.length; i++) {
      var v = seedVolumes[i]
      try {
        app.findFirstRecordByData('blueprint_volumes', 'name', v.name)
      } catch (_) {
        var record = new Record(volumesCol)
        var keys = Object.keys(v)
        for (var j = 0; j < keys.length; j++) {
          record.set(keys[j], v[keys[j]])
        }
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('blueprint_volumes')
      app.delete(col)
    } catch (_) {}
  },
)
