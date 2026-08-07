migrate(
  (app) => {
    var R = "@request.auth.id != ''"

    function createRec(col, data) {
      try {
        var c = app.findCollectionByNameOrId(col)
        var r = new Record(c)
        for (var k in data) r.set(k, data[k])
        app.save(r)
      } catch (err) {
        console.log('seed failed: ' + col + ' - ' + String(err))
      }
    }

    var now = new Date().toISOString()

    createRec('industrial_intelligence_alerts', {
      detection_key: 'predicted_delay:seed-1',
      type: 'predicted_delay',
      severity: 'critical',
      title: 'OP Atrasada: OP-2026-001',
      description: 'Ordem OP-2026-001 está 5 dia(s) atrasada',
      status: 'open',
      priority: 'urgent',
      origin: 'production_orders',
      justification: 'Data de término excedida há 5 dias',
      data_used: JSON.stringify({ order_number: 'OP-2026-001', days_late: 5 }),
      expected_impact: 'Atraso na entrega ao cliente',
      evidence: JSON.stringify([{ collection: 'production_orders', field: 'end_date' }]),
      source_records: JSON.stringify([{ collection: 'production_orders', id: 'seed-1' }]),
      order_id: 'seed-1',
      resolved: false,
    })

    createRec('industrial_intelligence_alerts', {
      detection_key: 'critical_stock:seed-2',
      type: 'critical_stock',
      severity: 'warning',
      title: 'Estoque Crítico: Produto A',
      description: 'Estoque 5 (mínimo: 10)',
      status: 'open',
      priority: 'high',
      origin: 'products',
      justification: 'Estoque abaixo do mínimo',
      data_used: JSON.stringify({ product_name: 'Produto A', stock: 5, min_stock: 10 }),
      expected_impact: 'Risco de parada de produção',
      evidence: JSON.stringify([{ collection: 'products', field: 'stock', value: 5 }]),
      source_records: JSON.stringify([{ collection: 'products', id: 'seed-2' }]),
      product_id: 'seed-2',
      resolved: false,
    })

    createRec('industrial_intelligence_recommendations', {
      detection_key: 'anticipate_purchase:seed-2',
      type: 'anticipate_purchase',
      title: 'Antecipar Compra: Produto A',
      description: 'Estoque crítico — antecipar compra de matéria-prima',
      status: 'pending',
      priority: 'urgent',
      origin: 'products',
      justification: 'Estoque 5 abaixo do mínimo 10',
      data_used: JSON.stringify({ product_name: 'Produto A', stock: 5, min_stock: 10 }),
      expected_impact: 'Evitar ruptura e parada de produção',
      evidence: JSON.stringify([{ collection: 'products', field: 'stock', value: 5 }]),
      source_records: JSON.stringify([{ collection: 'products', id: 'seed-2' }]),
      product_id: 'seed-2',
    })

    createRec('industrial_intelligence_recommendations', {
      detection_key: 'replan_production:seed-1',
      type: 'replan_production',
      title: 'Replanejar Produção: OP-2026-001',
      description: 'OP atrasada 5 dias — replanejar cronograma',
      status: 'pending',
      priority: 'high',
      origin: 'production_orders',
      justification: 'Atraso de 5 dias requer replanejamento',
      data_used: JSON.stringify({ order_number: 'OP-2026-001', days_late: 5 }),
      expected_impact: 'Reduzir atraso e recuperar cronograma',
      evidence: JSON.stringify([{ collection: 'production_orders' }]),
      source_records: JSON.stringify([{ collection: 'production_orders', id: 'seed-1' }]),
      order_id: 'seed-1',
    })

    createRec('industrial_intelligence_predictions', {
      detection_key: 'production_delay:seed-1',
      type: 'production_delay',
      title: 'Atraso de Produção: OP-2026-001',
      description: 'Produção atrasada 5 dias',
      probability: 'high',
      status: 'active',
      origin: 'production_orders',
      justification: 'OP com data de término excedida',
      data_used: JSON.stringify({ order_number: 'OP-2026-001', days_late: 5 }),
      evidence: JSON.stringify([{ collection: 'production_orders' }]),
      source_records: JSON.stringify([{ collection: 'production_orders', id: 'seed-1' }]),
      order_id: 'seed-1',
    })

    createRec('industrial_intelligence_predictions', {
      detection_key: 'rupture_risk:seed-2',
      type: 'rupture_risk',
      title: 'Risco de Ruptura: Produto A',
      description: 'Estoque abaixo do mínimo',
      probability: 'high',
      status: 'active',
      origin: 'products',
      justification: 'Estoque atual 5 vs mínimo 10',
      data_used: JSON.stringify({ product_name: 'Produto A', stock: 5, min_stock: 10 }),
      evidence: JSON.stringify([{ collection: 'products' }]),
      source_records: JSON.stringify([{ collection: 'products', id: 'seed-2' }]),
      product_id: 'seed-2',
    })

    createRec('industrial_intelligence_insights', {
      detection_key: 'bottleneck:seed-3',
      type: 'bottleneck',
      title: 'Gargalo: Máquina CNC-01',
      description: '8 operações agendadas',
      category: 'operational',
      origin: 'aps_schedules',
      data_used: JSON.stringify({ resource_name: 'CNC-01', scheduled_ops: 8 }),
      evidence: JSON.stringify([{ collection: 'aps_schedules' }]),
      source_records: JSON.stringify([
        { collection: 'aps_schedules' },
        { collection: 'production_resources', id: 'seed-3' },
      ]),
      machine_id: 'seed-3',
      value: '8',
      unit: 'ops',
    })

    createRec('industrial_intelligence_insights', {
      detection_key: 'best_performing_team:seed-4',
      type: 'best_performing_team',
      title: 'Melhor Equipe: Equipe Alpha',
      description: '120 unidades produzidas',
      category: 'operational',
      origin: 'industrial_apontamentos',
      data_used: JSON.stringify({ team: 'Equipe Alpha', total_produced: 120 }),
      evidence: JSON.stringify([{ collection: 'industrial_apontamentos' }]),
      source_records: JSON.stringify([{ collection: 'industrial_apontamentos' }]),
      value: '120',
      unit: 'units',
    })

    createRec('industrial_intelligence_insights', {
      detection_key: 'stock_rupture_risk:seed-2',
      type: 'stock_rupture_risk',
      title: 'Risco de Ruptura: Produto A',
      description: 'Estoque 5 ≤ mínimo 10',
      category: 'stock',
      origin: 'products',
      data_used: JSON.stringify({ product_name: 'Produto A', stock: 5, min_stock: 10 }),
      evidence: JSON.stringify([{ collection: 'products' }]),
      source_records: JSON.stringify([{ collection: 'products', id: 'seed-2' }]),
      product_id: 'seed-2',
      value: '5',
      unit: 'units',
    })

    console.log('0103: industrial intelligence seeds created')
  },
  (app) => {
    var cols = [
      'industrial_intelligence_insights',
      'industrial_intelligence_predictions',
      'industrial_intelligence_recommendations',
      'industrial_intelligence_alerts',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        var records = app.findRecordsByFilter(cols[i], 'detection_key ~ "seed"', '', 100, 0)
        for (var r = 0; r < records.length; r++) {
          app.delete(records[r])
        }
      } catch (_) {}
    }
  },
)
