migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    function seed(collectionName, data, dedupField) {
      try {
        if (dedupField) {
          try {
            app.findFirstRecordByData(collectionName, dedupField, data[dedupField])
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
        console.log('Seed error for ' + collectionName + ' [' + (data[dedupField] || '') + ']: ' + String(err))
      }
    }

    function seedOrUpdate(collectionName, dedupField, dedupValue, data) {
      try {
        var existing = app.findFirstRecordByData(collectionName, dedupField, dedupValue)
        for (var key in data) {
          existing.set(key, data[key])
        }
        app.save(existing)
      } catch (_) {
        try {
          var col = app.findCollectionByNameOrId(collectionName)
          var rec = new Record(col)
          for (var key in data) {
            rec.set(key, data[key])
          }
          app.save(rec)
        } catch (err) {
          console.log('SeedOrUpdate error for ' + collectionName + ' [' + dedupValue + ']: ' + String(err))
        }
      }
    }

    var VEHICLES = [
      {
        codigo: 'VEIC-001', tipo_propriedade: 'Próprio', proprietario: 'Velora Log Ltda',
        placa: 'RTZ1A23', renavam: '0045678901', marca: 'Volvo', modelo: 'FH 540 6x2',
        ano: '2023', cor: 'Branco', tipo_veiculo: 'Truck', capacidade_peso: 28000,
        capacidade_volume: 120, quantidade_eixos: 6, tipo_carroceria: 'Baú',
        empresa: 'Velora Log', filial: 'Matriz', unidade_operacao: 'Vitória/ES',
        data_aquisicao: '2023-01-15', vencimento_licenciamento: '2026-12-31',
        vencimento_seguro: '2026-12-31', situacao: 'Disponível',
        manutencoes: [], abastecimentos: [], documentos: [], historico: [],
      },
      {
        codigo: 'VEIC-002', tipo_propriedade: 'Próprio', proprietario: 'Velora Log Ltda',
        placa: 'RTZ2B34', renavam: '0045678902', marca: 'Scania', modelo: 'R450 6x2',
        ano: '2022', cor: 'Prata', tipo_veiculo: 'Truck', capacidade_peso: 26000,
        capacidade_volume: 110, quantidade_eixos: 6, tipo_carroceria: 'Baú',
        empresa: 'Velora Log', filial: 'Matriz', unidade_operacao: 'Vitória/ES',
        data_aquisicao: '2022-06-20', vencimento_licenciamento: '2026-08-31',
        vencimento_seguro: '2026-08-31', situacao: 'Em Rota',
        manutencoes: [], abastecimentos: [], documentos: [], historico: [],
      },
      {
        codigo: 'VEIC-003', tipo_propriedade: 'Próprio', proprietario: 'Velora Log Ltda',
        placa: 'RTZ3C45', renavam: '0045678903', marca: 'Mercedes-Benz', modelo: 'Actros 2651',
        ano: '2024', cor: 'Branco', tipo_veiculo: 'Truck', capacidade_peso: 30000,
        capacidade_volume: 130, quantidade_eixos: 6, tipo_carroceria: 'Sider',
        empresa: 'Velora Log', filial: 'Matriz', unidade_operacao: 'Vila Velha/ES',
        data_aquisicao: '2024-03-10', vencimento_licenciamento: '2027-03-31',
        vencimento_seguro: '2027-03-31', situacao: 'Disponível',
        manutencoes: [], abastecimentos: [], documentos: [], historico: [],
      },
      {
        codigo: 'VEIC-004', tipo_propriedade: 'Terceirizado', proprietario: 'Transportes Costa Ltda',
        placa: 'QWE4D56', renavam: '0045678904', marca: 'Iveco', modelo: 'Daily 70C17',
        ano: '2023', cor: 'Branco', tipo_veiculo: 'VUC', capacidade_peso: 5000,
        capacidade_volume: 35, quantidade_eixos: 4, tipo_carroceria: 'Furgão',
        empresa: 'Velora Log', filial: 'Matriz', unidade_operacao: 'Serra/ES',
        data_aquisicao: '2023-09-01', vencimento_licenciamento: '2026-09-30',
        vencimento_seguro: '2026-09-30', situacao: 'Disponível',
        manutencoes: [], abastecimentos: [], documentos: [], historico: [],
      },
      {
        codigo: 'VEIC-005', tipo_propriedade: 'Agregado', proprietario: 'João Marcos Oliveira',
        placa: 'QWE5E67', renavam: '0045678905', marca: 'Ford', modelo: 'Cargo 2429',
        ano: '2021', cor: 'Vermelho', tipo_veiculo: 'Toco', capacidade_peso: 14000,
        capacidade_volume: 70, quantidade_eixos: 4, tipo_carroceria: 'Baú',
        empresa: 'Velora Log', filial: 'Matriz', unidade_operacao: 'Cariacica/ES',
        data_aquisicao: '2021-11-15', vencimento_licenciamento: '2026-11-30',
        vencimento_seguro: '2026-11-30', situacao: 'Em Manutenção',
        manutencoes: [], abastecimentos: [], documentos: [], historico: [],
      },
    ]

    for (var vi = 0; vi < VEHICLES.length; vi++) {
      seed('logistics_vehicles', VEHICLES[vi], 'codigo')
    }

    var DRIVERS = [
      {
        nome: 'João Silva Santos', cpf: '123.456.789-01', rg: 'MG-15.234.567',
        data_nascimento: '1985-03-12', telefone: '(27) 99876-5432',
        email: 'joao.silva@veloralog.com.br', endereco: 'Rua das Flores, 123 - Vitória/ES',
        numero_cnh: '01234567890', categoria_cnh: 'E', validade_cnh: '2027-05-20',
        empresa: 'Velora Log', filial: 'Matriz', transportadora: 'Próprio',
        tipo_vinculo: 'Colaborador', veiculo_padrao: 'RTZ1A23', situacao: 'Disponível',
        documentos: [], rotas: [], entregas: [], ocorrencias: [], desempenho: [], historico: [],
      },
      {
        nome: 'Carlos Eduardo Mendes', cpf: '234.567.890-12', rg: 'ES-22.345.678',
        data_nascimento: '1990-07-25', telefone: '(27) 99765-4321',
        email: 'carlos.mendes@veloralog.com.br', endereco: 'Av. Brasil, 456 - Serra/ES',
        numero_cnh: '02345678901', categoria_cnh: 'E', validade_cnh: '2026-11-15',
        empresa: 'Velora Log', filial: 'Matriz', transportadora: 'Próprio',
        tipo_vinculo: 'Colaborador', veiculo_padrao: 'RTZ2B34', situacao: 'Em Rota',
        documentos: [], rotas: [], entregas: [], ocorrencias: [], desempenho: [], historico: [],
      },
      {
        nome: 'Pedro Henrique Oliveira', cpf: '345.678.901-23', rg: 'ES-33.456.789',
        data_nascimento: '1988-11-08', telefone: '(27) 99654-3210',
        email: 'pedro.oliveira@veloralog.com.br', endereco: 'Rua Sete, 789 - Vila Velha/ES',
        numero_cnh: '03456789012', categoria_cnh: 'D', validade_cnh: '2028-02-28',
        empresa: 'Velora Log', filial: 'Matriz', transportadora: 'Próprio',
        tipo_vinculo: 'Colaborador', veiculo_padrao: 'RTZ3C45', situacao: 'Disponível',
        documentos: [], rotas: [], entregas: [], ocorrencias: [], desempenho: [], historico: [],
      },
      {
        nome: 'Marcos Vinícius Costa', cpf: '456.789.012-34', rg: 'MG-44.567.890',
        data_nascimento: '1992-01-30', telefone: '(27) 99543-2109',
        email: 'marcos.costa@veloralog.com.br', endereco: 'Rua do Comércio, 321 - Cariacica/ES',
        numero_cnh: '04567890123', categoria_cnh: 'D', validade_cnh: '2027-08-10',
        empresa: 'Velora Log', filial: 'Matriz', transportadora: 'Terceirizado',
        tipo_vinculo: 'Terceirizado', veiculo_padrao: 'QWE4D56', situacao: 'Disponível',
        documentos: [], rotas: [], entregas: [], ocorrencias: [], desempenho: [], historico: [],
      },
      {
        nome: 'Anderson Ferreira Lima', cpf: '567.890.123-45', rg: 'ES-55.678.901',
        data_nascimento: '1983-09-14', telefone: '(27) 99432-1098',
        email: 'anderson.lima@veloralog.com.br', endereco: 'Av. Paulista, 654 - Serra/ES',
        numero_cnh: '05678901234', categoria_cnh: 'E', validade_cnh: '2026-06-30',
        empresa: 'Velora Log', filial: 'Matriz', transportadora: 'Próprio',
        tipo_vinculo: 'Agregado', veiculo_padrao: 'QWE5E67', situacao: 'Em Descanso',
        documentos: [], rotas: [], entregas: [], ocorrencias: [], desempenho: [], historico: [],
      },
    ]

    for (var di = 0; di < DRIVERS.length; di++) {
      seed('logistics_drivers', DRIVERS[di], 'cpf')
    }

    var ROUTES = [
      {
        codigo_rota: 'RT-NORTE-01', nome_rota: 'Rota Norte ES', empresa: 'Velora Log',
        filial: 'Matriz', regiao: 'Norte', cidade_origem: 'Vitória',
        cidades_atendidas: 'Linhares, São Mateus, Aracruz, Fundão',
        estado: 'ES', distancia_estimada: '220 km', tempo_estimado: '4h 30min',
        pedagios: 'R$ 18,40', custo_estimado: 'R$ 450,00', dias_operacao: 'Seg-Sex',
        horario_saida: '06:00', responsavel: 'Carlos Mendes', situacao: 'Ativa',
        veiculo_padrao: 'RTZ1A23', motorista_padrao: 'João Silva Santos',
        capacidade_maxima_peso: 28000, capacidade_maxima_volume: 120,
        clientes_vinculados: [], sequencia_entregas: [], historico: [],
      },
      {
        codigo_rota: 'RT-SUL-01', nome_rota: 'Rota Sul ES', empresa: 'Velora Log',
        filial: 'Matriz', regiao: 'Sul', cidade_origem: 'Vitória',
        cidades_atendidas: 'Cachoeiro de Itapemirim, Marataízes, Itapemirim, Piúma',
        estado: 'ES', distancia_estimada: '180 km', tempo_estimado: '3h 45min',
        pedagios: 'R$ 12,80', custo_estimado: 'R$ 380,00', dias_operacao: 'Seg-Sáb',
        horario_saida: '07:00', responsavel: 'Carlos Mendes', situacao: 'Ativa',
        veiculo_padrao: 'RTZ2B34', motorista_padrao: 'Carlos Eduardo Mendes',
        capacidade_maxima_peso: 26000, capacidade_maxima_volume: 110,
        clientes_vinculados: [], sequencia_entregas: [], historico: [],
      },
      {
        codigo_rota: 'RT-METRO-01', nome_rota: 'Rota Metropolitana', empresa: 'Velora Log',
        filial: 'Matriz', regiao: 'Metropolitana', cidade_origem: 'Vitória',
        cidades_atendidas: 'Vila Velha, Serra, Cariacica, Viana',
        estado: 'ES', distancia_estimada: '85 km', tempo_estimado: '2h 15min',
        pedagios: 'R$ 0,00', custo_estimado: 'R$ 180,00', dias_operacao: 'Seg-Sex',
        horario_saida: '08:00', responsavel: 'Carlos Mendes', situacao: 'Ativa',
        veiculo_padrao: 'QWE4D56', motorista_padrao: 'Marcos Vinícius Costa',
        capacidade_maxima_peso: 5000, capacidade_maxima_volume: 35,
        clientes_vinculados: [], sequencia_entregas: [], historico: [],
      },
      {
        codigo_rota: 'RT-CENTRAL-01', nome_rota: 'Rota Central ES', empresa: 'Velora Log',
        filial: 'Matriz', regiao: 'Central', cidade_origem: 'Vitória',
        cidades_atendidas: 'Colatina, Baixo Guandu, Afonso Cláudio, Domingos Martins',
        estado: 'ES', distancia_estimada: '150 km', tempo_estimado: '3h 00min',
        pedagios: 'R$ 8,50', custo_estimado: 'R$ 310,00', dias_operacao: 'Seg-Qui',
        horario_saida: '06:30', responsavel: 'Carlos Mendes', situacao: 'Ativa',
        veiculo_padrao: 'RTZ3C45', motorista_padrao: 'Pedro Henrique Oliveira',
        capacidade_maxima_peso: 30000, capacidade_maxima_volume: 130,
        clientes_vinculados: [], sequencia_entregas: [], historico: [],
      },
    ]

    for (var ri = 0; ri < ROUTES.length; ri++) {
      seed('logistics_routes', ROUTES[ri], 'codigo_rota')
    }

    seed('wms_romaneios', {
      numero_romaneio: 'ROM-001', data: '2026-08-10', rota: 'Rota Norte ES',
      transportadora: 'Próprio', motorista: 'João Silva Santos', veiculo: 'RTZ1A23',
      pedidos: ['PED-0001', 'PED-0002', 'PED-0003'],
      clientes: ['Comércio Vitória Ltda', 'Indústria Capixaba SA', 'Supermercado Estrela'],
      notas_fiscais: ['NF-001234', 'NF-001235', 'NF-001236'],
      quantidade_volumes: 48, peso_total: '12500.00',
      observacoes: 'Romaneio compartilhado WMS/Transporte/Logística — fluxo end-to-end validado.',
      status: 'Liberada', responsavel: 'Carlos Mendes',
    }, 'numero_romaneio')

    seed('wms_romaneios', {
      numero_romaneio: 'ROM-002', data: '2026-08-12', rota: 'Rota Sul ES',
      transportadora: 'Terceirizado', motorista: 'Carlos Eduardo Mendes', veiculo: 'RTZ2B34',
      pedidos: ['PED-0004', 'PED-0005'],
      clientes: ['Distribuidora Ferreira', 'Mercadão Bom Preço'],
      notas_fiscais: ['NF-001237', 'NF-001238'],
      quantidade_volumes: 32, peso_total: '8200.00',
      observacoes: 'Romaneiro compartilhado — rota Sul com 2 entregas programadas.',
      status: 'Em Planejamento', responsavel: 'Carlos Mendes',
    }, 'numero_romaneio')

    seed('wms_receipts', {
      numero_recebimento: 'REC-001', fornecedor: 'Distribuidora Alfa Ltda',
      nota_fiscal: 'NF-Entrada-001', data_prevista: '2026-08-09',
      data_recebida: '2026-08-09', status: 'Recebido',
      itens: [
        { produto_id: '1', produto_nome: 'Cimento Portland 50kg', produto_codigo: 'CIM-50', quantidade_esperada: 200, quantidade_recebida: 200, lote: 'L-2026-001', validade: '2027-08-09', divergencia: 0 },
        { produto_id: '2', produto_nome: 'Tijolo Cerâmico', produto_codigo: 'TJ-001', quantidade_esperada: 5000, quantidade_recebida: 5000, lote: 'L-2026-002', validade: '', divergencia: 0 },
      ],
      responsavel: 'Pedro Henrique Oliveira', observacoes: 'Recebimento conferido sem divergências.',
      empresa: 'Velora Log', filial: 'Matriz', deposito: 'Depósito Central - Cariacica',
    }, 'numero_recebimento')

    seed('wms_waves', {
      numero_wave: 'WAVE-001', tipo: 'Separação', status: 'Concluída',
      prioridade: 'Alta', operador: 'Pedro Henrique Oliveira',
      itens: [
        { produto_id: '1', produto_nome: 'Cimento Portland 50kg', produto_codigo: 'CIM-50', quantidade: 100, localizacao: 'A-01-03', lote: 'L-2026-001', pedido: 'PED-0001', cliente: 'Comércio Vitória Ltda', separado: true },
        { produto_id: '2', produto_nome: 'Tijolo Cerâmico', produto_codigo: 'TJ-001', quantidade: 2000, localizacao: 'B-02-01', lote: 'L-2026-002', pedido: 'PED-0002', cliente: 'Indústria Capixaba SA', separado: true },
      ],
      data_liberacao: '2026-08-10T06:00:00Z', data_conclusao: '2026-08-10T08:30:00Z',
      total_itens: 2, itens_separados: 2,
      empresa: 'Velora Log', filial: 'Matriz', deposito: 'Depósito Central - Cariacica',
    }, 'numero_wave')

    seed('wms_separations', {
      numero_separacao: 'SEP-001', wave_id: '', pedido: 'PED-0001',
      cliente: 'Comércio Vitória Ltda', rota: 'Rota Norte ES',
      produto_id: '1', produto_nome: 'Cimento Portland 50kg', produto_codigo: 'CIM-50',
      localizacao: 'A-01-03', lote: 'L-2026-001', validade: '2027-08-09',
      quantidade_solicitada: 100, quantidade_separada: 100,
      operador: 'Pedro Henrique Oliveira', prioridade: 'Alta',
      estrategia: 'Por Onda', status: 'Concluída',
    }, 'numero_separacao')

    seed('wms_separations', {
      numero_separacao: 'SEP-002', wave_id: '', pedido: 'PED-0002',
      cliente: 'Indústria Capixaba SA', rota: 'Rota Norte ES',
      produto_id: '2', produto_nome: 'Tijolo Cerâmico', produto_codigo: 'TJ-001',
      localizacao: 'B-02-01', lote: 'L-2026-002', validade: '',
      quantidade_solicitada: 2000, quantidade_separada: 2000,
      operador: 'Pedro Henrique Oliveira', prioridade: 'Alta',
      estrategia: 'Por Onda', status: 'Concluída',
    }, 'numero_separacao')

    seed('wms_shippings', {
      numero_expedicao: 'EXP-001', pedido: 'PED-0001', nota_fiscal: 'NF-001234',
      cliente: 'Comércio Vitória Ltda', transportadora: 'Próprio',
      motorista: 'João Silva Santos', veiculo: 'RTZ1A23', rota: 'Rota Norte ES',
      doca: 'Doca 01', quantidade_volumes: 16, peso_bruto: '5200.00', peso_liquido: '5000.00',
      romaneio_id: '', status: 'Em Transporte', responsavel: 'Pedro Henrique Oliveira',
    }, 'numero_expedicao')

    seed('wms_shippings', {
      numero_expedicao: 'EXP-002', pedido: 'PED-0002', nota_fiscal: 'NF-001235',
      cliente: 'Indústria Capixaba SA', transportadora: 'Próprio',
      motorista: 'João Silva Santos', veiculo: 'RTZ1A23', rota: 'Rota Norte ES',
      doca: 'Doca 01', quantidade_volumes: 20, peso_bruto: '4500.00', peso_liquido: '4300.00',
      romaneio_id: '', status: 'Em Transporte', responsavel: 'Pedro Henrique Oliveira',
    }, 'numero_expedicao')

    seedOrUpdate('transport_journeys', 'numero_viagem', 'VIA-004', {
      numero_viagem: 'VIA-004', status: 'Em Trânsito', rota: 'Rota Central ES',
      veiculo: 'RTZ3C45', motorista: 'Pedro Henrique Oliveira', transportadora: 'Próprio',
      romaneio_id: '', numero_romaneio: '', origem: 'Vitória/ES', destino: 'Colatina/ES',
      data_prevista_saida: '2026-08-09', data_prevista_chegada: '2026-08-09',
      data_saida: '2026-08-09', peso_total: '8500.00', volume_total: '45.00',
      quantidade_entregas: 4, valor_frete: '780.00', custo_total: '610.00',
      tipo_transporte: 'Próprio', empresa: 'Velora Log', filial: 'Matriz',
      responsavel: 'Carlos Mendes', observacoes: 'Viagem com 4 entregas na região central.',
      entregas: [
        { pedido: 'PED-0006', cliente: 'Ferreira & Filhos Ltda', cidade: 'Colatina', valor: '3200.00' },
        { pedido: 'PED-0007', cliente: 'Construtora Capixaba', cidade: 'Baixo Guandu', valor: '1800.00' },
        { pedido: 'PED-0008', cliente: 'Mercado União', cidade: 'Afonso Cláudio', valor: '950.00' },
        { pedido: 'PED-0009', cliente: 'Lar&Cia Moveis', cidade: 'Domingos Martins', valor: '2100.00' },
      ],
      documentos: [], ocorrencias: [],
      rastreamento: [
        { localizacao: 'Vitória/ES', data_hora: '2026-08-09T06:30:00Z', status: 'Saída confirmada' },
        { localizacao: 'Fundão/ES', data_hora: '2026-08-09T07:15:00Z', status: 'Em trânsito' },
      ],
      comprovantes: [],
      historico: [
        { action: 'Carga formada', user: 'Carlos Mendes', date: '2026-08-09T05:00:00Z' },
        { action: 'Carregamento concluído', user: 'Pedro Henrique Oliveira', date: '2026-08-09T06:00:00Z' },
        { action: 'Viagem liberada', user: 'Carlos Mendes', date: '2026-08-09T06:30:00Z' },
      ],
    })

    seedOrUpdate('transport_journeys', 'numero_viagem', 'VIA-005', {
      numero_viagem: 'VIA-005', status: 'Planejada', rota: 'Rota Metropolitana',
      veiculo: 'QWE4D56', motorista: 'Marcos Vinícius Costa', transportadora: 'Terceirizado',
      romaneio_id: '', numero_romaneio: '', origem: 'Cariacica/ES', destino: 'Serra/ES',
      data_prevista_saida: '2026-08-11', data_prevista_chegada: '2026-08-11',
      peso_total: '3200.00', volume_total: '18.00',
      quantidade_entregas: 6, valor_frete: '420.00', custo_total: '280.00',
      tipo_transporte: 'Terceirizado', empresa: 'Velora Log', filial: 'Matriz',
      responsavel: 'Carlos Mendes', observacoes: 'Rota metropolitana com 6 entregas programadas.',
      entregas: [
        { pedido: 'PED-0010', cliente: 'Farmácia Santa Clara', cidade: 'Serra', valor: '850.00' },
        { pedido: 'PED-0011', cliente: 'Padaria Pão Quente', cidade: 'Vila Velha', valor: '420.00' },
        { pedido: 'PED-0012', cliente: 'Loja Tudo Barato', cidade: 'Cariacica', valor: '680.00' },
        { pedido: 'PED-0013', cliente: 'Pet Shop Amigo Fiel', cidade: 'Serra', valor: '350.00' },
        { pedido: 'PED-0014', cliente: 'Restaurante Sabor Caseiro', cidade: 'Vila Velha', valor: '920.00' },
        { pedido: 'PED-0015', cliente: 'Papelaria Central', cidade: 'Cariacica', valor: '280.00' },
      ],
      documentos: [], ocorrencias: [], rastreamento: [], comprovantes: [],
      historico: [
        { action: 'Carga formada', user: 'Carlos Mendes', date: new Date().toISOString() },
      ],
    })

    seedOrUpdate('transport_journeys', 'numero_viagem', 'VIA-006', {
      numero_viagem: 'VIA-006', status: 'Finalizada', rota: 'Rota Metropolitana',
      veiculo: 'GHI3H45', motorista: 'Pedro Oliveira', transportadora: 'Próprio',
      romaneio_id: '', numero_romaneio: '', origem: 'Vila Velha/ES', destino: 'Serra/ES',
      data_prevista_saida: '2026-08-08', data_prevista_chegada: '2026-08-08',
      data_saida: '2026-08-08', data_chegada: '2026-08-08',
      peso_total: '2800.00', volume_total: '15.00',
      quantidade_entregas: 8, valor_frete: '650.00', custo_total: '480.00',
      tipo_transporte: 'Próprio', empresa: 'Velora Log', filial: 'Matriz',
      responsavel: 'Carlos Mendes', observacoes: 'Viagem concluída com 8 entregas realizadas.',
      entregas: [],
      documentos: [], ocorrencias: [],
      rastreamento: [
        { localizacao: 'Serra/ES', data_hora: '2026-08-08T12:00:00Z', status: 'Todas as entregas concluídas' },
      ],
      comprovantes: [
        { cliente: 'Supermercado Ideal', recebedor: 'Maria Souza', data: '2026-08-08T10:30:00Z' },
      ],
      historico: [
        { action: 'Viagem finalizada', user: 'Pedro Oliveira', date: '2026-08-08T12:00:00Z' },
      ],
    })

    var DELIVERIES = [
      {
        numero_entrega: 'ENT-001', pedido: 'PED-0001', nota_fiscal: 'NF-001234',
        cliente: 'Comércio Vitória Ltda', endereco: 'Av. Nossa Senhora dos Navegantes, 500',
        cidade: 'Linhares', rota: 'Rota Norte ES', transportadora: 'Próprio',
        veiculo: 'RTZ1A23', motorista: 'João Silva Santos',
        data_prevista: '2026-08-10', data_realizada: '',
        valor_mercadoria: '12500.00', status: 'Em Trânsito',
        empresa: 'Velora Log', filial: 'Matriz', cep: '29900-000',
        regiao: 'Norte', prioridade: 'Alta', peso: '5200.00', volume: '28.00',
        quantidade_volumes: 16, contato_cliente: '(27) 3372-1000',
        recebedor_nome: '', recebedor_documento: '',
        pedidos_vinculados: ['PED-0001'], notas_fiscais: ['NF-001234'],
        produtos: [], historico_movimentacoes: [
          { action: 'Separação concluída', date: '2026-08-10T08:30:00Z' },
          { action: 'Carregamento confirmado', date: '2026-08-10T06:00:00Z' },
          { action: 'Em trânsito', date: '2026-08-10T06:30:00Z' },
        ],
        ocorrencias: [], comprovantes: [],
      },
      {
        numero_entrega: 'ENT-002', pedido: 'PED-0002', nota_fiscal: 'NF-001235',
        cliente: 'Indústria Capixaba SA', endereco: 'Rodovia BR-101, Km 152',
        cidade: 'Aracruz', rota: 'Rota Norte ES', transportadora: 'Próprio',
        veiculo: 'RTZ1A23', motorista: 'João Silva Santos',
        data_prevista: '2026-08-10', data_realizada: '',
        valor_mercadoria: '8500.00', status: 'Em Trânsito',
        empresa: 'Velora Log', filial: 'Matriz', cep: '29190-000',
        regiao: 'Norte', prioridade: 'Alta', peso: '4500.00', volume: '22.00',
        quantidade_volumes: 20, contato_cliente: '(27) 3256-2000',
        recebedor_nome: '', recebedor_documento: '',
        pedidos_vinculados: ['PED-0002'], notas_fiscais: ['NF-001235'],
        produtos: [], historico_movimentacoes: [],
        ocorrencias: [], comprovantes: [],
      },
      {
        numero_entrega: 'ENT-003', pedido: 'PED-0006', nota_fiscal: 'NF-001240',
        cliente: 'Ferreira & Filhos Ltda', endereco: 'Rua das Garças, 78',
        cidade: 'Colatina', rota: 'Rota Central ES', transportadora: 'Próprio',
        veiculo: 'RTZ3C45', motorista: 'Pedro Henrique Oliveira',
        data_prevista: '2026-08-09', data_realizada: '',
        valor_mercadoria: '3200.00', status: 'Em Trânsito',
        empresa: 'Velora Log', filial: 'Matriz', cep: '29700-000',
        regiao: 'Central', prioridade: 'Média', peso: '1800.00', volume: '10.00',
        quantidade_volumes: 8, contato_cliente: '(27) 3722-3000',
        recebedor_nome: '', recebedor_documento: '',
        pedidos_vinculados: ['PED-0006'], notas_fiscais: ['NF-001240'],
        produtos: [], historico_movimentacoes: [],
        ocorrencias: [], comprovantes: [],
      },
      {
        numero_entrega: 'ENT-004', pedido: 'PED-0003', nota_fiscal: 'NF-001236',
        cliente: 'Supermercado Estrela', endereco: 'Av. Jerônimo Monteiro, 1200',
        cidade: 'Cachoeiro de Itapemirim', rota: 'Rota Sul ES',
        transportadora: 'Próprio', veiculo: 'RTZ2B34', motorista: 'Carlos Eduardo Mendes',
        data_prevista: '2026-08-08', data_realizada: '2026-08-08',
        valor_mercadoria: '4200.00', status: 'Entregue',
        empresa: 'Velora Log', filial: 'Matriz', cep: '29300-000',
        regiao: 'Sul', prioridade: 'Alta', peso: '2100.00', volume: '12.00',
        quantidade_volumes: 12, contato_cliente: '(28) 3521-4000',
        recebedor_nome: 'Antônio Silva', recebedor_documento: 'CPF: 999.888.777-66',
        pedidos_vinculados: ['PED-0003'], notas_fiscais: ['NF-001236'],
        produtos: [], historico_movimentacoes: [
          { action: 'Entregue', date: '2026-08-08T11:30:00Z' },
        ],
        ocorrencias: [], comprovantes: [
          { tipo: 'Assinatura', recebedor: 'Antônio Silva', data: '2026-08-08T11:30:00Z' },
        ],
      },
      {
        numero_entrega: 'ENT-005', pedido: 'PED-0004', nota_fiscal: 'NF-001237',
        cliente: 'Distribuidora Ferreira', endereco: 'Rua do Comércio, 45',
        cidade: 'Marataízes', rota: 'Rota Sul ES', transportadora: 'Próprio',
        veiculo: 'RTZ2B34', motorista: 'Carlos Eduardo Mendes',
        data_prevista: '2026-08-07', data_realizada: '',
        valor_mercadoria: '6800.00', status: 'Atrasada',
        empresa: 'Velora Log', filial: 'Matriz', cep: '29345-000',
        regiao: 'Sul', prioridade: 'Alta', peso: '3400.00', volume: '18.00',
        quantidade_volumes: 15, contato_cliente: '(28) 3532-5000',
        recebedor_nome: '', recebedor_documento: '',
        pedidos_vinculados: ['PED-0004'], notas_fiscais: ['NF-001237'],
        produtos: [], historico_movimentacoes: [],
        ocorrencias: [
          { tipo: 'Cliente Ausente', descricao: 'Cliente não encontrado no endereço', data: '2026-08-07' },
        ],
        comprovantes: [],
      },
    ]

    for (var ei = 0; ei < DELIVERIES.length; ei++) {
      seed('logistics_deliveries', DELIVERIES[ei], 'numero_entrega')
    }

    seed('logistics_freights', {
      numero_frete: 'FRE-001', documento_origem: 'Pedido de Venda',
      pedido: 'PED-0001', nota_fiscal: 'NF-001234', cliente: 'Comércio Vitória Ltda',
      transportadora: 'Próprio', origem: 'Cariacica/ES', destino: 'Linhares/ES',
      peso: '5200.00', volume: '28.00', valor_mercadoria: '12500.00',
      tipo_frete: 'Próprio', tabela_frete: 'Tabela Padrão Próprio',
      valor_calculado: '850.00', valor_negociado: '850.00',
      pedagio: '18.40', seguro: '0.00', taxas: '0.00', adicionais: '0.00',
      valor_total: '868.40', prazo_entrega: '1 dia útil',
      responsavel: 'Carlos Mendes', situacao: 'Contratado', cte: '',
      empresa: 'Velora Log', filial: 'Matriz', cotacoes: [], historico: [],
    }, 'numero_frete')

    seed('logistics_freights', {
      numero_frete: 'FRE-002', documento_origem: 'Pedido de Venda',
      pedido: 'PED-0003', nota_fiscal: 'NF-001236', cliente: 'Supermercado Estrela',
      transportadora: 'Próprio', origem: 'Cariacica/ES', destino: 'Cachoeiro de Itapemirim/ES',
      peso: '2100.00', volume: '12.00', valor_mercadoria: '4200.00',
      tipo_frete: 'Próprio', tabela_frete: 'Tabela Padrão Próprio',
      valor_calculado: '580.00', valor_negociado: '580.00',
      pedagio: '12.80', seguro: '0.00', taxas: '0.00', adicionais: '0.00',
      valor_total: '592.80', prazo_entrega: '1 dia útil',
      responsavel: 'Carlos Mendes', situacao: 'Finalizado', cte: '',
      empresa: 'Velora Log', filial: 'Matriz', cotacoes: [], historico: [],
    }, 'numero_frete')

    seed('logistics_tracking', {
      veiculo: 'RTZ1A23', motorista: 'João Silva Santos', rota: 'Rota Norte ES',
      entrega: 'ENT-001', cliente: 'Comércio Vitória Ltda',
      ultima_localizacao: 'BR-101, Km 80 - Fundão/ES',
      data_hora_atualizacao: '2026-08-10T07:30:00Z',
      proxima_parada: 'Aracruz/ES', previsao_chegada: '2026-08-10T09:00:00Z',
      status: 'Em Trânsito', latitude: '-20.0258', longitude: '-40.3089',
      empresa: 'Velora Log', filial: 'Matriz',
      linha_tempo: [
        { localizacao: 'Cariacica/ES', data_hora: '2026-08-10T06:30:00Z', status: 'Saída do depósito' },
        { localizacao: 'Vitória/ES', data_hora: '2026-08-10T06:45:00Z', status: 'Em trânsito' },
        { localizacao: 'Fundão/ES', data_hora: '2026-08-10T07:30:00Z', status: 'Em trânsito' },
      ],
    }, 'entrega')

    seed('logistics_tracking', {
      veiculo: 'RTZ3C45', motorista: 'Pedro Henrique Oliveira', rota: 'Rota Central ES',
      entrega: 'ENT-003', cliente: 'Ferreira & Filhos Ltda',
      ultima_localizacao: 'BR-262, Km 45 - Domingos Martins/ES',
      data_hora_atualizacao: '2026-08-09T08:15:00Z',
      proxima_parada: 'Colatina/ES', previsao_chegada: '2026-08-09T09:30:00Z',
      status: 'Em Trânsito', latitude: '-20.2546', longitude: '-40.6587',
      empresa: 'Velora Log', filial: 'Matriz',
      linha_tempo: [
        { localizacao: 'Vitória/ES', data_hora: '2026-08-09T06:30:00Z', status: 'Saída' },
        { localizacao: 'Domingos Martins/ES', data_hora: '2026-08-09T08:15:00Z', status: 'Em trânsito' },
      ],
    }, 'entrega')

    var COSTS = [
      { descricao: 'Combustível - VIA-004', tipo_custo: 'Combustível', entrega: 'ENT-003', pedido: 'PED-0006', cliente: 'Ferreira & Filhos Ltda', rota: 'Rota Central ES', veiculo: 'RTZ3C45', motorista: 'Pedro Henrique Oliveira', transportadora: 'Próprio', empresa: 'Velora Log', filial: 'Matriz', valor: '180.00', data: '2026-08-09', responsavel: 'Carlos Mendes', historico: [] },
      { descricao: 'Pedágio - VIA-004', tipo_custo: 'Pedágio', entrega: 'ENT-003', pedido: 'PED-0006', cliente: 'Ferreira & Filhos Ltda', rota: 'Rota Central ES', veiculo: 'RTZ3C45', motorista: 'Pedro Henrique Oliveira', transportadora: 'Próprio', empresa: 'Velora Log', filial: 'Matriz', valor: '8.50', data: '2026-08-09', responsavel: 'Carlos Mendes', historico: [] },
      { descricao: 'Combustível - VIA-001', tipo_custo: 'Combustível', entrega: 'ENT-001', pedido: 'PED-0001', cliente: 'Comércio Vitória Ltda', rota: 'Rota Norte ES', veiculo: 'RTZ1A23', motorista: 'João Silva Santos', transportadora: 'Próprio', empresa: 'Velora Log', filial: 'Matriz', valor: '220.00', data: '2026-08-10', responsavel: 'Carlos Mendes', historico: [] },
      { descricao: 'Pedágio - VIA-001', tipo_custo: 'Pedágio', entrega: 'ENT-001', pedido: 'PED-0001', cliente: 'Comércio Vitória Ltda', rota: 'Rota Norte ES', veiculo: 'RTZ1A23', motorista: 'João Silva Santos', transportadora: 'Próprio', empresa: 'Velora Log', filial: 'Matriz', valor: '18.40', data: '2026-08-10', responsavel: 'Carlos Mendes', historico: [] },
      { descricao: 'Combustível - VIA-003 (Finalizada)', tipo_custo: 'Combustível', entrega: 'ENT-004', pedido: 'PED-0003', cliente: 'Supermercado Estrela', rota: 'Rota Metropolitana', veiculo: 'GHI3H45', motorista: 'Pedro Oliveira', transportadora: 'Próprio', empresa: 'Velora Log', filial: 'Matriz', valor: '150.00', data: '2026-08-08', responsavel: 'Carlos Mendes', historico: [] },
    ]
    for (var ci = 0; ci < COSTS.length; ci++) {
      seed('logistics_costs', COSTS[ci], 'descricao')
    }

    try {
      var network = app.findFirstRecordByData('client_networks', 'name', 'Rede Supermercados Alfa')
      if (network) {
        var currentPolicy = network.getString('restriction_policy') || ''
        var currentLimit = network.getString('credit_limit') || ''
        if (currentPolicy !== 'block' || currentLimit !== '100000') {
          network.set('restriction_policy', 'block')
          network.set('credit_limit', '100000')
          network.set('observations', 'Rede configurada com política de bloqueio e limite de R$ 100.000,00 — validada no fluxo end-to-end.')
          app.save(network)
        }
      }
    } catch (_) {}

    try {
      app.findFirstRecordByData('client_networks', 'name', 'Rede Distribuidora Ferreira')
    } catch (_) {
      var netCol = app.findCollectionByNameOrId('client_networks')
      var net2 = new Record(netCol)
      net2.set('name', 'Rede Distribuidora Ferreira')
      net2.set('corporate_name', 'Distribuidora Ferreira Ltda')
      net2.set('responsible', 'José Ferreira')
      net2.set('contact_phone', '(27) 3322-5500')
      net2.set('status', 'Ativa')
      net2.set('restriction_policy', 'require_approval')
      net2.set('credit_limit', '75000')
      net2.set('observations', 'Rede com política de exigir aprovação — limite R$ 75.000,00.')
      net2.set('member_ids', [])
      net2.set('member_history', [])
      app.save(net2)
    }

    try {
      app.findFirstRecordByData('client_networks', 'name', 'Grupo Econômico Capixaba')
    } catch (_) {
      var netCol3 = app.findCollectionByNameOrId('client_networks')
      var net3 = new Record(netCol3)
      net3.set('name', 'Grupo Econômico Capixaba')
      net3.set('corporate_name', 'Capixaba Holding SA')
      net3.set('responsible', 'Roberto Capixaba')
      net3.set('contact_phone', '(27) 3333-6600')
      net3.set('contact_email', 'roberto@capixabaholding.com.br')
      net3.set('status', 'Ativa')
      net3.set('restriction_policy', 'alert')
      net3.set('credit_limit', '200000')
      net3.set('observations', 'Grupo econômico com política de alerta — limite R$ 200.000,00.')
      net3.set('member_ids', [])
      net3.set('member_history', [])
      app.save(net3)
    }

    try {
      var allNetworks = app.findRecordsByFilter('client_networks', '', '', 500, 0)
      for (var ni = 0; ni < allNetworks.length; ni++) {
        var n = allNetworks[ni]
        var policy = n.getString('restriction_policy') || ''
        var limit = n.getString('credit_limit') || ''
        if (!policy) {
          n.set('restriction_policy', 'alert')
        }
        if (!limit || limit === '0') {
          n.set('credit_limit', '50000')
        }
        if (!policy || !limit || limit === '0') {
          app.save(n)
        }
      }
    } catch (_) {}
  },
  (app) => {
    var deliveryNums = ['ENT-001', 'ENT-002', 'ENT-003', 'ENT-004', 'ENT-005']
    for (var i = 0; i < deliveryNums.length; i++) {
      try { app.delete(app.findFirstRecordByData('logistics_deliveries', 'numero_entrega', deliveryNums[i])) } catch (_) {}
    }
    var vehicleCodes = ['VEIC-001', 'VEIC-002', 'VEIC-003', 'VEIC-004', 'VEIC-005']
    for (var j = 0; j < vehicleCodes.length; j++) {
      try { app.delete(app.findFirstRecordByData('logistics_vehicles', 'codigo', vehicleCodes[j])) } catch (_) {}
    }
    var routeCodes = ['RT-NORTE-01', 'RT-SUL-01', 'RT-METRO-01', 'RT-CENTRAL-01']
    for (var k = 0; k < routeCodes.length; k++) {
      try { app.delete(app.findFirstRecordByData('logistics_routes', 'codigo_rota', routeCodes[k])) } catch (_) {}
    }
    var journeyNums = ['VIA-004', 'VIA-005', 'VIA-006']
    for (var m = 0; m < journeyNums.length; m++) {
      try { app.delete(app.findFirstRecordByData('transport_journeys', 'numero_viagem', journeyNums[m])) } catch (_) {}
    }
    var driverCpfs = ['123.456.789-01', '234.567.890-12', '345.678.901-23', '456.789.012-34', '567.890.123-45']
    for (var p = 0; p < driverCpfs.length; p++) {
      try { app.delete(app.findFirstRecordByData('logistics_drivers', 'cpf', driverCpfs[p])) } catch (_) {}
    }
    var freightNums = ['FRE-001', 'FRE-002']
    for (var q = 0; q < freightNums.length; q++) {
      try { app.delete(app.findFirstRecordByData('logistics_freights', 'numero_frete', freightNums[q])) } catch (_) {}
    }
    var wmsNums = ['REC-001', 'WAVE-001', 'SEP-001', 'SEP-002', 'EXP-001', 'EXP-002', 'ROM-001', 'ROM-002']
    for (var r = 0; r < wmsNums.length; r++) {
      try { app.delete(app.findFirstRecordByData('wms_receipts', 'numero_recebimento', wmsNums[r])) } catch (_) {}
      catch (_) {}
      try { app.delete(app.findFirstRecordByData('wms_waves', 'numero_wave', wmsNums[r])) } catch (_) {}
      try { app.delete(app.findFirstRecordByData('wms_separations', 'numero_separacao', wmsNums[r])) } catch (_) {}
      try { app.delete(app.findFirstRecordByData('wms_shippings', 'numero_expedicao', wmsNums[r])) } catch (_) {}
      try { app.delete(app.findFirstRecordByData('wms_romaneios', 'numero_romaneio', wmsNums[r])) } catch (_) {}
    }
    var costDescs = [
      'Combustível - VIA-004', 'Pedágio - VIA-004', 'Combustível - VIA-001',
      'Pedágio - VIA-001', 'Combustível - VIA-003 (Finalizada)',
    ]
    for (var s = 0; s < costDescs.length; s++) {
      try { app.delete(app.findFirstRecordByData('logistics_costs', 'descricao', costDescs[s])) } catch (_) {}
    }
    try { app.delete(app.findFirstRecordByData('logistics_tracking', 'entrega', 'ENT-001')) } catch (_) {}
    try { app.delete(app.findFirstRecordByData('logistics_tracking', 'entrega', 'ENT-003')) } catch (_) {}
    try { app.delete(app.findFirstRecordByData('client_networks', 'name', 'Rede Distribuidora Ferreira')) } catch (_) {}
    try { app.delete(app.findFirstRecordByData('client_networks', 'name', 'Grupo Econômico Capixaba')) } catch (_) {}
  },
)
