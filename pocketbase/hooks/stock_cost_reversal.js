// pb_hooks/stock_cost_reversal.js
// Reversão e Ajuste Auditável de Custos (Devoluções e Cancelamentos) — ERP HURAM
// Ao registrar devolução de compras ou cancelamento de NF de entrada:
// Recalcula/reverte o custo de forma auditável SEM alterar custos históricos,
// gravando evento explícito do tipo 'adjustment' em product_cost_history.

onRecordAfterCreateSuccess((e) => {
  var ret = e.record
  var items = ret.get('items')
  if (!items || items.length === 0) return e.next()

  var returnNum = ret.getString('return_number') || ret.id
  var invoiceNum = ret.getString('invoice_doc_number') || ''
  var supplierName = ret.getString('supplier_name') || ''
  var respUser = ret.getString('responsible_user') || 'Sistema'

  try {
    for (var i = 0; i < items.length; i++) {
      var it = items[i]
      if (!it || !it.product) continue

      var prodName = it.product || ''
      var prodCode = it.code || ''
      var qtyReturned = parseFloat(String(it.quantity || 0).replace(',', '.')) || 0
      if (qtyReturned <= 0) continue

      var unitPrice = parseFloat(String(it.unit_price || 0).replace(',', '.')) || 0

      // Busca o produto correspondente
      var prod = null
      try {
        var filter = []
        if (prodCode) filter.push('code = "' + prodCode + '"')
        if (prodName) filter.push('name = "' + prodName + '"')
        prod = $app.findFirstRecordByFilter('products', filter.join(' || '))
      } catch (_) {}

      if (!prod) continue

      var curStock = prod.getInt('stock') || 0
      var curCost =
        parseFloat(
          String(prod.getString('cost_average') || prod.getString('cost_price') || '0').replace(
            ',',
            '.',
          ),
        ) || 0

      // Reversão de custo ponderado:
      // Se a devolução retira mercadoria que entrou a um custo específico, recalculamos o saldo remanescente
      var balanceAfter = Math.max(0, curStock - Math.round(qtyReturned))
      var newCost = curCost

      // Se houver saldo restante e a devolução tem preço unitário divergente
      if (balanceAfter > 0 && curStock > qtyReturned) {
        var valorTotalEstoque = curStock * curCost
        var valorDevolvido = qtyReturned * unitPrice
        var novoValorTotal = valorTotalEstoque - valorDevolvido
        if (novoValorTotal > 0) {
          newCost = novoValorTotal / balanceAfter
        }
      }

      var newCostStr = newCost.toFixed(4)

      // Atualiza o produto com auditabilidade garantida
      prod.set('cost_average', newCostStr)
      prod.set('cost_price', newCostStr)
      prod.set('cost_origin', 'adjustment')
      $app.save(prod)

      // Grava em product_cost_history o evento de ajuste
      try {
        var histCol = $app.findCollectionByNameOrId('product_cost_history')
        var hist = new Record(histCol)
        hist.set('product', prod.id)
        hist.set('data_hora', new Date().toISOString())
        hist.set('origem', 'adjustment')
        hist.set('documento_referencia', 'DEV-' + returnNum)
        hist.set('metodo', 'weighted_average')
        hist.set('custo_anterior', curCost)
        hist.set('custo_novo', parseFloat(newCostStr))
        hist.set('quantidade_entrada', -qtyReturned)
        hist.set('saldo_apos', balanceAfter)
        if (e.auth) hist.set('usuario', e.auth.id)

        hist.set('composicao', {
          tipo_evento: 'Reversão por Devolução de Compra',
          motivo: ret.getString('reason') || 'Devolução ao Fornecedor',
          documento_devolucao: returnNum,
          nota_fiscal_origem: invoiceNum,
          fornecedor: supplierName,
          quantidade_devolvida: qtyReturned,
          custo_unitario_devolucao: unitPrice,
          saldo_anterior: curStock,
          custo_anterior: curCost,
          saldo_apos: balanceAfter,
          custo_recalculado: parseFloat(newCostStr),
          responsavel: respUser,
        })
        $app.save(hist)
      } catch (histErr) {
        $app
          .logger()
          .error('Falha ao registrar historico de reversao de custo', 'error', String(histErr))
      }
    }
  } catch (err) {
    $app.logger().error('stock_cost_reversal failed', 'error', String(err))
  }

  return e.next()
}, 'purchase_returns')
