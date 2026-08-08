migrate(
  (app) => {
    function exists(col, filter) {
      try {
        return app.findRecordsByFilter(col, filter, '-created', 1, 0).length > 0
      } catch (_) {
        return false
      }
    }
    function seed(col, data, filter) {
      if (exists(col, filter)) return
      var c = app.findCollectionByNameOrId(col)
      var r = new Record(c)
      for (var k in data) r.set(k, data[k])
      app.save(r)
    }

    seed(
      'sst_risk_matrix_config',
      {
        nome: 'Matriz 5x5 Corporativa',
        metodologia: 'Probabilidade x Severidade',
        probabilidades: JSON.stringify([
          'Rara',
          'Improvavel',
          'Possivel',
          'Provavel',
          'Quase Certo',
        ]),
        severidades: JSON.stringify([
          'Insignificante',
          'Menor',
          'Moderada',
          'Maior',
          'Catastrofica',
        ]),
        niveis: JSON.stringify([
          { nivel: 'Baixo', cor: '#22c55e', acao: 'Monitorar' },
          { nivel: 'Moderado', cor: '#eab308', acao: 'Planejar intervencao' },
          { nivel: 'Alto', cor: '#f97316', acao: 'Intervir com prioridade' },
          { nivel: 'Critico', cor: '#ef4444', acao: 'Intervir imediatamente' },
        ]),
        situacao: 'Ativo',
      },
      'nome = "Matriz 5x5 Corporativa"',
    )

    seed(
      'sst_work_environments',
      {
        nome: 'Galpao Operacional',
        setor: 'Operacional',
        area: 'Operacoes',
        empresa: 'Velora Log',
        filial: 'Matriz',
        riscos: JSON.stringify(['Ergonomico', 'Acidente', 'Ruido']),
        maquinas: JSON.stringify(['Empilhadeira', 'Esteira']),
        epcs: JSON.stringify(['Sinalizacao de piso', 'Barreira de protecao']),
        exposicoes: JSON.stringify(['Ruido 82 dB', 'Levantamento manual de peso']),
        num_trabalhadores: 12,
        responsavel_tecnico: 'Joao Santos',
        situacao: 'Ativo',
      },
      'nome = "Galpao Operacional"',
    )

    seed(
      'sst_exposure_groups',
      {
        nome: 'GHE Motoristas',
        setor: 'Operacional',
        cargo: 'Motorista',
        atividade: 'Direcao de veiculos',
        ambiente: 'Cabine do veiculo',
        agente: 'Vibracao e posto constraindo',
        exposicao: 'Habitual',
        num_trabalhadores: 4,
        trabalhadores: JSON.stringify([]),
        avaliacoes: JSON.stringify([]),
        controles: JSON.stringify(['Treinamento NR-11', 'Manutencao preventiva']),
        responsavel: 'Joao Santos',
        situacao: 'Ativo',
      },
      'nome = "GHE Motoristas"',
    )

    seed(
      'sst_environmental_assessments',
      {
        tipo_agente: 'Fisico - Ruido',
        ambiente: 'Galpao Operacional',
        setor: 'Operacional',
        metodologia: 'Dosimetria',
        equipamento: 'Dosimetro modelo XYZ',
        calibracao: '2025-07-01',
        responsavel_tecnico: 'Eng. Joao Santos',
        data_avaliacao: '2025-08-01',
        resultado: '82',
        unidade: 'dB(A)',
        limite: '85',
        conclusao: 'Abaixo do limite de tolerancia',
        registro: 'LAR-001/2025',
        situacao: 'Concluido',
      },
      'registro = "LAR-001/2025"',
    )

    seed(
      'sst_ltcat',
      {
        documento: 'LTCAT 2025',
        versao: '1.0',
        empresa: 'Velora Log',
        estabelecimento: 'Matriz - Vitoria/ES',
        data_elaboracao: '2025-01-15',
        data_validade: '2026-01-15',
        responsavel_tecnico: 'Eng. Joao Santos',
        metodologia: 'Avaliacao ambiental qualitativa e quantitativa',
        ambientes: JSON.stringify(['Galpao Operacional', 'Area Administrativa']),
        agentes: JSON.stringify(['Ruido', 'Poeira', 'Vibracao']),
        epis: JSON.stringify(['Protetor auricular', 'Luva de seguranca']),
        epcs: JSON.stringify(['Sinalizacao', 'Enclausuramento']),
        observacoes: 'Documento baseado no PGR e inventario de riscos vigente.',
        situacao: 'Ativo',
      },
      'documento = "LTCAT 2025"',
    )

    seed(
      'sst_cipa',
      {
        gestao: '2025/2026',
        empresa: 'Velora Log',
        estabelecimento: 'Matriz',
        presidente: 'Carlos Eduardo Pereira',
        vice_presidente: 'Marcos Vinicius Rocha',
        membros: JSON.stringify([
          { nome: 'Carlos Eduardo Pereira', cargo: 'Presidente', tipo: 'Efetivo' },
          { nome: 'Marcos Vinicius Rocha', cargo: 'Vice-Presidente', tipo: 'Efetivo' },
        ]),
        reunioes: JSON.stringify([{ data: '2025-08-01', pauta: 'Posse e plano de trabalho' }]),
        treinamentos: JSON.stringify([]),
        documentos: JSON.stringify([]),
        pendencias: JSON.stringify(['Eleger suplentes', 'Agendar treinamento NR-5']),
        data_posse: '2025-08-01',
        data_fim_mandato: '2026-07-31',
        situacao: 'Ativo',
      },
      'gestao = "2025/2026"',
    )

    seed(
      'sst_sesmt',
      {
        empresa: 'Velora Log',
        estabelecimento: 'Matriz',
        profissionais: JSON.stringify([
          { nome: 'Joao Santos', funcao: 'Engenheiro de Seguranca', registro: 'CREA-ES 12345' },
          { nome: 'Dra. Ana Silva', funcao: 'Medica do Trabalho', registro: 'CRM-ES 67890' },
        ]),
        dimensionamento: 'NR-4 - Grau de risco 2 (Transporte)',
        atribuicoes: JSON.stringify([
          'Coordenar PGR',
          'Supervisionar PCMSO',
          'Investigar acidentes',
        ]),
        agenda: JSON.stringify([]),
        acoes: JSON.stringify([]),
        responsavel: 'Joao Santos',
        situacao: 'Ativo',
      },
      'empresa = "Velora Log"',
    )

    seed(
      'sst_compliance_status',
      {
        nr: 'NR-1',
        empresa: 'Velora Log',
        filial: 'Matriz',
        unidade: 'Todas',
        status: 'Conforme',
        pendencias: JSON.stringify(['Revisar PGR em 2026-01']),
        responsavel: 'Joao Santos',
        data_avaliacao: '2025-08-01',
        proxima_avaliacao: '2025-12-01',
        situacao: 'Ativo',
      },
      'nr = "NR-1" && empresa = "Velora Log"',
    )
    seed(
      'sst_compliance_status',
      {
        nr: 'NR-5',
        empresa: 'Velora Log',
        filial: 'Matriz',
        unidade: 'Todas',
        status: 'Atencao',
        pendencias: JSON.stringify(['Eleger suplentes CIPA', 'Treinamento membros']),
        responsavel: 'Joao Santos',
        data_avaliacao: '2025-08-01',
        proxima_avaliacao: '2025-09-01',
        situacao: 'Ativo',
      },
      'nr = "NR-5" && empresa = "Velora Log"',
    )
    seed(
      'sst_compliance_status',
      {
        nr: 'NR-7',
        empresa: 'Velora Log',
        filial: 'Matriz',
        unidade: 'Todas',
        status: 'Conforme',
        pendencias: JSON.stringify([]),
        responsavel: 'Dra. Ana Silva',
        data_avaliacao: '2025-08-01',
        proxima_avaliacao: '2026-01-01',
        situacao: 'Ativo',
      },
      'nr = "NR-7" && empresa = "Velora Log"',
    )
    seed(
      'sst_compliance_status',
      {
        nr: 'NR-6',
        empresa: 'Velora Log',
        filial: 'Matriz',
        unidade: 'Todas',
        status: 'Atencao',
        pendencias: JSON.stringify(['Renovar CA de luvas', 'Atualizar ficha de EPI']),
        responsavel: 'Joao Santos',
        data_avaliacao: '2025-08-01',
        proxima_avaliacao: '2025-10-01',
        situacao: 'Ativo',
      },
      'nr = "NR-6" && empresa = "Velora Log"',
    )

    seed(
      'sst_esocial_sst_events',
      {
        tipo_evento: 'S-2220',
        employee_name: 'Carlos Eduardo Pereira',
        employee_id: '',
        competencia: '2025-08',
        protocolo: '',
        recibo: '',
        data_envio: '',
        data_retorno: '',
        status_retorno: '',
        erro_descricao: '',
        dados_evento: JSON.stringify({ tipo_exame: 'Periodico', aptidao: 'Apto' }),
        situacao: 'Pendente',
      },
      'tipo_evento = "S-2220" && employee_name = "Carlos Eduardo Pereira"',
    )
    seed(
      'sst_esocial_sst_events',
      {
        tipo_evento: 'S-2240',
        employee_name: 'Marcos Vinicius Rocha',
        employee_id: '',
        competencia: '2025-08',
        protocolo: '123456',
        recibo: '789012',
        data_envio: '2025-08-02',
        data_retorno: '2025-08-03',
        status_retorno: 'Aceito',
        erro_descricao: '',
        dados_evento: JSON.stringify({
          ambiente: 'Cabine veiculo',
          agentes: ['Vibracao', 'Ruido'],
        }),
        situacao: 'Aceito',
      },
      'tipo_evento = "S-2240" && employee_name = "Marcos Vinicius Rocha"',
    )

    seed(
      'sst_nr_catalog',
      {
        nr_numero: 'NR-1',
        titulo: 'Disposicoes Gerais e Gerenciamento de Riscos Ocupacionais',
        versao: 'Vigente desde 26/05/2026',
        data_vigencia: '2026-05-26',
        data_publicacao: '2025-12-16',
        orgao: 'MTE',
        resumo: JSON.stringify(['GRO/PGR', 'Inventario de riscos', 'Plano de acao']),
        situacao: 'Vigente',
      },
      'nr_numero = "NR-1"',
    )
    seed(
      'sst_nr_catalog',
      {
        nr_numero: 'NR-5',
        titulo: 'Comissao Interna de Prevencao de Acidentes',
        versao: 'Atual',
        data_vigencia: '',
        data_publicacao: '',
        orgao: 'MTE',
        resumo: JSON.stringify(['CIPA', 'Eleicao', 'Mandato']),
        situacao: 'Vigente',
      },
      'nr_numero = "NR-5"',
    )
    seed(
      'sst_nr_catalog',
      {
        nr_numero: 'NR-7',
        titulo: 'Programa de Controle Medico de Saude Ocupacional',
        versao: 'Atual',
        data_vigencia: '',
        data_publicacao: '',
        orgao: 'MTE',
        resumo: JSON.stringify(['PCMSO', 'ASO', 'Exames ocupacionais']),
        situacao: 'Vigente',
      },
      'nr_numero = "NR-7"',
    )
    seed(
      'sst_nr_catalog',
      {
        nr_numero: 'NR-6',
        titulo: 'Equipamento de Protecao Individual',
        versao: 'Atual',
        data_vigencia: '',
        data_publicacao: '',
        orgao: 'MTE',
        resumo: JSON.stringify(['EPI', 'CA', 'Entrega']),
        situacao: 'Vigente',
      },
      'nr_numero = "NR-6"',
    )

    seed(
      'sst_ergonomics',
      {
        ambiente: 'Galpao Operacional',
        setor: 'Operacional',
        posto: 'Posto de Carga',
        tipo_analise: 'Analise Ergonomica do Trabalho',
        data_avaliacao: '2025-07-15',
        responsavel: 'Joao Santos',
        riscos_identificados: JSON.stringify(['Postura inadequada', 'Levantamento manual de peso']),
        recomendacoes: JSON.stringify(['Automatizar processo de carga', 'Treinamento postural']),
        plano_acao: JSON.stringify([{ acao: 'Avaliar automatizacao', prazo: '2025-12-01' }]),
        situacao: 'Ativo',
      },
      'ambiente = "Galpao Operacional" && posto = "Posto de Carga"',
    )

    seed(
      'sst_training_matrix',
      {
        employee_name: 'Carlos Eduardo Pereira',
        cargo: 'Analista Administrativo',
        setor: 'Administrativo',
        treinamento: 'NR-1 - GRO/PGR',
        nr: 'NR-1',
        data_realizacao: '2025-01-15',
        validade: '2026-01-15',
        carga_horaria: '4h',
        instrutor: 'Joao Santos',
        situacao: 'Válido',
      },
      'employee_name = "Carlos Eduardo Pereira" && treinamento = "NR-1 - GRO/PGR"',
    )
    seed(
      'sst_training_matrix',
      {
        employee_name: 'Marcos Vinicius Rocha',
        cargo: 'Motorista',
        setor: 'Operacional',
        treinamento: 'NR-11 - Movimentacao de Cargas',
        nr: 'NR-11',
        data_realizacao: '2023-01-15',
        validade: '2025-01-15',
        carga_horaria: '8h',
        instrutor: 'SEST SENAT',
        situacao: 'Vencido',
      },
      'employee_name = "Marcos Vinicius Rocha" && treinamento = "NR-11 - Movimentacao de Cargas"',
    )
  },
  (app) => {},
)
