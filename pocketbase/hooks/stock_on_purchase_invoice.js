onRecordAfterCreateSuccess((e) => {
  var invoice = e.record
  var items = invoice.get('items')
  if (!items || items.length === 0) return e.next()

  try {
    var movCol = $app.findCollectionByNameOrId('stock_movements')
    var supplier = invoice.getString('supplier_name') || ''
    var invoiceNum =
      invoice.getString('invoice_doc_number') || invoice.getString('invoice_number') || ''

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item || !item.product) continue

      var productName = item.product || ''
      var productCode = item.code || ''
      var qty = parseInt(item.quantity) || 0
      if (qty <= 0) continue

      var productId = ''
      try {
        var prod = $app.findFirstRecordByFilter(
          'products',
          'name = "' + productName + '" || code = "' + productCode + '"',
        )
        if (prod) {
          productId = prod.id
          var currentStock = prod.getInt('stock') || 0
          var newStock = currentStock + qty
          var unitCost = item.unit_price || '0'

          prod.set('stock', newStock)
          if (unitCost && parseFloat(String(unitCost).replace(',', '.')) > 0) {
            prod.set('last_cost', unitCost)
            prod.set('cost_price', unitCost)
          }
          $app.save(prod)

          var mov = new Record(movCol)
          mov.set('produto_id', productId)
          mov.set('produto_nome', productName)
          mov.set('produto_codigo', productCode)
          mov.set('tipo_movimentacao', 'Entrada por Compra')
          mov.set('documento_origem', invoiceNum)
          mov.set('documento_tipo', 'Nota Fiscal de Entrada')
          mov.set('quantidade', qty)
          mov.set('unidade', item.unit || 'un')
          mov.set('saldo_anterior', currentStock)
          mov.set('saldo_atual', newStock)
          mov.set('empresa', invoice.getString('company') || '')
          mov.set('filial', invoice.getString('branch') || '')
          mov.set('motivo', 'Entrada por compra - NF ' + invoiceNum)
          mov.set('responsavel', invoice.getString('responsible_user') || 'Sistema')
          mov.set('custo_unitario', String(unitCost))
          mov.set('custo_total', String(parseFloat(String(unitCost).replace(',', '.')) * qty))
          $app.save(mov)
        }
      } catch (err) {
        $app
          .logger()
          .error(
            'stock movement from purchase invoice failed',
            'error',
            String(err),
            'product',
            productName,
          )
      }
    }
  } catch (err2) {
    $app.logger().error('stock_on_purchase_invoice hook failed', 'error', String(err2))
  }

  return e.next()
}, 'purchase_invoices')
