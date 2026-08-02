migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'contracts_operations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'services', type: 'json' },
          { name: 'total_value', type: 'text' },
          {
            name: 'status',
            type: 'select',
            values: ['Rascunho', 'Ativo', 'Concluído', 'Cancelado'],
            maxSelect: 1,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_contracts_operations_status ON contracts_operations (status)',
          'CREATE INDEX idx_contracts_operations_created ON contracts_operations (created)',
        ],
      }),
    )

    var col = app.findCollectionByNameOrId('contracts_operations')
    var seedContracts = [
      {
        name: 'Contrato Logística Vitória 2026',
        services: [],
        total_value: '',
        status: 'Ativo',
      },
      {
        name: 'Operação Cross Docking Portuária',
        services: [],
        total_value: '',
        status: 'Rascunho',
      },
    ]
    for (var i = 0; i < seedContracts.length; i++) {
      try {
        app.findFirstRecordByData('contracts_operations', 'name', seedContracts[i].name)
      } catch (_) {
        var rec = new Record(col)
        rec.set('name', seedContracts[i].name)
        rec.set('services', seedContracts[i].services)
        rec.set('total_value', seedContracts[i].total_value)
        rec.set('status', seedContracts[i].status)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('contracts_operations'))
    } catch (_) {}
  },
)
