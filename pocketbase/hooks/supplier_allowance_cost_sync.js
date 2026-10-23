// pb_hooks/supplier_allowance_cost_sync.js
// Sincronização e Integração Oficial: Verbas de Fornecedor → Custo Médio Ponderado Real
// Quando uma apropriação em supplier_allowance_appropriations com motivo contendo "ajuste_custo_aquisicao"
// é aprovada (ou criada já com status "aprovado"), recalcula o custo médio do produto afetado e
// gera o registro oficial em product_cost_history com a verba como documento de referência.

onRecordAfterCreateSuccess((e) => {
  try {
    var appropriationRecord = e.record
    var status = appropriationRecord.getString('status')
    var reason = appropriationRecord.getString('reason') || ''
    var productId = appropriationRecord.getString('product') || ''
    var costApplied = appropriationRecord.getBool('cost_applied')

    // Somente se aprovado, com produto vinculado, motivo de ajuste de custo de aquisição e ainda não aplicado
    if (
      status === 'aprovado' &&
      productId &&
      reason.indexOf('ajuste_custo_aquisicao') !== -1 &&
      !costApplied
    ) {
      var allocatedVal =
        parseFloat(
          String(appropriationRecord.getString('allocated_value') || '0').replace(',', '.'),
        ) || 0
      if (allocatedVal > 0) {
        var prod = null
        try {
          prod = $app.findRecordById('products', productId)
        } catch (_) {}

        if (prod) {
          var currentStock = prod.getInt('stock') || 0
          var custoMedioAtual =
            parseFloat(
              String(prod.getString('cost_average') || prod.getString('cost_price') || '0').replace(
                ',',
                '.',
              ),
            ) || 0

          var baseQtd = currentStock > 0 ? currentStock : 1
          var unitDeduction = allocatedVal / baseQtd

          var novoCustoMedio = Math.max(0, custoMedioAtual - unitDeduction)
          var costNewStr = novoCustoMedio.toFixed(4)
          var unitDeductionStr = unitDeduction.toFixed(4)

          prod.set('cost_average', costNewStr)
          prod.set('cost_price', costNewStr)
          prod.set('last_cost', costNewStr)
          prod.set('cost_origin', 'supplier_allowance')
          $app.save(prod)

          var empresaId = prod.getString('empresa') || ''
          if (!empresaId) {
            try {
              var accountId = appropriationRecord.getString('account')
              if (accountId) {
                var acc = $app.findRecordById('supplier_allowance_accounts', accountId)
                if (acc) empresaId = acc.getString('empresa') || ''
              }
            } catch (_) {}
          }

          var histCol = $app.findCollectionByNameOrId('product_cost_history')
          var hist = new Record(histCol)
          hist.set('product', productId)
          if (empresaId) hist.set('empresa', empresaId)
          hist.set('data_hora', new Date().toISOString())
          hist.set('origem', 'supplier_allowance')
          hist.set('documento_referencia', 'VERBA_' + appropriationRecord.id)
          hist.set('metodo', 'allowance_deduction')
          hist.set('custo_anterior', custoMedioAtual)
          hist.set('custo_novo', novoCustoMedio)
          hist.set('quantidade_entrada', 0)
          hist.set('saldo_apos', currentStock)
          if (e.auth) hist.set('usuario', e.auth.id)

          var compJson = {
            metodo: 'Abatimento de Verba de Fornecedor (Ajuste de Custo de Aquisição)',
            motivo_verba: reason,
            valor_total_verba: allocatedVal,
            saldo_estoque_base: currentStock,
            abatimento_unitario: unitDeduction,
            custo_medio_anterior: custoMedioAtual,
            novo_custo_medio: novoCustoMedio,
            apropriacao_id: appropriationRecord.id,
            conta_corrente_id: appropriationRecord.getString('account'),
            apuracao_id: appropriationRecord.getString('accrual'),
            empresa_id: empresaId,
          }
          hist.set('composicao', compJson)
          $app.save(hist)

          appropriationRecord.set('cost_applied', true)
          appropriationRecord.set('cost_history_ref', hist.id)
          appropriationRecord.set('unit_cost_deduction', unitDeductionStr)
          $app.save(appropriationRecord)

          try {
            var pc = $app.findFirstRecordByFilter(
              'pricing_config',
              'product_id = "' + productId + '"',
            )
            if (pc) {
              pc.set('average_cost', costNewStr)
              pc.set('last_purchase_cost', costNewStr)
              pc.set('replacement_cost', costNewStr)
              pc.set('accounting_cost', costNewStr)
              $app.save(pc)
            }
          } catch (_) {}

          $app
            .logger()
            .info(
              'Custo médio reduzido por verba de fornecedor (create)',
              'product',
              productId,
              'appropriation',
              appropriationRecord.id,
              'custo_ant',
              custoMedioAtual,
              'novo_custo',
              novoCustoMedio,
            )
        }
      }
    }
  } catch (err) {
    $app
      .logger()
      .error('Falha ao aplicar abatimento de verba no custo (create)', 'error', String(err))
  }
  return e.next()
}, 'supplier_allowance_appropriations')

onRecordAfterUpdateSuccess((e) => {
  try {
    var appropriationRecord = e.record
    var status = appropriationRecord.getString('status')
    var reason = appropriationRecord.getString('reason') || ''
    var productId = appropriationRecord.getString('product') || ''
    var costApplied = appropriationRecord.getBool('cost_applied')

    // Somente se aprovado, com produto vinculado, motivo de ajuste de custo de aquisição e ainda não aplicado
    if (
      status === 'aprovado' &&
      productId &&
      reason.indexOf('ajuste_custo_aquisicao') !== -1 &&
      !costApplied
    ) {
      var allocatedVal =
        parseFloat(
          String(appropriationRecord.getString('allocated_value') || '0').replace(',', '.'),
        ) || 0
      if (allocatedVal > 0) {
        var prod = null
        try {
          prod = $app.findRecordById('products', productId)
        } catch (_) {}

        if (prod) {
          var currentStock = prod.getInt('stock') || 0
          var custoMedioAtual =
            parseFloat(
              String(prod.getString('cost_average') || prod.getString('cost_price') || '0').replace(
                ',',
                '.',
              ),
            ) || 0

          var baseQtd = currentStock > 0 ? currentStock : 1
          var unitDeduction = allocatedVal / baseQtd

          var novoCustoMedio = Math.max(0, custoMedioAtual - unitDeduction)
          var costNewStr = novoCustoMedio.toFixed(4)
          var unitDeductionStr = unitDeduction.toFixed(4)

          prod.set('cost_average', costNewStr)
          prod.set('cost_price', costNewStr)
          prod.set('last_cost', costNewStr)
          prod.set('cost_origin', 'supplier_allowance')
          $app.save(prod)

          var empresaId = prod.getString('empresa') || ''
          if (!empresaId) {
            try {
              var accountId = appropriationRecord.getString('account')
              if (accountId) {
                var acc = $app.findRecordById('supplier_allowance_accounts', accountId)
                if (acc) empresaId = acc.getString('empresa') || ''
              }
            } catch (_) {}
          }

          var histCol = $app.findCollectionByNameOrId('product_cost_history')
          var hist = new Record(histCol)
          hist.set('product', productId)
          if (empresaId) hist.set('empresa', empresaId)
          hist.set('data_hora', new Date().toISOString())
          hist.set('origem', 'supplier_allowance')
          hist.set('documento_referencia', 'VERBA_' + appropriationRecord.id)
          hist.set('metodo', 'allowance_deduction')
          hist.set('custo_anterior', custoMedioAtual)
          hist.set('custo_novo', novoCustoMedio)
          hist.set('quantidade_entrada', 0)
          hist.set('saldo_apos', currentStock)
          if (e.auth) hist.set('usuario', e.auth.id)

          var compJson = {
            metodo: 'Abatimento de Verba de Fornecedor (Ajuste de Custo de Aquisição)',
            motivo_verba: reason,
            valor_total_verba: allocatedVal,
            saldo_estoque_base: currentStock,
            abatimento_unitario: unitDeduction,
            custo_medio_anterior: custoMedioAtual,
            novo_custo_medio: novoCustoMedio,
            apropriacao_id: appropriationRecord.id,
            conta_corrente_id: appropriationRecord.getString('account'),
            apuracao_id: appropriationRecord.getString('accrual'),
            empresa_id: empresaId,
          }
          hist.set('composicao', compJson)
          $app.save(hist)

          appropriationRecord.set('cost_applied', true)
          appropriationRecord.set('cost_history_ref', hist.id)
          appropriationRecord.set('unit_cost_deduction', unitDeductionStr)
          $app.save(appropriationRecord)

          try {
            var pc = $app.findFirstRecordByFilter(
              'pricing_config',
              'product_id = "' + productId + '"',
            )
            if (pc) {
              pc.set('average_cost', costNewStr)
              pc.set('last_purchase_cost', costNewStr)
              pc.set('replacement_cost', costNewStr)
              pc.set('accounting_cost', costNewStr)
              $app.save(pc)
            }
          } catch (_) {}

          $app
            .logger()
            .info(
              'Custo médio reduzido por verba de fornecedor (update)',
              'product',
              productId,
              'appropriation',
              appropriationRecord.id,
              'custo_ant',
              custoMedioAtual,
              'novo_custo',
              novoCustoMedio,
            )
        }
      }
    }
  } catch (err) {
    $app
      .logger()
      .error('Falha ao aplicar abatimento de verba no custo (update)', 'error', String(err))
  }
  return e.next()
}, 'supplier_allowance_appropriations')
