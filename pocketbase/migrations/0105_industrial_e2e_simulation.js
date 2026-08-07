migrate(
  (app) => {
    function findRec(col, field, value) {
      try {
        return app.findFirstRecordByData(col, field, value)
      } catch (_) {
        return null
      }
    }

    function findRecsByFilter(col, filter, sort, limit) {
      try {
        return app.findRecordsByFilter(col, filter || '', sort || '', limit || 500, 0)
      } catch (_) {
        return []
      }
    }

    function createRec(colName, data) {
      try {
        var col = app.findCollectionByNameOrId(colName)
        var r = new Record(col)
        for (var k in data) r.set(k, data[k])
        app.save(r)
        return r
      } catch (err) {
        console.log('seed skip: ' + colName + ' - ' + String(err))
        return null
      }
    }

    var pa = findRec('products', 'code', 'IND-PA-0001')
    var az = findRec('products', 'code', 'IND-MP-0001')
    var sal = findRec('products', 'code', 'IND-MP-0002')
    var pote = findRec('products', 'code', 'IND-EMB-0001')
    var tampa = findRec('products', 'code', 'IND-EMB-0002')

    if (!pa) {
      console.log('0105: product IND-PA-0001 not found, skipping')
      return
    }

    var resource = findRec('production_resources', 'code', 'RES-0001')
    var bomVersion = null
    try {
      var boms = app.findRecordsByFilter(
        'bom_versions',
        'product_id = "' + pa.id + '"',
        '-version',
        1,
        0,
      )
      if (boms.length > 0) bomVersion = boms[0]
    } catch (_) {}

    var route = null
    try {
      var routes = app.findRecordsByFilter(
        'production_routes',
        'product_id = "' + pa.id + '"',
        '-version',
        1,
        0,
      )
      if (routes.length > 0) route = routes[0]
    } catch (_) {}

    // === DEMAND ===
    var dem1 = findRec('industrial_demand', 'demand_number', 'DEM-2026-002')
    if (!dem1) {
      dem1 = createRec('industrial_demand', {
        demand_number: 'DEM-2026-002',
        product_id: pa.id,
        quantity: 10000,
        unit: 'un',
        demand_type: 'order',
        scenario: 'make_to_stock',
        source: 'Previsao Comercial Agosto 2026',
        due_date: '2026-08-30',
        status: 'open',
        responsible: 'PCP',
      })
    }

    var dem2 = findRec('industrial_demand', 'demand_number', 'DEM-2026-003')
    if (!dem2) {
      dem2 = createRec('industrial_demand', {
        demand_number: 'DEM-2026-003',
        product_id: pa.id,
        quantity: 3000,
        unit: 'un',
        demand_type: 'order',
        scenario: 'made_to_order',
        source: 'Cliente Supermercado Bom Preco',
        due_date: '2026-08-20',
        status: 'open',
        responsible: 'Comercial',
      })
    }

    // === PRODUCTION ORDERS ===
    var op1 = findRec('production_orders', 'order_number', 'OP-2026-0002')
    if (!op1) {
      op1 = createRec('production_orders', {
        order_number: 'OP-2026-0002',
        status: 'em_producao',
        product_id: pa.id,
        quantity: '10000',
        unit: 'un',
        start_date: '2026-07-25',
        end_date: '2026-08-28',
        responsible: 'PCP',
        production_scenario: 'make_to_stock',
        demand_id: dem1 ? dem1.id : '',
      })
    }

    var op2 = findRec('production_orders', 'order_number', 'OP-2026-0003')
    if (!op2) {
      op2 = createRec('production_orders', {
        order_number: 'OP-2026-0003',
        status: 'planejada',
        product_id: pa.id,
        quantity: '3000',
        unit: 'un',
        start_date: '2026-08-10',
        end_date: '2026-08-25',
        responsible: 'PCP',
        production_scenario: 'made_to_order',
        demand_id: dem2 ? dem2.id : '',
      })
    }

    var op3 = findRec('production_orders', 'order_number', 'OP-2026-0004')
    if (!op3) {
      op3 = createRec('production_orders', {
        order_number: 'OP-2026-0004',
        status: 'rascunho',
        product_id: pa.id,
        quantity: '5000',
        unit: 'un',
        start_date: '2026-09-01',
        end_date: '2026-09-15',
        responsible: 'PCP',
        production_scenario: 'batch',
      })
    }

    // === PHASES FOR OP-2026-0002 ===
    var existingPhases = findRecsByFilter(
      'industrial_phases',
      'production_order_id = "' + op1.id + '"',
      'sequence',
      10,
    )
    if (existingPhases.length === 0 && route) {
      var ops = findRecsByFilter(
        'production_route_operations',
        'route_id = "' + route.id + '"',
        'order',
        10,
      )
      var phaseDefs = [
        {
          seq: 1,
          name: 'Preparacao da Salmoura',
          wc: 'Centro Preparacao',
          exp: 240,
          actual: 220,
          status: 'completed',
          q: 'approved',
        },
        {
          seq: 2,
          name: 'Mistura Azeitona + Salmoura',
          wc: 'Centro Mistura',
          exp: 120,
          actual: 115,
          status: 'completed',
          q: 'approved',
        },
        {
          seq: 3,
          name: 'Envase',
          wc: 'Linha Envase',
          exp: 360,
          actual: 0,
          status: 'in_progress',
          q: 'pending',
        },
        {
          seq: 4,
          name: 'Colocacao de Tampa',
          wc: 'Linha Envase',
          exp: 160,
          actual: 0,
          status: 'pending',
          q: 'pending',
        },
        {
          seq: 5,
          name: 'Rotulagem',
          wc: 'Centro Acabamento',
          exp: 120,
          actual: 0,
          status: 'pending',
          q: 'pending',
        },
        {
          seq: 6,
          name: 'Encartonagem',
          wc: 'Centro Acabamento',
          exp: 80,
          actual: 0,
          status: 'pending',
          q: 'pending',
        },
        {
          seq: 7,
          name: 'Paletizacao',
          wc: 'Expedicao',
          exp: 160,
          actual: 0,
          status: 'pending',
          q: 'pending',
        },
      ]
      for (var i = 0; i < phaseDefs.length; i++) {
        var pd = phaseDefs[i]
        var phData = {
          production_order_id: op1.id,
          sequence: pd.seq,
          operation_name: pd.name,
          work_center: pd.wc,
          expected_time_minutes: pd.exp,
          status: pd.status,
          quality_status: pd.q,
          responsible: 'PCP',
          team_name: pd.seq <= 2 ? 'Equipe Alpha' : 'Equipe Beta',
          operator_name: pd.seq <= 2 ? 'Joao Silva' : '',
        }
        if (pd.actual > 0) phData.actual_time_minutes = pd.actual
        if (pd.status === 'completed') {
          phData.started_at = '2026-07-25T06:00:00Z'
          phData.completed_at = '2026-07-26T14:00:00Z'
        }
        if (pd.status === 'in_progress') {
          phData.started_at = '2026-07-27T06:00:00Z'
        }
        if (resource) phData.resource_id = resource.id
        if (pd.seq === 3) {
          phData.losses = JSON.stringify({ quantity: 120, reason: 'Ruptura de pote de vidro' })
        }
        createRec('industrial_phases', phData)
      }
    }

    // Phase with rework for OP-2026-0003 (simulates quality issue)
    var existingPhases2 = findRecsByFilter(
      'industrial_phases',
      'production_order_id = "' + op2.id + '"',
      'sequence',
      10,
    )
    if (existingPhases2.length === 0) {
      createRec('industrial_phases', {
        production_order_id: op2.id,
        sequence: 1,
        operation_name: 'Preparacao da Salmoura',
        work_center: 'Centro Preparacao',
        expected_time_minutes: 90,
        status: 'pending',
        quality_status: 'pending',
        responsible: 'PCP',
        team_name: 'Equipe Gamma',
        operator_name: 'Maria Santos',
        resource_id: resource ? resource.id : '',
      })
      createRec('industrial_phases', {
        production_order_id: op2.id,
        sequence: 2,
        operation_name: 'Envase',
        work_center: 'Linha Envase',
        expected_time_minutes: 180,
        status: 'pending',
        quality_status: 'pending',
        responsible: 'PCP',
        team_name: 'Equipe Gamma',
        operator_name: 'Maria Santos',
        resource_id: resource ? resource.id : '',
      })
    }

    // === APONTAMENTOS ===
    var existingApont = findRecsByFilter(
      'industrial_apontamentos',
      'production_order_id = "' + op1.id + '"',
      '-created',
      50,
    )
    if (existingApont.length === 0) {
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Joao Silva',
        operation_name: 'Preparacao da Salmoura',
        type: 'inicio',
        start_time: '2026-07-25T06:00:00Z',
        end_time: '2026-07-25T06:30:00Z',
        duration_minutes: 30,
        lot_number: 'LOT-SALMOURA-001',
        responsible: 'Joao Silva',
      })
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Joao Silva',
        operation_name: 'Preparacao da Salmoura',
        type: 'producao',
        quantity_produced: 4000,
        start_time: '2026-07-25T06:30:00Z',
        end_time: '2026-07-25T10:00:00Z',
        duration_minutes: 210,
        lot_number: 'LOT-SALMOURA-001',
        responsible: 'Joao Silva',
      })
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Joao Silva',
        operation_name: 'Mistura Azeitona + Salmoura',
        type: 'producao',
        quantity_produced: 3800,
        start_time: '2026-07-25T14:00:00Z',
        end_time: '2026-07-25T16:00:00Z',
        duration_minutes: 120,
        lot_number: 'LOT-MISTURA-001',
        responsible: 'Joao Silva',
      })
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Joao Silva',
        operation_name: 'Envase',
        type: 'producao',
        quantity_produced: 2500,
        start_time: '2026-07-27T06:00:00Z',
        end_time: '2026-07-27T12:00:00Z',
        duration_minutes: 360,
        lot_number: 'LOT-ENVASE-001',
        responsible: 'Joao Silva',
      })
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Joao Silva',
        operation_name: 'Envase',
        type: 'refugo',
        quantity_rejected: 120,
        start_time: '2026-07-27T12:00:00Z',
        end_time: '2026-07-27T12:15:00Z',
        duration_minutes: 15,
        lot_number: 'LOT-ENVASE-001',
        responsible: 'Joao Silva',
        notes: 'Ruptura de potes de vidro durante envase',
      })
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Carlos Oliveira',
        operation_name: 'Envase',
        type: 'producao',
        quantity_produced: 0,
        start_time: '2026-07-28T06:00:00Z',
        end_time: '2026-07-28T06:30:00Z',
        duration_minutes: 30,
        lot_number: 'LOT-ENVASE-002',
        responsible: 'Carlos Oliveira',
        notes: 'Parada para troca de equipe',
      })
      createRec('industrial_apontamentos', {
        production_order_id: op1.id,
        product_id: pa.id,
        resource_id: resource ? resource.id : '',
        operator_name: 'Equipe Alpha',
        operation_name: 'Envase',
        type: 'producao',
        quantity_produced: 60,
        start_time: '2026-07-26T06:00:00Z',
        end_time: '2026-07-26T12:00:00Z',
        duration_minutes: 360,
        lot_number: 'LOT-ENVASE-003',
        responsible: 'Equipe Alpha',
      })
    }

    // === PHASE COSTS ===
    var phase1 = null
    var phase2 = null
    var phase3 = null
    var phases1 = findRecsByFilter(
      'industrial_phases',
      'production_order_id = "' + op1.id + '"',
      'sequence',
      10,
    )
    for (var p = 0; p < phases1.length; p++) {
      if (phases1[p].getInt('sequence') === 1) phase1 = phases1[p]
      if (phases1[p].getInt('sequence') === 2) phase2 = phases1[p]
      if (phases1[p].getInt('sequence') === 3) phase3 = phases1[p]
    }

    if (phase1) {
      var existingCosts = findRecsByFilter(
        'industrial_phase_costs',
        'phase_id = "' + phase1.id + '"',
        '',
        10,
      )
      if (existingCosts.length === 0) {
        createRec('industrial_phase_costs', {
          phase_id: phase1.id,
          cost_type: 'labor',
          amount: '180.00',
          description: 'Mao de obra - preparacao salmoura',
          responsible: 'Custos',
        })
        createRec('industrial_phase_costs', {
          phase_id: phase1.id,
          cost_type: 'materials',
          amount: '85.00',
          description: 'Sal e acucar',
          responsible: 'Custos',
        })
        createRec('industrial_phase_costs', {
          phase_id: phase1.id,
          cost_type: 'energy',
          amount: '35.00',
          description: 'Aquecimento',
          responsible: 'Custos',
        })
      }
    }
    if (phase2) {
      var existingCosts2 = findRecsByFilter(
        'industrial_phase_costs',
        'phase_id = "' + phase2.id + '"',
        '',
        10,
      )
      if (existingCosts2.length === 0) {
        createRec('industrial_phase_costs', {
          phase_id: phase2.id,
          cost_type: 'labor',
          amount: '120.00',
          description: 'Mao de obra - mistura',
          responsible: 'Custos',
        })
        createRec('industrial_phase_costs', {
          phase_id: phase2.id,
          cost_type: 'machine',
          amount: '60.00',
          description: 'Horas maquina misturador',
          responsible: 'Custos',
        })
      }
    }
    if (phase3) {
      var existingCosts3 = findRecsByFilter(
        'industrial_phase_costs',
        'phase_id = "' + phase3.id + '"',
        '',
        10,
      )
      if (existingCosts3.length === 0) {
        createRec('industrial_phase_costs', {
          phase_id: phase3.id,
          cost_type: 'labor',
          amount: '250.00',
          description: 'Mao de obra - envase',
          responsible: 'Custos',
        })
        createRec('industrial_phase_costs', {
          phase_id: phase3.id,
          cost_type: 'machine',
          amount: '180.00',
          description: 'Horas maquina linha envase',
          responsible: 'Custos',
        })
        createRec('industrial_phase_costs', {
          phase_id: phase3.id,
          cost_type: 'losses',
          amount: '300.00',
          description: 'Perda de 120 potes de vidro',
          responsible: 'Custos',
        })
      }
    }

    // === TRACEABILITY ===
    var existingTrace = findRec('industrial_traceability', 'lot_number', 'LOT-REC-001')
    if (!existingTrace) {
      createRec('industrial_traceability', {
        production_order_id: op1.id,
        product_id: pa.id,
        raw_material_id: az ? az.id : '',
        lot_number: 'LOT-REC-001',
        serial_number: 'SER-RM-001',
        operator_name: 'Carlos Estoque',
        resource_id: resource ? resource.id : '',
        quantity: 1200,
        direction: 'entrada',
        timestamp: '2026-07-24T08:00:00Z',
        notes: 'Recebimento de azeitona verde - lote fornecedor AZ-2026-07',
      })
    }
    var existingTrace2 = findRec('industrial_traceability', 'lot_number', 'LOT-REC-002')
    if (!existingTrace2) {
      createRec('industrial_traceability', {
        production_order_id: op1.id,
        product_id: pa.id,
        raw_material_id: sal ? sal.id : '',
        lot_number: 'LOT-REC-002',
        serial_number: 'SER-RM-002',
        operator_name: 'Carlos Estoque',
        resource_id: resource ? resource.id : '',
        quantity: 100,
        direction: 'entrada',
        timestamp: '2026-07-24T08:30:00Z',
        notes: 'Recebimento de sal refinado',
      })
    }
    var existingTrace3 = findRec('industrial_traceability', 'lot_number', 'LOT-PROD-001')
    if (!existingTrace3) {
      createRec('industrial_traceability', {
        production_order_id: op1.id,
        product_id: pa.id,
        raw_material_id: pote ? pote.id : '',
        lot_number: 'LOT-PROD-001',
        serial_number: 'SER-PROD-001',
        operator_name: 'Joao Silva',
        resource_id: resource ? resource.id : '',
        quantity: 2500,
        direction: 'saida',
        timestamp: '2026-07-27T12:00:00Z',
        notes: 'Produto acabado - 2500 potes 200ml',
      })
    }
    var existingTrace4 = findRec('industrial_traceability', 'lot_number', 'LOT-EXP-001')
    if (!existingTrace4) {
      createRec('industrial_traceability', {
        production_order_id: op1.id,
        product_id: pa.id,
        raw_material_id: tampa ? tampa.id : '',
        lot_number: 'LOT-EXP-001',
        serial_number: 'SER-EXP-001',
        operator_name: 'Pedro Expedicao',
        resource_id: resource ? resource.id : '',
        quantity: 2000,
        direction: 'saida',
        timestamp: '2026-07-28T16:00:00Z',
        notes: 'Expedicao parcial - 2000 potes para distribuicao',
      })
    }

    // === QUALITY NON-CONFORMITY ===
    var existingNc = findRec(
      'quality_non_conformities',
      'description',
      'Ruptura de potes de vidro - lote LOT-ENVASE-001',
    )
    if (!existingNc) {
      createRec('quality_non_conformities', {
        production_order_id: op1.id,
        product_id: pa.id,
        description: 'Ruptura de potes de vidro - lote LOT-ENVASE-001',
        severity: 'media',
        status: 'em_analise',
        quantity_affected: 120,
        root_cause: 'Choque termico no envase a quente',
        corrective_action: 'Ajustar temperatura de envase e revisar transporte interno',
        lot_number: 'LOT-ENVASE-001',
        responsible: 'Qualidade',
      })
    }

    // === MAINTENANCE IMPACT ===
    var existingMaint = findRec(
      'maintenance_schedules',
      'title',
      'Manutencao Corretiva Linha Envase',
    )
    if (!existingMaint && resource) {
      createRec('maintenance_schedules', {
        resource_id: resource.id,
        type: 'corretiva',
        title: 'Manutencao Corretiva Linha Envase',
        description: 'Troca de selo hidraulico da pistola de envase - vazamento detectado',
        frequency_days: 0,
        status: 'em_andamento',
        impact_on_production: 'alto',
        estimated_downtime_hours: 6,
        responsible: 'Manutencao',
        next_maintenance: '2026-08-05',
      })
    }

    // === APS SCHEDULES ===
    var existingAps = findRec('aps_schedules', 'operation_name', 'Envase OP-2026-0002')
    if (!existingAps) {
      createRec('aps_schedules', {
        production_order_id: op1.id,
        resource_id: resource ? resource.id : '',
        operation_name: 'Envase OP-2026-0002',
        scheduled_start: '2026-08-01T06:00:00.000Z',
        scheduled_end: '2026-08-01T18:00:00.000Z',
        duration_minutes: 720,
        status: 'confirmado',
        sequence: 1,
        responsible: 'PCP',
      })
    }
    var existingAps2 = findRec('aps_schedules', 'operation_name', 'Rotulagem OP-2026-0002')
    if (!existingAps2) {
      createRec('aps_schedules', {
        production_order_id: op1.id,
        resource_id: resource ? resource.id : '',
        operation_name: 'Rotulagem OP-2026-0002',
        scheduled_start: '2026-08-02T06:00:00.000Z',
        scheduled_end: '2026-08-02T12:00:00.000Z',
        duration_minutes: 360,
        status: 'confirmado',
        sequence: 2,
        responsible: 'PCP',
      })
    }
    var existingAps3 = findRec('aps_schedules', 'operation_name', 'Encartonagem OP-2026-0002')
    if (!existingAps3) {
      createRec('aps_schedules', {
        production_order_id: op1.id,
        resource_id: resource ? resource.id : '',
        operation_name: 'Encartonagem OP-2026-0002',
        scheduled_start: '2026-08-03T06:00:00.000Z',
        scheduled_end: '2026-08-03T10:00:00.000Z',
        duration_minutes: 240,
        status: 'planejado',
        sequence: 3,
        responsible: 'PCP',
      })
    }
    var existingAps4 = findRec('aps_schedules', 'operation_name', 'Paletizacao OP-2026-0002')
    if (!existingAps4) {
      createRec('aps_schedules', {
        production_order_id: op1.id,
        resource_id: resource ? resource.id : '',
        operation_name: 'Paletizacao OP-2026-0002',
        scheduled_start: '2026-08-03T14:00:00.000Z',
        scheduled_end: '2026-08-03T18:00:00.000Z',
        duration_minutes: 240,
        status: 'planejado',
        sequence: 4,
        responsible: 'PCP',
      })
    }
    var existingAps5 = findRec('aps_schedules', 'operation_name', 'Envase OP-2026-0003')
    if (!existingAps5) {
      createRec('aps_schedules', {
        production_order_id: op2.id,
        resource_id: resource ? resource.id : '',
        operation_name: 'Envase OP-2026-0003',
        scheduled_start: '2026-08-05T06:00:00.000Z',
        scheduled_end: '2026-08-05T12:00:00.000Z',
        duration_minutes: 360,
        status: 'planejado',
        sequence: 5,
        responsible: 'PCP',
      })
    }

    // === STOCK ADJUSTMENTS (critical stock for raw materials) ===
    if (az) {
      try {
        var azRec = app.findRecordById('products', az.id)
        azRec.set('stock', 800)
        azRec.set('min_stock', 500)
        app.save(azRec)
      } catch (_) {}
    }
    if (pote) {
      try {
        var poteRec = app.findRecordById('products', pote.id)
        poteRec.set('stock', 3500)
        poteRec.set('min_stock', 3000)
        app.save(poteRec)
      } catch (_) {}
    }
    if (pa) {
      try {
        var paRec = app.findRecordById('products', pa.id)
        paRec.set('stock', 2500)
        paRec.set('min_stock', 1000)
        paRec.set('max_stock', 20000)
        app.save(paRec)
      } catch (_) {}
    }

    // === THRESHOLD REFINEMENT ===
    // Adjust thresholds based on simulated operation analysis
    var thCol = app.findCollectionByNameOrId('industrial_threshold_config')
    var refinements = {
      loss_threshold: '15',
      total_loss_threshold: '80',
      capacity_saturation: '4',
      bottleneck_ops: '3',
      critical_delay_days: '5',
      at_risk_days: '3',
      wip_threshold: '8',
      cost_deviation: '8000',
      low_productivity: '15',
      high_productivity: '80',
      idle_ratio: '0.35',
      min_oee: '65',
    }
    for (var thKey in refinements) {
      try {
        var thRec = app.findFirstRecordByData('industrial_threshold_config', 'key', thKey)
        if (thRec) {
          thRec.set('value', refinements[thKey])
          app.save(thRec)
        }
      } catch (_) {}
    }

    console.log('0105: industrial E2E simulation seed data created')
  },
  (app) => {
    function safeDelete(col, filter) {
      try {
        var rs = app.findRecordsByFilter(col, filter, '-created', 100, 0)
        for (var i = 0; i < rs.length; i++) {
          try {
            app.delete(rs[i])
          } catch (_) {}
        }
      } catch (_) {}
    }
    safeDelete(
      'aps_schedules',
      'operation_name ~ "OP-2026-0002" || operation_name ~ "OP-2026-0003"',
    )
    safeDelete(
      'industrial_traceability',
      'lot_number ~ "LOT-REC" || lot_number ~ "LOT-PROD" || lot_number ~ "LOT-EXP"',
    )
    safeDelete(
      'industrial_phase_costs',
      'description ~ "Mao de obra" || description ~ "Sal e acucar" || description ~ "Aquecimento" || description ~ "Horas maquina" || description ~ "Perda de 120"',
    )
    safeDelete('industrial_apontamentos', 'production_order_id != "" && lot_number ~ "LOT-"')
    safeDelete('industrial_phases', 'production_order_id != "" && operation_name ~ "Salmoura"')
    safeDelete('quality_non_conformities', 'description ~ "Ruptura de potes"')
    safeDelete('maintenance_schedules', 'title = "Manutencao Corretiva Linha Envase"')
    safeDelete(
      'production_orders',
      'order_number ~ "OP-2026-000" && order_number != "OP-2026-0001"',
    )
    safeDelete(
      'industrial_demand',
      'demand_number = "DEM-2026-002" || demand_number = "DEM-2026-003"',
    )
  },
)
