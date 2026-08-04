onRecordAfterCreateSuccess((e) => {
  try {
    const opType = 'Venda faturada'
    const valor = e.record.getString('total_value') || '0'
    const documento = e.record.getString('invoice_number') || ''
    const empresa = e.record.getString('company') || ''
    const filial = e.record.getString('branch') || ''
    const rules = $app.findRecordsByFilter(
      'contabil_integration_rules',
      'tipo_operacao = "' + opType + '" && ativo = true',
      '-created',
      1,
      0,
    )
    if (
      rules.length > 0 &&
      rules[0].getString('conta_debito') &&
      rules[0].getString('conta_credito')
    ) {
      var rule = rules[0]
      var col = $app.findCollectionByNameOrId('contabil_lancamentos')
      var rec = new Record(col)
      var today = new Date().toISOString().split('T')[0]
      rec.set('numero_lancamento', 'LC-' + Date.now().toString(36).toUpperCase())
      rec.set('data_lancamento', today)
      rec.set('data_competencia', today)
      rec.set('empresa', empresa)
      rec.set('filial', filial)
      rec.set('historico', rule.getString('historico_padrao') || 'Venda faturada')
      rec.set('documento_origem', 'Vendas')
      rec.set('numero_documento', documento)
      rec.set('conta_debito', rule.getString('conta_debito'))
      rec.set('conta_credito', rule.getString('conta_credito'))
      rec.set('valor', valor)
      rec.set('centro_custo', rule.getString('centro_custo'))
      rec.set('status', 'Contabilizado')
      rec.set('origem', 'Vendas')
      rec.set('total_debitos', valor)
      rec.set('total_creditos', valor)
      $app.save(rec)
    } else {
      var pcol = $app.findCollectionByNameOrId('contabil_pending_integrations')
      var prec = new Record(pcol)
      prec.set('data', new Date().toISOString().split('T')[0])
      prec.set('modulo_origem', 'Vendas')
      prec.set('documento', documento)
      prec.set('tipo_operacao', opType)
      prec.set('valor', valor)
      prec.set('motivo_pendencia', 'Regra nao configurada')
      prec.set('status', 'Pendente')
      prec.set('origem_id', e.record.id)
      $app.save(prec)
    }
  } catch (err) {
    $app.logger().error('contabil sales invoice hook failed', 'error', String(err))
  }
  return e.next()
}, 'sales_invoices')
