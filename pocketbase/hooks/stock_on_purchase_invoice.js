// pb_hooks/stock_on_purchase_invoice.js
// Entrada de Mercadoria via Nota Fiscal de Compra — ERP HURAM
// Atualiza o saldo físico no produto e registra movimentação de estoque
// Delega o cálculo do Custo Médio Ponderado Real ao hook stock_cost_update.js

onRecordAfterCreateSuccess((e) => {
  var invoice = e.record
  var items = invoice.get('items')
  if (!items || items.length === 0) return e.next()

  try {
    var movCol = $app.findCollectionByNameOrId('stock_movements')
    var supplier = invoice.getString('supplier_name') || ''
    var invoiceNum =
      invoice.getString('invoice_doc_number') || invoice.getString('invoice_number') || ''
    var empresaId = invoice.getString('empresa_id') || ''
    var companyName = invoice.getString('company') || ''
    var branchName = invoice.getString('branch') || ''
    var respUser = invoice.getString('responsible_user') || 'Sistema'

    // Dados de rateio e valores acessórios da nota para anexar na movimentação
    var totalProdutos =
      parseFloat(String(invoice.getString('valor_produtos') || '0').replace(',', '.')) || 0
    var totalFrete =
      parseFloat(String(invoice.getString('valor_frete') || '0').replace(',', '.')) || 0
    var totalSeguro =
      parseFloat(String(invoice.getString('valor_seguro') || '0').replace(',', '.')) || 0
    var totalOutras =
      parseFloat(String(invoice.getString('valor_outras_despesas') || '0').replace(',', '.')) || 0
    var totalDesconto =
      parseFloat(String(invoice.getString('valor_desconto') || '0').replace(',', '.')) || 0
    var totalIcms =
      parseFloat(String(invoice.getString('valor_icms') || '0').replace(',', '.')) || 0
    var totalIcmsSt =
      parseFloat(String(invoice.getString('valor_icms_st') || '0').replace(',', '.')) || 0
    var totalIpi = parseFloat(String(invoice.getString('valor_ipi') || '0').replace(',', '.')) || 0
    var totalPis = parseFloat(String(invoice.getString('valor_pis') || '0').replace(',', '.')) || 0
    var totalCofins =
      parseFloat(String(invoice.getString('valor_cofins') || '0').replace(',', '.')) || 0

    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item) continue

      var productName = item.product || ''
      var productCode = item.code || ''
      var qty = parseFloat(String(item.quantity || 0).replace(',', '.')) || 0
      if (qty <= 0) continue

      var unitPrice = parseFloat(String(item.unit_price || 0).replace(',', '.')) || 0
      var itemTotal =
        parseFloat(String(item.total || qty * unitPrice).replace(',', '.')) || qty * unitPrice

      // Identifica o produto no cadastro
      var prod = null
      try {
        if (item.matched_product_id) {
          prod = $app.findRecordById('products', item.matched_product_id)
        }
      } catch (_) {}

      if (!prod && (productName || productCode)) {
        try {
          var filterParts = []
          if (productCode) filterParts.push('code = "' + productCode + '"')
          if (productName) filterParts.push('name = "' + productName + '"')
          prod = $app.findFirstRecordByFilter('products', filterParts.join(' || '))
        } catch (_) {}
      }

      if (!prod) continue

      var productId = prod.id
      var currentStock = prod.getInt('stock') || 0
      var newStock = currentStock + Math.round(qty)

      // Atualiza o saldo do produto. Custo será atualizado por stock_cost_update.js na criação da movimentação
      prod.set('stock', newStock)
      prod.set('last_purchase', new Date().toISOString())
      $app.save(prod)

      // Rateio proporcional dos tributos e despesas por valor do item
      var ratio = totalProdutos > 0 ? itemTotal / totalProdutos : 1 / items.length
      var itemFrete =
        item.frete !== undefined
          ? parseFloat(String(item.frete).replace(',', '.'))
          : totalFrete * ratio
      var itemSeguro =
        item.seguro !== undefined
          ? parseFloat(String(item.seguro).replace(',', '.'))
          : totalSeguro * ratio
      var itemOutras =
        item.outras_despesas !== undefined
          ? parseFloat(String(item.outras_despesas).replace(',', '.'))
          : totalOutras * ratio
      var itemDesconto =
        item.desconto !== undefined
          ? parseFloat(String(item.desconto).replace(',', '.'))
          : totalDesconto * ratio
      var itemIcms =
        item.icms !== undefined
          ? parseFloat(String(item.icms).replace(',', '.'))
          : totalIcms * ratio
      var itemIcmsSt =
        item.icms_st !== undefined
          ? parseFloat(String(item.icms_st).replace(',', '.'))
          : totalIcmsSt * ratio
      var itemIpi =
        item.ipi !== undefined ? parseFloat(String(item.ipi).replace(',', '.')) : totalIpi * ratio
      var itemPis =
        item.pis !== undefined ? parseFloat(String(item.pis).replace(',', '.')) : totalPis * ratio
      var itemCofins =
        item.cofins !== undefined
          ? parseFloat(String(item.cofins).replace(',', '.'))
          : totalCofins * ratio

      var mov = new Record(movCol)
      mov.set('produto_id', productId)
      mov.set('produto_nome', prod.getString('name'))
      mov.set('produto_codigo', prod.getString('code'))
      mov.set('tipo_movimentacao', 'Entrada por Compra')
      mov.set('documento_origem', invoiceNum)
      mov.set('documento_tipo', 'Nota Fiscal de Entrada')
      mov.set('quantidade', Math.round(qty))
      mov.set('unidade', item.unit || prod.getString('unit') || 'un')
      mov.set('saldo_anterior', currentStock)
      mov.set('saldo_atual', newStock)
      mov.set('empresa', companyName || empresaId)
      mov.set('filial', branchName)
      mov.set(
        'motivo',
        'Entrada por compra - NF ' + invoiceNum + (supplier ? ' (' + supplier + ')' : ''),
      )
      mov.set('responsavel', respUser)
      mov.set('custo_unitario', unitPrice.toFixed(4))
      mov.set('custo_total', itemTotal.toFixed(2))

      // Grava metadata contendo a decomposição para cálculo exato no stock_cost_update
      var metaObj = {
        invoice_id: invoice.id,
        invoice_number: invoiceNum,
        empresa_id: empresaId,
        supplier_name: supplier,
        supplier_cnpj: invoice.getString('supplier_cnpj') || '',
        cfop: item.cfop || '',
        ncm: item.ncm || prod.getString('ncm') || '',
        unit_price: unitPrice,
        frete: itemFrete,
        seguro: itemSeguro,
        outras_despesas: itemOutras,
        desconto: itemDesconto,
        icms: itemIcms,
        icms_st: itemIcmsSt,
        ipi: itemIpi,
        pis: itemPis,
        cofins: itemCofins,
      }
      try {
        mov.set('observacoes', JSON.stringify(metaObj))
      } catch (_) {}

      $app.save(mov)
    }
  } catch (err2) {
    $app.logger().error('stock_on_purchase_invoice hook failed', 'error', String(err2))
  }

  return e.next()
}, 'purchase_invoices')
