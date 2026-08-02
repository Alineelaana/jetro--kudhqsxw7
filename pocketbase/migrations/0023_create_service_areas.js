migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'service_areas',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'is_default', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_service_areas_name ON service_areas (name)'],
      }),
    )

    var defaultAreas = [
      'Transporte',
      'Armazenamento',
      'Recebimento',
      'Entrega',
      'Picking',
      'Packing',
      'WMS',
    ]
    var col = app.findCollectionByNameOrId('service_areas')
    for (var i = 0; i < defaultAreas.length; i++) {
      try {
        app.findFirstRecordByData('service_areas', 'name', defaultAreas[i])
      } catch (_) {
        var rec = new Record(col)
        rec.set('name', defaultAreas[i])
        rec.set('is_default', true)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('service_areas'))
    } catch (_) {}
  },
)
