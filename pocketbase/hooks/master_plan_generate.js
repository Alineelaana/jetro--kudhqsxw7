routerAdd(
  'POST',
  '/backend/v1/industrial/master-plan/generate',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')
      var role = authUser.getString('role') || ''
      if (role !== 'SUP' && role !== 'PADRAO' && role !== 'COMERCIAL')
        return e.forbiddenError('Insufficient permissions')

      var planId = body.plan_id || ''
      if (!planId) return e.badRequestError('plan_id required')

      var plan = $app.findRecordById('master_production_plans', planId)
      var productId = plan.getString('product_id') || ''
      var forecastQty = plan.getFloat('forecast_quantity') || 0
      var period = plan.getString('period') || ''

      var components = []
      try {
        var bomRes = $http.send({
          url: $secrets.get('SITE_URL') || '' + '/backend/v1/industrial/bom-explosion/' + productId,
          method: 'GET',
          headers: { Authorization: e.request.header.get('Authorization') || '' },
          timeout: 30,
        })
        if (bomRes.statusCode === 200 && bomRes.json) {
          components = bomRes.json.components || []
        }
      } catch (_) {}

      var purchaseSuggestions = []
      for (var i = 0; i < components.length; i++) {
        var c = components[i]
        var neededQty = (c.total_quantity || 0) * forecastQty
        var stockQty = 0
        try {
          var prod = $app.findRecordById('products', c.item_id)
          stockQty = prod.getFloat('stock') || 0
        } catch (_) {}
        var netNeed = neededQty - stockQty
        if (netNeed > 0) {
          purchaseSuggestions.push({
            item_id: c.item_id,
            item_name: c.item_name,
            item_code: c.item_code,
            needed: neededQty,
            in_stock: stockQty,
            net_need: netNeed,
            unit: c.unit,
            level: c.level,
          })
        }
      }

      purchaseSuggestions.sort(function (a, b) {
        return b.net_need - a.net_need
      })

      plan.set('items', JSON.stringify(purchaseSuggestions))
      $app.save(plan)

      return e.json(200, {
        plan_id: planId,
        product_id: productId,
        forecast_quantity: forecastQty,
        total_components: components.length,
        purchase_suggestions: purchaseSuggestions,
        total_suggestions: purchaseSuggestions.length,
      })
    } catch (err) {
      $app.logger().error('Master plan generate failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar plano mestre' })
    }
  },
  $apis.requireAuth(),
)
