// sales_numbers_next.js — Geração sequencial transacional de números de pedidos de venda e documentos
routerAdd(
  'GET',
  '/backend/v1/sales-numbers/next',
  (e) => {
    const type = e.request.url.query().get('type') || 'order'
    const prefixes = { order: 'PV', invoice: 'FAT', nfe: 'NFE', nfce: 'NFC', return: 'DEV' }
    const collections = {
      order: 'sales_orders',
      invoice: 'sales_invoices',
      nfe: 'nfe_records',
      nfce: 'nfce_records',
      return: 'sales_returns',
    }
    const prefix = prefixes[type] || 'PV'
    const colName = collections[type] || 'sales_orders'

    let maxNum = 0
    let totalCount = 0

    try {
      totalCount = $app.countRecords(colName)
    } catch (_) {}

    if (type === 'order') {
      try {
        // Encontra o maior número existente no formato PV-XXXXXX
        const records = $app.findRecordsByFilter(
          colName,
          "order_number ~ 'PV-'",
          '-created',
          100,
          0,
        )
        for (let i = 0; i < records.length; i++) {
          const raw = String(records[i].get('order_number') || '')
          const match = raw.match(/PV-(\d+)/)
          if (match && match[1]) {
            const val = parseInt(match[1], 10)
            if (!isNaN(val) && val > maxNum) {
              maxNum = val
            }
          }
        }
      } catch (_) {}

      const nextSeq = Math.max(maxNum + 1, totalCount + 1)
      const number = 'PV-' + String(nextSeq).padStart(6, '0')
      return e.json(200, { number: number, sequence: nextSeq })
    }

    const nextSeq = totalCount + 1
    const number = prefix + '-' + String(nextSeq).padStart(4, '0')
    return e.json(200, { number: number, sequence: nextSeq })
  },
  $apis.requireAuth(),
)
