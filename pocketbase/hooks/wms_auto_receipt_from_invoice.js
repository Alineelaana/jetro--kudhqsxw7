onRecordAfterCreateSuccess((e) => {
  var invoice = e.record
  var status = invoice.getString('status') || ''
  if (status !== 'Confirmada') return e.next()

  var items = invoice.get('items')
  if (!items || items.length === 0) return e.next()

  try {
    var receiptCol = $app.findCollectionByNameOrId('wms_receipts')
    var invoiceNum =
      invoice.getString('invoice_doc_number') || invoice.getString('invoice_number') || ''
    var supplier = invoice.getString('supplier_name') || ''

    try {
      $app.findFirstRecordByFilter('wms_receipts', "nota_fiscal = '" + invoiceNum + "'")
      return e.next()
    } catch (_) {}

    var receiptItems = []
    for (var i = 0; i < items.length; i++) {
      var item = items[i]
      if (!item) continue
      receiptItems.push({
        produto_id: '',
        produto_nome: item.product || '',
        produto_codigo: item.code || '',
        quantidade_esperada: parseInt(item.quantity) || 0,
        quantidade_recebida: 0,
        lote: '',
        validade: '',
        divergencia: 0,
      })
    }

    var receipt = new Record(receiptCol)
    receipt.set('numero_recebimento', 'REC-AUTO-' + invoiceNum)
    receipt.set('fornecedor', supplier)
    receipt.set('nota_fiscal', invoiceNum)
    receipt.set('data_prevista', new Date().toISOString().split('T')[0])
    receipt.set('data_recebida', '')
    receipt.set('status', 'Aguardando Chegada')
    receipt.set('itens', receiptItems)
    receipt.set('responsavel', invoice.getString('responsible_user') || 'Sistema')
    receipt.set('observacoes', 'Recebimento gerado automaticamente da NF: ' + invoiceNum)
    receipt.set('empresa', invoice.getString('company') || '')
    receipt.set('filial', invoice.getString('branch') || '')
    receipt.set('deposito', '')
    $app.save(receipt)
  } catch (err) {
    $app.logger().error('wms_auto_receipt_from_invoice failed', 'error', String(err))
  }
  return e.next()
}, 'purchase_invoices')
