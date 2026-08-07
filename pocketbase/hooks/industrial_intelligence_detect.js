routerAdd('POST', '/backend/v1/industrial/intelligence/detect', (e) => {
  var internalSecret = $secrets.get('PB_SUPERUSER_TOKEN') || ''
  var providedSecret = e.request.header.get('X-Internal-Secret') || ''
  if (!e.auth && !(internalSecret && providedSecret && providedSecret === internalSecret)) {
    return e.unauthorizedError('Authentication required')
  }

  var results = { insights: 0, alerts: 0, predictions: 0, recommendations: 0 }
  var body = e.requestInfo().body || {}

  function J(o) {
    return JSON.stringify(o)
  }
  function now() {
    return new Date().toISOString()
  }

  function hasExisting(col, key) {
    try {
      var r = $app.findRecordsByFilter(
        col,
        'detection_key = "' +
          key +
          '" && status != "dismissed" && status != "rejected" && status != "expired" && status != "resolved" && status != "implemented"',
        '-created',
        1,
        0,
      )
      return r.length > 0
    } catch (_) {
      return false
    }
  }

  function createRec(col, data) {
    try {
      var c = $app.findCollectionByNameOrId(col)
      var r = new Record(c)
      for (var k in data) r.set(k, data[k])
      $app.save(r)
      return true
    } catch (err) {
      $app.logger().error('intelligence create failed', 'col', col, 'error', String(err))
      return false
    }
  }

  function mkInsight(
    type,
    keyId,
    title,
    desc,
    category,
    origin,
    dataUsed,
    evidence,
    srcRecs,
    extra,
  ) {
    var dkey = type + ':' + keyId
    if (hasExisting('industrial_intelligence_insights', dkey)) return
    var d = {
      detection_key: dkey,
      type: type,
      title: title,
      description: desc,
      category: category,
      origin: origin,
      data_used: J(dataUsed),
      evidence: J(evidence),
      source_records: J(srcRecs),
    }
    if (extra) {
      for (var k in extra) {
        if (extra[k] !== undefined && extra[k] !== null) d[k] = extra[k]
      }
    }
    if (createRec('industrial_intelligence_insights', d)) results.insights++
  }

  function mkAlert(
    type,
    keyId,
    severity,
    title,
    desc,
    priority,
    origin,
    justification,
    dataUsed,
    impact,
    evidence,
    srcRecs,
    extra,
  ) {
    var dkey = type + ':' + keyId
    if (hasExisting('industrial_intelligence_alerts', dkey)) return
    var d = {
      detection_key: dkey,
      type: type,
      severity: severity,
      title: title,
      description: desc,
      status: 'open',
      priority: priority,
      origin: origin,
      justification: justification,
      data_used: J(dataUsed),
      expected_impact: impact,
      evidence: J(evidence),
      source_records: J(srcRecs),
      resolved: false,
    }
    if (extra) {
      for (var k in extra) {
        if (extra[k] !== undefined && extra[k] !== null) d[k] = extra[k]
      }
    }
    if (createRec('industrial_intelligence_alerts', d)) results.alerts++
  }

  function mkPrediction(
    type,
    keyId,
    title,
    desc,
    probability,
    origin,
    justification,
    dataUsed,
    evidence,
    srcRecs,
    extra,
  ) {
    var dkey = type + ':' + keyId
    if (hasExisting('industrial_intelligence_predictions', dkey)) return
    var d = {
      detection_key: dkey,
      type: type,
      title: title,
      description: desc,
      probability: probability,
      status: 'active',
      origin: origin,
      justification: justification,
      data_used: J(dataUsed),
      evidence: J(evidence),
      source_records: J(srcRecs),
    }
    if (extra) {
      for (var k in extra) {
        if (extra[k] !== undefined && extra[k] !== null) d[k] = extra[k]
      }
    }
    if (createRec('industrial_intelligence_predictions', d)) results.predictions++
  }

  function mkRec(
    type,
    keyId,
    title,
    desc,
    priority,
    origin,
    justification,
    dataUsed,
    impact,
    evidence,
    srcRecs,
    extra,
  ) {
    var dkey = type + ':' + keyId
    if (hasExisting('industrial_intelligence_recommendations', dkey)) return
    var d = {
      detection_key: dkey,
      type: type,
      title: title,
      description: desc,
      status: 'pending',
      priority: priority,
      origin: origin,
      justification: justification,
      data_used: J(dataUsed),
      expected_impact: impact,
      evidence: J(evidence),
      source_records: J(srcRecs),
    }
    if (extra) {
      for (var k in extra) {
        if (extra[k] !== undefined && extra[k] !== null) d[k] = extra[k]
      }
    }
    if (createRec('industrial_intelligence_recommendations', d)) results.recommendations++
  }

  var dt = new Date()
  var todayStr = dt.toISOString().substring(0, 10)

  var TH = {
    loss_threshold: 10,
    total_loss_threshold: 50,
    capacity_saturation: 5,
    bottleneck_ops: 3,
    critical_delay_days: 7,
    at_risk_days: 3,
    wip_threshold: 10,
    cost_deviation: 10000,
    low_productivity: 10,
    high_productivity: 50,
    idle_ratio: 0.4,
    min_oee: 60,
  }
  try {
    var thRecs = $app.findRecordsByFilter(
      'industrial_threshold_config',
      'active = true',
      '',
      100,
      0,
    )
    for (var thi = 0; thi < thRecs.length; thi++) {
      var thKey = thRecs[thi].getString('key')
      var thVal = parseFloat(thRecs[thi].getString('value'))
      if (!isNaN(thVal) && TH[thKey] !== undefined) TH[thKey] = thVal
    }
  } catch (_) {}

  // === PRODUCTION ORDERS ===
  try {
    var orders = $app.findRecordsByFilter(
      'production_orders',
      'status != "concluida" && status != "cancelada" && status != "fechada"',
      '-created',
      200,
      0,
    )
    var activePhases = {}
    try {
      var phases = $app.findRecordsByFilter(
        'industrial_phases',
        'status = "in_progress"',
        '-created',
        500,
        0,
      )
      for (var p = 0; p < phases.length; p++) {
        var poId = phases[p].getString('production_order_id') || ''
        if (poId) activePhases[poId] = (activePhases[poId] || 0) + 1
      }
    } catch (_) {}

    var lateCount = 0,
      atRiskCount = 0,
      stoppedCount = 0,
      wipCount = 0
    for (var i = 0; i < orders.length; i++) {
      var o = orders[i]
      var orderNum = o.getString('order_number') || o.id
      var ed = o.getString('end_date') || ''
      var status = o.getString('status') || ''
      var emp = o.getString('company') || ''
      var fil = o.getString('branch') || ''
      var src = [{ collection: 'production_orders', id: o.id }]
      var hasActive = activePhases[o.id] > 0

      if (ed) {
        var d = new Date(ed)
        if (d < dt) {
          var daysLate = Math.ceil((dt - d) / 86400000)
          lateCount++
          mkAlert(
            'predicted_delay',
            o.id,
            daysLate > TH.critical_delay_days ? 'critical' : 'warning',
            'OP Atrasada: ' + orderNum,
            'Ordem ' + orderNum + ' atrasada ' + daysLate + ' dia(s)',
            daysLate > TH.critical_delay_days ? 'urgent' : 'high',
            'production_orders',
            'Data de término ' + ed + ' excedida há ' + daysLate + ' dias',
            { order_number: orderNum, end_date: ed, days_late: daysLate },
            'Atraso na entrega, possível multa e insatisfação do cliente',
            [{ collection: 'production_orders', id: o.id, field: 'end_date', value: ed }],
            src,
            { order_id: o.id, empresa: emp, filial: fil },
          )
          mkInsight(
            'late_order',
            o.id,
            'Ordem Atrasada: ' + orderNum,
            'Atraso de ' + daysLate + ' dia(s)',
            'operational',
            'production_orders',
            { order_number: orderNum, end_date: ed, days_late: daysLate },
            [{ collection: 'production_orders', id: o.id, field: 'end_date', value: ed }],
            src,
            { order_id: o.id, value: daysLate, unit: 'days', empresa: emp, filial: fil },
          )
          mkPrediction(
            'production_delay',
            o.id,
            'Atraso de Produção: ' + orderNum,
            'Produção atrasada ' + daysLate + ' dias',
            'high',
            'production_orders',
            'OP com data de término excedida',
            { order_number: orderNum, days_late: daysLate },
            [{ collection: 'production_orders', id: o.id }],
            src,
            { order_id: o.id, predicted_date: ed, empresa: emp, filial: fil },
          )
          mkPrediction(
            'delivery_delay',
            o.id,
            'Entrega Atrasada: ' + orderNum,
            'Entrega prevista atrasada',
            'high',
            'production_orders',
            'OP atrasada impacta entrega',
            { order_number: orderNum, days_late: daysLate },
            [{ collection: 'production_orders', id: o.id }],
            src,
            { order_id: o.id, predicted_date: ed, empresa: emp, filial: fil },
          )
          mkRec(
            'replan_production',
            o.id,
            'Replanejar Produção: ' + orderNum,
            'OP atrasada ' + daysLate + ' dias — replanejar cronograma',
            'high',
            'production_orders',
            'Atraso de ' + daysLate + ' dias requer replanejamento',
            { order_number: orderNum, days_late: daysLate },
            'Reduzir atraso e recuperar cronograma',
            [{ collection: 'production_orders', id: o.id }],
            src,
            { order_id: o.id, empresa: emp, filial: fil },
          )
        } else {
          var daysLeft = Math.ceil((d - dt) / 86400000)
          if (daysLeft <= TH.at_risk_days && !hasActive) {
            atRiskCount++
            mkInsight(
              'order_at_risk',
              o.id,
              'OP em Risco: ' + orderNum,
              'OP termina em ' + daysLeft + ' dia(s) sem fases ativas',
              'operational',
              'production_orders',
              {
                order_number: orderNum,
                end_date: ed,
                days_left: daysLeft,
                has_active_phases: false,
              },
              [{ collection: 'production_orders', id: o.id, field: 'end_date', value: ed }],
              src,
              { order_id: o.id, value: daysLeft, unit: 'days', empresa: emp, filial: fil },
            )
            mkPrediction(
              'production_delay',
              o.id,
              'Risco de Atraso: ' + orderNum,
              'OP sem fases ativas e término próximo',
              'medium',
              'production_orders',
              'Faltam ' + daysLeft + ' dias e não há fases em execução',
              { order_number: orderNum, days_left: daysLeft },
              [{ collection: 'production_orders', id: o.id }],
              src,
              { order_id: o.id, predicted_date: ed, empresa: emp, filial: fil },
            )
          }
        }
      }

      if (!hasActive && status !== 'concluida' && status !== 'cancelada') {
        stoppedCount++
        mkAlert(
          'stopped_op',
          o.id,
          'warning',
          'OP Parada: ' + orderNum,
          'OP sem fases em execução',
          'medium',
          'production_orders',
          'Ordem ativa sem fases em progresso',
          { order_number: orderNum, status: status },
          'Parada de produção, ociosidade de recursos',
          [{ collection: 'production_orders', id: o.id }],
          src,
          { order_id: o.id, empresa: emp, filial: fil },
        )
        mkInsight(
          'elevated_wip',
          o.id,
          'WIP Elevado: ' + orderNum,
          'OP em aberto sem atividade',
          'operational',
          'production_orders',
          { order_number: orderNum, status: status },
          [{ collection: 'production_orders', id: o.id }],
          src,
          { order_id: o.id, empresa: emp, filial: fil },
        )
      }
      wipCount++
    }

    if (wipCount > TH.wip_threshold) {
      mkInsight(
        'elevated_wip',
        'global',
        'WIP Elevado',
        wipCount + ' ordens em andamento',
        'operational',
        'production_orders',
        { total_wip: wipCount },
        [],
        [],
        { value: wipCount, unit: 'orders' },
      )
    }
    if (lateCount > 0) {
      mkInsight(
        'low_planning_adherence',
        'global',
        'Baixa Aderência ao Plano',
        lateCount + ' ordens atrasadas de ' + orders.length,
        'planning',
        'production_orders',
        {
          late: lateCount,
          total: orders.length,
          adherence: (((orders.length - lateCount) / orders.length) * 100).toFixed(1) + '%',
        },
        [],
        [],
      )
      mkRec(
        'replan_production',
        'global',
        'Replanejar Produção',
        lateCount + ' ordens atrasadas necessitam replanejamento',
        'urgent',
        'production_orders',
        'Aderência ao plano abaixo do ideal',
        { late_orders: lateCount },
        'Recuperar cronograma de produção',
        [],
        [],
      )
    }
  } catch (_) {}

  // === INDUSTRIAL PHASES ===
  try {
    var allPhases = $app.findRecordsByFilter('industrial_phases', '', '-created', 500, 0)
    var lossMap = {},
      reworkMap = {},
      pendingQ = 0,
      lossTotal = 0
    for (var pi = 0; pi < allPhases.length; pi++) {
      var ph = allPhases[pi]
      var opName = ph.getString('operation_name') || ''
      var phStatus = ph.getString('status') || ''
      var qStatus = ph.getString('quality_status') || ''
      var wc = ph.getString('work_center') || ''
      var phSrc = [{ collection: 'industrial_phases', id: ph.id }]
      var losses = ph.get('losses')
      var lossQty = 0
      if (losses && typeof losses === 'object') {
        lossQty = parseFloat(losses.quantity || losses.total || '0') || 0
      }
      if (lossQty > 0) {
        lossMap[opName] = (lossMap[opName] || 0) + lossQty
        lossTotal += lossQty
        if (lossQty > TH.loss_threshold) {
          mkAlert(
            'excess_losses',
            ph.id,
            'warning',
            'Perdas Excessivas: ' + opName,
            'Fase com ' + lossQty + ' unidades de perda',
            'high',
            'industrial_phases',
            'Perda acima do limite na fase ' + opName,
            { operation: opName, loss_qty: lossQty },
            'Aumento de custo e redução de eficiência',
            [{ collection: 'industrial_phases', id: ph.id, field: 'losses', value: lossQty }],
            phSrc,
            { work_center_id: wc },
          )
        }
        mkInsight(
          'increased_losses',
          ph.id,
          'Perdas: ' + opName,
          lossQty + ' unidades perdidas',
          'quality',
          'industrial_phases',
          { operation: opName, loss_qty: lossQty },
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc, value: lossQty, unit: 'units' },
        )
        mkInsight(
          'increased_scrap',
          ph.id,
          'Scrap: ' + opName,
          lossQty + ' unidades de scrap',
          'quality',
          'industrial_phases',
          { operation: opName, scrap_qty: lossQty },
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc, value: lossQty, unit: 'units' },
        )
      }
      if (phStatus === 'rework') {
        reworkMap[opName] = (reworkMap[opName] || 0) + 1
        mkAlert(
          'excess_rework',
          ph.id,
          'warning',
          'Retrabalho: ' + opName,
          'Fase em retrabalho',
          'high',
          'industrial_phases',
          'Status da fase é retrabalho',
          { operation: opName, status: 'rework' },
          'Aumento de tempo e custo de produção',
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc },
        )
        mkInsight(
          'increased_rework',
          ph.id,
          'Retrabalho: ' + opName,
          'Fase requer retrabalho',
          'quality',
          'industrial_phases',
          { operation: opName, status: 'rework' },
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc },
        )
        mkRec(
          'review_engineering',
          ph.id,
          'Revisar Engenharia: ' + opName,
          'Retrabalho recorrente — revisar especificações',
          'medium',
          'industrial_phases',
          'Fases com retrabalho indicam problema de engenharia',
          { operation: opName },
          'Reduzir retrabalho e melhorar qualidade',
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc },
        )
      }
      if (qStatus === 'pending') {
        pendingQ++
        mkAlert(
          'pending_inspection',
          ph.id,
          'info',
          'Inspeção Pendente: ' + opName,
          'Fase aguardando inspeção de qualidade',
          'medium',
          'industrial_phases',
          'Quality_status pendente',
          { operation: opName, quality_status: 'pending' },
          'Possível atraso se rejeitada',
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc },
        )
      }
      var actualT = ph.getFloat('actual_time_minutes') || 0
      var expectedT = ph.getFloat('expected_time_minutes') || 0
      if (expectedT > 0 && actualT > expectedT * 1.5) {
        mkInsight(
          'bottleneck',
          ph.id,
          'Gargalo: ' + opName,
          'Tempo real ' + actualT + 'min vs esperado ' + expectedT + 'min',
          'operational',
          'industrial_phases',
          {
            operation: opName,
            actual: actualT,
            expected: expectedT,
            ratio: (actualT / expectedT).toFixed(2),
          },
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc, value: actualT, unit: 'minutes' },
        )
        mkInsight(
          'critical_work_center',
          ph.id,
          'Centro Crítico: ' + wc,
          'Centro com tempo excedido em ' + opName,
          'operational',
          'industrial_phases',
          { work_center: wc, operation: opName },
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc },
        )
        mkRec(
          'review_routing',
          ph.id,
          'Revisar Roteiro: ' + opName,
          'Tempo excedido — revisar roteiro de produção',
          'medium',
          'industrial_phases',
          'Tempo real ' + (actualT / expectedT).toFixed(2) + 'x o esperado',
          { operation: opName, actual: actualT, expected: expectedT },
          'Otimizar fluxo e reduzir tempo',
          [{ collection: 'industrial_phases', id: ph.id }],
          phSrc,
          { work_center_id: wc },
        )
      }
    }
    if (lossTotal > TH.total_loss_threshold) {
      mkPrediction(
        'loss_increase_trend',
        'global',
        'Tendência de Aumento de Perdas',
        'Perdas totais elevadas: ' + lossTotal,
        'medium',
        'industrial_phases',
        'Perdas acumuladas acima do normal',
        { total_losses: lossTotal },
        [{ collection: 'industrial_phases', type: 'aggregate' }],
        [],
      )
    }
  } catch (_) {}

  // === APS SCHEDULES ===
  try {
    var aps = $app.findRecordsByFilter(
      'aps_schedules',
      'status != "cancelado" && status != "concluido"',
      '',
      500,
      0,
    )
    var apsMap = {}
    for (var s = 0; s < aps.length; s++) {
      var rid = aps[s].getString('resource_id') || ''
      if (rid) apsMap[rid] = (apsMap[rid] || 0) + 1
    }
    var bk = Object.keys(apsMap)
    var maxLoad = 0,
      maxRid = ''
    for (var b = 0; b < bk.length; b++) {
      var load = apsMap[bk[b]]
      if (load > maxLoad) {
        maxLoad = load
        maxRid = bk[b]
      }
      var rName = ''
      try {
        var r = $app.findRecordById('production_resources', bk[b])
        rName = r.getString('name')
      } catch (_) {}
      var rSrc = [
        { collection: 'aps_schedules', resource_id: bk[b] },
        { collection: 'production_resources', id: bk[b] },
      ]
      if (load >= 5) {
        mkInsight(
          'overloaded_machine',
          bk[b],
          'Máquina Sobrecarregada: ' + (rName || bk[b]),
          load + ' operações agendadas',
          'capacity',
          'aps_schedules',
          { resource_id: bk[b], resource_name: rName, scheduled_ops: load },
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b], value: load, unit: 'ops' },
        )
        mkAlert(
          'capacity_exhausted',
          bk[b],
          'critical',
          'Capacidade Esgotada: ' + (rName || bk[b]),
          load + ' operações agendadas',
          'urgent',
          'aps_schedules',
          'Recurso com carga elevada',
          { resource_name: rName, scheduled_ops: load },
          'Atraso em todas as OPs que usam este recurso',
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b] },
        )
        mkRec(
          'balance_load',
          bk[b],
          'Balancear Carga: ' + (rName || bk[b]),
          'Redistribuir ' + load + ' operações',
          'high',
          'aps_schedules',
          'Recurso sobrecarregado com ' + load + ' ops',
          { resource_name: rName, scheduled_ops: load },
          'Reduzir gargalo e equilibrar produção',
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b] },
        )
        mkRec(
          'switch_work_center',
          bk[b],
          'Trocar Centro: ' + (rName || bk[b]),
          'Mover operações para outro recurso',
          'high',
          'aps_schedules',
          'Sobrecarga detectada',
          { resource_name: rName, scheduled_ops: load },
          'Aliviar recurso crítico',
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b] },
        )
        mkRec(
          'review_capacity',
          bk[b],
          'Revisar Capacidade: ' + (rName || bk[b]),
          'Capacidade insuficiente para demanda',
          'medium',
          'aps_schedules',
          'Carga excede capacidade disponível',
          { resource_name: rName, scheduled_ops: load },
          'Avaliar expansão ou terceirização',
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b] },
        )
        mkInsight(
          'capacity_deviation',
          bk[b],
          'Desvio de Capacidade: ' + (rName || bk[b]),
          load + ' ops vs capacidade planejada',
          'capacity',
          'aps_schedules',
          { resource_name: rName, scheduled_ops: load },
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b], value: load, unit: 'ops' },
        )
        mkPrediction(
          'future_capacity_need',
          bk[b],
          'Necessidade Futura de Capacidade',
          'Demanda crescente no recurso ' + (rName || bk[b]),
          'medium',
          'aps_schedules',
          'Carga atual indica necessidade de mais capacidade',
          { resource_name: rName, scheduled_ops: load },
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b] },
        )
      }
      if (load >= TH.bottleneck_ops) {
        mkInsight(
          'bottleneck',
          bk[b],
          'Gargalo: ' + (rName || bk[b]),
          load + ' operações agendadas',
          'operational',
          'aps_schedules',
          { resource_name: rName, scheduled_ops: load },
          [{ collection: 'aps_schedules', resource_id: bk[b] }],
          rSrc,
          { machine_id: bk[b], value: load, unit: 'ops' },
        )
      }
    }
    // Low utilization
    try {
      var allRes = $app.findRecordsByFilter('production_resources', '', '', 500, 0)
      var idleCount = 0,
        totalRes = allRes.length
      for (var ri = 0; ri < allRes.length; ri++) {
        var resId = allRes[ri].id
        var resName = allRes[ri].getString('name') || resId
        var resActive = allRes[ri].getString('active') !== 'false'
        var resSrc = [{ collection: 'production_resources', id: resId }]
        if (!apsMap[resId]) {
          if (resActive) {
            idleCount++
            mkInsight(
              'idle_machine',
              resId,
              'Máquina Ociosa: ' + resName,
              'Sem operações agendadas',
              'capacity',
              'production_resources',
              { resource_name: resName, active: true },
              [{ collection: 'production_resources', id: resId }],
              resSrc,
              { machine_id: resId },
            )
            mkRec(
              'anticipate_maintenance',
              resId,
              'Antecipar Manutenção: ' + resName,
              'Máquina ociosa — janela para manutenção',
              'low',
              'production_resources',
              'Recurso sem carga pode receber manutenção',
              { resource_name: resName },
              'Prevenir falhas futuras',
              [{ collection: 'production_resources', id: resId }],
              resSrc,
              { machine_id: resId },
            )
          }
        }
        if (!resActive) {
          mkAlert(
            'machine_unavailable',
            resId,
            'warning',
            'Máquina Indisponível: ' + resName,
            'Recurso inativo',
            'high',
            'production_resources',
            'Recurso marcado como inativo',
            { resource_name: resName, active: false },
            'Redução de capacidade produtiva',
            [{ collection: 'production_resources', id: resId }],
            resSrc,
            { machine_id: resId },
          )
        }
      }
      if (totalRes > 0 && idleCount / totalRes > TH.idle_ratio) {
        mkInsight(
          'low_capacity_utilization',
          'global',
          'Baixa Utilização de Capacidade',
          idleCount + ' de ' + totalRes + ' máquinas ociosas',
          'capacity',
          'production_resources',
          {
            idle: idleCount,
            total: totalRes,
            utilization: (((totalRes - idleCount) / totalRes) * 100).toFixed(1) + '%',
          },
          [],
          [],
        )
      }
    } catch (_) {}
  } catch (_) {}

  // === PRODUCTS & STOCK ===
  try {
    var prods = $app.findRecordsByFilter('products', '', '', 500, 0)
    var ruptureCount = 0,
      excessCount = 0,
      criticalCount = 0
    for (var pi2 = 0; pi2 < prods.length; pi2++) {
      var pr = prods[pi2]
      var prName = pr.getString('name') || pr.id
      var stock = pr.getFloat('stock') || 0
      var minStock = pr.getFloat('min_stock') || 0
      var maxStock = pr.getFloat('max_stock') || 0
      var prActive = pr.get('active') !== false
      var prSrc = [{ collection: 'products', id: pr.id }]
      if (minStock > 0 && stock <= minStock) {
        ruptureCount++
        mkAlert(
          'critical_stock',
          pr.id,
          stock === 0 ? 'critical' : 'warning',
          'Estoque Crítico: ' + prName,
          'Estoque ' + stock + ' (mínimo: ' + minStock + ')',
          stock === 0 ? 'urgent' : 'high',
          'products',
          'Estoque abaixo do mínimo',
          { product_name: prName, stock: stock, min_stock: minStock },
          'Risco de parada de produção por falta de material',
          [{ collection: 'products', id: pr.id, field: 'stock', value: stock }],
          prSrc,
          { product_id: pr.id },
        )
        mkInsight(
          'stock_rupture_risk',
          pr.id,
          'Risco de Ruptura: ' + prName,
          'Estoque ' + stock + ' ≤ mínimo ' + minStock,
          'stock',
          'products',
          { product_name: prName, stock: stock, min_stock: minStock },
          [{ collection: 'products', id: pr.id }],
          prSrc,
          { product_id: pr.id, value: stock, unit: 'units' },
        )
        mkPrediction(
          'rupture_risk',
          pr.id,
          'Risco de Ruptura: ' + prName,
          'Estoque abaixo do mínimo',
          stock === 0 ? 'high' : 'medium',
          'products',
          'Estoque atual ' + stock + ' vs mínimo ' + minStock,
          { product_name: prName, stock: stock, min_stock: minStock },
          [{ collection: 'products', id: pr.id }],
          prSrc,
          { product_id: pr.id },
        )
        mkRec(
          'anticipate_purchase',
          pr.id,
          'Antecipar Compra: ' + prName,
          'Estoque crítico — antecipar compra',
          'urgent',
          'products',
          'Estoque ' + stock + ' abaixo do mínimo ' + minStock,
          { product_name: prName, stock: stock, min_stock: minStock },
          'Evitar ruptura e parada de produção',
          [{ collection: 'products', id: pr.id }],
          prSrc,
          { product_id: pr.id },
        )
        mkRec(
          'review_minimum_stock',
          pr.id,
          'Revisar Estoque Mínimo: ' + prName,
          'Ajustar parâmetro de estoque mínimo',
          'medium',
          'products',
          'Estoque mínimo pode estar mal calibrado',
          { product_name: prName, min_stock: minStock },
          'Otimizar política de estoque',
          [{ collection: 'products', id: pr.id }],
          prSrc,
          { product_id: pr.id },
        )
        if (stock === 0) {
          mkInsight(
            'critical_material',
            pr.id,
            'Material Crítico: ' + prName,
            'Sem estoque disponível',
            'stock',
            'products',
            { product_name: prName, stock: 0 },
            [{ collection: 'products', id: pr.id }],
            prSrc,
            { product_id: pr.id },
          )
          mkAlert(
            'order_awaiting_material',
            pr.id,
            'critical',
            'Aguardando Material: ' + prName,
            'Produto sem estoque pode parar OPs',
            'urgent',
            'products',
            'Estoque zero para produto ativo',
            { product_name: prName, stock: 0 },
            'Parada de produção se OPs dependem deste material',
            [{ collection: 'products', id: pr.id }],
            prSrc,
            { product_id: pr.id },
          )
          criticalCount++
        }
      }
      if (maxStock > 0 && stock > maxStock) {
        excessCount++
        mkInsight(
          'excess_stock',
          pr.id,
          'Excesso de Estoque: ' + prName,
          'Estoque ' + stock + ' > máximo ' + maxStock,
          'stock',
          'products',
          { product_name: prName, stock: stock, max_stock: maxStock },
          [{ collection: 'products', id: pr.id }],
          prSrc,
          { product_id: pr.id, value: stock, unit: 'units' },
        )
        mkRec(
          'review_economic_lot',
          pr.id,
          'Revisar Lote Econômico: ' + prName,
          'Excesso de estoque — revisar lote',
          'low',
          'products',
          'Estoque acima do máximo',
          { product_name: prName, stock: stock, max_stock: maxStock },
          'Reduzir custo de armazenagem',
          [{ collection: 'products', id: pr.id }],
          prSrc,
          { product_id: pr.id },
        )
      }
    }
    if (ruptureCount > 0) {
      mkPrediction(
        'future_raw_material_need',
        'global',
        'Necessidade Futura de Matéria-Prima',
        ruptureCount + ' produtos com estoque crítico',
        'high',
        'products',
        'Múltiplos produtos abaixo do estoque mínimo',
        { rupture_count: ruptureCount },
        [{ collection: 'products', type: 'aggregate' }],
        [],
      )
    }
  } catch (_) {}

  // === PURCHASE ORDERS ===
  try {
    var pos = $app.findRecordsByFilter(
      'purchase_orders',
      'status != "cancelada" && status != "concluida" && status != "recebida"',
      '-created',
      200,
      0,
    )
    for (var poi = 0; poi < pos.length; poi++) {
      var po = pos[poi]
      var poNum = po.getString('order_number') || po.id
      var supplier = po.getString('supplier_name') || ''
      var forecast = po.getString('delivery_forecast') || ''
      var poSrc = [{ collection: 'purchase_orders', id: po.id }]
      if (forecast) {
        var fd = new Date(forecast)
        if (fd < dt) {
          var poDaysLate = Math.ceil((dt - fd) / 86400000)
          mkAlert(
            'delayed_supplier',
            po.id,
            poDaysLate > TH.critical_delay_days ? 'critical' : 'warning',
            'Fornecedor Atrasado: ' + supplier,
            'PC ' + poNum + ' atrasada ' + poDaysLate + ' dia(s)',
            'high',
            'purchase_orders',
            'Entrega prevista ' + forecast + ' excedida',
            {
              order_number: poNum,
              supplier: supplier,
              delivery_forecast: forecast,
              days_late: poDaysLate,
            },
            'Atraso pode impactar produção',
            [
              {
                collection: 'purchase_orders',
                id: po.id,
                field: 'delivery_forecast',
                value: forecast,
              },
            ],
            poSrc,
          )
          mkInsight(
            'supplier_delay_impact',
            po.id,
            'Atraso de Fornecedor: ' + supplier,
            'PC ' + poNum + ' atrasada ' + poDaysLate + ' dias',
            'supplier',
            'purchase_orders',
            { supplier: supplier, order_number: poNum, days_late: poDaysLate },
            [{ collection: 'purchase_orders', id: po.id }],
            poSrc,
            { value: poDaysLate, unit: 'days' },
          )
          mkRec(
            'review_supplier',
            po.id,
            'Revisar Fornecedor: ' + supplier,
            'Atraso de ' + poDaysLate + ' dias — avaliar fornecedor',
            'high',
            'purchase_orders',
            'Atraso recorrente pode comprometer produção',
            { supplier: supplier, days_late: poDaysLate },
            'Identificar fornecedores alternativos',
            [{ collection: 'purchase_orders', id: po.id }],
            poSrc,
          )
        }
      }
    }
  } catch (_) {}

  // === INDUSTRIAL COSTS ===
  try {
    var costs = $app.findRecordsByFilter('industrial_costs', '', '-created', 500, 0)
    var costMap = {}
    var totalCost = 0
    for (var ci = 0; ci < costs.length; ci++) {
      var c = costs[ci]
      var itemId = c.getString('item_id') || c.getString('product_id') || ''
      var tc = parseFloat(c.getString('total_cost') || c.getString('amount') || '0') || 0
      if (itemId) costMap[itemId] = (costMap[itemId] || 0) + tc
      totalCost += tc
      if (tc > TH.cost_deviation) {
        var cName = ''
        try {
          var cp = $app.findRecordById('products', itemId)
          cName = cp.getString('name')
        } catch (_) {}
        mkInsight(
          'cost_above_standard',
          c.id,
          'Custo Acima do Padrão: ' + (cName || itemId),
          'Custo total R$ ' + tc.toFixed(2),
          'cost',
          'industrial_costs',
          { item_id: itemId, total_cost: tc },
          [{ collection: 'industrial_costs', id: c.id }],
          [
            { collection: 'industrial_costs', id: c.id },
            { collection: 'products', id: itemId },
          ],
          { product_id: itemId, value: tc.toFixed(2), unit: 'BRL' },
        )
        mkAlert(
          'cost_above_forecast',
          c.id,
          'warning',
          'Custo Acima do Previsto: ' + (cName || itemId),
          'R$ ' + tc.toFixed(2),
          'medium',
          'industrial_costs',
          'Custo acima do orçado',
          { item_id: itemId, total_cost: tc },
          'Impacto no margin e lucratividade',
          [{ collection: 'industrial_costs', id: c.id }],
          [{ collection: 'industrial_costs', id: c.id }],
          { product_id: itemId },
        )
      }
    }
    if (totalCost > 0) {
      mkPrediction(
        'cost_increase_trend',
        'global',
        'Tendência de Aumento de Custo',
        'Custo total R$ ' + totalCost.toFixed(2),
        'medium',
        'industrial_costs',
        'Custos acumulados elevados',
        { total_cost: totalCost },
        [{ collection: 'industrial_costs', type: 'aggregate' }],
        [],
      )
      mkPrediction(
        'production_financial_risk',
        'global',
        'Risco Financeiro de Produção',
        'Custos elevados podem impactar margem',
        'medium',
        'industrial_costs',
        'Custo total R$ ' + totalCost.toFixed(2),
        { total_cost: totalCost },
        [{ collection: 'industrial_costs', type: 'aggregate' }],
        [],
      )
    }
  } catch (_) {}

  // === APONTAMENTOS ===
  try {
    var aps2 = $app.findRecordsByFilter('industrial_apontamentos', '', '-created', 500, 0)
    var opMap = {},
      teamMap = {}
    for (var ai = 0; ai < aps2.length; ai++) {
      var a = aps2[ai]
      var opName2 = a.getString('operator_name') || ''
      var team = a.getString('team_name') || ''
      var qty = a.getFloat('quantity_produced') || 0
      var setupT = a.getFloat('setup_time') || a.getFloat('setup_time_minutes') || 0
      if (opName2) opMap[opName2] = (opMap[opName2] || 0) + qty
      if (team) teamMap[team] = (teamMap[team] || 0) + qty
      if (qty === 0) {
        mkInsight(
          'low_productivity',
          a.id,
          'Baixa Produtividade',
          'Apontamento sem produção',
          'operational',
          'industrial_apontamentos',
          { operator: opName2, quantity: 0 },
          [{ collection: 'industrial_apontamentos', id: a.id }],
          [{ collection: 'industrial_apontamentos', id: a.id }],
        )
      }
    }
    var opKeys = Object.keys(opMap)
    for (var ok = 0; ok < opKeys.length; ok++) {
      if (opMap[opKeys[ok]] < TH.low_productivity) {
        mkInsight(
          'low_productivity_operator',
          opKeys[ok],
          'Operador de Baixa Produtividade: ' + opKeys[ok],
          opMap[opKeys[ok]] + ' unidades produzidas',
          'operational',
          'industrial_apontamentos',
          { operator: opKeys[ok], total_produced: opMap[opKeys[ok]] },
          [{ collection: 'industrial_apontamentos', operator: opKeys[ok] }],
          [{ collection: 'industrial_apontamentos', type: 'aggregate', operator: opKeys[ok] }],
          { value: opMap[opKeys[ok]], unit: 'units' },
        )
        mkAlert(
          'oee_below_target',
          opKeys[ok],
          'info',
          'OEE Baixo: ' + opKeys[ok],
          'Produção abaixo da meta',
          'low',
          'industrial_apontamentos',
          'Operador com baixa produção',
          { operator: opKeys[ok], produced: opMap[opKeys[ok]] },
          'Redução de eficiência geral',
          [{ collection: 'industrial_apontamentos', operator: opKeys[ok] }],
          [],
        )
        mkPrediction(
          'productivity_drop_trend',
          opKeys[ok],
          'Tendência de Queda de Produtividade: ' + opKeys[ok],
          'Produção acumulada baixa',
          'low',
          'industrial_apontamentos',
          'Produção abaixo de 10 unidades',
          { operator: opKeys[ok], produced: opMap[opKeys[ok]] },
          [{ collection: 'industrial_apontamentos', operator: opKeys[ok] }],
          [],
        )
      }
    }
    var teamKeys = Object.keys(teamMap)
    for (var tk = 0; tk < teamKeys.length; tk++) {
      if (teamMap[teamKeys[tk]] > TH.high_productivity) {
        mkInsight(
          'best_performing_team',
          teamKeys[tk],
          'Melhor Equipe: ' + teamKeys[tk],
          teamMap[teamKeys[tk]] + ' unidades produzidas',
          'operational',
          'industrial_apontamentos',
          { team: teamKeys[tk], total_produced: teamMap[teamKeys[tk]] },
          [{ collection: 'industrial_apontamentos', team: teamKeys[tk] }],
          [{ collection: 'industrial_apontamentos', type: 'aggregate', team: teamKeys[tk] }],
          { value: teamMap[teamKeys[tk]], unit: 'units' },
        )
      }
    }
  } catch (_) {}

  // === DEMAND ===
  try {
    var demands = $app.findRecordsByFilter(
      'industrial_demand',
      'status = "open"',
      '-created',
      100,
      0,
    )
    if (demands.length > 0) {
      mkPrediction(
        'future_capacity_need',
        'global',
        'Necessidade Futura de Capacidade',
        demands.length + ' demandas em aberto',
        'medium',
        'industrial_demand',
        'Demandas não atendidas indicam necessidade de capacidade',
        { open_demands: demands.length },
        [{ collection: 'industrial_demand', type: 'aggregate' }],
        [],
      )
      mkRec(
        'redistribute_production',
        'global',
        'Redistribuir Produção',
        demands.length + ' demandas em aberto requerem planejamento',
        'medium',
        'industrial_demand',
        'Demandas em aberto',
        { open_demands: demands.length },
        'Atender demandas pendentes',
        [{ collection: 'industrial_demand', type: 'aggregate' }],
        [],
      )
    }
  } catch (_) {}

  // === ADDITIONAL RECOMMENDATIONS ===
  try {
    var lateOrdersExist = false
    try {
      var lo = $app.findRecordsByFilter(
        'industrial_intelligence_alerts',
        'type = "predicted_delay" && status = "open"',
        '-created',
        1,
        0,
      )
      lateOrdersExist = lo.length > 0
    } catch (_) {}
    if (lateOrdersExist) {
      mkRec(
        'change_sequence',
        'global',
        'Alterar Sequência de Produção',
        'Reordenar OPs para priorizar atrasadas',
        'high',
        'industrial_intelligence_alerts',
        'Existem OPs atrasadas que precisam priorização',
        { source: 'alerts' },
        'Reduzir atrasos totais',
        [],
        [],
      )
    }
  } catch (_) {}

  return e.json(200, results)
})
