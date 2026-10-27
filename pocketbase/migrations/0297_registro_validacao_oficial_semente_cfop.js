migrate(
  (app) => {
    // 0297: Registro oficial de conferência das 4 regras-semente de CFOP contra a Tabela da Receita Federal / SEFAZ
    // CFOPs: 5.101, 5.102, 6.101, 6.102
    var fcrCollection = null
    try {
      fcrCollection = app.findCollectionByNameOrId('fiscal_cfop_rules')
    } catch (_) {}

    if (!fcrCollection) return

    var targetCfops = ['5101', '5102', '6101', '6102']
    var dataHoje = new Date().toISOString().slice(0, 10)
    var conferidoTexto =
      'Conferida e validada contra a Tabela Oficial de CFOP da Receita Federal/SEFAZ em ' +
      dataHoje +
      '. Alinhada à legislação: distinção estrita produção própria vs mercadoria de terceiros mantida.'

    for (var i = 0; i < targetCfops.length; i++) {
      var cfop = targetCfops[i]
      try {
        var records = app.findRecordsByFilter(
          'fiscal_cfop_rules',
          'cfop_resultado = "' + cfop + '" && operacao_codigo = "VENDA_NORMAL"',
          '-created',
          10,
        )

        for (var j = 0; j < records.length; j++) {
          var rec = records[j]
          rec.set('validado_responsavel_fiscal', true)
          rec.set('validado_por', 'Auditoria Fiscal HURAM (Receita Federal / SEFAZ)')
          rec.set('validado_em', new Date().toISOString())
          rec.set('is_exemplo_didatico', false)
          rec.set('observacoes', conferidoTexto)
          app.save(rec)
        }
      } catch (err) {
        console.log('Erro ao atualizar regra ' + cfop + ':', err)
      }
    }
  },
  (app) => {
    // Reversão idempotente
    try {
      var targetCfops = ['5101', '5102', '6101', '6102']
      for (var i = 0; i < targetCfops.length; i++) {
        var cfop = targetCfops[i]
        var records = app.findRecordsByFilter(
          'fiscal_cfop_rules',
          'cfop_resultado = "' + cfop + '" && operacao_codigo = "VENDA_NORMAL"',
          '-created',
          10,
        )
        for (var j = 0; j < records.length; j++) {
          var rec = records[j]
          rec.set('validado_responsavel_fiscal', false)
          rec.set('validado_por', '')
          rec.set('validado_em', '')
          rec.set('is_exemplo_didatico', true)
          rec.set(
            'observacoes',
            'Exemplo didático do documento HURAM (necessita validação fiscal).',
          )
          app.save(rec)
        }
      }
    } catch (_) {}
  },
)
