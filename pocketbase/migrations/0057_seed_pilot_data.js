migrate(
  (app) => {
    function seed(collectionName, data, dedupField, dedupValue) {
      try {
        if (dedupField) {
          try {
            app.findFirstRecordByData(collectionName, dedupField, dedupValue || data[dedupField])
            return
          } catch (_) {}
        }
        var col = app.findCollectionByNameOrId(collectionName)
        var rec = new Record(col)
        for (var key in data) {
          rec.set(key, data[key])
        }
        app.save(rec)
      } catch (err) {
        console.log('Seed error for ' + collectionName + ': ' + String(err))
      }
    }

    var paramsCol = app.findCollectionByNameOrId('system_parameters')
    var providerParams = [
      {
        module: 'notifications',
        key: 'whatsapp_provider_configured',
        label: 'WhatsApp Provider Configurado',
        value: 'false',
        value_type: 'boolean',
      },
      {
        module: 'notifications',
        key: 'email_smtp_configured',
        label: 'SMTP Configurado',
        value: 'false',
        value_type: 'boolean',
      },
      {
        module: 'notifications',
        key: 'email_smtp_host',
        label: 'SMTP Host',
        value: '',
        value_type: 'text',
      },
      {
        module: 'notifications',
        key: 'email_smtp_port',
        label: 'SMTP Porta',
        value: '587',
        value_type: 'text',
      },
      {
        module: 'notifications',
        key: 'email_smtp_user',
        label: 'SMTP Usuario',
        value: '',
        value_type: 'text',
      },
      {
        module: 'notifications',
        key: 'email_from_address',
        label: 'E-mail Remetente',
        value: 'noreply@veloralog.com.br',
        value_type: 'text',
      },
    ]
    for (var i = 0; i < providerParams.length; i++) {
      var p = providerParams[i]
      try {
        app.findFirstRecordByData('system_parameters', 'key', p.key)
      } catch (_) {
        var prec = new Record(paramsCol)
        prec.set('module', p.module)
        prec.set('key', p.key)
        prec.set('label', p.label)
        prec.set('value', p.value)
        prec.set('value_type', p.value_type)
        prec.set('active', true)
        app.save(prec)
      }
    }

    seed(
      'financial_receivables',
      {
        numero_titulo: 'TR-2026-0001',
        cliente: 'Comercio Vitoria Ltda',
        empresa: 'Velora Log',
        filial: 'Matriz',
        documento_origem: 'Nota Fiscal',
        numero_nota_fiscal: 'NF-001234',
        numero_pedido: 'PED-0001',
        data_emissao: '2026-07-15',
        data_competencia: '2026-07-15',
        data_vencimento: '2026-08-14',
        valor_original: '12500.00',
        valor_atualizado: '12500.00',
        status: 'Em Aberto',
        forma_recebimento: 'Boleto',
        conta_bancaria: 'Banco do Brasil - Conta 12345-6',
        centro_custo: 'Operacoes',
        plano_contas: 'Receita de Servicos',
        vendedor: 'Carlos Mendes',
        observacoes: 'Transporte de cargas - Vitoria para Cariacica',
      },
      'numero_titulo',
    )

    seed(
      'financial_receivables',
      {
        numero_titulo: 'TR-2026-0002',
        cliente: 'Industria Capixaba SA',
        empresa: 'Velora Log',
        filial: 'Matriz',
        documento_origem: 'Nota Fiscal',
        numero_nota_fiscal: 'NF-001235',
        numero_pedido: 'PED-0002',
        data_emissao: '2026-07-10',
        data_competencia: '2026-07-10',
        data_vencimento: '2026-07-25',
        valor_original: '8500.00',
        valor_atualizado: '8500.00',
        status: 'Vencido',
        conta_bancaria: 'Banco do Brasil - Conta 12345-6',
        vendedor: 'Ana Paula Souza',
        observacoes: 'Armazenagem e distribuicao',
      },
      'numero_titulo',
    )

    seed(
      'financial_receivables',
      {
        numero_titulo: 'TR-2026-0003',
        cliente: 'Supermercado Estrela',
        empresa: 'Velora Log',
        filial: 'Matriz',
        documento_origem: 'Nota Fiscal',
        numero_nota_fiscal: 'NF-001236',
        numero_pedido: 'PED-0003',
        data_emissao: '2026-07-20',
        data_competencia: '2026-07-20',
        data_vencimento: '2026-08-19',
        valor_original: '4200.00',
        valor_recebido: '4200.00',
        valor_atualizado: '4200.00',
        status: 'Recebido',
        forma_recebimento: 'PIX',
        conta_bancaria: 'Banco do Brasil - Conta 12345-6',
        data_recebimento: '2026-08-01',
        vendedor: 'Carlos Mendes',
      },
      'numero_titulo',
    )

    seed(
      'financial_receivables',
      {
        numero_titulo: 'TR-2026-0004',
        cliente: 'Distribuidora Ferreira',
        empresa: 'Velora Log',
        filial: 'Matriz',
        documento_origem: 'Nota Fiscal',
        numero_nota_fiscal: 'NF-001237',
        numero_pedido: 'PED-0004',
        data_emissao: '2026-07-25',
        data_competencia: '2026-07-25',
        data_vencimento: '2026-08-24',
        valor_original: '6800.00',
        valor_recebido: '3000.00',
        valor_atualizado: '6800.00',
        status: 'Parcialmente Recebido',
        forma_recebimento: 'Boleto',
        conta_bancaria: 'Banco do Brasil - Conta 12345-6',
        data_recebimento: '2026-07-30',
        vendedor: 'Ana Paula Souza',
      },
      'numero_titulo',
    )

    seed(
      'financial_payables',
      {
        numero_titulo: 'TP-2026-0001',
        fornecedor: 'Posto Shell - Vitoria',
        empresa: 'Velora Log',
        filial: 'Matriz',
        documento_origem: 'Conta',
        data_emissao: '2026-07-01',
        data_vencimento: '2026-08-10',
        valor_original: '3500.00',
        valor_atualizado: '3500.00',
        status: 'Em Aberto',
        forma_pagamento: 'Transferencia',
        conta_bancaria: 'Banco do Brasil - Conta 12345-6',
        centro_custo: 'Operacoes',
        plano_contas: 'Combustivel',
        observacoes: 'Combustivel julho',
      },
      'numero_titulo',
    )

    seed(
      'financial_payables',
      {
        numero_titulo: 'TP-2026-0002',
        fornecedor: 'Oficina Diesel ES',
        empresa: 'Velora Log',
        filial: 'Matriz',
        documento_origem: 'Servico',
        data_emissao: '2026-07-15',
        data_vencimento: '2026-08-15',
        valor_original: '1800.00',
        valor_atualizado: '1800.00',
        status: 'Pago',
        valor_pago: '1800.00',
        data_pagamento: '2026-08-02',
        forma_pagamento: 'PIX',
        conta_bancaria: 'Banco do Brasil - Conta 12345-6',
        observacoes: 'Manutencao caminhao Volvo',
      },
      'numero_titulo',
    )

    seed('financial_movements', {
      data_hora: '2026-08-01',
      tipo_movimentacao: 'Recebimento',
      documento: 'TR-2026-0003',
      cliente_fornecedor: 'Supermercado Estrela',
      conta: 'Banco do Brasil - Conta 12345-6',
      entrada: '4200.00',
      saida: '0',
      observacoes: 'Recebimento via PIX',
    })

    seed('financial_movements', {
      data_hora: '2026-08-02',
      tipo_movimentacao: 'Pagamento',
      documento: 'TP-2026-0002',
      cliente_fornecedor: 'Oficina Diesel ES',
      conta: 'Banco do Brasil - Conta 12345-6',
      entrada: '0',
      saida: '1800.00',
      observacoes: 'Pagamento via PIX',
    })

    seed('financial_reconciliation', {
      data: '2026-08-01',
      descricao_bancaria: 'PIX Recebido - Supermercado Estrela',
      documento: 'TR-2026-0003',
      valor: '4200.00',
      tipo: 'Entrada',
      status: 'N\u00e3o Conciliado',
      conta_bancaria: 'Banco do Brasil - Conta 12345-6',
    })

    seed('financial_reconciliation', {
      data: '2026-08-02',
      descricao_bancaria: 'PIX Enviado - Oficina Diesel ES',
      documento: 'TP-2026-0002',
      valor: '1800.00',
      tipo: 'Saida',
      status: 'N\u00e3o Conciliado',
      conta_bancaria: 'Banco do Brasil - Conta 12345-6',
    })

    seed('financial_bank_statements', {
      conta_bancaria: 'Banco do Brasil - Conta 12345-6',
      data: '2026-08-01',
      descricao: 'PIX Recebido - Supermercado Estrela',
      documento: 'TR-2026-0003',
      valor: '4200.00',
      tipo: 'Entrada',
      conciliado: false,
      arquivo_origem: 'Importacao Manual',
    })

    seed('financial_bank_statements', {
      conta_bancaria: 'Banco do Brasil - Conta 12345-6',
      data: '2026-08-02',
      descricao: 'PIX Enviado - Oficina Diesel ES',
      documento: 'TP-2026-0002',
      valor: '1800.00',
      tipo: 'Saida',
      conciliado: false,
      arquivo_origem: 'Importacao Manual',
    })

    seed('financial_boletos', {
      cliente: 'Comercio Vitoria Ltda',
      titulo_id: '',
      nosso_numero: '000123456',
      linha_digitavel: '00190.00095 01234.560000 00000.123456 1 98760000125000',
      valor: '12500.00',
      data_emissao: '2026-07-15',
      data_vencimento: '2026-08-14',
      banco: 'Banco do Brasil',
      status: 'Registrado',
      empresa: 'Velora Log',
      filial: 'Matriz',
    })

    seed('financial_pix', {
      cliente: 'Distribuidora Ferreira',
      titulo_id: '',
      identificador_transacao: 'PIX-2026-0001',
      chave_pix: 'veloralog@pix.com.br',
      valor: '3000.00',
      data_geracao: '2026-07-30',
      data_vencimento: '2026-08-24',
      status: 'Pago',
      tipo_pix: 'Dinamico',
      empresa: 'Velora Log',
      filial: 'Matriz',
    })

    seed('financial_cash_registers', {
      nome_caixa: 'Caixa Operacional 01',
      empresa: 'Velora Log',
      filial: 'Matriz',
      operador: 'Carlos Mendes',
      saldo_inicial: '500.00',
      status: 'Aberto',
      data_abertura: new Date().toISOString(),
    })

    try {
      app.findFirstRecordByData('email_templates', 'name', 'Confirmacao de Recebimento')
    } catch (_) {
      try {
        var tplCol = app.findCollectionByNameOrId('email_templates')
        var tpl = new Record(tplCol)
        tpl.set('name', 'Confirmacao de Recebimento')
        tpl.set('category', 'cobranca')
        tpl.set('subject', 'Recebimento Confirmado - Velora Log')
        tpl.set('sender', 'noreply@veloralog.com.br')
        tpl.set(
          'body',
          '<p>Prezado(a) Cliente,</p><p>Confirmamos o recebimento do titulo <strong>{{numero_titulo}}</strong> no valor de <strong>R$ {{valor}}</strong>.</p><p>Obrigado pela preferencia.</p><p>Velora Log</p>',
        )
        tpl.set('active', true)
        app.save(tpl)
      } catch (_) {}
    }
  },
  (app) => {
    var titulos = ['TR-2026-0001', 'TR-2026-0002', 'TR-2026-0003', 'TR-2026-0004']
    for (var i = 0; i < titulos.length; i++) {
      try {
        app.delete(app.findFirstRecordByData('financial_receivables', 'numero_titulo', titulos[i]))
      } catch (_) {}
    }
    var payTitulos = ['TP-2026-0001', 'TP-2026-0002']
    for (var j = 0; j < payTitulos.length; j++) {
      try {
        app.delete(app.findFirstRecordByData('financial_payables', 'numero_titulo', payTitulos[j]))
      } catch (_) {}
    }
  },
)
