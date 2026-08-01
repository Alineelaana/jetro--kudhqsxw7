migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('budget_requests')

    var samples = [
      {
        data: {
          nome_completo: 'João Silva',
          empresa: 'Silva Comércio Ltda',
          email: 'joao.silva@silvacomerico.com.br',
          telefone: '(27) 99876-5432',
          servico_interesse: 'Transporte de Cargas',
          tipo_operacao: 'Transporte de Cargas',
          cidade_origem: 'Vitória - ES',
          cidade_destino: 'São Paulo - SP',
          tipo_mercadoria: 'Eletrônicos',
          volume_estimado: '20 paletes',
          periodicidade: 'Contrato Recorrente',
          mensagem: 'Necessitamos de transporte semanal para entrega em SP.',
          privacy_consent_accepted: true,
          privacy_consent_accepted_at: '2026-07-28T14:30:00.000Z',
        },
        client_name: 'João Silva',
        client_email: 'joao.silva@silvacomerico.com.br',
        client_phone: '(27) 99876-5432',
        service: 'Transporte de Cargas',
      },
      {
        data: {
          nome_completo: 'Maria Oliveira',
          empresa: 'Oliveira Distribuidora',
          email: 'maria@oliveiradistrib.com.br',
          telefone: '(27) 98765-4321',
          servico_interesse: 'Armazenagem de Produtos em Estoque',
          tipo_operacao: 'Armazenagem de Produtos em Estoque',
          cidade_origem: 'Cariacica - ES',
          cidade_destino: '',
          tipo_mercadoria: 'Alimentos não perecíveis',
          volume_estimado: '500 caixas',
          periodicidade: 'Operação Única / Pontual',
          mensagem: 'Precisamos de armazenagem por 30 dias.',
          privacy_consent_accepted: true,
          privacy_consent_accepted_at: '2026-07-30T09:15:00.000Z',
        },
        client_name: 'Maria Oliveira',
        client_email: 'maria@oliveiradistrib.com.br',
        client_phone: '(27) 98765-4321',
        service: 'Armazenagem de Produtos em Estoque',
      },
      {
        data: {
          nome_completo: 'Carlos Santos',
          empresa: 'Santos Logística',
          email: 'carlos@santoslog.com.br',
          telefone: '(27) 99654-3210',
          servico_interesse: 'Logística Portuária',
          tipo_operacao: 'Logística Portuária',
          cidade_origem: 'Vitória - ES',
          cidade_destino: 'Salvador - BA',
          tipo_mercadoria: 'Contêiner 40"',
          volume_estimado: '3 contêineres',
          periodicidade: 'Projeto Urgente',
          mensagem: 'Urgência na movimentação de contêineres no Porto de Vitória.',
          privacy_consent_accepted: true,
          privacy_consent_accepted_at: '2026-08-01T11:00:00.000Z',
        },
        client_name: 'Carlos Santos',
        client_email: 'carlos@santoslog.com.br',
        client_phone: '(27) 99654-3210',
        service: 'Logística Portuária',
      },
    ]

    for (var i = 0; i < samples.length; i++) {
      var s = samples[i]
      try {
        app.findFirstRecordByData('budget_requests', 'client_email', s.client_email)
      } catch (_) {
        var record = new Record(col)
        record.set('data', s.data)
        record.set('client_name', s.client_name)
        record.set('client_email', s.client_email)
        record.set('client_phone', s.client_phone)
        record.set('service', s.service)
        app.save(record)
      }
    }
  },
  (app) => {
    var emails = [
      'joao.silva@silvacomerico.com.br',
      'maria@oliveiradistrib.com.br',
      'carlos@santoslog.com.br',
    ]
    for (var i = 0; i < emails.length; i++) {
      try {
        var record = app.findFirstRecordByData('budget_requests', 'client_email', emails[i])
        app.delete(record)
      } catch (_) {}
    }
  },
)
