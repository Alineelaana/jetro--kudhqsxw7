onRecordAfterCreateSuccess((e) => {
  var mov = e.record
  var tipo = mov.getString('tipo_movimentacao') || ''
  var isEntry =
    tipo === 'Entrada por Compra' ||
    tipo === 'Entrada Manual' ||
    tipo === 'Entrada por Devolução' ||
    tipo === 'Ajuste Positivo'
  if (!isEntry) return e.next()

  var productId = mov.getString('produto_id') || ''
  if (!productId) return e.next()

  var unitCostStr = mov.getString('custo_unitario') || '0'
  var unitCost = parseFloat(unitCostStr.replace(',', '.')) || 0
  if (unitCost <= 0) return e.next()

  try {
    var prod = $app.findRecordById('products', productId)
    if (!prod) return e.next()

    prod.set('last_cost', unitCostStr)
    prod.set('cost_price', unitCostStr)
    $app.save(prod)

    try {
      var pc = $app.findFirstRecordByFilter('pricing_config', 'product_id = "' + productId + '"')
      if (pc) {
        pc.set('last_purchase_cost', unitCostStr)
        pc.set('replacement_cost', unitCostStr)
        pc.set('accounting_cost', unitCostStr)
        $app.save(pc)

        try {
          var pc2 = $app.findFirstRecordByFilter(
            'pricing_config',
            'product_id = "' + productId + '"',
          )
          if (pc2) {
            var freight = parseFloat(String(pc2.getString('freight_cost')).replace(',', '.')) || 0
            var insurance =
              parseFloat(String(pc2.getString('insurance_cost')).replace(',', '.')) || 0
            var otherExp =
              parseFloat(String(pc2.getString('other_expenses_cost')).replace(',', '.')) || 0
            var discount =
              parseFloat(String(pc2.getString('financial_discount')).replace(',', '.')) || 0
            var bonif = parseFloat(String(pc2.getString('bonifications')).replace(',', '.')) || 0
            var finalCost = unitCost + freight + insurance + otherExp - discount - bonif
            var icms = parseFloat(String(pc2.getString('icms')).replace(',', '.')) || 0
            var ipi = parseFloat(String(pc2.getString('ipi')).replace(',', '.')) || 0
            var pis = parseFloat(String(pc2.getString('pis')).replace(',', '.')) || 0
            var cofins = parseFloat(String(pc2.getString('cofins')).replace(',', '.')) || 0
            var cbs = parseFloat(String(pc2.getString('cbs')).replace(',', '.')) || 0
            var ibs = parseFloat(String(pc2.getString('ibs')).replace(',', '.')) || 0
            var selective =
              parseFloat(String(pc2.getString('selective_tax')).replace(',', '.')) || 0
            var totalTaxes = icms + ipi + pis + cofins + cbs + ibs + selective
            var totalCostNew = finalCost + totalTaxes
            var desiredMargin =
              parseFloat(String(pc2.getString('desired_margin')).replace(',', '.')) || 30
            var suggestedPrice = totalCostNew / (1 - desiredMargin / 100)
            var currentSuggested =
              parseFloat(String(pc2.getString('suggested_price')).replace(',', '.')) || 0

            pc2.set('final_cost', finalCost.toFixed(2))
            pc2.set('total_cost', totalCostNew.toFixed(2))
            pc2.set('suggested_price', suggestedPrice.toFixed(2))
            $app.save(pc2)

            if (
              currentSuggested > 0 &&
              Math.abs(suggestedPrice - currentSuggested) / currentSuggested > 0.05
            ) {
              try {
                var apprCol = $app.findCollectionByNameOrId('pricing_approvals')
                var appr = new Record(apprCol)
                appr.set('product_id', productId)
                appr.set('product_code', pc2.getString('product_code'))
                appr.set('product_name', pc2.getString('product_name'))
                appr.set('requested_price', suggestedPrice.toFixed(2))
                appr.set('current_price', currentSuggested.toFixed(2))
                appr.set('margin_percent', desiredMargin.toFixed(2))
                appr.set('minimum_margin', pc2.getString('minimum_margin'))
                appr.set('status', 'pending')
                appr.set('requester_name', 'Sistema - Integracao Compras')
                $app.save(appr)
              } catch (_) {}
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  } catch (err) {
    $app.logger().error('stock_cost_update failed', 'error', String(err))
  }

  return e.next()
}, 'stock_movements')
