migrate(
  (app) => {
    function seed(colName, data, matchField) {
      try {
        if (matchField && data[matchField])
          app.findFirstRecordByData(colName, matchField, data[matchField])
        else
          app.findFirstRecordByData(
            colName,
            'titulo',
            data.titulo || data.documento || data.employee_name,
          )
        return
      } catch (_) {}
      var col = app.findCollectionByNameOrId(colName)
      var rec = new Record(col)
      for (var k in data) rec.set(k, data[k])
      app.save(rec)
    }

    seed('rh_performance_evaluations', {
      employee_name: 'Carlos Eduardo Pereira',
      cargo: 'Analista Administrativo',
      departamento: 'Administrativo',
      avaliador: 'Maria Silva',
      periodo: '2025-01',
      nota_final: '8.5',
      tipo_avaliacao: 'Semestral',
      situacao: 'Concluída',
    })
    seed('rh_performance_evaluations', {
      employee_name: 'Marcos Vinicius Rocha',
      cargo: 'Motorista',
      departamento: 'Operacional',
      avaliador: 'João Santos',
      periodo: '2025-01',
      nota_final: '7.0',
      tipo_avaliacao: 'Semestral',
      situacao: 'Concluída',
    })

    seed('rh_career_plans', {
      employee_name: 'Carlos Eduardo Pereira',
      cargo_atual: 'Analista Administrativo',
      cargo_desejado: 'Coordenador Administrativo',
      prazo: '2026-12',
      acoes_necessarias: 'Curso de gestão, MBA em administração',
      situacao: 'Ativo',
    })
    seed('rh_internal_communications', {
      titulo: 'Reunião Geral de Segurança',
      tipo: 'Aviso',
      data_publicacao: '2025-08-01',
      destinatarios: 'Todos',
      conteudo: 'Reunião obrigatória de segurança do trabalho dia 10/08.',
      autor: 'RH',
      situacao: 'Publicada',
    })

    seed('dp_admissions', {
      employee_name: 'Roberto Alves Souza',
      cpf: '456.789.012-34',
      cargo: 'Motorista',
      departamento: 'Operacional',
      data_admissao: '2024-08-01',
      tipo_contrato: 'CLT',
      salario: '2500',
      situacao: 'Concluída',
    })
    seed('dp_work_contracts', {
      employee_name: 'Carlos Eduardo Pereira',
      tipo_contrato: 'CLT',
      data_inicio: '2024-01-15',
      salario: '3200',
      jornada: '44h',
      situacao: 'Ativo',
    })
    seed('dp_leaves', {
      employee_name: 'Juliana Costa Ribeiro',
      tipo_afastamento: 'Doença',
      data_inicio: '2025-07-01',
      data_fim: '2025-08-15',
      motivo: 'Cirurgia',
      cid: 'M54.5',
      situacao: 'Em Andamento',
    })
    seed('dp_13th_salary', {
      employee_name: 'Carlos Eduardo Pereira',
      competencia: '2025',
      valor_primeira: '1600',
      data_primeira: '2025-11-30',
      situacao: 'Planejada',
    })
    seed('dp_labor_charges', {
      tipo_encargo: 'FGTS',
      competencia: '2025-07',
      valor: '1360.00',
      data_vencimento: '2025-08-20',
      empresa: 'Velora Log',
      situacao: 'Em Aberto',
    })
    seed('dp_labor_charges', {
      tipo_encargo: 'INSS',
      competencia: '2025-07',
      valor: '2380.00',
      data_vencimento: '2025-08-20',
      empresa: 'Velora Log',
      situacao: 'Em Aberto',
    })
    seed('dp_labor_charges', {
      tipo_encargo: 'IRRF',
      competencia: '2025-07',
      valor: '450.00',
      data_vencimento: '2025-08-20',
      empresa: 'Velora Log',
      situacao: 'Em Aberto',
    })
    seed('dp_occupational_exams', {
      employee_name: 'Carlos Eduardo Pereira',
      tipo_exame: 'Admissional',
      data_realizacao: '2024-01-10',
      data_validade: '2025-01-10',
      resultado: 'Apto',
      medico: 'Dr. Silva',
      clinica: 'Clinica Medica',
      situacao: 'Vencido',
    })
    seed('dp_occupational_exams', {
      employee_name: 'Marcos Vinicius Rocha',
      tipo_exame: 'Periódico',
      data_realizacao: '2025-06-15',
      data_validade: '2026-06-15',
      resultado: 'Apto',
      medico: 'Dr. Santos',
      clinica: 'Clinica Medica',
      situacao: 'Válido',
    })
    seed('dp_uniforms_epis', {
      employee_name: 'Marcos Vinicius Rocha',
      item: 'Botina de Segurança',
      tipo: 'EPI',
      categoria: 'Calçado',
      data_entrega: '2024-06-10',
      quantidade: 1,
      ca: 'CA-12345',
      situacao: 'Entregue',
    })

    seed('sst_pgr', {
      documento: 'PGR 2025',
      versao: '1.0',
      data_elaboracao: '2025-01-01',
      data_revisao: '2025-01-15',
      data_validade: '2026-01-01',
      responsavel: 'João Santos',
      situacao: 'Ativo',
    })
    seed('sst_non_conformities', {
      descricao: 'Funcionário sem EPI adequado',
      origem: 'Inspeção',
      gravidade: 'Alta',
      area_responsavel: 'Operacional',
      responsavel: 'João Santos',
      prazo: '2025-08-15',
      data_criacao: '2025-07-20',
      situacao: 'Aberta',
    })
    seed('sst_action_plans', {
      titulo: 'Corrigir entrega de EPIs',
      origem: 'Não Conformidade',
      prioridade: 'Alta',
      responsavel: 'João Santos',
      data_inicio: '2025-07-21',
      data_fim: '2025-08-15',
      progresso: 30,
      situacao: 'Em Andamento',
    })
    seed('sst_aso', {
      employee_name: 'Carlos Eduardo Pereira',
      tipo_aso: 'Periódico',
      data_realizacao: '2024-01-10',
      data_validade: '2025-01-10',
      resultado: 'Apto',
      medico: 'Dr. Silva',
      clinica: 'Clinica Medica',
      situacao: 'Vencido',
    })
    seed('sst_epis', {
      employee_name: 'Carlos Eduardo Pereira',
      item: 'Capacete de Segurança',
      ca: 'CA-54321',
      data_entrega: '2024-06-10',
      quantidade: 1,
      situacao: 'Entregue',
    })
    seed('sst_indicators', {
      indicador: 'Taxa de Acidentes',
      categoria: 'Acidentes',
      periodo: '2025-07',
      valor: '0',
      meta: '0',
      unidade: 'ocorrências',
      responsavel: 'João Santos',
      situacao: 'Ativo',
    })
  },
  (app) => {},
)
