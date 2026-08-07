routerAdd(
  'GET',
  '/backend/v1/industrial/traceability/{direction}/{id}',
  (e) => {
    try {
      var direction = e.request.pathValue('direction')
      var id = e.request.pathValue('id')
      if (!direction || !id) return e.badRequestError('direction and id required')
      if (direction !== 'forward' && direction !== 'backward')
        return e.badRequestError('direction must be forward or backward')

      var nodes = []
      var edges = []

      if (direction === 'backward') {
        var order = $app.findRecordById('production_orders', id)
        nodes.push({ type: 'order', id: id, label: order.getString('order_number') })

        var phases = []
        try {
          phases = $app.findRecordsByFilter(
            'industrial_phases',
            'production_order_id = "' + id + '"',
            'sequence',
            100,
            0,
          )
        } catch (_) {}
        for (var p = 0; p < phases.length; p++) {
          var ph = phases[p]
          nodes.push({
            type: 'phase',
            id: ph.id,
            label: ph.getString('operation_name'),
            status: ph.getString('status'),
            operator: ph.getString('operator_name'),
          })
          edges.push({ from: id, to: ph.id })

          var pcosts = []
          try {
            pcosts = $app.findRecordsByFilter(
              'industrial_phase_costs',
              'phase_id = "' + ph.id + '"',
              '',
              100,
              0,
            )
          } catch (_) {}
          for (var c = 0; c < pcosts.length; c++) {
            nodes.push({
              type: 'cost',
              id: pcosts[c].id,
              label: pcosts[c].getString('cost_type') + ': R$ ' + pcosts[c].getString('amount'),
            })
            edges.push({ from: ph.id, to: pcosts[c].id })
          }
        }

        var traces = []
        try {
          traces = $app.findRecordsByFilter(
            'industrial_traceability',
            'production_order_id = "' + id + '"',
            '-created',
            200,
            0,
          )
        } catch (_) {}
        for (var t = 0; t < traces.length; t++) {
          var tr = traces[t]
          var rmName = ''
          var rmId = tr.getString('raw_material_id') || ''
          if (rmId) {
            try {
              var rm = $app.findRecordById('products', rmId)
              rmName = rm.getString('name')
            } catch (_) {}
          }
          nodes.push({
            type: 'material',
            id: tr.id,
            label: rmName || tr.getString('lot_number'),
            lot: tr.getString('lot_number'),
            direction: tr.getString('direction'),
            qty: tr.getFloat('quantity'),
          })
          edges.push({ from: id, to: tr.id })
        }

        var aps = []
        try {
          aps = $app.findRecordsByFilter(
            'aps_schedules',
            'production_order_id = "' + id + '"',
            '',
            50,
            0,
          )
        } catch (_) {}
        for (var s = 0; s < aps.length; s++) {
          nodes.push({
            type: 'schedule',
            id: aps[s].id,
            label: aps[s].getString('operation_name'),
            start: aps[s].getString('scheduled_start'),
          })
          edges.push({ from: id, to: aps[s].id })
        }
      } else {
        var product = $app.findRecordById('products', id)
        nodes.push({ type: 'product', id: id, label: product.getString('name') })

        var traces2 = []
        try {
          traces2 = $app.findRecordsByFilter(
            'industrial_traceability',
            'raw_material_id = "' + id + '"',
            '-created',
            200,
            0,
          )
        } catch (_) {}
        var seenOrders = {}
        for (var t2 = 0; t2 < traces2.length; t2++) {
          var tr2 = traces2[t2]
          nodes.push({
            type: 'trace',
            id: tr2.id,
            label: tr2.getString('lot_number'),
            qty: tr2.getFloat('quantity'),
          })
          edges.push({ from: id, to: tr2.id })
          var oId = tr2.getString('production_order_id') || ''
          if (oId && !seenOrders[oId]) {
            seenOrders[oId] = true
            var oNum = ''
            try {
              var o = $app.findRecordById('production_orders', oId)
              oNum = o.getString('order_number')
            } catch (_) {}
            nodes.push({ type: 'order', id: oId, label: oNum })
            edges.push({ from: tr2.id, to: oId })
          }
        }

        var costs2 = []
        try {
          costs2 = $app.findRecordsByFilter(
            'industrial_costs',
            'item_id = "' + id + '"',
            '-version',
            50,
            0,
          )
        } catch (_) {}
        for (var c2 = 0; c2 < costs2.length; c2++) {
          nodes.push({
            type: 'cost',
            id: costs2[c2].id,
            label:
              'Custo v' +
              costs2[c2].getInt('version') +
              ': R$ ' +
              costs2[c2].getString('total_cost'),
          })
          edges.push({ from: id, to: costs2[c2].id })
        }
      }

      return e.json(200, {
        direction: direction,
        start_id: id,
        nodes: nodes,
        edges: edges,
        total_nodes: nodes.length,
      })
    } catch (err) {
      $app.logger().error('Traceability query failed', 'error', String(err))
      return e.json(500, { error: 'Falha na consulta de rastreabilidade' })
    }
  },
  $apis.requireAuth(),
)
