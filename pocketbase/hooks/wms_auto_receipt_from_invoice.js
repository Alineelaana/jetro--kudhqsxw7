onRecordAfterCreateSuccess((e) => {
  try {
    const record = e.record
    const status = record.getString('status')
    if (status !== 'confirmada' && status !== 'aprovada') {
      return e.next()
    }

    let wmsReceipts
    try {
      wmsReceipts = $app.findCollectionByNameOrId('wms_receipts')
    } catch (_) {
      return e.next()
    }

    const invoiceId = record.getId()

    let existing = []
    try {
      existing = $app.findRecordsByFilter('wms_receipts', 'invoice_id = {:id}', '-created', 1, 0, {
        id: invoiceId,
      })
    } catch (_) {
      return e.next()
    }

    if (existing && existing.length > 0) {
      return e.next()
    }

    let parsedItems = []
    const items = record.get('items')
    if (items) {
      if (typeof items === 'string') {
        try {
          parsedItems = JSON.parse(items)
        } catch (_) {
          parsedItems = []
        }
      } else if (Array.isArray(items)) {
        parsedItems = items
      }
    }

    if (parsedItems.length === 0) {
      return e.next()
    }

    const receipt = new Record(wmsReceipts)
    receipt.set('invoice_id', invoiceId)
    receipt.set('status', 'pendente')
    receipt.set(
      'order_number',
      record.getString('invoice_number') || record.getString('order_number') || '',
    )
    receipt.set('supplier_name', record.getString('supplier_name') || '')
    receipt.set('items', JSON.stringify(parsedItems))

    const responsibleUser = record.getString('responsible_user')
    if (responsibleUser) {
      receipt.set('responsible_user', responsibleUser)
    }

    $app.save(receipt)
  } catch (err) {
    $app.logger().error('wms_auto_receipt_from_invoice error', 'error', String(err))
  }

  return e.next()
}, 'purchase_invoices')
