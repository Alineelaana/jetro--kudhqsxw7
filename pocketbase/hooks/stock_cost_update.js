// pb_hooks/stock_cost_update.js
// Motor de Custo Médio Ponderado Real — ERP HURAM
// Disparado após criação de movimentação em stock_movements
//
// FÓRMULA OFICIAL:
// novo_custo_medio = (saldo_anterior × custo_medio_atual + quantidade_entrada × custo_unitario_composto) ÷ novo_saldo
//
// CUSTO UNITÁRIO COMPOSTO:
// preço unitário do item da NF
// + frete / seguro / despesas acessórias rateados
// + tributos NÃO recuperáveis (definidos pela cost_policy da empresa)
// − descontos incondicionais
// − verbas de fornecedor classificadas como "ajuste de custo de aquisição"
// (verbas de campanha/receita NÃO reduzem custo)
//
// REGRAS ESPECIAIS:
// - Saldo anterior <= 0: novo_custo_medio = custo_unitario_composto
// - Bonificação (unitCost = 0): aumenta o saldo SEM zerar o custo médio
// - Produtos fabricados (cost_type = 'fabricado' ou cost_origin = 'production'):
//   custo de origem produção prevalece, entrada de compra não sobrescreve
// - Grava sempre em product_cost_history a trilha completa de auditoria imutável

onRecordAfterCreateSuccess((e) => {
  var mov = e.record
  var tipo = mov.getString('tipo_movimentacao') || ''
  var isEntry =
    tipo === 'Entrada por Compra' ||
    tipo === 'Entrada Manual' ||
    tipo === 'Entrada por Devolução' ||
    tipo === 'Ajuste Positivo'

  if (!isEntry) return e.next()

  var productId = mov.getString('produto_id') || ''
  if (!productId) return e.next()

  var qty =
    parseFloat(
      String(mov.getInt('quantidade') || mov.getString('quantidade') || '0').replace(',', '.'),
    ) || 0
  if (qty <= 0) return e.next()

  try {
    var prod = $app.findRecordById('products', productId)
    if (!prod) return e.next()

    // REGRA DE PROTEÇÃO: Produtos fabricados não têm custo sobrescrito por entrada de compra
    var costType = prod.getString('cost_type') || ''
    var costOrigin = prod.getString('cost_origin') || ''
    var isFabricado = costType === 'fabricado' || costOrigin === 'production'
    if (isFabricado && tipo === 'Entrada por Compra') {
      $app
        .logger()
        .info(
          'Custo de produto fabricado protegido contra sobrescrita por compra',
          'product',
          prod.id,
        )
      return e.next()
    }

    // Leitura do custo unitário bruto da movimentação
    var unitCostStr = mov.getString('custo_unitario') || '0'
    var unitCost = parseFloat(String(unitCostStr).replace(',', '.')) || 0

    // Metadata fiscal anexada na movimentação (quando originada de purchase_invoices ou fiscal_xml_entry)
    var meta = {}
    try {
      var obs = mov.getString('observacoes') || ''
      if (obs && obs.indexOf('{') === 0) {
        meta = JSON.parse(obs)
      }
    } catch (_) {}

    // Identifica empresa para buscar política de custeio (cost_policy)
    var empresaId = meta.empresa_id || ''
    if (!empresaId) {
      try {
        var empRecord = $app.findFirstRecordByFilter('empresas', '1 = 1')
        if (empRecord) empresaId = empRecord.id
      } catch (_) {}
    }

    var policy = null
    if (empresaId) {
      try {
        policy = $app.findFirstRecordByFilter(
          'cost_policy',
          'empresa = "' + empresaId + '" && ativo = true',
        )
      } catch (_) {}
    }
    if (!policy) {
      try {
        policy = $app.findFirstRecordByFilter('cost_policy', 'ativo = true')
      } catch (_) {}
    }

    var incluirFrete = policy ? policy.getBool('incluir_frete') : true
    var incluirSeguro = policy ? policy.getBool('incluir_seguro') : true
    var incluirDespesas = policy ? policy.getBool('incluir_despesas_acessorias') : true
    var deduzirRecuperaveis = policy ? policy.getBool('deduzir_impostos_recuperaveis') : true

    // Parâmetros de composição da política
    var paramComp = {}
    try {
      if (policy) paramComp = policy.get('parametros_composicao') || {}
    } catch (_) {}

    var icmsRecuperavel =
      paramComp.icms_recuperavel !== undefined ? Boolean(paramComp.icms_recuperavel) : true
    var pisCofinsRecuperavel =
      paramComp.pis_cofins_recuperavel !== undefined
        ? Boolean(paramComp.pis_cofins_recuperavel)
        : true
    var ipiRecuperavel =
      paramComp.ipi_recuperavel !== undefined ? Boolean(paramComp.ipi_recuperavel) : false

    // Componentes de custo do item
    var itemFrete =
      incluirFrete && meta.frete ? parseFloat(String(meta.frete).replace(',', '.')) || 0 : 0
    var itemSeguro =
      incluirSeguro && meta.seguro ? parseFloat(String(meta.seguro).replace(',', '.')) || 0 : 0
    var itemOutras =
      incluirDespesas && meta.outras_despesas
        ? parseFloat(String(meta.outras_despesas).replace(',', '.')) || 0
        : 0
    var itemDesconto = meta.desconto ? parseFloat(String(meta.desconto).replace(',', '.')) || 0 : 0

    // Rateio unitário das despesas e descontos
    var freteUnit = qty > 0 ? itemFrete / qty : 0
    var seguroUnit = qty > 0 ? itemSeguro / qty : 0
    var outrasUnit = qty > 0 ? itemOutras / qty : 0
    var descontoUnit = qty > 0 ? itemDesconto / qty : 0

    // Tributos recuperáveis vs não-recuperáveis
    var icmsUnit =
      meta.icms && qty > 0 ? (parseFloat(String(meta.icms).replace(',', '.')) || 0) / qty : 0
    var pisUnit =
      meta.pis && qty > 0 ? (parseFloat(String(meta.pis).replace(',', '.')) || 0) / qty : 0
    var cofinsUnit =
      meta.cofins && qty > 0 ? (parseFloat(String(meta.cofins).replace(',', '.')) || 0) / qty : 0
    var ipiUnit =
      meta.ipi && qty > 0 ? (parseFloat(String(meta.ipi).replace(',', '.')) || 0) / qty : 0
    var icmsStUnit =
      meta.icms_st && qty > 0 ? (parseFloat(String(meta.icms_st).replace(',', '.')) || 0) / qty : 0

    // Se a empresa recupera impostos, deduz da aquisição; impostos não recuperáveis agregam ao custo
    var deducaoImpostos = 0
    var acrescimoImpostos = 0

    if (deduzirRecuperaveis) {
      if (icmsRecuperavel) deducaoImpostos += icmsUnit
      if (pisCofinsRecuperavel) deducaoImpostos += pisUnit + cofinsUnit
    }

    // ICMS ST e IPI não recuperável agregam custo se não constavam embutidos no preço unitário
    if (!ipiRecuperavel && ipiUnit > 0) acrescimoImpostos += ipiUnit
    if (icmsStUnit > 0) acrescimoImpostos += icmsStUnit

    // VERBAS DE FORNECEDOR (supplier_allowances)
    // Apenas verbas classificadas como "ajuste de custo de aquisição" reduzem custo do produto.
    // Verbas de campanha / marketing / coop NÃO reduzem custo de estoque.
    var verbaAjusteCustoTotal = 0
    try {
      if (productId) {
        var verbas = $app.findRecordsByFilter(
          'supplier_allowance_appropriations',
          'product = "' +
            productId +
            '" && status = "aprovado" && reason ~ "ajuste_custo_aquisicao"',
          '-created',
          20,
          0,
        )
        for (var v = 0; v < verbas.length; v++) {
          var valV =
            parseFloat(String(verbas[v].getString('allocated_value')).replace(',', '.')) || 0
          verbaAjusteCustoTotal += valV
        }
      }
    } catch (_) {}

    var verbaUnit = qty > 0 ? verbaAjusteCustoTotal / qty : 0

    // CUSTO UNITÁRIO COMPOSTO
    var custoUnitarioComposto = 0
    var isBonificacao = unitCost === 0 && tipo === 'Entrada por Compra'

    if (isBonificacao) {
      // Bonificação: preço zero. Apenas custos acessórios se houver
      custoUnitarioComposto = Math.max(0, freteUnit + seguroUnit + outrasUnit)
    } else {
      custoUnitarioComposto =
        unitCost +
        freteUnit +
        seguroUnit +
        outrasUnit +
        acrescimoImpostos -
        descontoUnit -
        deducaoImpostos -
        verbaUnit
      if (custoUnitarioComposto < 0) custoUnitarioComposto = 0
    }

    // Saldos anterior e atual do produto
    var saldoAnterior = mov.getInt('saldo_anterior')
    if (saldoAnterior === null || saldoAnterior === undefined) {
      saldoAnterior = Math.max(0, (prod.getInt('stock') || 0) - qty)
    }

    var novoSaldo = saldoAnterior + qty
    if (novoSaldo <= 0) novoSaldo = qty

    // Custo médio atual do produto
    var custoMedioAtual =
      parseFloat(
        String(prod.getString('cost_average') || prod.getString('cost_price') || '0').replace(
          ',',
          '.',
        ),
      ) || 0

    // CÁLCULO DO NOVO CUSTO MÉDIO PONDERADO REAL
    var novoCustoMedio = 0

    if (saldoAnterior <= 0) {
      // Saldo zerado ou negativo: adota o custo da entrada
      novoCustoMedio = custoUnitarioComposto > 0 ? custoUnitarioComposto : custoMedioAtual
    } else if (isBonificacao && custoUnitarioComposto === 0) {
      // Bonificação pura com custo composto zero: aumenta o saldo SEM zerar o custo médio
      // novo_custo_medio = (saldo_anterior × custo_medio_atual) ÷ novo_saldo
      novoCustoMedio = (saldoAnterior * custoMedioAtual) / novoSaldo
    } else {
      // Fórmula Ponderada Real:
      // (saldo_anterior × custo_medio_atual + quantidade_entrada × custo_unitario_composto) ÷ novo_saldo
      var valorTotalAnterior = saldoAnterior * custoMedioAtual
      var valorEntrada = qty * custoUnitarioComposto
      novoCustoMedio = (valorTotalAnterior + valorEntrada) / novoSaldo
    }

    if (isNaN(novoCustoMedio) || novoCustoMedio < 0) {
      novoCustoMedio = custoUnitarioComposto > 0 ? custoUnitarioComposto : custoMedioAtual
    }

    var costNewStr = novoCustoMedio.toFixed(4)
    var lastCostStr = custoUnitarioComposto.toFixed(4)

    // Atualiza a fonte oficial única no produto: cost_price, cost_average, last_cost
    prod.set('cost_average', costNewStr)
    prod.set('cost_price', costNewStr)
    prod.set('last_cost', lastCostStr)
    prod.set('cost_origin', 'fiscal_entry')
    $app.save(prod)

    // GRAVAÇÃO OBRIGATÓRIA DA TRILHA DE AUDITORIA EM product_cost_history
    try {
      var histCol = $app.findCollectionByNameOrId('product_cost_history')
      var hist = new Record(histCol)
      hist.set('product', productId)
      if (empresaId) hist.set('empresa', empresaId)
      hist.set('data_hora', new Date().toISOString())
      hist.set('origem', 'fiscal_entry')
      hist.set('documento_referencia', mov.getString('documento_origem') || mov.id)
      hist.set('metodo', 'weighted_average')
      hist.set('custo_anterior', custoMedioAtual)
      hist.set('custo_novo', parseFloat(costNewStr))
      hist.set('quantidade_entrada', qty)
      hist.set('saldo_apos', novoSaldo)
      if (e.auth) hist.set('usuario', e.auth.id)

      // Composição completa do cálculo para conferência e compliance
      var compositionJson = {
        metodo: 'Custo Médio Ponderado Real',
        formula: '(saldo_ant × custo_ant + qtd_entrada × custo_unit_comp) ÷ novo_saldo',
        saldo_anterior: saldoAnterior,
        custo_medio_anterior: custoMedioAtual,
        quantidade_entrada: qty,
        novo_saldo: novoSaldo,
        novo_custo_medio: parseFloat(costNewStr),
        custo_unitario_composto: parseFloat(lastCostStr),
        detalhamento_composicao: {
          preco_unitario_nf: unitCost,
          frete_unitario: freteUnit,
          seguro_unitario: seguroUnit,
          despesas_acessorias_unitario: outrasUnit,
          acrescimo_tributos_nao_recuperaveis: acrescimoImpostos,
          desconto_unitario: descontoUnit,
          deducao_tributos_recuperaveis: deducaoImpostos,
          abatimento_verba_aquisicao: verbaUnit,
        },
        documento_origem: mov.getString('documento_origem'),
        tipo_movimentacao: tipo,
        empresa_id: empresaId,
        cost_policy_utilizada: policy ? policy.id : 'padrao_sistema',
      }
      hist.set('composicao', compositionJson)
      $app.save(hist)
    } catch (histErr) {
      $app
        .logger()
        .error(
          'Falha ao registrar product_cost_history no stock_cost_update',
          'error',
          String(histErr),
        )
    }

    // SINCRONIZAÇÃO DA PRECIFICAÇÃO (pricing_config) — preserva consistência comercial
    try {
      var pc = $app.findFirstRecordByFilter('pricing_config', 'product_id = "' + productId + '"')
      if (pc) {
        pc.set('average_cost', costNewStr)
        pc.set('last_purchase_cost', lastCostStr)
        pc.set('replacement_cost', costNewStr)
        pc.set('accounting_cost', costNewStr)
        $app.save(pc)
      }
    } catch (_) {}
  } catch (err) {
    $app.logger().error('stock_cost_update failed', 'error', String(err))
  }

  return e.next()
}, 'stock_movements')
