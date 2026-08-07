routerAdd(
  'GET',
  '/backend/v1/industrial/intelligence/executive-panel',
  (e) => {
    var data = {}

    function safeFilter(col, filter, sort, limit) {
      try {
        return $app.findRecordsByFilter(col, filter || '', sort || '', limit || 500, 0)
      } catch (_) {
        return []
      }
    }

    // GERAL
    var orders = safeFilter(
      'production_orders',
      'status != "concluida" && status != "cancelada" && status != "fechada"',
      '-created',
      200,
    )
    var now = new Date()
    var lateOrders = [],
      criticalOrders = [],
      completedToday = 0
    for (var i = 0; i < orders.length; i++) {
      var ed = orders[i].getString('end_date') || ''
      if (ed && new Date(ed) < now) {
        lateOrders.push({
          order_number: orders[i].getString('order_number') || orders[i].id,
          status: orders[i].getString('status'),
          end_date: ed,
          days_late: Math.ceil((now - new Date(ed)) / 86400000),
          progress: 0,
        })
      } else if (ed) {
        var daysLeft = Math.ceil((new Date(ed) - now) / 86400000)
        if (daysLeft <= 3) {
          criticalOrders.push({
            order_number: orders[i].getString('order_number') || orders[i].id,
            status: orders[i].getString('status'),
            end_date: ed,
            days_late: 0,
            progress: 0,
          })
        }
      }
    }
    var totalPhases = safeFilter('industrial_phases', '', '', 500).length
    var totalDemand = 0
    try {
      totalDemand = $app.countRecords('industrial_demand')
    } catch (_) {}
    data.geral = {
      total_orders: orders.length,
      active_orders: orders.length,
      late_orders: lateOrders.length,
      completed_today: completedToday,
      total_phases: totalPhases,
      total_demand: totalDemand,
    }

    // PRODUÇÃO HOJE
    var todayApont = safeFilter('industrial_apontamentos', '', '-created', 500)
    var todayCount = 0,
      totalProduced = 0,
      operators = {}
    for (var a = 0; a < todayApont.length; a++) {
      var created = todayApont[a].getString('created') || ''
      if (created.substring(0, 10) === now.toISOString().substring(0, 10)) {
        todayCount++
        totalProduced += todayApont[a].getFloat('quantity_produced') || 0
      }
      var op = todayApont[a].getString('operator_name') || ''
      if (op) operators[op] = true
    }
    data.producao_hoje = {
      apontamentos_count: todayCount,
      total_produced: totalProduced,
      active_operators: Object.keys(operators).length,
    }

    // ORDENS CRÍTICAS
    data.ordens_criticas = lateOrders.concat(criticalOrders).slice(0, 15)

    // GARGALOS
    var aps = safeFilter('aps_schedules', 'status != "cancelado" && status != "concluido"', '', 500)
    var apsMap = {}
    for (var s = 0; s < aps.length; s++) {
      var rid = aps[s].getString('resource_id') || ''
      if (rid) apsMap[rid] = (apsMap[rid] || 0) + 1
    }
    var gargalos = []
    var bk = Object.keys(apsMap)
    for (var b = 0; b < bk.length; b++) {
      var rName = ''
      try {
        var r = $app.findRecordById('production_resources', bk[b])
        rName = r.getString('name')
      } catch (_) {}
      gargalos.push({ resource_name: rName || bk[b], scheduled_ops: apsMap[bk[b]], insight_id: '' })
    }
    gargalos.sort(function (a, b) {
      return b.scheduled_ops - a.scheduled_ops
    })
    data.gargalos = gargalos.slice(0, 10)

    // MÁQUINAS
    var resources = safeFilter('production_resources', '', '', 500)
    var activeMachines = 0,
      idleMachines = 0,
      overloadedMachines = 0
    var machineList = []
    for (var m = 0; m < resources.length; m++) {
      var mActive = resources[m].get('active') !== false
      var mLoad = apsMap[resources[m].id] || 0
      var mName = resources[m].getString('name') || resources[m].id
      var mStatus = 'idle'
      if (mLoad >= 5) {
        mStatus = 'overloaded'
        overloadedMachines++
      } else if (mLoad > 0) {
        mStatus = 'active'
        activeMachines++
      } else {
        idleMachines++
      }
      machineList.push({ name: mName, status: mStatus, load: mLoad })
    }
    data.maquinas = {
      total: resources.length,
      active: activeMachines,
      idle: idleMachines,
      overloaded: overloadedMachines,
      list: machineList.slice(0, 10),
    }

    // CENTROS DE TRABALHO
    var phases = safeFilter('industrial_phases', '', '', 500)
    var wcMap = {}
    for (var p = 0; p < phases.length; p++) {
      var wc = phases[p].getString('work_center') || ''
      if (wc) wcMap[wc] = (wcMap[wc] || 0) + 1
    }
    var centros = []
    var wck = Object.keys(wcMap)
    for (var w = 0; w < wck.length; w++) {
      centros.push({
        name: wck[w],
        load: wcMap[wck[w]],
        capacity: 10,
        utilization: wcMap[wck[w]] * 10,
      })
    }
    centros.sort(function (a, b) {
      return b.load - a.load
    })
    data.centros_trabalho = centros.slice(0, 10)

    // EFICIÊNCIA
    var opMap = {},
      teamMap = {}
    for (var a2 = 0; a2 < todayApont.length; a2++) {
      var opN = todayApont[a2].getString('operator_name') || ''
      var tmN = todayApont[a2].getString('team_name') || ''
      var q = todayApont[a2].getFloat('quantity_produced') || 0
      if (opN) opMap[opN] = (opMap[opN] || 0) + q
      if (tmN) teamMap[tmN] = (teamMap[tmN] || 0) + q
    }
    var bestOp = '',
      bestOpQty = 0,
      bestTeam = '',
      bestTeamQty = 0
    var ok = Object.keys(opMap)
    for (var oi = 0; oi < ok.length; oi++) {
      if (opMap[ok[oi]] > bestOpQty) {
        bestOp = ok[oi]
        bestOpQty = opMap[ok[oi]]
      }
    }
    var tk = Object.keys(teamMap)
    for (var ti = 0; ti < tk.length; ti++) {
      if (teamMap[tk[ti]] > bestTeamQty) {
        bestTeam = tk[ti]
        bestTeamQty = teamMap[tk[ti]]
      }
    }
    var avgProd = todayApont.length > 0 ? totalProduced / todayApont.length : 0
    data.eficiencia = {
      avg_productivity: Math.round(avgProd),
      oee_estimate: Math.round(avgProd * 10),
      best_operator: bestOp,
      best_team: bestTeam,
    }

    // CUSTOS
    var costs = safeFilter('industrial_costs', '', '-created', 500)
    var costMap = {},
      totalCostVal = 0
    for (var c = 0; c < costs.length; c++) {
      var itemId = costs[c].getString('item_id') || costs[c].getString('product_id') || ''
      var tc =
        parseFloat(costs[c].getString('total_cost') || costs[c].getString('amount') || '0') || 0
      if (itemId) costMap[itemId] = (costMap[itemId] || 0) + tc
      totalCostVal += tc
    }
    var highestCostName = '',
      highestCostVal = 0
    var ck = Object.keys(costMap)
    for (var ci = 0; ci < ck.length; ci++) {
      if (costMap[ck[ci]] > highestCostVal) {
        highestCostVal = costMap[ck[ci]]
        try {
          var hp = $app.findRecordById('products', ck[ci])
          highestCostName = hp.getString('name')
        } catch (_) {
          highestCostName = ck[ci]
        }
      }
    }
    data.custos = {
      total_cost: totalCostVal,
      highest_cost_product: highestCostName,
      cost_trend: totalCostVal > 50000 ? 'increasing' : 'stable',
    }

    // QUALIDADE
    var pendingQ = 0,
      reworkCount = 0
    for (var q = 0; q < phases.length; q++) {
      if (phases[q].getString('quality_status') === 'pending') pendingQ++
      if (phases[q].getString('status') === 'rework') reworkCount++
    }
    data.qualidade = {
      pending_inspections: pendingQ,
      rework_count: reworkCount,
      rejection_rate: phases.length > 0 ? Math.round((reworkCount / phases.length) * 100) : 0,
    }

    // ENTREGAS
    data.entregas = {
      on_time: orders.length - lateOrders.length - criticalOrders.length,
      delayed: lateOrders.length,
      at_risk: criticalOrders.length,
    }

    // COMPRAS CRÍTICAS
    var purchaseOrders = safeFilter(
      'purchase_orders',
      'status != "cancelada" && status != "recebida" && status != "concluida"',
      '-created',
      200,
    )
    var comprasCrit = []
    for (var po = 0; po < purchaseOrders.length; po++) {
      var forecast = purchaseOrders[po].getString('delivery_forecast') || ''
      if (forecast && new Date(forecast) < now) {
        comprasCrit.push({
          order_number: purchaseOrders[po].getString('order_number') || purchaseOrders[po].id,
          supplier_name: purchaseOrders[po].getString('supplier_name') || '',
          delivery_forecast: forecast,
          days_late: Math.ceil((now - new Date(forecast)) / 86400000),
          status: purchaseOrders[po].getString('status') || '',
        })
      }
    }
    data.compras_criticas = comprasCrit.slice(0, 10)

    // ESTOQUE CRÍTICO
    var products = safeFilter('products', '', '', 500)
    var estoqueCrit = []
    for (var pr = 0; pr < products.length; pr++) {
      var stock = products[pr].getFloat('stock') || 0
      var minS = products[pr].getFloat('min_stock') || 0
      if (minS > 0 && stock <= minS) {
        estoqueCrit.push({
          product_name: products[pr].getString('name') || products[pr].id,
          stock: stock,
          min_stock: minS,
          status: stock === 0 ? 'rupture' : 'critical',
        })
      }
    }
    data.estoque_critico = estoqueCrit.slice(0, 15)

    // ALERTAS E RECOMENDAÇÕES
    data.alertas = safeFilter(
      'industrial_intelligence_alerts',
      'status = "open" || status = "acknowledged"',
      '-created',
      10,
    )
    data.recomendacoes = safeFilter(
      'industrial_intelligence_recommendations',
      'status = "pending"',
      '-created',
      10,
    )

    // GERENCIAL
    data.gerencial = {
      machine_highest_cost: highestCostName
        ? { name: highestCostName, cost: highestCostVal }
        : null,
      best_operator: bestOp ? { name: bestOp, produced: bestOpQty } : null,
      best_team_efficiency: bestTeam ? { name: bestTeam, efficiency: bestTeamQty } : null,
      highest_margin_product: null,
      most_rework_product: null,
      biggest_loss_source: null,
      saturated_centers: centros
        .filter(function (c) {
          return c.utilization > 80
        })
        .slice(0, 5),
      at_risk_orders: criticalOrders.map(function (o) {
        return { order_number: o.order_number, risk_factor: 'Termina em <= 3 dias' }
      }),
      products_delaying_deliveries: lateOrders.slice(0, 5).map(function (o) {
        return { product_name: o.order_number, delay_days: o.days_late }
      }),
      suppliers_compromising_production: comprasCrit.slice(0, 5).map(function (c) {
        return { supplier_name: c.supplier_name, delay_days: c.days_late }
      }),
      processes_needing_revision: [],
    }
    // Biggest loss
    var lossMap = {}
    for (var lp = 0; lp < phases.length; lp++) {
      var opName = phases[lp].getString('operation_name') || ''
      var losses = phases[lp].get('losses')
      var lq = 0
      if (losses && typeof losses === 'object') {
        lq = parseFloat(losses.quantity || losses.total || '0') || 0
      }
      if (opName && lq > 0) lossMap[opName] = (lossMap[opName] || 0) + lq
    }
    var biggestLoss = '',
      biggestLossQty = 0
    var lk = Object.keys(lossMap)
    for (var li = 0; li < lk.length; li++) {
      if (lossMap[lk[li]] > biggestLossQty) {
        biggestLoss = lk[li]
        biggestLossQty = lossMap[lk[li]]
      }
    }
    if (biggestLoss) {
      data.gerencial.biggest_loss_source = { operation: biggestLoss, losses: biggestLossQty }
      data.gerencial.processes_needing_revision.push({
        process: biggestLoss,
        reason: 'Maior perda: ' + biggestLossQty + ' unidades',
      })
    }
    // Most rework product
    var reworkProductMap = {}
    for (var rp = 0; rp < phases.length; rp++) {
      if (phases[rp].getString('status') === 'rework') {
        var poId = phases[rp].getString('production_order_id') || ''
        if (poId) reworkProductMap[poId] = (reworkProductMap[poId] || 0) + 1
      }
    }
    var mostRework = '',
      mostReworkCount = 0
    var rk = Object.keys(reworkProductMap)
    for (var ri = 0; ri < rk.length; ri++) {
      if (reworkProductMap[rk[ri]] > mostReworkCount) {
        mostRework = rk[ri]
        mostReworkCount = reworkProductMap[rk[ri]]
      }
    }
    if (mostRework) {
      var mrName = mostRework
      try {
        var mrp = $app.findRecordById('production_orders', mostRework)
        mrName = mrp.getString('order_number') || mostRework
      } catch (_) {}
      data.gerencial.most_rework_product = { name: mrName, count: mostReworkCount }
    }

    // FLUXO COMERCIAL
    var salesOrders = safeFilter('sales_orders', '', '-created', 50)
    var salesInvoices = safeFilter('sales_invoices', '', '-created', 50)
    data.fluxo_comercial = {
      sales_orders: salesOrders.length,
      with_production: orders.length,
      stock_available: products.filter(function (p) {
        return (p.getFloat('stock') || 0) > 0
      }).length,
      scheduled: aps.length,
      produced: todayCount,
      invoiced: salesInvoices.length,
    }

    return e.json(200, data)
  },
  $apis.requireAuth(),
)
