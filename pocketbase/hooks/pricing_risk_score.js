onRecordAfterCreateSuccess((e) => {
  var record = e.record
  var productId = record.getString('product_id')
  var userName = record.getString('user_name')
  var userRole = record.getString('user_role')
  var prevPrice = parseFloat(String(record.getString('previous_price')).replace(',', '.')) || 0
  var newPrice = parseFloat(String(record.getString('new_price')).replace(',', '.')) || 0

  if (prevPrice <= 0 || newPrice <= 0) return e.next()

  var changePercent = Math.abs(((newPrice - prevPrice) / prevPrice) * 100)
  var riskIndex = 0
  var riskFactors = []

  if (changePercent > 30) {
    riskIndex += 40
    riskFactors.push('change_above_30pct')
  } else if (changePercent > 15) {
    riskIndex += 20
    riskFactors.push('change_above_15pct')
  } else if (changePercent > 5) {
    riskIndex += 10
    riskFactors.push('change_above_5pct')
  }

  try {
    var oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    var recentChanges = $app.findRecordsByFilter(
      'pricing_history',
      "user_name = '" + userName + "' && created >= '" + oneHourAgo + "'",
      '',
      0,
      0,
    )
    if (recentChanges.length > 20) {
      riskIndex += 30
      riskFactors.push('many_changes_hour')
    } else if (recentChanges.length > 10) {
      riskIndex += 15
      riskFactors.push('frequent_changes')
    }
  } catch (_) {}

  var hour = new Date().getHours()
  if (hour < 7 || hour > 20) {
    riskIndex += 20
    riskFactors.push('outside_allowed_hours')
  }

  try {
    var recentProducts = $app.findRecordsByFilter(
      'pricing_history',
      "user_name = '" + userName + "'",
      '-created',
      10,
      0,
    )
    var uniqueProducts = {}
    for (var i = 0; i < recentProducts.length; i++) {
      uniqueProducts[recentProducts[i].getString('product_id')] = true
    }
    var productCount = Object.keys(uniqueProducts).length
    if (productCount > 8) {
      riskIndex += 25
      riskFactors.push('many_products_changed')
    }
  } catch (_) {}

  if (riskIndex > 0) {
    try {
      var rmCol = $app.findCollectionByNameOrId('pricing_risk_monitor')
      var rm = new Record(rmCol)
      rm.set('product_id', productId)
      rm.set('product_code', record.getString('product_code'))
      rm.set('product_name', record.getString('product_name'))
      rm.set('user_name', userName)
      rm.set('user_role', userRole)
      rm.set('change_type', 'price_change')
      rm.set('risk_index', riskIndex)
      rm.set('risk_factors', JSON.stringify(riskFactors))
      rm.set('previous_value', record.getString('previous_price'))
      rm.set('new_value', record.getString('new_price'))
      rm.set('change_percentage', changePercent.toFixed(2))
      rm.set('requires_approval', riskIndex >= 50)
      rm.set('approval_status', riskIndex >= 50 ? 'pending' : '')
      rm.set('resolved', false)
      $app.save(rm)
    } catch (err) {
      $app.logger().error('risk monitor creation failed', 'error', String(err))
    }
  }

  return e.next()
}, 'pricing_history')
