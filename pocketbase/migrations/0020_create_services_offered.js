migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'services_offered',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'value', type: 'text' },
          { name: 'max_discount', type: 'number' },
          { name: 'observations', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_services_offered_name ON services_offered (name)',
          'CREATE INDEX idx_services_offered_active ON services_offered (active)',
        ],
      }),
    )

    var seedServices = [
      {
        name: 'Armazenagem de Produtos em Estoque',
        description: 'Gestao WMS avancada, inventario continuo, picking e packing agil.',
        value: '',
        max_discount: 10,
        observations: '',
        active: true,
      },
      {
        name: 'Transporte de Cargas',
        description:
          'Transporte rodoviario de cargas fracionadas e dedicadas com monitoramento em tempo real.',
        value: '',
        max_discount: 15,
        observations: '',
        active: true,
      },
      {
        name: 'Distribuicao Urbana e Delivery',
        description: 'Solucoes de ultima milha com roteirizacao inteligente.',
        value: '',
        max_discount: 10,
        observations: '',
        active: true,
      },
      {
        name: 'Logistica Portuaria',
        description: 'Conexao direta com os principais portos e terminais do Espirito Santo.',
        value: '',
        max_discount: 12,
        observations: '',
        active: true,
      },
      {
        name: 'Cross Docking',
        description: 'Triagem e redistribuicao imediata de produtos entre modais.',
        value: '',
        max_discount: 8,
        observations: '',
        active: true,
      },
    ]
    var col = app.findCollectionByNameOrId('services_offered')
    for (var i = 0; i < seedServices.length; i++) {
      try {
        app.findFirstRecordByData('services_offered', 'name', seedServices[i].name)
      } catch (_) {
        var rec = new Record(col)
        rec.set('name', seedServices[i].name)
        rec.set('description', seedServices[i].description)
        rec.set('value', seedServices[i].value)
        rec.set('max_discount', seedServices[i].max_discount)
        rec.set('observations', seedServices[i].observations)
        rec.set('active', seedServices[i].active)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('services_offered'))
    } catch (_) {}
  },
)
