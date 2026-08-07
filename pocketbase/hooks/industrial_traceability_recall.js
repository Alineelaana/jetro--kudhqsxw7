routerAdd(
  'POST',
  '/backend/v1/industrial/traceability/recall',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var query = (body.query || '').trim()
      if (!query) return e.badRequestError('query is required')

      var traces = []
      try {
        traces = $app.findRecordsByFilter(
          'industrial_traceability',
          'lot_number ~ "' + query + '" || serial_number ~ "' + query + '"',
          '-created',
          200,
          0,
        )
      } catch (_) {}

      if (traces.length === 0) {
        return e.json(200, {
          query: query,
          records: [],
          quality_records: [],
          message: 'Nenhum registro encontrado',
        })
      }

      var results = []
      var orderIds = {}
      for (var i = 0; i < traces.length; i++) {
        var t = traces[i]
        var oId = t.getString('production_order_id') || ''
        if (oId) orderIds[oId] = true
        var prodName = '',
          rmName = '',
          resName = ''
        try {
          if (t.getString('product_id'))
            prodName = $app.findRecordById('products', t.getString('product_id')).getString('name')
        } catch (_) {}
        try {
          if (t.getString('raw_material_id'))
            rmName = $app
              .findRecordById('products', t.getString('raw_material_id'))
              .getString('name')
        } catch (_) {}
        try {
          if (t.getString('resource_id'))
            resName = $app
              .findRecordById('production_resources', t.getString('resource_id'))
              .getString('name')
        } catch (_) {}
        results.push({
          id: t.id,
          lot_number: t.getString('lot_number'),
          serial_number: t.getString('serial_number'),
          direction: t.getString('direction'),
          quantity: t.getFloat('quantity'),
          product_name: prodName,
          raw_material_name: rmName,
          resource_name: resName,
          operator_name: t.getString('operator_name'),
          timestamp: t.getString('timestamp'),
          production_order_id: oId,
          notes: t.getString('notes'),
        })
      }

      var qualityRecords = []
      var orderKeys = Object.keys(orderIds)
      for (var k = 0; k < orderKeys.length; k++) {
        var oid = orderKeys[k]
        var orderNum = ''
        try {
          orderNum = $app.findRecordById('production_orders', oid).getString('order_number')
        } catch (_) {}
        try {
          var ncs = $app.findRecordsByFilter(
            'quality_non_conformities',
            'production_order_id = "' + oid + '"',
            '-created',
            50,
            0,
          )
          for (var n = 0; n < ncs.length; n++) {
            qualityRecords.push({
              id: ncs[n].id,
              order_id: oid,
              order_number: orderNum,
              description: ncs[n].getString('description'),
              severity: ncs[n].getString('severity'),
              status: ncs[n].getString('status'),
              quantity_affected: ncs[n].getFloat('quantity_affected'),
              lot_number: ncs[n].getString('lot_number'),
              root_cause: ncs[n].getString('root_cause'),
            })
          }
        } catch (_) {}
        try {
          var phases = $app.findRecordsByFilter(
            'industrial_phases',
            'production_order_id = "' + oid + '"',
            'sequence',
            50,
            0,
          )
          for (var p = 0; p < phases.length; p++) {
            if (
              phases[p].getString('quality_status') !== 'pending' ||
              phases[p].getString('status') === 'rework'
            ) {
              qualityRecords.push({
                id: phases[p].id,
                order_id: oid,
                order_number: orderNum,
                type: 'phase_quality',
                operation_name: phases[p].getString('operation_name'),
                quality_status: phases[p].getString('quality_status'),
                phase_status: phases[p].getString('status'),
              })
            }
          }
        } catch (_) {}
      }

      return e.json(200, {
        query: query,
        records: results,
        quality_records: qualityRecords,
        total: results.length,
      })
    } catch (err) {
      $app.logger().error('Traceability recall failed', 'error', String(err))
      return e.json(500, { error: 'Falha na consulta de recall' })
    }
  },
  $apis.requireAuth(),
)
