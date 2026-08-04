onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status') || ''
  const newStatus = e.record.getString('status') || ''

  if (oldStatus === newStatus) return e.next()
  if (newStatus !== 'Pago' && newStatus !== 'Parcialmente Pago') return e.next()

  const titulo = e.record.getString('numero_titulo') || ''
  const fornecedor = e.record.getString('fornecedor') || ''
  const valorOriginal = parseFloat(e.record.getString('valor_original') || '0')
  const valorPago = parseFloat(e.record.getString('valor_pago') || '0')
  const contaBancaria = e.record.getString('conta_bancaria') || ''
  const formaPagamento = e.record.getString('forma_pagamento') || ''
  const dataPagamento =
    e.record.getString('data_pagamento') || new Date().toISOString().split('T')[0]
  const valorMov = newStatus === 'Parcialmente Pago' ? valorPago : valorOriginal

  try {
    const movCol = $app.findCollectionByNameOrId('financial_movements')
    const mov = new Record(movCol)
    mov.set('data_hora', dataPagamento)
    mov.set('tipo_movimentacao', 'Pagamento')
    mov.set('documento', titulo)
    mov.set('cliente_fornecedor', fornecedor)
    mov.set('conta', contaBancaria)
    mov.set('entrada', '0')
    mov.set('saida', String(valorMov))
    mov.set('observacoes', 'Pagamento do titulo ' + titulo + ' - ' + fornecedor)
    $app.save(mov)
  } catch (err) {
    $app.logger().error('Failed to create movement from payable payment', 'error', String(err))
  }

  try {
    const reconCol = $app.findCollectionByNameOrId('financial_reconciliation')
    const recon = new Record(reconCol)
    recon.set('data', dataPagamento)
    recon.set('descricao_bancaria', 'Pagamento - ' + fornecedor + ' - ' + titulo)
    recon.set('documento', titulo)
    recon.set('valor', String(valorMov))
    recon.set('tipo', 'Saida')
    recon.set('lancamento_correspondente', e.record.id)
    recon.set('status', 'N\u00e3o Conciliado')
    recon.set('conta_bancaria', contaBancaria)
    $app.save(recon)
  } catch (err) {
    $app.logger().error('Failed to create reconciliation entry from payable', 'error', String(err))
  }

  try {
    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(auditCol)
    log.set('action', 'update')
    log.set('module', 'finance')
    log.set('target_collection', 'financial_payables')
    log.set('target_id', e.record.id)
    log.set('target_summary', titulo + ' - ' + fornecedor + ' | ' + oldStatus + ' -> ' + newStatus)
    log.set('previous_value', { status: oldStatus })
    log.set('new_value', { status: newStatus, valor_pago: valorMov, forma: formaPagamento })
    log.set('criticidade', 'Media')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'financial_payables')
