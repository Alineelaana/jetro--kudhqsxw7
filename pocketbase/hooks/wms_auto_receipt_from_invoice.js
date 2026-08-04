onRecordAfterCreateSuccess((e) => {
  try {
    const invoice = e.record
    const collectionName = invoice.collectionName

    if (collectionName !== 'purchase_invoices') {
      return e.next()
    }

    const status = invoice.getString('status')
    if (status !== 'confirmed' && status !== 'approved' && status !== 'received') {
      return e.next()
    }

    let receiptCollection
    try {
      receiptCollection = $app.findCollectionByNameOrId('wms_receipts')
    } catch (err) {
      return e.next()
    }

    const existingFilter = 'reference_invoice = {:invoiceId}'
    let existing = []
    try {
      existing = $app.findRecordsByFilter('wms_receipts', existingFilter, 'created', 1, 0, {
        invoiceId: invoice.id,
      })
    } catch (_) {}

    if (existing && existing.length > 0) {
      return e.next()
    }

    const receipt = new Record(receiptCollection)

    try {
      receipt.set('reference_invoice', invoice.id)
    } catch (_) {}
    try {
      receipt.set('supplier', invoice.getString('supplier') || '')
    } catch (_) {}
    try {
      receipt.set('status', 'pending')
    } catch (_) {}
    try {
      receipt.set('type', 'automatic')
    } catch (_) {}

    const invoiceNumber = invoice.getString('invoice_number') || invoice.getString('number') || ''
    if (invoiceNumber) {
      try {
        receipt.set('document_number', invoiceNumber)
      } catch (_) {}
    }

    const notes = 'Recebimento automático gerado pela nota fiscal: ' + invoiceNumber
    try {
      receipt.set('notes', notes)
    } catch (_) {}

    try {
      receipt.set('created_by', e.auth?.id || '')
    } catch (_) {}

    $app.save(receipt)

    let invoiceItems = []
    try {
      invoiceItems = $app.findRecordsByFilter(
        'purchase_invoice_items',
        'invoice = {:invoiceId}',
        'created',
        500,
        0,
        { invoiceId: invoice.id },
      )
    } catch (_) {}

    let receiptItemsCollection
    try {
      receiptItemsCollection = $app.findCollectionByNameOrId('wms_receipt_items')
    } catch (err) {
      return e.next()
    }

    for (const invItem of invoiceItems) {
      try {
        const receiptItem = new Record(receiptItemsCollection)
        try {
          receiptItem.set('receipt', receipt.id)
        } catch (_) {}
        try {
          receiptItem.set('product', invItem.getString('product') || '')
        } catch (_) {}
        try {
          receiptItem.set('quantity', invItem.get('quantity') || 0)
        } catch (_) {}
        try {
          receiptItem.set('status', 'pending')
        } catch (_) {}
        $app.save(receiptItem)
      } catch (_) {}
    }

    $app
      .logger()
      .info(
        'Auto receipt created from invoice',
        'invoiceId',
        invoice.id,
        'receiptId',
        receipt.id,
        'itemsCount',
        invoiceItems.length,
      )
  } catch (err) {
    $app.logger().error('wms_auto_receipt_from_invoice failed', 'error', String(err))
  }

  return e.next()
}, 'purchase_invoices')
