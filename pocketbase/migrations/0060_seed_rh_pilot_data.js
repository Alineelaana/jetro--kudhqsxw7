migrate(
  (app) => {
    function seed(colName, data) {
      try {
        app.findFirstRecordByData(colName, 'name', data.name || data.nome_completo)
        return
      } catch (_) {}
      var col = app.findCollectionByNameOrId(colName)
      var rec = new Record(col)
      for (var k in data) {
        rec.set(k, data[k])
      }
      app.save(rec)
    }

    seed('rh_departments', {
      code: '001',
      name: 'Administrativo',
      empresa: 'Velora Log',
      gestor_responsavel: 'Maria Silva',
      centro_custo: 'CC-001',
      description: 'Departamento administrativo',
      situacao: 'Ativo',
    })
    seed('rh_departments', {
      code: '002',
      name: 'Operacional',
      empresa: 'Velora Log',
      gestor_responsavel: 'João Santos',
      centro_custo: 'CC-002',
      description: 'Operações logísticas',
      situacao: 'Ativo',
    })
    seed('rh_departments', {
      code: '003',
      name: 'Comercial',
      empresa: 'Velora Log',
      gestor_responsavel: 'Ana Costa',
      centro_custo: 'CC-003',
      description: 'Equipe comercial',
      situacao: 'Ativo',
    })

    seed('rh_positions', {
      code: 'C001',
      name: 'Analista Administrativo',
      departamento: 'Administrativo',
      faixa_salarial_inicial: '2500',
      faixa_salarial_final: '4500',
      jornada_padrao: '44h',
      escolaridade_minima: 'Superior',
      situacao: 'Ativo',
    })
    seed('rh_positions', {
      code: 'C002',
      name: 'Motorista',
      departamento: 'Operacional',
      faixa_salarial_inicial: '2200',
      faixa_salarial_final: '3500',
      jornada_padrao: '44h',
      escolaridade_minima: 'Ensino Médio',
      situacao: 'Ativo',
    })
    seed('rh_positions', {
      code: 'C003',
      name: 'Coordenador Comercial',
      departamento: 'Comercial',
      faixa_salarial_inicial: '4000',
      faixa_salarial_final: '7000',
      jornada_padrao: '44h',
      escolaridade_minima: 'Superior',
      situacao: 'Ativo',
    })

    seed('rh_employees', {
      nome_completo: 'Carlos Eduardo Pereira',
      cpf: '123.456.789-01',
      matricula: 'EMP-001',
      empresa: 'Velora Log',
      departamento: 'Administrativo',
      cargo: 'Analista Administrativo',
      data_admissao: '2024-01-15',
      tipo_contrato: 'CLT',
      salario: '3200',
      situacao: 'Ativo',
      telefone: '(27) 99999-1111',
      email_pessoal: 'carlos@email.com',
    })
    seed('rh_employees', {
      nome_completo: 'Marcos Vinicius Rocha',
      cpf: '234.567.890-12',
      matricula: 'EMP-002',
      empresa: 'Velora Log',
      departamento: 'Operacional',
      cargo: 'Motorista',
      data_admissao: '2023-06-10',
      tipo_contrato: 'CLT',
      salario: '2800',
      situacao: 'Ativo',
      telefone: '(27) 99999-2222',
      email_pessoal: 'marcos@email.com',
    })
    seed('rh_employees', {
      nome_completo: 'Patricia Fernandes Lima',
      cpf: '345.678.901-23',
      matricula: 'EMP-003',
      empresa: 'Velora Log',
      departamento: 'Comercial',
      cargo: 'Coordenador Comercial',
      data_admissao: '2022-03-20',
      tipo_contrato: 'CLT',
      salario: '5500',
      situacao: 'Em Férias',
      telefone: '(27) 99999-3333',
      email_pessoal: 'patricia@email.com',
    })
    seed('rh_employees', {
      nome_completo: 'Roberto Alves Souza',
      cpf: '456.789.012-34',
      matricula: 'EMP-004',
      empresa: 'Velora Log',
      departamento: 'Operacional',
      cargo: 'Motorista',
      data_admissao: '2024-08-01',
      tipo_contrato: 'CLT',
      salario: '2500',
      situacao: 'Em Experiência',
      telefone: '(27) 99999-4444',
      email_pessoal: 'roberto@email.com',
    })
    seed('rh_employees', {
      nome_completo: 'Juliana Costa Ribeiro',
      cpf: '567.890.123-45',
      matricula: 'EMP-005',
      empresa: 'Velora Log',
      departamento: 'Administrativo',
      cargo: 'Analista Administrativo',
      data_admissao: '2023-11-05',
      tipo_contrato: 'CLT',
      salario: '3000',
      situacao: 'Afastado',
      telefone: '(27) 99999-5555',
      email_pessoal: 'juliana@email.com',
    })

    seed('rh_vacations', {
      employee_name: 'Patricia Fernandes Lima',
      data_admissao: '2022-03-20',
      periodo_aquisitivo_inicio: '2024-03-20',
      periodo_aquisitivo_fim: '2025-03-19',
      dias_disponiveis: 30,
      dias_utilizados: 0,
      dias_vendidos: 0,
      data_inicio: '2025-08-01',
      data_fim: '2025-08-30',
      situacao: 'Em Andamento',
    })
    seed('rh_vacations', {
      employee_name: 'Carlos Eduardo Pereira',
      data_admissao: '2024-01-15',
      periodo_aquisitivo_inicio: '2025-01-15',
      periodo_aquisitivo_fim: '2026-01-14',
      dias_disponiveis: 30,
      dias_utilizados: 0,
      dias_vendidos: 0,
      data_prevista: '2026-01-15',
      situacao: 'Disponível',
    })

    seed('rh_benefits', {
      name: 'Vale Transporte',
      tipo_beneficio: 'Vale Transporte',
      fornecedor: 'VR',
      valor: '180',
      participacao_empresa: '100',
      participacao_colaborador: '0',
      situacao: 'Ativo',
    })
    seed('rh_benefits', {
      name: 'Plano de Saúde',
      tipo_beneficio: 'Plano de Saúde',
      fornecedor: 'Unimed',
      valor: '450',
      participacao_empresa: '300',
      participacao_colaborador: '150',
      situacao: 'Ativo',
    })

    seed('rh_trainings', {
      name: 'Segurança no Trabalho',
      categoria: 'Segurança',
      instrutor: 'Marcos Tavares',
      modalidade: 'Presencial',
      data: '2025-09-15',
      horario: '08:00',
      carga_horaria: '8h',
      local: 'Sala de Treinamentos',
      obrigatorio: true,
      situacao: 'Planejado',
    })
    seed('rh_trainings', {
      name: 'NR-11 - Movimentação de Cargas',
      categoria: 'Operacional',
      instrutor: 'Ana Paula Mendes',
      modalidade: 'Online',
      data: '2025-08-20',
      horario: '14:00',
      carga_horaria: '4h',
      local: 'Plataforma Online',
      obrigatorio: true,
      situacao: 'Inscrições Abertas',
    })

    seed('rh_payroll', {
      competencia: '2025-07',
      empresa: 'Velora Log',
      tipo_folha: 'Mensal',
      situacao: 'Fechada',
      valor_bruto: '17000',
      valor_liquido: '12500',
      total_descontos: '4500',
      quantidade_colaboradores: 5,
      responsavel: 'Maria Silva',
    })

    seed('rh_time_records', {
      employee_name: 'Carlos Eduardo Pereira',
      data: '2025-08-04',
      entrada: '08:00',
      saida_intervalo: '12:00',
      retorno_intervalo: '13:00',
      saida: '17:00',
      horas_trabalhadas: '08:00',
      situacao: 'Aprovado',
    })
    seed('rh_time_records', {
      employee_name: 'Marcos Vinicius Rocha',
      data: '2025-08-04',
      entrada: '06:00',
      saida_intervalo: '11:00',
      retorno_intervalo: '12:00',
      saida: '16:00',
      horas_trabalhadas: '09:00',
      horas_extras: '01:00',
      situacao: 'Pendente',
    })

    seed('rh_payroll_events', {
      code: 'E001',
      name: 'Salário Base',
      tipo: 'Provento',
      forma_calculo: 'Fixo',
      incide_inss: true,
      incide_fgts: true,
      incide_irrf: true,
      situacao: 'Ativo',
    })
    seed('rh_payroll_events', {
      code: 'D001',
      name: 'INSS',
      tipo: 'Desconto',
      forma_calculo: 'Percentual',
      percentual: '14',
      incide_inss: false,
      incide_fgts: false,
      incide_irrf: false,
      situacao: 'Ativo',
    })
  },
  (app) => {},
)
