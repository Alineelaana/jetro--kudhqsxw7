routerAdd(
  'GET',
  '/backend/v1/industrial/bom-explosion/{productId}',
  (e) => {
    try {
      var productId = e.request.pathValue('productId')
      if (!productId) return e.badRequestError('product_id required')

      var result = []
      var visited = {}

      function explode(pid, parentQty, level) {
        if (visited[pid]) return
        visited[pid] = true

        var boms = []
        try {
          boms = $app.findRecordsByFilter(
            'bom_versions',
            'product_id = "' + pid + '" && status = "ativo"',
            '-version',
            1,
            0,
          )
        } catch (_) {}

        if (boms.length === 0) return
        var bom = boms[0]

        var components = []
        try {
          components = $app.findRecordsByFilter(
            'bom_components',
            'bom_version_id = "' + bom.id + '"',
            'ordem',
            200,
            0,
          )
        } catch (_) {}

        for (var i = 0; i < components.length; i++) {
          var comp = components[i]
          var itemId = comp.getString('item_id')
          var qtyStr = comp.getString('quantidade') || '1'
          var qty = parseFloat(qtyStr) || 1
          var totalQty = qty * parentQty

          var itemName = ''
          var itemCode = ''
          try {
            var item = $app.findRecordById('products', itemId)
            itemName = item.getString('name')
            itemCode = item.getString('code')
          } catch (_) {}

          result.push({
            level: level,
            item_id: itemId,
            item_name: itemName,
            item_code: itemCode,
            quantity: qty,
            total_quantity: totalQty,
            unit: comp.getString('unidade') || '',
            perda_prevista: comp.getString('perda_prevista') || '',
            is_obsolete: comp.getBool('is_obsolete') || false,
            bom_version_id: bom.id,
          })

          explode(itemId, totalQty, level + 1)
        }
      }

      explode(productId, 1, 0)

      return e.json(200, {
        product_id: productId,
        components: result,
        total_components: result.length,
      })
    } catch (err) {
      $app.logger().error('BOM explosion failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao explodir BOM' })
    }
  },
  $apis.requireAuth(),
)
