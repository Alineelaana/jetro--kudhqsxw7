onRecordAfterCreateSuccess((e) => {
  const invoice = e.record
  const invoiceNum = invoice.getString('invoice_number') || ''
  const orderNum = invoice.getString('order_number') || ''
  const clientName = invoice.getString('client_name') || ''
  const clientId = invoice.getString('client_id') || ''
  const totalValue = invoice.getString('total_value') || '0'
  const company = invoice.getString('company') || 'Velora Log'
  const branch = invoice.getString('branch') || 'Matriz'

  try {
    $app.findFirstRecordByFilter(
      'financial_receivables',
      'numero_nota_fiscal = "' + invoiceNum + '"',
    )
    return e.next()
  } catch (_) {}

  const today = new Date()
  const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const pad = function (n) {
    return n < 10 ? '0' + n : '' + n
  }
  const fmtDate = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate())
  const fmtDue =
    dueDate.getFullYear() + '-' + pad(dueDate.getMonth() + 1) + '-' + pad(dueDate.getDate())

  try {
    const col = $app.findCollectionByNameOrId('financial_receivables')
    const rec = new Record(col)
    rec.set('numero_titulo', 'TR-' + invoiceNum)
    rec.set('cliente', clientName)
    rec.set('client_id', clientId)
    rec.set('empresa', company)
    rec.set('filial', branch)
    rec.set('documento_origem', 'Nota Fiscal')
    rec.set('numero_nota_fiscal', invoiceNum)
    rec.set('numero_pedido', orderNum)
    rec.set('data_emissao', fmtDate)
    rec.set('data_competencia', fmtDate)
    rec.set('data_vencimento', fmtDue)
    rec.set('valor_original', totalValue)
    rec.set('valor_atualizado', totalValue)
    rec.set('status', 'Em Aberto')
    rec.set('observacoes', 'Titulo gerado automaticamente pelo faturamento do pedido ' + orderNum)
    $app.save(rec)

    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(auditCol)
    log.set('action', 'create')
    log.set('module', 'finance')
    log.set('target_collection', 'financial_receivables')
    log.set('target_id', rec.id)
    log.set('target_summary', 'Titulo TR-' + invoiceNum + ' - ' + clientName)
    log.set('new_value', {
      numero_titulo: 'TR-' + invoiceNum,
      cliente: clientName,
      valor: totalValue,
      origem: 'Faturamento ' + invoiceNum,
    })
    log.set('criticidade', 'Media')
    log.set('origem', 'Automacao')
    $app.save(log)
  } catch (err) {
    $app.logger().error('Failed to create receivable from invoice', 'error', String(err))
  }

  return e.next()
}, 'sales_invoices')
