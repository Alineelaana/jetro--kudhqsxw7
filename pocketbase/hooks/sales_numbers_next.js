routerAdd(
  'GET',
  '/backend/v1/sales-numbers/next',
  (e) => {
    const type = e.request.url.query().get('type') || 'order'
    const prefixes = { order: 'PED', invoice: 'FAT', nfe: 'NFE', nfce: 'NFC', return: 'DEV' }
    const collections = {
      order: 'sales_orders',
      invoice: 'sales_invoices',
      nfe: 'nfe_records',
      nfce: 'nfce_records',
      return: 'sales_returns',
    }
    const prefix = prefixes[type] || 'PED'
    const colName = collections[type] || 'sales_orders'
    let count = 0
    try {
      count = $app.countRecords(colName)
    } catch (_) {}
    const number = prefix + '-' + String(count + 1).padStart(4, '0')
    return e.json(200, { number: number, sequence: count + 1 })
  },
  $apis.requireAuth(),
)
