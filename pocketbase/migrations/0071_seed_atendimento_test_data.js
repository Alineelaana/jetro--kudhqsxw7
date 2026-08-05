migrate(
  (app) => {
    function findExisting(colName, field, value) {
      try {
        return app.findFirstRecordByData(colName, field, value)
      } catch (_) {
        return null
      }
    }

    function findExistingByFilter(colName, filter) {
      try {
        var results = app.findRecordsByFilter(colName, filter, '-created', 1, 0)
        if (results.length > 0) return results[0]
        return null
      } catch (_) {
        return null
      }
    }

    function seedRecord(colName, data, dedupField) {
      var existing = findExisting(colName, dedupField, data[dedupField])
      if (existing) return existing.id
      var col = app.findCollectionByNameOrId(colName)
      var rec = new Record(col)
      for (var k in data) rec.set(k, data[k])
      app.save(rec)
      return rec.id
    }

    var adminId = ''
    try {
      adminId = app.findAuthRecordByEmail('_pb_users_auth_', 'alineelaana@gmail.com').id
    } catch (_) {}

    var setorIds = {}
    var setorNames = ['Financeiro', 'Logistica', 'Fiscal', 'Comercial', 'Compras', 'TI', 'RH']
    setorNames.forEach(function (n) {
      var r = findExisting('atendimento_setores', 'nome', n)
      if (r) setorIds[n] = r.id
    })

    var motivoIds = {}
    var motivoNames = [
      'Produto Avariado',
      'Produto Faltando',
      'Produto Incorreto',
      'Troca',
      'Devolucao',
      'Garantia',
      'Divergencia na NF',
      'Divergencia no Pedido',
      'Cobranca Indevida',
      'Boleto',
      'Financeiro',
      'Entrega em Atraso',
      'Entrega Parcial',
      'Problema Logistico',
      'Problema Comercial',
      'Cadastro',
      'Reclamacao',
      'Sugestao',
      'Elogio',
      'Duvida',
      'Outro',
    ]
    motivoNames.forEach(function (n) {
      var r = findExisting('atendimento_motivos', 'nome', n)
      if (r) motivoIds[n] = r.id
    })

    var fluxoAvariadoId = ''
    var fluxoCobrancaId = ''
    var fa = findExisting('fluxos_inteligentes', 'nome', 'Fluxo Produto Avariado')
    if (fa) fluxoAvariadoId = fa.id
    var fc = findExisting('fluxos_inteligentes', 'nome', 'Fluxo Cobranca Indevida')
    if (fc) fluxoCobrancaId = fc.id

    var etapasAvariado = []
    var etapasCobranca = []
    if (fluxoAvariadoId) {
      try {
        etapasAvariado = app.findRecordsByFilter(
          'fluxo_etapas',
          'fluxo_id = "' + fluxoAvariadoId + '"',
          'ordem',
          50,
          0,
        )
      } catch (_) {}
    }
    if (fluxoCobrancaId) {
      try {
        etapasCobranca = app.findRecordsByFilter(
          'fluxo_etapas',
          'fluxo_id = "' + fluxoCobrancaId + '"',
          'ordem',
          50,
          0,
        )
      } catch (_) {}
    }

    var testPartners = [
      {
        partner_type: 'Cliente',
        person_type: 'PJ',
        active: true,
        blocked: false,
        company_name: 'TESTE Comercio Vitoria Ltda',
        trade_name: 'TESTE Comercio Vitoria',
        cnpj: '12.345.678/0001-90',
        email: 'teste@comerciovitoria.com',
        phone: '(27) 99999-0001',
        address: 'Rua das Testes, 123 - Centro, Vitoria - ES',
        cep: '29010-000',
        state_registration: '123.456.789.123',
        observations:
          'CLIENTE DE TESTE - Dados ficcionais para teste do modulo Central de Atendimento',
        financial_history: JSON.stringify([
          { date: '2026-07-01', description: 'Limite de credito aprovado', value: '50000.00' },
          { date: '2026-07-15', description: 'Pagamento em dia', value: '12500.00' },
        ]),
        monthly_income: '50000.00',
      },
      {
        partner_type: 'Cliente',
        person_type: 'PJ',
        active: true,
        blocked: false,
        company_name: 'TESTE Industria Capixaba SA',
        trade_name: 'TESTE Industria Capixaba',
        cnpj: '23.456.789/0001-01',
        email: 'teste@industriacapixaba.com',
        phone: '(27) 99999-0002',
        address: 'Av. dos Testes, 456 - Bairro Industrial, Cariacica - ES',
        cep: '29160-000',
        state_registration: '234.567.890.234',
        observations:
          'CLIENTE DE TESTE - Dados ficcionais para teste do modulo Central de Atendimento',
        financial_history: JSON.stringify([
          { date: '2026-06-01', description: 'Limite de credito aprovado', value: '100000.00' },
          { date: '2026-07-10', description: 'Titulo vencido', value: '8500.00' },
        ]),
        monthly_income: '100000.00',
      },
      {
        partner_type: 'Cliente',
        person_type: 'PJ',
        active: true,
        blocked: false,
        company_name: 'TESTE Supermercado Estrela',
        trade_name: 'TESTE Supermercado Estrela',
        cnpj: '34.567.890/0001-12',
        email: 'teste@supermercadoestrela.com',
        phone: '(27) 99999-0003',
        address: 'Rua Estrela, 789 - Vila Nova, Vila Velha - ES',
        cep: '29050-000',
        state_registration: '345.678.901.345',
        observations:
          'CLIENTE DE TESTE - Dados ficcionais para teste do modulo Central de Atendimento',
        financial_history: JSON.stringify([
          { date: '2026-05-01', description: 'Limite de credito aprovado', value: '30000.00' },
          { date: '2026-08-01', description: 'Pagamento via PIX', value: '4200.00' },
        ]),
        monthly_income: '30000.00',
      },
    ]
    var partnerIds = {}
    testPartners.forEach(function (p) {
      partnerIds[p.company_name] = seedRecord('partners', p, 'cnpj')
    })

    var testProducts = [
      {
        name: 'TESTE Caixa de Papelao 40x30x30',
        description: 'Produto de TESTE - Caixa de papelao ondulado 40x30x30cm para armazenagem',
        ncm: '4819.10.00',
        ean: '7890000000001',
        code: 'TESTE-PROD-001',
        unit: 'un',
        price: '8,50',
        brand: 'TESTE PackLog',
        category: 'Embalagens',
        active: true,
        stock: 500,
      },
      {
        name: 'TESTE Filme Stretch PVC 500mm',
        description: 'Produto de TESTE - Filme stretch PVC 500mm x 300m para envelopamento',
        ncm: '3923.29.90',
        ean: '7890000000002',
        code: 'TESTE-PROD-002',
        unit: 'rolo',
        price: '42,00',
        brand: 'TESTE PackLog',
        category: 'Insumos',
        active: true,
        stock: 120,
      },
      {
        name: 'TESTE Fita Adesiva 48mm x 100m',
        description: 'Produto de TESTE - Fita adesiva transparente para empacotamento',
        ncm: '3919.10.20',
        ean: '7890000000003',
        code: 'TESTE-PROD-003',
        unit: 'rolo',
        price: '6,80',
        brand: 'TESTE AdesivaLog',
        category: 'Insumos',
        active: true,
        stock: 300,
      },
    ]
    testProducts.forEach(function (p) {
      seedRecord('products', p, 'code')
    })

    var orderItems1 = JSON.stringify([
      {
        code: 'TESTE-PROD-001',
        product: 'TESTE Caixa de Papelao 40x30x30',
        quantity: '100',
        unit: 'un',
        lot: 'L2026-001',
        validity: '2027-01-01',
        unit_price: '3.50',
        total: '350.00',
      },
      {
        code: 'TESTE-PROD-002',
        product: 'TESTE Filme Stretch PVC 500mm',
        quantity: '20',
        unit: 'rolo',
        lot: 'L2026-002',
        validity: '2027-06-01',
        unit_price: '42.00',
        total: '840.00',
      },
    ])
    var orderItems2 = JSON.stringify([
      {
        code: 'TESTE-PROD-003',
        product: 'TESTE Fita Adesiva 48mm x 100m',
        quantity: '500',
        unit: 'rolo',
        lot: 'L2026-003',
        validity: '2027-03-01',
        unit_price: '6.80',
        total: '3400.00',
      },
    ])

    var orderIds = {}
    orderIds['TESTE-PED-0001'] = seedRecord(
      'sales_orders',
      {
        order_number: 'TESTE-PED-0001',
        status: 'Aprovado',
        client_name: 'TESTE Comercio Vitoria Ltda',
        salesperson_name: 'Carlos Mendes',
        payment_condition: '30/60 Dias',
        payment_method: 'Boleto',
        delivery_date: '2026-08-10',
        items: orderItems1,
        gross_value: '1190.00',
        discount_value: '0',
        freight_value: '50.00',
        tax_value: '190.40',
        total_value: '1230.40',
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: 'Admin',
        stock_reserved: true,
        history: JSON.stringify([]),
      },
      'order_number',
    )
    orderIds['TESTE-PED-0002'] = seedRecord(
      'sales_orders',
      {
        order_number: 'TESTE-PED-0002',
        status: 'Faturado Totalmente',
        client_name: 'TESTE Industria Capixaba SA',
        salesperson_name: 'Ana Paula Souza',
        payment_condition: '30 Dias',
        payment_method: 'Transferencia',
        delivery_date: '2026-07-25',
        items: orderItems2,
        gross_value: '3400.00',
        discount_value: '340.00',
        freight_value: '80.00',
        tax_value: '530.40',
        total_value: '3670.40',
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: 'Admin',
        stock_reserved: false,
        history: JSON.stringify([]),
      },
      'order_number',
    )

    var invoiceIds = {}
    invoiceIds['TESTE-NF-001'] = seedRecord(
      'sales_invoices',
      {
        invoice_number: 'TESTE-NF-001',
        status: 'Autorizada',
        order_id: orderIds['TESTE-PED-0001'] || '',
        order_number: 'TESTE-PED-0001',
        client_name: 'TESTE Comercio Vitoria Ltda',
        invoice_date: '2026-08-05',
        items: orderItems1,
        total_value: '1190.00',
        carrier_name: 'Velora Log Transportes',
        volumes: '10',
        gross_weight: '25.500',
        net_weight: '24.000',
        freight_value: '50.00',
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: 'Admin',
        history: JSON.stringify([]),
      },
      'invoice_number',
    )
    invoiceIds['TESTE-NF-002'] = seedRecord(
      'sales_invoices',
      {
        invoice_number: 'TESTE-NF-002',
        status: 'Autorizada',
        order_id: orderIds['TESTE-PED-0002'] || '',
        order_number: 'TESTE-PED-0002',
        client_name: 'TESTE Industria Capixaba SA',
        invoice_date: '2026-07-20',
        items: orderItems2,
        total_value: '3400.00',
        carrier_name: 'Velora Log Transportes',
        volumes: '5',
        gross_weight: '15.000',
        net_weight: '14.000',
        freight_value: '80.00',
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: 'Admin',
        history: JSON.stringify([]),
      },
      'invoice_number',
    )

    var nfeIds = {}
    nfeIds['TESTE-NFE-001'] = seedRecord(
      'nfe_records',
      {
        nfe_number: 'TESTE-NFE-001',
        status: 'Autorizada',
        invoice_id: invoiceIds['TESTE-NF-001'] || '',
        order_id: orderIds['TESTE-PED-0001'] || '',
        client_name: 'TESTE Comercio Vitoria Ltda',
        company: 'Velora Log',
        nature_of_operation: 'Venda de Mercadoria',
        cfop: '5102',
        items: orderItems1,
        total_value: '1190.00',
        tax_value: '190.40',
        carrier_name: 'Velora Log Transportes',
        volumes: '10',
        authorization_protocol: '123456789012345',
        responsible_user: 'Admin',
        history: JSON.stringify([]),
      },
      'nfe_number',
    )
    nfeIds['TESTE-NFE-002'] = seedRecord(
      'nfe_records',
      {
        nfe_number: 'TESTE-NFE-002',
        status: 'Autorizada',
        invoice_id: invoiceIds['TESTE-NF-002'] || '',
        order_id: orderIds['TESTE-PED-0002'] || '',
        client_name: 'TESTE Industria Capixaba SA',
        company: 'Velora Log',
        nature_of_operation: 'Venda de Mercadoria',
        cfop: '5102',
        items: orderItems2,
        total_value: '3400.00',
        tax_value: '530.40',
        carrier_name: 'Velora Log Transportes',
        volumes: '5',
        authorization_protocol: '123456789012346',
        responsible_user: 'Admin',
        history: JSON.stringify([]),
      },
      'nfe_number',
    )

    var scCol = app.findCollectionByNameOrId('service_centers')
    var histCol = app.findCollectionByNameOrId('atendimento_historico')
    var fesCol = app.findCollectionByNameOrId('fluxo_etapa_status')

    function upsertStage(
      atendimentoId,
      etapa,
      status,
      dataInicio,
      dataFim,
      tempoGasto,
      obs,
      limite,
    ) {
      var existing = null
      try {
        var results = app.findRecordsByFilter(
          'fluxo_etapa_status',
          'atendimento_id = "' + atendimentoId + '" && etapa_id = "' + etapa.id + '"',
          '',
          1,
          0,
        )
        if (results.length > 0) existing = results[0]
      } catch (_) {}

      var rec = existing || new Record(fesCol)
      rec.set('atendimento_id', atendimentoId)
      rec.set('etapa_id', etapa.id)
      rec.set('status', status)
      rec.set('usuario_responsavel', adminId || '')
      rec.set('checklist_progress', JSON.stringify({}))
      if (dataInicio) rec.set('data_inicio', dataInicio)
      if (dataFim) rec.set('data_fim', dataFim)
      if (tempoGasto) rec.set('tempo_gasto_minutos', tempoGasto)
      if (obs) rec.set('observacoes', obs)
      if (limite) rec.set('data_hora_limite', limite)
      app.save(rec)
    }

    function seedHistorico(atendimentoId, entries) {
      var hasTest = false
      try {
        var existing = app.findRecordsByFilter(
          'atendimento_historico',
          'atendimento_id = "' + atendimentoId + '" && conteudo ~ "TESTE-ATEND"',
          '',
          1,
          0,
        )
        if (existing.length > 0) hasTest = true
      } catch (_) {}
      if (hasTest) return

      for (var i = 0; i < entries.length; i++) {
        var e = entries[i]
        var h = new Record(histCol)
        h.set('atendimento_id', atendimentoId)
        h.set('tipo', e.tipo)
        h.set('usuario_id', adminId || '')
        h.set('data_hora', e.data_hora)
        h.set('conteudo', e.conteudo)
        app.save(h)
      }
    }

    function seedStages(atendimentoId, etapas, completedCount, inProgress) {
      var now = Date.now()
      for (var i = 0; i < etapas.length; i++) {
        var etapa = etapas[i]
        var tempoMax = etapa.getInt('tempo_maximo_minutos') || 60
        if (i < completedCount) {
          upsertStage(
            atendimentoId,
            etapa,
            'Concluida',
            new Date(now - (completedCount - i) * 3600000).toISOString(),
            new Date(now - (completedCount - i - 1) * 3600000).toISOString(),
            60,
            'Etapa concluida - TESTE',
            null,
          )
        } else if (i === completedCount && inProgress) {
          upsertStage(
            atendimentoId,
            etapa,
            'Em Andamento',
            new Date(now).toISOString(),
            null,
            null,
            'Etapa em andamento - TESTE',
            new Date(now + tempoMax * 60000).toISOString(),
          )
        } else {
          upsertStage(atendimentoId, etapa, 'Pendente', null, null, null, null, null)
        }
      }
    }

    var a1 = findExistingByFilter(
      'service_centers',
      'client_name = "TESTE Comercio Vitoria Ltda" && descricao ~ "TESTE-ATEND-001"',
    )
    var atend1Id = ''
    if (!a1) {
      var r1 = new Record(scCol)
      r1.set('client_name', 'TESTE Comercio Vitoria Ltda')
      r1.set('client_email', 'teste@comerciovitoria.com')
      r1.set('client_phone', '(27) 99999-0001')
      r1.set(
        'descricao',
        'TESTE-ATEND-001 - Cliente relata que 15 caixas de papelao chegaram avariadas na entrega. Produto improprio para uso. Solicita troca urgente.',
      )
      r1.set('motivo_id', motivoIds['Produto Avariado'] || '')
      r1.set('setor_id', setorIds['Logistica'] || '')
      r1.set('origem', 'WhatsApp')
      r1.set('tipo', 'Reclamacao')
      r1.set('prioridade', 'Alta')
      r1.set('status', 'Aberto')
      r1.set('pedido_id', orderIds['TESTE-PED-0001'] || 'TESTE-PED-0001')
      r1.set('nf_id', invoiceIds['TESTE-NF-001'] || '')
      r1.set('chave_nf', 'TESTE-NFE-001')
      r1.set('empresa', 'Velora Log')
      r1.set('filial', 'Matriz')
      r1.set('flow_id', fluxoAvariadoId || '')
      r1.set('usuario_abertura', adminId || '')
      r1.set(
        'affected_items',
        JSON.stringify([
          {
            code: 'TESTE-PROD-001',
            product: 'TESTE Caixa de Papelao 40x30x30',
            quantity: '15',
            lot: 'L2026-001',
            problem: 'Avariado',
          },
        ]),
      )
      r1.set(
        'internal_comments',
        JSON.stringify([
          {
            user: 'Admin',
            date: new Date().toISOString(),
            comment: '@Carlos Verificar com a transportadora o que aconteceu na entrega - TESTE',
          },
        ]),
      )
      r1.set(
        'client_messages',
        JSON.stringify([
          {
            date: new Date().toISOString(),
            message: 'Boa tarde, as caixas chegaram amassadas e rasgadas. Preciso de troca.',
          },
        ]),
      )
      app.save(r1)
      atend1Id = r1.id

      r1.set('data_hora_limite', new Date(Date.now() - 7200000).toISOString())
      r1.set('sla_limite', '4')
      r1.set('sla_cumprido', false)
      app.save(r1)

      if (etapasAvariado.length > 0) {
        seedStages(atend1Id, etapasAvariado, 0, true)
        r1.set('current_stage_id', etapasAvariado[0].id)
        app.save(r1)
      }

      var now1 = Date.now()
      seedHistorico(atend1Id, [
        {
          tipo: 'abertura',
          data_hora: new Date(now1 - 7200000).toISOString(),
          conteudo: 'TESTE-ATEND-001: Atendimento aberto via WhatsApp',
        },
        {
          tipo: 'classificacao',
          data_hora: new Date(now1 - 7100000).toISOString(),
          conteudo: 'TESTE-ATEND-001: Motivo classificado como Produto Avariado',
        },
        {
          tipo: 'comentario',
          data_hora: new Date(now1 - 7000000).toISOString(),
          conteudo:
            'TESTE-ATEND-001: @Carlos - Verificar com transportadora sobre avaria na entrega',
        },
        {
          tipo: 'cliente',
          data_hora: new Date(now1 - 6900000).toISOString(),
          conteudo:
            'TESTE-ATEND-001: Cliente informou 15 caixas avariadas, precisa de troca urgente',
        },
      ])
    } else {
      atend1Id = a1.id
    }

    var a2 = findExistingByFilter(
      'service_centers',
      'client_name = "TESTE Industria Capixaba SA" && descricao ~ "TESTE-ATEND-002"',
    )
    var atend2Id = ''
    if (!a2) {
      var r2 = new Record(scCol)
      r2.set('client_name', 'TESTE Industria Capixaba SA')
      r2.set('client_email', 'teste@industriacapixaba.com')
      r2.set('client_phone', '(27) 99999-0002')
      r2.set(
        'descricao',
        'TESTE-ATEND-002 - Cliente contesta cobranca de R$ 8.500,00 referente ao pedido TESTE-PED-0002. Alega que ja efetuou o pagamento via transferencia.',
      )
      r2.set('motivo_id', motivoIds['Cobranca Indevida'] || '')
      r2.set('setor_id', setorIds['Financeiro'] || '')
      r2.set('origem', 'Telefone')
      r2.set('tipo', 'Reclamacao')
      r2.set('prioridade', 'Alta')
      r2.set('status', 'Em Atendimento')
      r2.set('pedido_id', orderIds['TESTE-PED-0002'] || 'TESTE-PED-0002')
      r2.set('nf_id', invoiceIds['TESTE-NF-002'] || '')
      r2.set('chave_nf', 'TESTE-NFE-002')
      r2.set('empresa', 'Velora Log')
      r2.set('filial', 'Matriz')
      r2.set('flow_id', fluxoCobrancaId || '')
      r2.set('usuario_abertura', adminId || '')
      r2.set(
        'affected_items',
        JSON.stringify([
          { document: 'TESTE-NF-002', value: '8500.00', problem: 'Cobranca indevida' },
        ]),
      )
      r2.set(
        'internal_comments',
        JSON.stringify([
          {
            user: 'Admin',
            date: new Date().toISOString(),
            comment:
              '@Maria Verificar extrato bancario para confirmar pagamento do cliente - TESTE',
          },
        ]),
      )
      r2.set(
        'client_messages',
        JSON.stringify([
          {
            date: new Date().toISOString(),
            message:
              'Ja efetuei o pagamento de R$ 8.500,00 via transferencia bancaria no dia 20/07.',
          },
        ]),
      )
      app.save(r2)
      atend2Id = r2.id

      var now2 = Date.now()
      r2.set('data_hora_limite', new Date(now2 + 1800000).toISOString())
      r2.set('sla_limite', '8')
      r2.set('sla_cumprido', false)
      app.save(r2)

      if (etapasCobranca.length > 0) {
        seedStages(atend2Id, etapasCobranca, 3, true)
        if (etapasCobranca[3]) {
          r2.set('current_stage_id', etapasCobranca[3].id)
          app.save(r2)
        }
      }

      seedHistorico(atend2Id, [
        {
          tipo: 'abertura',
          data_hora: new Date(now2 - 14400000).toISOString(),
          conteudo: 'TESTE-ATEND-002: Atendimento aberto via Telefone',
        },
        {
          tipo: 'classificacao',
          data_hora: new Date(now2 - 14300000).toISOString(),
          conteudo: 'TESTE-ATEND-002: Motivo classificado como Cobranca Indevida',
        },
        {
          tipo: 'stage_complete',
          data_hora: new Date(now2 - 14000000).toISOString(),
          conteudo: 'TESTE-ATEND-002: Etapa concluida - Receber Atendimento',
        },
        {
          tipo: 'stage_complete',
          data_hora: new Date(now2 - 12000000).toISOString(),
          conteudo: 'TESTE-ATEND-002: Etapa concluida - Verificar Cobranca',
        },
        {
          tipo: 'stage_complete',
          data_hora: new Date(now2 - 10000000).toISOString(),
          conteudo: 'TESTE-ATEND-002: Etapa concluida - Validar com Financeiro',
        },
        {
          tipo: 'comentario',
          data_hora: new Date(now2 - 9000000).toISOString(),
          conteudo:
            'TESTE-ATEND-002: @Maria - Pagamento confirmado no extrato, cobranca foi indevida',
        },
        {
          tipo: 'cliente',
          data_hora: new Date(now2 - 8000000).toISOString(),
          conteudo: 'TESTE-ATEND-002: Cliente informou comprovante de transferencia anexado',
        },
      ])
    } else {
      atend2Id = a2.id
    }

    var a3 = findExistingByFilter(
      'service_centers',
      'client_name = "TESTE Supermercado Estrela" && descricao ~ "TESTE-ATEND-003"',
    )
    var atend3Id = ''
    if (!a3) {
      var r3 = new Record(scCol)
      r3.set('client_name', 'TESTE Supermercado Estrela')
      r3.set('client_email', 'teste@supermercadoestrela.com')
      r3.set('client_phone', '(27) 99999-0003')
      r3.set(
        'descricao',
        'TESTE-ATEND-003 - Cliente recebeu produto com embalagem danificada. Troca autorizada e realizada com sucesso. Caso encerrado.',
      )
      r3.set('motivo_id', motivoIds['Produto Avariado'] || '')
      r3.set('setor_id', setorIds['Comercial'] || '')
      r3.set('origem', 'E-mail')
      r3.set('tipo', 'Solicitacao')
      r3.set('prioridade', 'Normal')
      r3.set('status', 'Finalizado')
      r3.set('empresa', 'Velora Log')
      r3.set('filial', 'Matriz')
      r3.set('flow_id', fluxoAvariadoId || '')
      r3.set('usuario_abertura', adminId || '')
      r3.set('usuario_encerramento', adminId || '')
      r3.set('sla_cumprido', true)
      r3.set(
        'affected_items',
        JSON.stringify([
          {
            code: 'TESTE-PROD-003',
            product: 'TESTE Fita Adesiva 48mm x 100m',
            quantity: '10',
            lot: 'L2026-003',
            problem: 'Embalagem danificada',
          },
        ]),
      )
      r3.set(
        'internal_comments',
        JSON.stringify([
          {
            user: 'Admin',
            date: new Date(Date.now() - 86400000).toISOString(),
            comment: 'Troca autorizada e processada - TESTE',
          },
        ]),
      )
      r3.set(
        'client_messages',
        JSON.stringify([
          {
            date: new Date(Date.now() - 172800000).toISOString(),
            message: 'Recebi a fita adesiva com a embalagem rasgada.',
          },
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            message: 'Obrigado pela troca rapida! Recebi o produto em perfeitas condicoes.',
          },
        ]),
      )
      app.save(r3)
      atend3Id = r3.id

      r3.set('sla_cumprido', true)
      r3.set('data_encerramento', new Date(Date.now() - 86400000).toISOString().split('T')[0])
      app.save(r3)

      if (etapasAvariado.length > 0) {
        seedStages(atend3Id, etapasAvariado, etapasAvariado.length, false)
      }

      var now3 = Date.now()
      var hist3 = [
        {
          tipo: 'abertura',
          data_hora: new Date(now3 - 172800000).toISOString(),
          conteudo: 'TESTE-ATEND-003: Atendimento aberto via E-mail',
        },
        {
          tipo: 'classificacao',
          data_hora: new Date(now3 - 172000000).toISOString(),
          conteudo: 'TESTE-ATEND-003: Motivo classificado como Produto Avariado',
        },
      ]
      var stageNames = [
        'Receber Atendimento',
        'Validar NF',
        'Verificar Lote',
        'Verificar Fotos',
        'Encaminhar a Logistica',
        'Avaliar Necessidade de Coleta',
        'Autorizar Troca/Devolucao',
        'Atualizar Financeiro',
        'Informar Cliente',
        'Fechar Atendimento',
      ]
      for (var si = 0; si < stageNames.length; si++) {
        hist3.push({
          tipo: 'stage_complete',
          data_hora: new Date(now3 - (170000000 - si * 8000000)).toISOString(),
          conteudo: 'TESTE-ATEND-003: Etapa concluida - ' + stageNames[si],
        })
      }
      hist3.push({
        tipo: 'encerramento',
        data_hora: new Date(now3 - 86400000).toISOString(),
        conteudo: 'TESTE-ATEND-003: Atendimento finalizado com sucesso - SLA cumprido',
      })
      hist3.push({
        tipo: 'cliente',
        data_hora: new Date(now3 - 86400000).toISOString(),
        conteudo: 'TESTE-ATEND-003: Cliente confirmou recebimento da troca e ficou satisfeito',
      })
      seedHistorico(atend3Id, hist3)
    } else {
      atend3Id = a3.id
    }
  },
  (app) => {
    function safeDelete(colName, filter) {
      try {
        var records = app.findRecordsByFilter(colName, filter, '-created', 200, 0)
        for (var i = 0; i < records.length; i++) {
          try {
            app.delete(records[i])
          } catch (_) {}
        }
      } catch (_) {}
    }
    function safeDeleteByField(colName, field, value) {
      try {
        app.delete(app.findFirstRecordByData(colName, field, value))
      } catch (_) {}
    }

    var testClientFilters = [
      'client_name = "TESTE Comercio Vitoria Ltda"',
      'client_name = "TESTE Industria Capixaba SA"',
      'client_name = "TESTE Supermercado Estrela"',
    ]
    testClientFilters.forEach(function (f) {
      try {
        var records = app.findRecordsByFilter('service_centers', f, '-created', 50, 0)
        for (var i = 0; i < records.length; i++) {
          var id = records[i].id
          safeDelete('fluxo_etapa_status', 'atendimento_id = "' + id + '"')
          safeDelete('atendimento_historico', 'atendimento_id = "' + id + '"')
          try {
            app.delete(records[i])
          } catch (_) {}
        }
      } catch (_) {}
    })

    safeDeleteByField('nfe_records', 'nfe_number', 'TESTE-NFE-001')
    safeDeleteByField('nfe_records', 'nfe_number', 'TESTE-NFE-002')
    safeDeleteByField('sales_invoices', 'invoice_number', 'TESTE-NF-001')
    safeDeleteByField('sales_invoices', 'invoice_number', 'TESTE-NF-002')
    safeDeleteByField('sales_orders', 'order_number', 'TESTE-PED-0001')
    safeDeleteByField('sales_orders', 'order_number', 'TESTE-PED-0002')
    safeDeleteByField('products', 'code', 'TESTE-PROD-001')
    safeDeleteByField('products', 'code', 'TESTE-PROD-002')
    safeDeleteByField('products', 'code', 'TESTE-PROD-003')
    safeDeleteByField('partners', 'cnpj', '12.345.678/0001-90')
    safeDeleteByField('partners', 'cnpj', '23.456.789/0001-01')
    safeDeleteByField('partners', 'cnpj', '34.567.890/0001-12')
  },
)
