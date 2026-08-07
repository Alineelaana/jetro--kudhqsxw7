routerAdd(
  'GET',
  '/backend/v1/industrial/executive-dashboard',
  (e) => {
    try {
      var apontamentos = []
      try {
        apontamentos = $app.findRecordsByFilter(
          'industrial_apontamentos',
          'type = "producao"',
          '-created',
          500,
          0,
        )
      } catch (_) {}

      var machineMap = {}
      var operatorMap = {}
      for (var i = 0; i < apontamentos.length; i++) {
        var a = apontamentos[i]
        var rid = a.getString('resource_id') || ''
        var op = a.getString('operator_name') || ''
        var qty = a.getFloat('quantity_produced') || 0
        if (rid) {
          machineMap[rid] = (machineMap[rid] || 0) + qty
        }
        if (op) {
          operatorMap[op] = (operatorMap[op] || 0) + qty
        }
      }

      var bestMachine = null
      var mk = Object.keys(machineMap)
      for (var m = 0; m < mk.length; m++) {
        if (!bestMachine || machineMap[mk[m]] > bestMachine.total) {
          var mn = ''
          try {
            var r = $app.findRecordById('production_resources', mk[m])
            mn = r.getString('name')
          } catch (_) {}
          bestMachine = { resource_id: mk[m], name: mn, total_produced: machineMap[mk[m]] }
        }
      }

      var bestOperator = null
      var ok = Object.keys(operatorMap)
      for (var o = 0; o < ok.length; o++) {
        if (!bestOperator || operatorMap[ok[o]] > bestOperator.total_produced)
          bestOperator = { operator_name: ok[o], total_produced: operatorMap[ok[o]] }
      }

      var costs = []
      try {
        costs = $app.findRecordsByFilter('industrial_costs', '', '-version', 500, 0)
      } catch (_) {}
      var costMap = {}
      for (var c = 0; c < costs.length; c++) {
        var pid = costs[c].getString('item_id') || ''
        var tc = parseFloat(costs[c].getString('total_cost') || '0') || 0
        if (pid) costMap[pid] = (costMap[pid] || 0) + tc
      }
      var highestCostProduct = null
      var ck = Object.keys(costMap)
      for (var h = 0; h < ck.length; h++) {
        if (!highestCostProduct || costMap[ck[h]] > highestCostProduct.total_cost) {
          var pn = ''
          try {
            var p = $app.findRecordById('products', ck[h])
            pn = p.getString('name')
          } catch (_) {}
          highestCostProduct = {
            product_id: ck[h],
            name: pn,
            total_cost: costMap[ck[h]].toFixed(2),
          }
        }
      }

      var phases = []
      try {
        phases = $app.findRecordsByFilter('industrial_phases', '', 'sequence', 500, 0)
      } catch (_) {}
      var lossMap = {}
      var reworkMap = {}
      for (var p2 = 0; p2 < phases.length; p2++) {
        var ph = phases[p2]
        var opName = ph.getString('operation_name') || ''
        var losses = ph.get('losses')
        if (losses && typeof losses === 'object') {
          var lv = parseFloat(losses.quantity || losses.total || '0') || 0
          if (lv > 0) lossMap[opName] = (lossMap[opName] || 0) + lv
        }
        if (ph.getString('status') === 'rework') reworkMap[opName] = (reworkMap[opName] || 0) + 1
      }
      var highestLoss = null
      var lk = Object.keys(lossMap)
      for (var l = 0; l < lk.length; l++) {
        if (!highestLoss || lossMap[lk[l]] > highestLoss.total_losses)
          highestLoss = { operation_name: lk[l], total_losses: lossMap[lk[l]] }
      }
      var highestRework = null
      var rk = Object.keys(reworkMap)
      for (var r2 = 0; r2 < rk.length; r2++) {
        if (!highestRework || reworkMap[rk[r2]] > highestRework.rework_count)
          highestRework = { operation_name: rk[r2], rework_count: reworkMap[rk[r2]] }
      }

      var lateOrders = []
      try {
        var orders = $app.findRecordsByFilter(
          'production_orders',
          'status != "concluida" && status != "cancelada" && status != "fechada"',
          '-created',
          200,
          0,
        )
        var now = new Date()
        for (var od = 0; od < orders.length; od++) {
          var ed = orders[od].getString('end_date') || ''
          if (ed) {
            var d = new Date(ed)
            if (d < now) {
              var days = Math.ceil((now - d) / 86400000)
              lateOrders.push({
                order_number: orders[od].getString('order_number'),
                end_date: ed,
                days_late: days,
              })
            }
          }
        }
      } catch (_) {}

      var bottlenecks = []
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
          var rid2 = aps[s].getString('resource_id') || ''
          if (rid2) apsMap[rid2] = (apsMap[rid2] || 0) + 1
        }
        var bk = Object.keys(apsMap)
        for (var b = 0; b < bk.length; b++) {
          var bn = ''
          try {
            var br = $app.findRecordById('production_resources', bk[b])
            bn = br.getString('name')
          } catch (_) {}
          bottlenecks.push({ resource_name: bn, scheduled_ops: apsMap[bk[b]] })
        }
        bottlenecks.sort(function (a, b) {
          return b.scheduled_ops - a.scheduled_ops
        })
      } catch (_) {}

      var totalDemand = 0
      try {
        totalDemand = $app.countRecords('industrial_demand')
      } catch (_) {}

      return e.json(200, {
        most_productive_machine: bestMachine,
        highest_operator_productivity: bestOperator,
        highest_cost_product: highestCostProduct,
        bottlenecks: bottlenecks.slice(0, 5),
        highest_loss_phase: highestLoss,
        highest_rework_phase: highestRework,
        overloaded_work_center:
          bottlenecks.length > 0
            ? { name: bottlenecks[0].resource_name, scheduled_ops: bottlenecks[0].scheduled_ops }
            : null,
        late_orders: lateOrders,
        total_orders: orders ? orders.length : 0,
        total_phases: phases.length,
        total_demand: totalDemand,
      })
    } catch (err) {
      $app.logger().error('Executive dashboard failed', 'error', String(err))
      return e.json(500, { error: 'Falha no dashboard executivo' })
    }
  },
  $apis.requireAuth(),
)
