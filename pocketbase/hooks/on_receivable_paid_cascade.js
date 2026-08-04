onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('status') || ''
  const newStatus = e.record.getString('status') || ''

  if (oldStatus === newStatus) return e.next()
  if (newStatus !== 'Recebido' && newStatus !== 'Parcialmente Recebido') return e.next()

  const titulo = e.record.getString('numero_titulo') || ''
  const cliente = e.record.getString('cliente') || ''
  const valorOriginal = parseFloat(e.record.getString('valor_original') || '0')
  const valorRecebido = parseFloat(e.record.getString('valor_recebido') || '0')
  const contaBancaria = e.record.getString('conta_bancaria') || ''
  const formaRecebimento = e.record.getString('forma_recebimento') || ''
  const dataRecebimento =
    e.record.getString('data_recebimento') || new Date().toISOString().split('T')[0]
  const valorMov = newStatus === 'Parcialmente Recebido' ? valorRecebido : valorOriginal

  try {
    const movCol = $app.findCollectionByNameOrId('financial_movements')
    const mov = new Record(movCol)
    mov.set('data_hora', dataRecebimento)
    mov.set('tipo_movimentacao', 'Recebimento')
    mov.set('documento', titulo)
    mov.set('cliente_fornecedor', cliente)
    mov.set('conta', contaBancaria)
    mov.set('entrada', String(valorMov))
    mov.set('saida', '0')
    mov.set('observacoes', 'Recebimento do titulo ' + titulo + ' - ' + cliente)
    $app.save(mov)
  } catch (err) {
    $app.logger().error('Failed to create movement from receivable payment', 'error', String(err))
  }

  try {
    const reconCol = $app.findCollectionByNameOrId('financial_reconciliation')
    const recon = new Record(reconCol)
    recon.set('data', dataRecebimento)
    recon.set('descricao_bancaria', 'Recebimento - ' + cliente + ' - ' + titulo)
    recon.set('documento', titulo)
    recon.set('valor', String(valorMov))
    recon.set('tipo', 'Entrada')
    recon.set('lancamento_correspondente', e.record.id)
    recon.set('status', 'N\u00e3o Conciliado')
    recon.set('conta_bancaria', contaBancaria)
    $app.save(recon)
  } catch (err) {
    $app
      .logger()
      .error('Failed to create reconciliation entry from receivable', 'error', String(err))
  }

  try {
    const stmtCol = $app.findCollectionByNameOrId('financial_bank_statements')
    const stmt = new Record(stmtCol)
    stmt.set('conta_bancaria', contaBancaria)
    stmt.set('data', dataRecebimento)
    stmt.set('descricao', 'Recebimento - ' + cliente + ' - ' + titulo)
    stmt.set('documento', titulo)
    stmt.set('valor', String(valorMov))
    stmt.set('tipo', 'Entrada')
    stmt.set('conciliado', false)
    stmt.set('arquivo_origem', 'Sistema')
    $app.save(stmt)
  } catch (err) {
    $app.logger().error('Failed to create bank statement from receivable', 'error', String(err))
  }

  try {
    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(auditCol)
    log.set('action', 'update')
    log.set('module', 'finance')
    log.set('target_collection', 'financial_receivables')
    log.set('target_id', e.record.id)
    log.set('target_summary', titulo + ' - ' + cliente + ' | ' + oldStatus + ' -> ' + newStatus)
    log.set('previous_value', { status: oldStatus })
    log.set('new_value', { status: newStatus, valor_recebido: valorMov, forma: formaRecebimento })
    log.set('criticidade', 'Media')
    log.set('origem', 'Area da Empresa')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'financial_receivables')
