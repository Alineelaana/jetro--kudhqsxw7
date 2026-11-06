// Migração 0314 — Cadastro de Cliente Alef Cordeiro Gonçalves e Pedido de Venda Gran Romano para Faturamento
migrate(
  (app) => {
    // =========================================================================
    // 1. Cadastrar / Localizar Cliente na coleção `partners`
    // =========================================================================
    var partnersCol = null
    try {
      partnersCol = app.findCollectionByNameOrId('partners')
    } catch (_) {
      return // sem parceiros
    }

    var partnerCnpj = '52.519.350/0001-62'
    var partnerCnpjClean = '52519350000162'
    var partner = null

    try {
      var found = app.findRecordsByFilter(
        'partners',
        'cnpj ~ "' + partnerCnpjClean + '" || cnpj ~ "' + partnerCnpj + '"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) partner = found[0]
    } catch (_) {}

    if (!partner) {
      partner = new Record(partnersCol)
    }

    partner.set('partner_type', 'Cliente')
    partner.set('person_type', 'PJ')
    partner.set('active', true)
    partner.set('blocked', false)
    partner.set('company_name', '52.519.350 ALEF CORDEIRO GONCALVES')
    partner.set('trade_name', 'Alef Cordeiro Gonçalves')
    partner.set('full_name', 'Alef Cordeiro Gonçalves (52.519.350 ALEF CORDEIRO GONCALVES)')
    partner.set('cnpj', partnerCnpj)
    partner.set('regime_tributario', 'Simples Nacional')
    partner.set('simples_nacional', true)
    partner.set('consumidor_final', true)
    partner.set('contribuinte_icms', false)
    partner.set('address', 'Campinho da Serra I')
    partner.set('address_district', 'Campinho da Serra I')
    partner.set('address_city', 'Serra')
    partner.set('address_state', 'ES')
    partner.set('cep', '29178-024')
    partner.set('empresa_id', 't4wx2m5n5jucy9z') // Gran Romano
    partner.set('filial_id', 'Matriz')
    partner.set(
      'observations',
      'Cliente MEI / Simples Nacional cadastrado para faturamento Gran Romano.',
    )

    app.saveNoValidate(partner)
    var partnerId = partner.id

    // =========================================================================
    // 2. Garantir sincronização opcional na coleção `clients` se existir
    // =========================================================================
    try {
      var clientsCol = app.findCollectionByNameOrId('clients')
      if (clientsCol) {
        var clientRec = null
        try {
          var cFound = app.findRecordsByFilter(
            'clients',
            'partner_id = "' + partnerId + '" || cnpj ~ "' + partnerCnpjClean + '"',
            '',
            1,
            0,
          )
          if (cFound && cFound.length > 0) clientRec = cFound[0]
        } catch (_) {}

        if (!clientRec) {
          clientRec = new Record(clientsCol)
          clientRec.set('partner_id', partnerId)
          clientRec.set('name', 'Alef Cordeiro Gonçalves (52.519.350 ALEF CORDEIRO GONCALVES)')
          clientRec.set('company_name', '52.519.350 ALEF CORDEIRO GONCALVES')
          clientRec.set('cnpj', partnerCnpj)
          clientRec.set('active', true)
          clientRec.set('status', 'ativo')
          clientRec.set('empresa_id', 't4wx2m5n5jucy9z')
          clientRec.set('filial_id', 'Matriz')
          app.saveNoValidate(clientRec)
        }
      }
    } catch (_) {}

    // =========================================================================
    // 3. Localizar produtos existentes com saldo em estoque
    // =========================================================================
    var prod1 = null
    var prod2 = null
    try {
      var p1 = app.findRecordsByFilter('products', 'code = "TESTE-PROD-001"', '', 1, 0)
      if (p1 && p1.length > 0) prod1 = p1[0]
    } catch (_) {}
    try {
      var p2 = app.findRecordsByFilter('products', 'code = "TESTE-PROD-002"', '', 1, 0)
      if (p2 && p2.length > 0) prod2 = p2[0]
    } catch (_) {}

    var prod1Id = prod1 ? prod1.id : '69ymhcvydjakjbo'
    var prod1Code = prod1 ? prod1.getString('code') || 'TESTE-PROD-001' : 'TESTE-PROD-001'
    var prod1Name = prod1
      ? prod1.getString('name') || 'TESTE Caixa de Papelao 40x30x30'
      : 'TESTE Caixa de Papelao 40x30x30'

    var prod2Id = prod2 ? prod2.id : 'cg4aigrwiq4765y'
    var prod2Code = prod2 ? prod2.getString('code') || 'TESTE-PROD-002' : 'TESTE-PROD-002'
    var prod2Name = prod2
      ? prod2.getString('name') || 'TESTE Filme Stretch PVC 500mm'
      : 'TESTE Filme Stretch PVC 500mm'

    // Garantir saldo em estoque suficiente para os 2 produtos
    try {
      if (prod1 && (prod1.getInt('stock') || 0) < 100) {
        prod1.set('stock', 500)
        app.saveNoValidate(prod1)
      }
      if (prod2 && (prod2.getInt('stock') || 0) < 50) {
        prod2.set('stock', 150)
        app.saveNoValidate(prod2)
      }
    } catch (_) {}

    // =========================================================================
    // 4. Determinar número de pedido padrão (PV-00000X / PED-XXXX)
    // =========================================================================
    var orderNumber = 'PV-000004'
    var recTitulo = 'REC-PV-000004'

    // Verificar se já existe pedido para esse cliente com esse número ou criar novo
    var existingOrder = null
    try {
      var oFound = app.findRecordsByFilter(
        'sales_orders',
        'order_number = "' +
          orderNumber +
          '" || (customer_cnpj ~ "' +
          partnerCnpjClean +
          '" && empresa_id = "t4wx2m5n5jucy9z")',
        '-created',
        1,
        0,
      )
      if (oFound && oFound.length > 0) existingOrder = oFound[0]
    } catch (_) {}

    var ordersCol = app.findCollectionByNameOrId('sales_orders')
    var order = existingOrder || new Record(ordersCol)

    if (existingOrder && existingOrder.getString('order_number')) {
      orderNumber = existingOrder.getString('order_number')
      recTitulo = 'REC-' + orderNumber
    }

    var nowIso = new Date().toISOString()
    var todayYmd = nowIso.substring(0, 10)

    // Valores coerentes:
    // Item 1: 50 un * R$ 8,50 = R$ 425,00
    // Item 2: 10 rolos * R$ 42,00 = R$ 420,00
    // Subtotal itens: R$ 845,00
    // Frete: R$ 45,00 (CIF)
    // Impostos (Simples Nacional / estimado): R$ 75,00
    // Total Geral: R$ 965,00
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
        action: 'Pedido Criado',
        date: nowIso,
        user: 'Admin HURAM',
        details:
          'Pedido de venda pronto para faturamento (Gran Romano) com 2 itens (total R$ 965,00)',
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
    // 5. Criar / Atualizar Recebível em `financial_receivables`
    // =========================================================================
    var recCol = app.findCollectionByNameOrId('financial_receivables')
    var receivable = null

    try {
      var rFound = app.findRecordsByFilter(
        'financial_receivables',
        'documento_origem ~ "' + orderNumber + '" || numero_pedido = "' + orderNumber + '"',
        '-created',
        1,
        0,
      )
      if (rFound && rFound.length > 0) receivable = rFound[0]
    } catch (_) {}

    if (!receivable) {
      receivable = new Record(recCol)
    }

    receivable.set('numero_titulo', recTitulo)
    receivable.set('documento_origem', orderNumber)
    receivable.set('numero_pedido', orderNumber)
    receivable.set('cliente', 'Alef Cordeiro Gonçalves (52.519.350 ALEF CORDEIRO GONCALVES)')
    receivable.set('client_id', partnerId)
    receivable.set('empresa', 't4wx2m5n5jucy9z') // Gran Romano
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
    // 6. Preencher dados completos do Pedido de Venda
    // =========================================================================
    order.set('order_number', orderNumber)
    order.set('client_id', partnerId)
    order.set('client_name', 'Alef Cordeiro Gonçalves (52.519.350 ALEF CORDEIRO GONCALVES)')
    order.set('customer_cnpj', partnerCnpj)
    order.set('customer_address', 'Campinho da Serra I, Serra - ES, 29178-024')
    order.set('customer_city', 'Serra')
    order.set('customer_district', 'Campinho da Serra I')
    order.set('empresa_id', 't4wx2m5n5jucy9z') // Gran Romano
    order.set('company', 't4wx2m5n5jucy9z') // Gran Romano
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
      'Pedido pronto para faturamento Focus NFe (Gran Romano, Série 2, Produção).',
    )

    order.set('salesperson_name', 'Vendas Internas - Gran Romano')
    order.set('responsible_user', 'Admin HURAM')

    // Ciclo completo de faturamento
    order.set('status', 'Pronto para Faturamento')
    order.set('faturamento_status', 'pendente_faturamento')
    order.set('separacao_status', 'confirmada')
    order.set('separacao_confirmada_at', nowIso)
    order.set('separacao_confirmada_por', 'Admin HURAM')
    order.set('liberado_faturamento_at', nowIso)
    order.set('liberado_faturamento_por', 'Alef Cordeiro Gonçalves')
    order.set('stock_reserved', true)
    order.set('is_invoiced', false)
    order.set('receivable_id', receivableId)
    order.set('history', history)

    app.saveNoValidate(order)

    // =========================================================================
    // 7. Criar reservas de estoque em `stock_reservations`
    // =========================================================================
    try {
      var resCol = app.findCollectionByNameOrId('stock_reservations')
      if (resCol) {
        // Limpar reservas antigas desse pedido se houver
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

        // Inserir reserva item 1
        var r1 = new Record(resCol)
        r1.set('order_id', order.id)
        r1.set('order_number', orderNumber)
        r1.set('product_id', prod1Id)
        r1.set('product_code', prod1Code)
        r1.set('product_name', prod1Name)
        r1.set('quantity', 50)
        r1.set('status', 'ativa')
        r1.set('empresa_id', 't4wx2m5n5jucy9z')
        app.saveNoValidate(r1)

        // Inserir reserva item 2
        var r2 = new Record(resCol)
        r2.set('order_id', order.id)
        r2.set('order_number', orderNumber)
        r2.set('product_id', prod2Id)
        r2.set('product_code', prod2Code)
        r2.set('product_name', prod2Name)
        r2.set('quantity', 10)
        r2.set('status', 'ativa')
        r2.set('empresa_id', 't4wx2m5n5jucy9z')
        app.saveNoValidate(r2)
      }
    } catch (_) {}
  },
  (app) => {
    // Down migration
    try {
      var orders = app.findRecordsByFilter(
        'sales_orders',
        'customer_cnpj ~ "52519350000162" || customer_cnpj ~ "52.519.350/0001-62"',
        '',
        10,
        0,
      )
      for (var i = 0; i < orders.length; i++) {
        var o = orders[i]
        try {
          var recs = app.findRecordsByFilter(
            'financial_receivables',
            'numero_pedido = "' + o.getString('order_number') + '"',
            '',
            10,
            0,
          )
          for (var j = 0; j < recs.length; j++) app.delete(recs[j])
        } catch (_) {}
        try {
          var sres = app.findRecordsByFilter(
            'stock_reservations',
            'order_id = "' + o.id + '"',
            '',
            10,
            0,
          )
          for (var k = 0; k < sres.length; k++) app.delete(sres[k])
        } catch (_) {}
        app.delete(o)
      }
    } catch (_) {}
  },
)
