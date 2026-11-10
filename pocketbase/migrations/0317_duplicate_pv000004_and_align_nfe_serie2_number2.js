// Migração 0317 — Duplicar PV-000004 como PV-000005 (Gran Romano / Alef Cordeiro) e alinhar numeração NF Série 2 para 2
migrate(
  (app) => {
    // =========================================================================
    // 1. Garantir campo proximo_numero_nfe na coleção fiscal_focus_nfe_config
    // =========================================================================
    try {
      var cfgCol = app.findCollectionByNameOrId('fiscal_focus_nfe_config')
      if (cfgCol) {
        var hasField = false
        var fields = cfgCol.fields
        for (var f = 0; f < fields.length; f++) {
          if (fields[f].name === 'proximo_numero_nfe') {
            hasField = true
            break
          }
        }
        if (!hasField) {
          cfgCol.fields.add(new NumberField({ name: 'proximo_numero_nfe' }))
          app.save(cfgCol)
        }
      }
    } catch (_) {}

    // Configurar Gran Romano: ambiente producao, serie 2, proximo_numero_nfe = 2
    var granRomanoId = 't4wx2m5n5jucy9z'
    try {
      var gran = app.findFirstRecordByFilter(
        'empresas',
        'cnpj ~ "23890124000145" || cnpj ~ "23.890.124/0001-45" || code = "GRAN-ROMANO"',
      )
      if (gran) granRomanoId = gran.id
    } catch (_) {}

    try {
      var focusCfg = app.findFirstRecordByFilter(
        'fiscal_focus_nfe_config',
        'empresa_id = "' + granRomanoId + '"',
      )
      if (focusCfg) {
        focusCfg.set('ambiente', 'producao')
        focusCfg.set('serie', '2')
        focusCfg.set('emitente_ref', '282422')
        focusCfg.set('proximo_numero_nfe', 2)
        app.saveNoValidate(focusCfg)
      }
    } catch (_) {}

    // =========================================================================
    // 2. Localizar Cliente Alef Cordeiro Gonçalves
    // =========================================================================
    var partnerId = 'el4ejffn4kk1ni4'
    var partnerCnpj = '52.519.350/0001-62'
    try {
      var p = app.findFirstRecordByFilter(
        'partners',
        'cnpj ~ "52519350000162" || cnpj ~ "52.519.350/0001-62"',
      )
      if (p) partnerId = p.id
    } catch (_) {}

    // Produtos
    var prod1Id = '69ymhcvydjakjbo'
    var prod1Code = 'TESTE-PROD-001'
    var prod1Name = 'TESTE Caixa de Papelao 40x30x30'

    var prod2Id = 'cg4aigrwiq4765y'
    var prod2Code = 'TESTE-PROD-002'
    var prod2Name = 'TESTE Filme Stretch PVC 500mm'

    try {
      var pr1 = app.findFirstRecordByFilter('products', 'code = "TESTE-PROD-001"')
      if (pr1) {
        prod1Id = pr1.id
        prod1Code = pr1.getString('code') || prod1Code
        prod1Name = pr1.getString('name') || prod1Name
        if ((pr1.getInt('stock') || 0) < 100) {
          pr1.set('stock', 500)
          app.saveNoValidate(pr1)
        }
      }
      var pr2 = app.findFirstRecordByFilter('products', 'code = "TESTE-PROD-002"')
      if (pr2) {
        prod2Id = pr2.id
        prod2Code = pr2.getString('code') || prod2Code
        prod2Name = pr2.getString('name') || prod2Name
        if ((pr2.getInt('stock') || 0) < 50) {
          pr2.set('stock', 150)
          app.saveNoValidate(pr2)
        }
      }
    } catch (_) {}

    // =========================================================================
    // 3. Criar / Atualizar Pedido PV-000005
    // =========================================================================
    var orderNumber = 'PV-000005'
    var recTitulo = 'REC-PV-000005'
    var nowIso = new Date().toISOString()
    var todayYmd = nowIso.substring(0, 10)

    var ordersCol = app.findCollectionByNameOrId('sales_orders')
    var existingOrder = null
    try {
      existingOrder = app.findFirstRecordByFilter(
        'sales_orders',
        'order_number = "' + orderNumber + '"',
      )
    } catch (_) {}

    var order = existingOrder || new Record(ordersCol)

    var items = [
      {
        product_id: prod1Id,
        code: prod1Code,
        product: prod1Name,
        quantity: 50,
        unit: 'un',
        unit_price: 8.5,
        total: 425.0,
      },
      {
        product_id: prod2Id,
        code: prod2Code,
        product: prod2Name,
        quantity: 10,
        unit: 'rolo',
        unit_price: 42.0,
        total: 420.0,
      },
    ]

    var history = [
      {
        action: 'Pedido Criado (Duplicado de PV-000004)',
        date: nowIso,
        user: 'Admin HURAM',
        details:
          'Pedido de venda pronto para faturamento (Gran Romano) com 2 itens (total R$ 965,00) espelhando PV-000004',
      },
      {
        action: 'Pedido Confirmado (Provisão e Reserva de Estoque ativadas)',
        date: nowIso,
        user: 'Admin HURAM',
      },
      {
        action: 'Separação de Itens Confirmada',
        date: nowIso,
        user: 'Admin HURAM',
        details: 'Todos os 2 itens disponíveis em estoque e reservados',
      },
      {
        action: 'Liberado para Faturamento (Encaminhado para a Central de Faturamento)',
        date: nowIso,
        user: 'Alef Cordeiro Gonçalves',
      },
    ]

    // =========================================================================
    // 4. Recebível em financial_receivables
    // =========================================================================
    var recCol = app.findCollectionByNameOrId('financial_receivables')
    var receivable = null
    try {
      receivable = app.findFirstRecordByFilter(
        'financial_receivables',
        'numero_pedido = "' + orderNumber + '" || documento_origem ~ "' + orderNumber + '"',
      )
    } catch (_) {}

    if (!receivable) {
      receivable = new Record(recCol)
    }

    receivable.set('numero_titulo', recTitulo)
    receivable.set('documento_origem', orderNumber)
    receivable.set('numero_pedido', orderNumber)
    receivable.set('cliente', 'Alef Cordeiro Gonçalves (52.519.350 ALEF CORDEIRO GONCALVES)')
    receivable.set('client_id', partnerId)
    receivable.set('empresa', granRomanoId)
    receivable.set('filial', 'Matriz')
    receivable.set('data_emissao', todayYmd)
    receivable.set('data_competencia', todayYmd)
    receivable.set('data_vencimento', todayYmd)
    receivable.set('valor_original', '965.00')
    receivable.set('valor_atualizado', '965.00')
    receivable.set('desconto', '0.00')
    receivable.set('acrescimos', '0.00')
    receivable.set('juros', '0.00')
    receivable.set('multa', '0.00')
    receivable.set('forma_recebimento', 'Boleto')
    receivable.set('status', 'Em Aberto')
    receivable.set(
      'observacoes',
      'Recebível gerado na confirmação do pedido ' + orderNumber + ' para faturamento Gran Romano',
    )
    receivable.set('historico', [
      {
        acao: 'Provisão financeira criada a partir do pedido ' + orderNumber,
        data: nowIso,
        usuario: 'Admin HURAM',
      },
    ])

    app.saveNoValidate(receivable)
    var receivableId = receivable.id

    // =========================================================================
    // 5. Salvar Pedido de Venda PV-000005
    // =========================================================================
    order.set('order_number', orderNumber)
    order.set('client_id', partnerId)
    order.set('client_name', 'Alef Cordeiro Gonçalves (52.519.350 ALEF CORDEIRO GONCALVES)')
    order.set('customer_cnpj', partnerCnpj)
    order.set('customer_address', 'Campinho da Serra I, Serra - ES, 29178-024')
    order.set('customer_city', 'Serra')
    order.set('customer_district', 'Campinho da Serra I')
    order.set('empresa_id', granRomanoId)
    order.set('company', granRomanoId)
    order.set('filial_id', 'Matriz')
    order.set('branch', 'Matriz')

    order.set('gross_value', '845.00')
    order.set('discount_value', '0.00')
    order.set('addition_value', '0.00')
    order.set('freight_type', 'CIF')
    order.set('freight_value', '45.00')
    order.set('tax_value', '75.00')
    order.set('insurance_value', '0.00')
    order.set('other_expenses', '0.00')
    order.set('total_value', '965.00')

    order.set('items', items)
    order.set('payment_condition', '30 Dias')
    order.set('payment_method', 'Boleto')
    order.set('delivery_date', todayYmd)
    order.set('carrier_name', 'Transportadora Rodoviário Brasil')
    order.set('fiscal_notes', 'Operação interna ES - Simples Nacional.')
    order.set(
      'internal_notes',
      'Pedido duplicado de PV-000004 pronto para faturamento Focus NFe (Gran Romano, Série 2, Produção, NF nº 2).',
    )

    order.set('salesperson_name', 'Vendas Internas - Gran Romano')
    order.set('responsible_user', 'Admin HURAM')

    // Liberado para Faturamento
    order.set('status', 'Pronto para Faturamento')
    order.set('faturamento_status', 'pendente_faturamento')
    order.set('separacao_status', 'confirmada')
    order.set('separacao_confirmada_at', nowIso)
    order.set('separacao_confirmada_por', 'Admin HURAM')
    order.set('liberado_faturamento_at', nowIso)
    order.set('liberado_faturamento_por', 'Alef Cordeiro Gonçalves')
    order.set('stock_reserved', true)
    order.set('is_invoiced', false)
    order.set('nfe_record_id', '')
    order.set('nfe_chave_acesso', '')
    order.set('nfe_numero', '')
    order.set('receivable_id', receivableId)
    order.set('history', history)

    app.saveNoValidate(order)

    // =========================================================================
    // 6. Reservas de Estoque em stock_reservations
    // =========================================================================
    try {
      var resCol = app.findCollectionByNameOrId('stock_reservations')
      if (resCol) {
        try {
          var oldRes = app.findRecordsByFilter(
            'stock_reservations',
            'order_id = "' + order.id + '" || order_number = "' + orderNumber + '"',
            '',
            100,
            0,
          )
          for (var ri = 0; ri < oldRes.length; ri++) {
            app.delete(oldRes[ri])
          }
        } catch (_) {}

        var r1 = new Record(resCol)
        r1.set('order_id', order.id)
        r1.set('order_number', orderNumber)
        r1.set('product_id', prod1Id)
        r1.set('product_code', prod1Code)
        r1.set('product_name', prod1Name)
        r1.set('quantity', 50)
        r1.set('status', 'ativa')
        r1.set('empresa_id', granRomanoId)
        app.saveNoValidate(r1)

        var r2 = new Record(resCol)
        r2.set('order_id', order.id)
        r2.set('order_number', orderNumber)
        r2.set('product_id', prod2Id)
        r2.set('product_code', prod2Code)
        r2.set('product_name', prod2Name)
        r2.set('quantity', 10)
        r2.set('status', 'ativa')
        r2.set('empresa_id', granRomanoId)
        app.saveNoValidate(r2)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      var ord = app.findFirstRecordByFilter('sales_orders', 'order_number = "PV-000005"')
      if (ord) {
        try {
          var recs = app.findRecordsByFilter(
            'financial_receivables',
            'numero_pedido = "PV-000005"',
            '',
            10,
            0,
          )
          for (var i = 0; i < recs.length; i++) app.delete(recs[i])
        } catch (_) {}
        try {
          var sres = app.findRecordsByFilter(
            'stock_reservations',
            'order_number = "PV-000005"',
            '',
            10,
            0,
          )
          for (var j = 0; j < sres.length; j++) app.delete(sres[j])
        } catch (_) {}
        app.delete(ord)
      }
    } catch (_) {}
  },
)
