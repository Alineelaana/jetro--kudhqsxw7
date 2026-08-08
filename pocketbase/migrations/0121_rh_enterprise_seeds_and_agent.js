migrate(
  (app) => {
    function seed(colName, data) {
      try {
        if (data.name) app.findFirstRecordByData(colName, 'name', data.name)
        else if (data.titulo) app.findFirstRecordByData(colName, 'titulo', data.titulo)
        return
      } catch (_) {}
      var col = app.findCollectionByNameOrId(colName)
      var rec = new Record(col)
      for (var k in data) rec.set(k, data[k])
      app.save(rec)
    }

    seed('rh_competencies', {
      name: 'Lideranca de Equipe',
      code: 'COMP-001',
      description: 'Capacidade de liderar e motivar equipes',
      tipo: 'Lideranca',
      categoria: 'Gestao',
      nivel_maximo: 5,
      situacao: 'Ativo',
    })
    seed('rh_competencies', {
      name: 'Comunicacao Eficaz',
      code: 'COMP-002',
      description: 'Comunicacao clara e objetiva',
      tipo: 'Comportamental',
      categoria: 'Interpessoal',
      nivel_maximo: 5,
      situacao: 'Ativo',
    })
    seed('rh_competencies', {
      name: 'Gestao de Projetos',
      code: 'COMP-003',
      description: 'Planejamento e execucao de projetos',
      tipo: 'Tecnica',
      categoria: 'Gestao',
      nivel_maximo: 5,
      situacao: 'Ativo',
    })
    seed('rh_competencies', {
      name: 'Pensamento Analitico',
      code: 'COMP-004',
      description: 'Analise de dados e tomada de decisao',
      tipo: 'Tecnica',
      categoria: 'Cognitivo',
      nivel_maximo: 5,
      situacao: 'Ativo',
    })
    seed('rh_competencies', {
      name: 'Trabalho em Equipe',
      code: 'COMP-005',
      description: 'Colaboracao e cooperacao',
      tipo: 'Comportamental',
      categoria: 'Interpessoal',
      nivel_maximo: 5,
      situacao: 'Ativo',
    })

    seed('rh_positions_slots', {
      cargo_name: 'Analista Administrativo',
      employee_name: 'Carlos Eduardo Pereira',
      departamento: 'Administrativo',
      tipo_posicao: 'Ocupada',
      situacao: 'Ativo',
    })
    seed('rh_positions_slots', {
      cargo_name: 'Motorista',
      employee_name: 'Marcos Vinicius Rocha',
      departamento: 'Operacional',
      tipo_posicao: 'Ocupada',
      situacao: 'Ativo',
    })
    seed('rh_positions_slots', {
      cargo_name: 'Coordenador Comercial',
      employee_name: 'Patricia Fernandes Lima',
      departamento: 'Comercial',
      tipo_posicao: 'Ocupada',
      situacao: 'Ativo',
    })
    seed('rh_positions_slots', {
      cargo_name: 'Motorista',
      departamento: 'Operacional',
      tipo_posicao: 'Vaga',
      situacao: 'Ativo',
    })
    seed('rh_positions_slots', {
      cargo_name: 'Analista Administrativo',
      departamento: 'Administrativo',
      tipo_posicao: 'Planejada',
      situacao: 'Ativo',
    })

    seed('rh_succession_plans', {
      posicao_critica: 'Coordenador Comercial',
      cargo_name: 'Coordenador Comercial',
      employee_name: 'Carlos Eduardo Pereira',
      nivel_prontidao: 'Pronto em 1 ano',
      risco_perda: 'Medio',
      impacto: 'Alto',
      gestor_responsavel: 'Maria Silva',
      situacao: 'Ativo',
    })
    seed('rh_succession_plans', {
      posicao_critica: 'Gerente Operacional',
      cargo_name: 'Motorista',
      employee_name: 'Marcos Vinicius Rocha',
      nivel_prontidao: 'Em desenvolvimento',
      risco_perda: 'Baixo',
      impacto: 'Medio',
      gestor_responsavel: 'Joao Santos',
      situacao: 'Ativo',
    })

    seed('rh_feedback', {
      employee_name: 'Carlos Eduardo Pereira',
      autor_name: 'Maria Silva',
      tipo: 'Positivo',
      data: '2025-08-01',
      contexto: 'Excelente desempenho no mes',
      acao_esperada: 'Manter o ritmo',
      status: 'Concluido',
    })
    seed('rh_feedback', {
      employee_name: 'Marcos Vinicius Rocha',
      autor_name: 'Joao Santos',
      tipo: 'Desenvolvimento',
      data: '2025-08-05',
      contexto: 'Pode melhorar a pontualidade',
      acao_esperada: 'Chegar 10 min antes',
      status: 'Em Andamento',
    })

    seed('rh_recognitions', {
      employee_name: 'Carlos Eduardo Pereira',
      autor_name: 'Maria Silva',
      tipo: 'Elogio',
      titulo: 'Destaque do Mes',
      descricao: 'Por excelencia nas entregas',
      data: '2025-08-01',
      visibilidade: 'Publico',
      situacao: 'Ativo',
    })

    seed('rh_pdi', {
      employee_name: 'Carlos Eduardo Pereira',
      cargo_atual: 'Analista Administrativo',
      cargo_desejado: 'Coordenador Administrativo',
      objetivo_geral: 'Desenvolver habilidades de gestao',
      responsavel: 'Maria Silva',
      gestor: 'Maria Silva',
      data_inicio: '2025-01-01',
      data_fim: '2025-12-31',
      progresso: 35,
      situacao: 'Ativo',
    })

    seed('rh_performance_cycles', {
      titulo: 'Avaliacao 2025 - Semestre 2',
      competencia: '2025-S2',
      ciclo: 'Semestral',
      data_abertura: '2025-07-01',
      modalidade: '360',
      situacao: 'Aberta',
    })

    $ai.agents.define(app, {
      slug: 'adapta-rh',
      name: 'ADAPTA RH',
      description: 'Assistente de Gestao de Pessoas com base em dados reais do RH.',
      systemPrompt:
        'Voce e o ADAPTA RH, assistente de gestao de pessoas. Responda perguntas sobre turnover, promocoes, sucessao, competencias, desempenho, clima e treinamentos. Respeite LGPD: nunca exponha dados medicos, salarios ou dados protegidos sem permissao explicita. Use apenas dados autorizados pelo perfil do usuario.',
      tier: 'fast',
      tools: [
        { collection: 'rh_employees', perms: { list: true, read: true } },
        { collection: 'rh_positions', perms: { list: true, read: true } },
        { collection: 'rh_departments', perms: { list: true, read: true } },
        { collection: 'rh_competencies', perms: { list: true, read: true } },
        { collection: 'rh_employee_competencies', perms: { list: true, read: true } },
        { collection: 'rh_succession_plans', perms: { list: true, read: true } },
        { collection: 'rh_feedback', perms: { list: true, read: true } },
        { collection: 'rh_pdi', perms: { list: true, read: true } },
        { collection: 'rh_performance_evaluations', perms: { list: true, read: true } },
        { collection: 'rh_recognitions', perms: { list: true, read: true } },
        { collection: 'rh_vacations', perms: { list: true, read: true } },
        { collection: 'rh_trainings', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'ADAPTA RH deve respeitar LGPD: dados medicos, salarios e dados pessoais sensiveis so sao exibidos com permissao explicita. Gestores veem apenas sua equipe. SUP ve toda a empresa.',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'adapta-rh')
    } catch (_) {}
  },
)
