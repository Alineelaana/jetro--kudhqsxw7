migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('commission_rules')

    if (!col.fields.getByName('created')) {
      col.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
    }
    if (!col.fields.getByName('updated')) {
      col.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))
    }

    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO')"
    col.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.role = 'FINANCEIRO')"
    col.deleteRule = "@request.auth.id != '' && @request.auth.role = 'SUP'"

    app.save(col)

    var seedData = [
      {
        role: 'RCA',
        percentage: '3',
        split_percentage: '50',
        priority: 1,
        applicability: 'all_sales',
        active: true,
      },
      {
        role: 'Televendas',
        percentage: '2',
        split_percentage: '30',
        priority: 2,
        applicability: 'all_sales',
        active: true,
      },
      {
        role: 'Responsavel Comercial Digital',
        percentage: '2',
        split_percentage: '20',
        priority: 3,
        applicability: 'digital_channel',
        active: true,
      },
    ]

    for (var i = 0; i < seedData.length; i++) {
      var s = seedData[i]
      try {
        app.findFirstRecordByData('commission_rules', 'role', s.role)
      } catch (_) {
        var record = new Record(col)
        record.set('role', s.role)
        record.set('percentage', s.percentage)
        record.set('split_percentage', s.split_percentage)
        record.set('priority', s.priority)
        record.set('applicability', s.applicability)
        record.set('active', s.active)
        record.set('empresa', '')
        record.set('filial', '')
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      var col = app.findCollectionByNameOrId('commission_rules')
      col.listRule = "@request.auth.id != ''"
      col.viewRule = "@request.auth.id != ''"
      col.createRule = "@request.auth.id != ''"
      col.updateRule = "@request.auth.id != ''"
      col.deleteRule = "@request.auth.id != ''"
      app.save(col)
    } catch (_) {}
  },
)
