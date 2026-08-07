migrate(
  (app) => {
    var demCol = app.findCollectionByNameOrId('industrial_demand')
    try {
      app.findFirstRecordByData('industrial_demand', 'demand_number', 'DEM-2026-001')
    } catch (_) {
      var pa = null
      try {
        pa = app.findFirstRecordByData('products', 'code', 'IND-PA-0001')
      } catch (_) {}
      var dem = new Record(demCol)
      dem.set('demand_number', 'DEM-2026-001')
      dem.set('quantity', 5000)
      dem.set('unit', 'un')
      dem.set('demand_type', 'order')
      dem.set('scenario', 'made_to_order')
      dem.set('source', 'Cliente GR Premium')
      dem.set('due_date', '2026-09-15')
      dem.set('status', 'open')
      dem.set('responsible', 'PCP')
      if (pa) dem.set('product_id', pa.id)
      app.save(dem)
    }

    var phCol = app.findCollectionByNameOrId('industrial_phases')
    try {
      app.findFirstRecordByData('industrial_phases', 'operation_name', 'Preparacao Massa')
    } catch (_) {
      var orders = []
      try {
        orders = app.findRecordsByFilter('production_orders', '', '-created', 1, 0)
      } catch (_) {}
      var orderId = ''
      if (orders.length > 0) orderId = orders[0].id
      var resId = ''
      try {
        var res = app.findRecordsByFilter('production_resources', 'active = true', 'name', 1, 0)
        if (res.length > 0) resId = res[0].id
      } catch (_) {}

      var phases = [
        { seq: 1, name: 'Preparacao Massa', wc: 'Centro Preparacao', exp: 120 },
        { seq: 2, name: 'Envase', wc: 'Linha Envase', exp: 180 },
        { seq: 3, name: 'Acabamento', wc: 'Centro Acabamento', exp: 90 },
      ]
      for (var i = 0; i < phases.length; i++) {
        var ph = new Record(phCol)
        ph.set('production_order_id', orderId)
        ph.set('sequence', phases[i].seq)
        ph.set('operation_name', phases[i].name)
        ph.set('work_center', phases[i].wc)
        ph.set('expected_time_minutes', phases[i].exp)
        ph.set('status', 'pending')
        ph.set('quality_status', 'pending')
        ph.set('responsible', 'PCP')
        if (resId) ph.set('resource_id', resId)
        app.save(ph)
      }
    }

    var pcCol = app.findCollectionByNameOrId('industrial_phase_costs')
    try {
      app.findFirstRecordByData('industrial_phase_costs', 'cost_type', 'labor')
    } catch (_) {
      var phs = []
      try {
        phs = app.findRecordsByFilter('industrial_phases', '', 'sequence', 10, 0)
      } catch (_) {}
      if (phs.length > 0) {
        var costs = [
          { type: 'labor', amount: '150.00', desc: 'Mao de obra operacional' },
          { type: 'machine', amount: '80.00', desc: 'Horas maquina' },
          { type: 'energy', amount: '25.00', desc: 'Consumo energetico' },
          { type: 'materials', amount: '320.00', desc: 'Materia-prima consumida' },
        ]
        for (var c = 0; c < costs.length; c++) {
          var pc = new Record(pcCol)
          pc.set('phase_id', phs[0].id)
          pc.set('cost_type', costs[c].type)
          pc.set('amount', costs[c].amount)
          pc.set('description', costs[c].desc)
          pc.set('responsible', 'Custos')
          app.save(pc)
        }
      }
    }

    console.log('0101: industrial GR seed data created')
  },
  (app) => {},
)
