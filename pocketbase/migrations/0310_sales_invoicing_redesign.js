migrate(
  (app) => {
    // 1. Atualizar sales_orders com campos do fluxo de faturamento
    try {
      var ordersCol = app.findCollectionByNameOrId('sales_orders')
      if (ordersCol) {
        var existingFields = {}
        var fields = ordersCol.fields || []
        for (var i = 0; i < fields.length; i++) {
          existingFields[fields[i].name] = true
        }

        if (!existingFields['separacao_status']) {
          ordersCol.fields.add(
            new TextField({
              name: 'separacao_status',
              required: false,
            }),
          )
        }
        if (!existingFields['separacao_confirmada_at']) {
          ordersCol.fields.add(
            new TextField({
              name: 'separacao_confirmada_at',
              required: false,
            }),
          )
        }
        if (!existingFields['separacao_confirmada_por']) {
          ordersCol.fields.add(
            new TextField({
              name: 'separacao_confirmada_por',
              required: false,
            }),
          )
        }
        if (!existingFields['faturamento_status']) {
          ordersCol.fields.add(
            new TextField({
              name: 'faturamento_status',
              required: false,
            }),
          )
        }
        if (!existingFields['liberado_faturamento_at']) {
          ordersCol.fields.add(
            new TextField({
              name: 'liberado_faturamento_at',
              required: false,
            }),
          )
        }
        if (!existingFields['liberado_faturamento_por']) {
          ordersCol.fields.add(
            new TextField({
              name: 'liberado_faturamento_por',
              required: false,
            }),
          )
        }
        if (!existingFields['receivable_id']) {
          ordersCol.fields.add(
            new TextField({
              name: 'receivable_id',
              required: false,
            }),
          )
        }
        if (!existingFields['nfe_record_id']) {
          ordersCol.fields.add(
            new TextField({
              name: 'nfe_record_id',
              required: false,
            }),
          )
        }
        if (!existingFields['nfe_chave_acesso']) {
          ordersCol.fields.add(
            new TextField({
              name: 'nfe_chave_acesso',
              required: false,
            }),
          )
        }
        if (!existingFields['nfe_numero']) {
          ordersCol.fields.add(
            new TextField({
              name: 'nfe_numero',
              required: false,
            }),
          )
        }

        app.save(ordersCol)
      }
    } catch (errOrders) {
      console.log('Erro ao atualizar campos de sales_orders: ' + errOrders)
    }

    // 2. Atualizar nfe_records para vincular pedido de origem
    try {
      var nfeCol = app.findCollectionByNameOrId('nfe_records')
      if (nfeCol) {
        var nfeFields = {}
        var curFields = nfeCol.fields || []
        for (var j = 0; j < curFields.length; j++) {
          nfeFields[curFields[j].name] = true
        }
        if (!nfeFields['sales_order_id']) {
          nfeCol.fields.add(
            new TextField({
              name: 'sales_order_id',
              required: false,
            }),
          )
        }
        if (!nfeFields['sales_order_number']) {
          nfeCol.fields.add(
            new TextField({
              name: 'sales_order_number',
              required: false,
            }),
          )
        }
        app.save(nfeCol)
      }
    } catch (errNfe) {
      console.log('Erro ao atualizar campos de nfe_records: ' + errNfe)
    }

    // 3. Criar coleção stock_reservations
    var existsReservations = false
    try {
      app.findCollectionByNameOrId('stock_reservations')
      existsReservations = true
    } catch (_) {}

    if (!existsReservations) {
      var resCol = new Collection({
        name: 'stock_reservations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'order_id', type: 'text', required: true },
          { name: 'order_number', type: 'text', required: false },
          { name: 'product_id', type: 'text', required: false },
          { name: 'product_code', type: 'text', required: false },
          { name: 'product_name', type: 'text', required: false },
          { name: 'quantity', type: 'number', required: true },
          { name: 'status', type: 'text', required: false }, // 'ativa' | 'cancelada' | 'baixada'
          { name: 'empresa_id', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(resCol)
    }

    // 4. Backfill de status para pedidos existentes (idempotente)
    try {
      var orders = app.findRecordsByFilter(
        'sales_orders',
        'faturamento_status = "" || faturamento_status = null',
        '',
        1000,
      )
      for (var k = 0; k < orders.length; k++) {
        var ord = orders[k]
        var st = (ord.getString('status') || '').toLowerCase()
        if (st === 'faturado') {
          ord.set('faturamento_status', 'faturado')
          ord.set('separacao_status', 'confirmada')
        } else if (st === 'cancelado') {
          ord.set('faturamento_status', 'cancelado')
        } else if (st === 'aprovado' || st === 'confirmado' || st === 'pronto para faturamento') {
          ord.set('faturamento_status', 'pendente_faturamento')
          ord.set('separacao_status', 'confirmada')
        } else {
          ord.set('faturamento_status', 'pendente_liberacao')
          ord.set('separacao_status', 'pendente')
        }
        app.save(ord)
      }
    } catch (errBf) {
      console.log('Backfill sales_orders aviso: ' + errBf)
    }
  },
  (app) => {
    try {
      var resCol = app.findCollectionByNameOrId('stock_reservations')
      if (resCol) app.delete(resCol)
    } catch (_) {}
  },
)
