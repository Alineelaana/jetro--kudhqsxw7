migrate(
  (app) => {
    if (!app.hasTable('blueprint_volumes')) {
      const collection = new Collection({
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
          { name: 'chapter_id', type: 'text' },
          { name: 'volume_type', type: 'text' },
          { name: 'value', type: 'text' },
          { name: 'unit', type: 'text' },
          { name: 'period', type: 'text' },
          { name: 'data', type: 'json' },
          { name: 'order', type: 'number' },
          { name: 'status', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_blueprint_volumes_name ON blueprint_volumes (name)'],
      })
      app.save(collection)
    }

    const volumesCol = app.findCollectionByNameOrId('blueprint_volumes')

    const volumes = [
      {
        name: 'Volume de Carga - Transporte Rodoviario',
        description: 'Projecao de volume de carga rodoviaria no ES',
        volume_type: 'transport',
        value: '12500',
        unit: 'toneladas',
        period: '2026-Q1',
        order: 1,
        status: 'active',
        data: JSON.stringify({ modals: ['rodoviario'], regions: ['ES', 'MG', 'RJ', 'SP'] }),
      },
      {
        name: 'Volume de Armazenagem - CDD Vitoria',
        description: 'Capacidade de armazenagem no CDD Vitoria',
        volume_type: 'storage',
        value: '8500',
        unit: 'm3',
        period: '2026-Q1',
        order: 2,
        status: 'active',
        data: JSON.stringify({ locations: ['Vitoria', 'Vila Velha', 'Cariacica'] }),
      },
      {
        name: 'Volume de Entregas - Ultima Milha',
        description: 'Volume de entregas ultima milha na Grande Vitoria',
        volume_type: 'delivery',
        value: '45000',
        unit: 'encomendas',
        period: '2026-Q1',
        order: 3,
        status: 'active',
        data: JSON.stringify({ zones: ['Grande Vitoria', 'Serra', 'Cariacica'] }),
      },
      {
        name: 'Volume de Carga - Cabotagem',
        description: 'Volume de carga via cabotagem no Porto de Vitoria',
        volume_type: 'transport',
        value: '3200',
        unit: 'TEU',
        period: '2026-Q1',
        order: 4,
        status: 'active',
        data: JSON.stringify({ ports: ['Porto de Vitoria', 'Porto de Tubarao'] }),
      },
    ]

    for (const v of volumes) {
      try {
        app.findFirstRecordByData('blueprint_volumes', 'name', v.name)
      } catch (_) {
        const record = new Record(volumesCol)
        record.set('name', v.name)
        record.set('description', v.description || '')
        record.set('volume_type', v.volume_type || '')
        record.set('value', v.value || '')
        record.set('unit', v.unit || '')
        record.set('period', v.period || '')
        record.set('order', v.order || 0)
        record.set('status', v.status || 'active')
        record.set('data', v.data || '{}')
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('blueprint_volumes', "id != ''", '', 100, 0)
      for (const r of records) {
        app.delete(r)
      }
    } catch (_) {}
  },
)
