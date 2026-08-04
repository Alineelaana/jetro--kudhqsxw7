migrate(
  (app) => {
    function exists(colName, filter) {
      try {
        return app.findRecordsByFilter(colName, filter, '-created', 1, 0).length > 0
      } catch (_) {
        return false
      }
    }
    function seed(colName, data, filter) {
      if (exists(colName, filter)) return
      var col = app.findCollectionByNameOrId(colName)
      var rec = new Record(col)
      for (var k in data) rec.set(k, data[k])
      app.save(rec)
    }

    try {
      var pos = app.findFirstRecordByData('rh_positions', 'name', 'Motorista')
      pos.set(
        'treinamentos_obrigatorios',
        JSON.stringify([
          'NR-11 - Movimentação de Cargas',
          'Direção Defensiva',
          'Primeiros Socorros',
        ]),
      )
      app.save(pos)
    } catch (_) {}

    seed(
      'rh_scales',
      {
        name: 'Escala Administrativa 5x2',
        tipo_escala: '5x2',
        turno: 'Diurno',
        horario_entrada: '08:00',
        horario_saida: '17:00',
        intervalo_inicio: '12:00',
        intervalo_fim: '13:00',
        tolerancia: '10min',
        dias_trabalho: 'Segunda a Sexta',
        folgas: 'Sábado e Domingo',
        jornada_diaria: '08h',
        jornada_semanal: '44h',
        situacao: 'Ativo',
      },
      'name = "Escala Administrativa 5x2"',
    )
    seed(
      'rh_scales',
      {
        name: 'Escala Operacional 6x1',
        tipo_escala: '6x1',
        turno: 'Diurno',
        horario_entrada: '06:00',
        horario_saida: '16:00',
        intervalo_inicio: '11:00',
        intervalo_fim: '12:00',
        tolerancia: '10min',
        dias_trabalho: 'Segunda a Sábado',
        folgas: 'Domingo',
        jornada_diaria: '09h',
        jornada_semanal: '54h',
        situacao: 'Ativo',
      },
      'name = "Escala Operacional 6x1"',
    )

    seed(
      'rh_time_records',
      {
        employee_name: 'Carlos Eduardo Pereira',
        data: '2025-08-05',
        entrada: '08:00',
        saida_intervalo: '12:00',
        retorno_intervalo: '13:00',
        saida: '17:00',
        horas_trabalhadas: '08:00',
        banco_horas: '00:00',
        situacao: 'Aprovado',
      },
      'employee_name = "Carlos Eduardo Pereira" && data = "2025-08-05"',
    )
    seed(
      'rh_time_records',
      {
        employee_name: 'Marcos Vinicius Rocha',
        data: '2025-08-05',
        entrada: '06:00',
        saida_intervalo: '11:00',
        retorno_intervalo: '12:00',
        saida: '19:30',
        horas_trabalhadas: '09:00',
        horas_extras: '03:30',
        banco_horas: '-02:00',
        situacao: 'Pendente',
      },
      'employee_name = "Marcos Vinicius Rocha" && data = "2025-08-05"',
    )
    seed(
      'rh_time_records',
      {
        employee_name: 'Roberto Alves Souza',
        data: '2025-08-05',
        entrada: '06:00',
        saida_intervalo: '11:00',
        retorno_intervalo: '12:00',
        saida: '16:00',
        horas_trabalhadas: '09:00',
        banco_horas: '00:00',
        situacao: 'Pendente',
      },
      'employee_name = "Roberto Alves Souza" && data = "2025-08-05"',
    )
    seed(
      'rh_time_records',
      {
        employee_name: 'Carlos Eduardo Pereira',
        data: '2025-08-06',
        entrada: '08:00',
        saida_intervalo: '12:00',
        retorno_intervalo: '13:00',
        saida: '17:00',
        horas_trabalhadas: '08:00',
        banco_horas: '00:00',
        situacao: 'Aprovado',
      },
      'employee_name = "Carlos Eduardo Pereira" && data = "2025-08-06"',
    )

    seed(
      'dp_licenses',
      {
        employee_name: 'Patricia Fernandes Lima',
        tipo_licenca: 'Licença Maternidade',
        data_inicio: '2025-08-01',
        data_fim: '2025-11-01',
        motivo: 'Maternidade',
        observacoes: 'Licença maternidade 120 dias',
        situacao: 'Ativa',
      },
      'employee_name = "Patricia Fernandes Lima" && tipo_licenca = "Licença Maternidade"',
    )

    seed(
      'rh_dismissals',
      {
        employee_name: 'Roberto Alves Souza',
        data_desligamento: '2025-08-15',
        tipo_desligamento: 'Sem Justa Causa',
        motivo: 'Término de experiência',
        aviso_previo: 'Trabalhado',
        data_ultimo_dia: '2025-08-15',
        responsavel: 'Maria Silva',
        valor_rescisao: '3500.00',
        observacoes: 'Rescisão de contrato de experiência',
        situacao: 'Concluída',
      },
      'employee_name = "Roberto Alves Souza"',
    )

    seed(
      'rh_climate_surveys',
      {
        titulo: 'Pesquisa de Clima 2025',
        periodo_inicio: '2025-06-01',
        periodo_fim: '2025-06-30',
        participantes: 5,
        taxa_participacao: '100%',
        nota_geral: '8.2',
        observacoes: 'Boa avaliação geral. Pontos de melhoria em infraestrutura.',
        situacao: 'Concluída',
      },
      'titulo = "Pesquisa de Clima 2025"',
    )

    seed(
      'rh_trainings',
      {
        name: 'Direção Defensiva - Turma 1',
        categoria: 'Operacional',
        instrutor: 'Carlos Motorista Instrutor',
        modalidade: 'Presencial',
        data: '2025-07-15',
        horario: '08:00',
        carga_horaria: '4h',
        local: 'Sala de Treinamentos',
        obrigatorio: true,
        situacao: 'Inscrições Abertas',
      },
      'name = "Direção Defensiva - Turma 1"',
    )

    seed(
      'sst_risk_inventory',
      {
        processo: 'Movimentação de Cargas',
        setor: 'Operacional',
        tipo_risco: 'Ergonômico',
        fonte_geradora: 'Levantamento e transporte manual de peso',
        intensidade: 'Médio',
        exposicao: 'Habitual',
        medidas_controle: 'Treinamento NR-11, uso de EPIs, automação de processos',
        responsavel: 'João Santos',
        situacao: 'Ativo',
      },
      'processo = "Movimentação de Cargas" && setor = "Operacional"',
    )
    seed(
      'sst_risk_inventory',
      {
        processo: 'Operação de Veículos',
        setor: 'Operacional',
        tipo_risco: 'Acidente',
        fonte_geradora: 'Direção de veículos em rodovias',
        intensidade: 'Alto',
        exposicao: 'Habitual',
        medidas_controle: 'Treinamento direção defensiva, manutenção preventiva, rastreamento',
        responsavel: 'João Santos',
        situacao: 'Ativo',
      },
      'processo = "Operação de Veículos" && setor = "Operacional"',
    )
    seed(
      'sst_risk_inventory',
      {
        processo: 'Trabalho Administrativo',
        setor: 'Administrativo',
        tipo_risco: 'Ergonômico',
        fonte_geradora: 'Uso de computadores e postura inadequada',
        intensidade: 'Baixo',
        exposicao: 'Habitual',
        medidas_controle: 'Orientações ergonômicas, pausas programadas',
        responsavel: 'Maria Silva',
        situacao: 'Ativo',
      },
      'processo = "Trabalho Administrativo" && setor = "Administrativo"',
    )
    seed(
      'sst_risk_inventory',
      {
        processo: 'Manuseio de Produtos Químicos',
        setor: 'Operacional',
        tipo_risco: 'Químico',
        fonte_geradora: 'Limpeza e desinfecção de veículos',
        intensidade: 'Médio',
        exposicao: 'Ocasional',
        medidas_controle: 'EPIs adequados, FISPQ disponível, ventilação',
        responsavel: 'João Santos',
        situacao: 'Ativo',
      },
      'processo = "Manuseio de Produtos Químicos" && setor = "Operacional"',
    )

    seed(
      'sst_vaccination',
      {
        employee_name: 'Carlos Eduardo Pereira',
        vacina: 'Tétano',
        dose: 'Reforço',
        data_aplicacao: '2024-01-10',
        data_validade: '2027-01-10',
        aplicador: 'Enf. Ana',
        lote: 'L2024-001',
        situacao: 'Aplicada',
      },
      'employee_name = "Carlos Eduardo Pereira" && vacina = "Tétano"',
    )
    seed(
      'sst_vaccination',
      {
        employee_name: 'Marcos Vinicius Rocha',
        vacina: 'Tétano',
        dose: 'Reforço',
        data_aplicacao: '2021-06-15',
        data_validade: '2024-06-15',
        aplicador: 'Enf. Paula',
        lote: 'L2021-045',
        situacao: 'Vencida',
      },
      'employee_name = "Marcos Vinicius Rocha" && vacina = "Tétano"',
    )
    seed(
      'sst_vaccination',
      {
        employee_name: 'Roberto Alves Souza',
        vacina: 'Tétano',
        dose: 'Reforço',
        data_aplicacao: '2024-08-01',
        data_validade: '2027-08-01',
        aplicador: 'Enf. Ana',
        lote: 'L2024-089',
        situacao: 'Aplicada',
      },
      'employee_name = "Roberto Alves Souza" && vacina = "Tétano"',
    )

    seed(
      'sst_certificates',
      {
        employee_name: 'Carlos Eduardo Pereira',
        certificado: 'NR-11 - Movimentação de Cargas',
        tipo: 'Treinamento',
        data_emissao: '2023-01-15',
        data_validade: '2025-01-15',
        emissor: 'SEST SENAT',
        carga_horaria: '8h',
        situacao: 'Vencido',
      },
      'employee_name = "Carlos Eduardo Pereira" && certificado = "NR-11 - Movimentação de Cargas"',
    )
    seed(
      'sst_certificates',
      {
        employee_name: 'Marcos Vinicius Rocha',
        certificado: 'NR-11 - Movimentação de Cargas',
        tipo: 'Treinamento',
        data_emissao: '2025-06-15',
        data_validade: '2027-06-15',
        emissor: 'SEST SENAT',
        carga_horaria: '8h',
        situacao: 'Válido',
      },
      'employee_name = "Marcos Vinicius Rocha" && certificado = "NR-11 - Movimentação de Cargas"',
    )
    seed(
      'sst_certificates',
      {
        employee_name: 'Roberto Alves Souza',
        certificado: 'Curso de Direção Defensiva',
        tipo: 'Treinamento',
        data_emissao: '2024-08-01',
        data_validade: '2026-08-01',
        emissor: 'DETran',
        carga_horaria: '4h',
        situacao: 'Válido',
      },
      'employee_name = "Roberto Alves Souza" && certificado = "Curso de Direção Defensiva"',
    )

    seed(
      'sst_psychosocial_assessments',
      {
        employee_name: 'Carlos Eduardo Pereira',
        tipo_avaliacao: 'Inicial',
        data_realizacao: '2025-01-15',
        resultado: 'Baixo Risco',
        avaliador: 'Psic. Fernanda',
        observacoes: 'Sem indicadores de risco psicossocial',
        situacao: 'Concluída',
      },
      'employee_name = "Carlos Eduardo Pereira" && tipo_avaliacao = "Inicial"',
    )
    seed(
      'sst_psychosocial_assessments',
      {
        employee_name: 'Marcos Vinicius Rocha',
        tipo_avaliacao: 'Inicial',
        data_realizacao: '',
        resultado: '',
        avaliador: 'Psic. Fernanda',
        observacoes: 'Avaliação agendada pendente',
        situacao: 'Pendente',
      },
      'employee_name = "Marcos Vinicius Rocha" && tipo_avaliacao = "Inicial"',
    )
    seed(
      'sst_psychosocial_assessments',
      {
        employee_name: 'Roberto Alves Souza',
        tipo_avaliacao: 'Admissional',
        data_realizacao: '2024-08-01',
        resultado: 'Baixo Risco',
        avaliador: 'Psic. Fernanda',
        observacoes: 'Sem indicadores de risco',
        situacao: 'Concluída',
      },
      'employee_name = "Roberto Alves Souza" && tipo_avaliacao = "Admissional"',
    )

    seed(
      'sst_non_conformities',
      {
        descricao: 'Extintor de incêndio vencido no veículo',
        origem: 'Inspeção',
        gravidade: 'Média',
        area_responsavel: 'Operacional',
        responsavel: 'João Santos',
        prazo: '2025-08-30',
        data_criacao: '2025-08-01',
        situacao: 'Aberta',
      },
      'descricao = "Extintor de incêndio vencido no veículo"',
    )
    seed(
      'sst_non_conformities',
      {
        descricao: 'Falta de sinalização de piso no galpão',
        origem: 'Auditoria Interna',
        gravidade: 'Baixa',
        area_responsavel: 'Administrativo',
        responsavel: 'Maria Silva',
        prazo: '2025-09-15',
        data_criacao: '2025-08-02',
        situacao: 'Em Tratamento',
      },
      'descricao = "Falta de sinalização de piso no galpão"',
    )

    seed(
      'sst_aso',
      {
        employee_name: 'Marcos Vinicius Rocha',
        tipo_aso: 'Periódico',
        data_realizacao: '2025-06-15',
        data_validade: '2026-06-15',
        resultado: 'Apto',
        medico: 'Dr. Santos',
        clinica: 'Clinica Medica',
        situacao: 'Válido',
      },
      'employee_name = "Marcos Vinicius Rocha" && tipo_aso = "Periódico"',
    )
    seed(
      'sst_aso',
      {
        employee_name: 'Roberto Alves Souza',
        tipo_aso: 'Admissional',
        data_realizacao: '2024-08-01',
        data_validade: '2025-08-01',
        resultado: 'Apto',
        medico: 'Dr. Silva',
        clinica: 'Clinica Medica',
        situacao: 'Vencido',
      },
      'employee_name = "Roberto Alves Souza" && tipo_aso = "Admissional"',
    )

    seed(
      'sst_epis',
      {
        employee_name: 'Marcos Vinicius Rocha',
        item: 'Luva de Segurança',
        ca: 'CA-67890',
        data_entrega: '2024-06-10',
        quantidade: 2,
        situacao: 'Entregue',
      },
      'employee_name = "Marcos Vinicius Rocha" && item = "Luva de Segurança"',
    )

    seed(
      'sst_action_plans',
      {
        titulo: 'Renovação de Extintores',
        origem: 'Não Conformidade',
        prioridade: 'Média',
        responsavel: 'João Santos',
        data_inicio: '2025-08-03',
        data_fim: '2025-08-30',
        progresso: 10,
        situacao: 'Em Andamento',
      },
      'titulo = "Renovação de Extintores"',
    )
    seed(
      'sst_pcmso',
      {
        documento: 'PCMSO 2025',
        versao: '1.0',
        data_elaboracao: '2025-01-01',
        data_revisao: '2025-01-15',
        data_validade: '2026-01-01',
        responsavel: 'Dr. Silva',
        medico_coordenador: 'Dr. Silva',
        situacao: 'Ativo',
      },
      'documento = "PCMSO 2025"',
    )
    seed(
      'sst_dds',
      {
        titulo: 'DDS - Uso de EPIs',
        data: '2025-08-04',
        instrutor: 'João Santos',
        area: 'Operacional',
        tema: 'Importância do uso correto de EPIs',
        num_participantes: 5,
        situacao: 'Realizado',
      },
      'titulo = "DDS - Uso de EPIs"',
    )
    seed(
      'sst_apr',
      {
        titulo: 'APR - Carga e Descarga',
        area: 'Operacional',
        responsavel: 'João Santos',
        data: '2025-08-01',
        atividade: 'Carga e descarga de mercadorias',
        riscos_identificados: 'Queda de carga, esmagamento, lesão ergonômica',
        medidas_controle: 'EPIs, treinamento, supervisão',
        situacao: 'Aprovada',
      },
      'titulo = "APR - Carga e Descarga"',
    )

    seed(
      'dp_mandatory_docs',
      {
        employee_name: 'Carlos Eduardo Pereira',
        documento: 'RG',
        categoria: 'Documentos Pessoais',
        data_entrega: '2024-01-15',
        data_validade: '',
        observacoes: 'Cópia do RG entregue na admissão',
        situacao: 'Válido',
      },
      'employee_name = "Carlos Eduardo Pereira" && documento = "RG"',
    )
    seed(
      'dp_mandatory_docs',
      {
        employee_name: 'Marcos Vinicius Rocha',
        documento: 'CNH',
        categoria: 'Habilitação',
        data_entrega: '2023-06-10',
        data_validade: '2026-06-10',
        observacoes: 'CNH categoria D',
        situacao: 'Válido',
      },
      'employee_name = "Marcos Vinicius Rocha" && documento = "CNH"',
    )
    seed(
      'dp_mandatory_docs',
      {
        employee_name: 'Roberto Alves Souza',
        documento: 'CNH',
        categoria: 'Habilitação',
        data_entrega: '2024-08-01',
        data_validade: '2025-08-01',
        observacoes: 'CNH categoria D - vencida',
        situacao: 'Vencido',
      },
      'employee_name = "Roberto Alves Souza" && documento = "CNH"',
    )

    seed(
      'rh_vacations',
      {
        employee_name: 'Marcos Vinicius Rocha',
        data_admissao: '2023-06-10',
        periodo_aquisitivo_inicio: '2023-06-10',
        periodo_aquisitivo_fim: '2024-06-09',
        dias_disponiveis: 30,
        dias_utilizados: 0,
        dias_vendidos: 0,
        data_prevista: '2024-06-10',
        situacao: 'Vencida',
        observacoes: 'Período aquisitivo vencido - férias não gozadas',
      },
      'employee_name = "Marcos Vinicius Rocha" && situacao = "Vencida"',
    )

    seed(
      'rh_employee_benefits',
      {
        employee_name: 'Carlos Eduardo Pereira',
        benefit_name: 'Vale Transporte',
        valor_empresa: '180',
        valor_descontado: '0',
        data_inclusao: '2024-01-15',
        situacao: 'Ativo',
      },
      'employee_name = "Carlos Eduardo Pereira" && benefit_name = "Vale Transporte"',
    )
    seed(
      'rh_employee_benefits',
      {
        employee_name: 'Carlos Eduardo Pereira',
        benefit_name: 'Plano de Saúde',
        valor_empresa: '300',
        valor_descontado: '150',
        data_inclusao: '2024-01-15',
        situacao: 'Ativo',
      },
      'employee_name = "Carlos Eduardo Pereira" && benefit_name = "Plano de Saúde"',
    )
    seed(
      'rh_employee_benefits',
      {
        employee_name: 'Marcos Vinicius Rocha',
        benefit_name: 'Vale Transporte',
        valor_empresa: '180',
        valor_descontado: '0',
        data_inclusao: '2023-06-10',
        situacao: 'Ativo',
      },
      'employee_name = "Marcos Vinicius Rocha" && benefit_name = "Vale Transporte"',
    )
    seed(
      'rh_employee_benefits',
      {
        employee_name: 'Marcos Vinicius Rocha',
        benefit_name: 'Plano de Saúde',
        valor_empresa: '300',
        valor_descontado: '150',
        data_inclusao: '2023-06-10',
        situacao: 'Ativo',
      },
      'employee_name = "Marcos Vinicius Rocha" && benefit_name = "Plano de Saúde"',
    )

    var payrollItems = JSON.stringify([
      {
        employee_name: 'Carlos Eduardo Pereira',
        cargo: 'Analista Administrativo',
        salario_base: '3200',
        valor_bruto: '3200.00',
        valor_liquido: '2917.18',
        inss_value: '282.82',
        irrf_value: '0.00',
        fgts_value: '256.00',
      },
      {
        employee_name: 'Marcos Vinicius Rocha',
        cargo: 'Motorista',
        salario_base: '2800',
        valor_bruto: '2800.00',
        valor_liquido: '2542.23',
        inss_value: '234.82',
        irrf_value: '22.95',
        fgts_value: '224.00',
      },
      {
        employee_name: 'Patricia Fernandes Lima',
        cargo: 'Coordenador Comercial',
        salario_base: '5500',
        valor_bruto: '5500.00',
        valor_liquido: '4456.61',
        inss_value: '588.81',
        irrf_value: '454.58',
        fgts_value: '440.00',
      },
      {
        employee_name: 'Roberto Alves Souza',
        cargo: 'Motorista',
        salario_base: '2500',
        valor_bruto: '2500.00',
        valor_liquido: '2293.41',
        inss_value: '203.82',
        irrf_value: '2.77',
        fgts_value: '200.00',
      },
    ])

    seed(
      'rh_payroll',
      {
        competencia: '2025-08',
        empresa: 'Velora Log',
        tipo_folha: 'Mensal',
        situacao: 'Em Preparação',
        valor_bruto: '14000.00',
        valor_liquido: '12209.43',
        total_descontos: '1790.57',
        total_encargos: '2910.57',
        quantidade_colaboradores: 4,
        responsavel: 'Maria Silva',
        itens: payrollItems,
        historico: JSON.stringify([
          { data: '2025-08-01', acao: 'Folha iniciada', responsavel: 'Maria Silva' },
        ]),
      },
      'competencia = "2025-08"',
    )

    seed(
      'sst_indicators',
      {
        indicador: 'Taxa de Absenteísmo',
        categoria: 'RH',
        periodo: '2025-07',
        valor: '2.5',
        meta: '3.0',
        unidade: '%',
        responsavel: 'Maria Silva',
        situacao: 'Ativo',
      },
      'indicador = "Taxa de Absenteísmo"',
    )
    seed(
      'rh_internal_communications',
      {
        titulo: 'Início do Piloto RH-DP-SST',
        tipo: 'Comunicado',
        data_publicacao: '2025-08-01',
        destinatarios: 'Todos',
        conteudo:
          'Iniciamos o piloto integrado dos módulos RH, DP e SST. Todos os colaboradores devem conferir seus dados cadastrais e documentos.',
        autor: 'RH',
        destaque: true,
        situacao: 'Publicada',
      },
      'titulo = "Início do Piloto RH-DP-SST"',
    )
  },
  (app) => {},
)
