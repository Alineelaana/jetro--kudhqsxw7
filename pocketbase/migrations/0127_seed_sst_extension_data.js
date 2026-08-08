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
      'sst_investigations',
      {
        titulo: 'Investigacao - Acidente com Empilhadeira',
        accident_id: '',
        employee_name: 'Marcos Vinicius Rocha',
        tipo_evento: 'Acidente',
        data_evento: '2025-07-20',
        data_investigacao: '2025-07-22',
        metodologia: '5 Porquês',
        causas_imediatas: JSON.stringify([
          'Operação sem treinamento vigente',
          'Empilhadeira com freio desregulado',
        ]),
        causas_basicas: JSON.stringify([
          'Treinamento NR-11 vencido',
          'Manutenção preventiva não executada',
        ]),
        causas_organizacionais: JSON.stringify([
          'Falta de plano de manutenção',
          'Controle de validade de treinamento ineficiente',
        ]),
        plano_acao: JSON.stringify([
          {
            acao: 'Renovar treinamento NR-11',
            responsavel: 'Joao Santos',
            prazo: '2025-09-01',
            status: 'Em Andamento',
          },
          {
            acao: 'Manutenção corretiva da empilhadeira',
            responsavel: 'Manutenção',
            prazo: '2025-08-15',
            status: 'Concluido',
          },
          {
            acao: 'Implementar controle de validade de treinamentos',
            responsavel: 'RH',
            prazo: '2025-10-01',
            status: 'Pendente',
          },
        ]),
        responsavel: 'Joao Santos',
        status_investigacao: 'Concluida',
        conclusao: 'Acidente evitável com treinamento vigente e manutenção preventiva adequada.',
        situacao: 'Ativo',
      },
      'titulo = "Investigacao - Acidente com Empilhadeira"',
    )

    seed(
      'sst_ppp',
      {
        employee_name: 'Marcos Vinicius Rocha',
        employee_id: '',
        empresa: 'Velora Log',
        filial: 'Matriz',
        funcao: 'Motorista',
        atividade: 'Direcao de veiculos de carga',
        setor: 'Operacional',
        ambiente: 'Cabine do veiculo',
        data_admissao: '2023-01-15',
        data_demissao: '',
        agentes_nocivos: JSON.stringify(['Vibracao', 'Ruido 82 dB']),
        epc: JSON.stringify(['Cinto de seguranca']),
        epi: JSON.stringify(['Protetor auricular', 'Calçado de seguranca']),
        exposicoes: JSON.stringify([
          { agente: 'Vibracao', tipo: 'Habitual', intensidade: 'Moderada' },
        ]),
        responsaveis_tecnicos: JSON.stringify(['Eng. Joao Santos - CREA-ES 12345']),
        ltcat_ref: 'LTCAT 2025',
        pgr_ref: 'PGR 2025',
        data_emissao: '2025-08-01',
        data_validade: '2026-08-01',
        situacao: 'Ativo',
      },
      'employee_name = "Marcos Vinicius Rocha" && empresa = "Velora Log"',
    )

    seed(
      'sst_obligations',
      {
        titulo: 'Revisão PGR Anual',
        tipo_obrigacao: 'PGR',
        nr_ref: 'NR-1',
        empresa: 'Velora Log',
        filial: 'Matriz',
        responsavel: 'Joao Santos',
        data_prevista: '2026-01-15',
        periodicidade: 'Anual',
        proxima_data: '2027-01-15',
        prioridade: 'Alta',
        situacao: 'Agendada',
      },
      'titulo = "Revisão PGR Anual"',
    )

    seed(
      'sst_obligations',
      {
        titulo: 'Renovação LTCAT',
        tipo_obrigacao: 'LTCAT',
        nr_ref: 'NR-9',
        empresa: 'Velora Log',
        filial: 'Matriz',
        responsavel: 'Joao Santos',
        data_prevista: '2026-01-15',
        periodicidade: 'Anual',
        proxima_data: '2027-01-15',
        prioridade: 'Alta',
        situacao: 'Agendada',
      },
      'titulo = "Renovação LTCAT"',
    )

    seed(
      'sst_obligations',
      {
        titulo: 'Treinamento NR-11 - Motoristas',
        tipo_obrigacao: 'Treinamento',
        nr_ref: 'NR-11',
        empresa: 'Velora Log',
        filial: 'Matriz',
        responsavel: 'Joao Santos',
        data_prevista: '2025-09-15',
        periodicidade: 'Bienal',
        proxima_data: '2027-09-15',
        prioridade: 'Critica',
        situacao: 'Pendente',
      },
      'titulo = "Treinamento NR-11 - Motoristas"',
    )

    seed(
      'sst_obligations',
      {
        titulo: 'Inspeção Empilhadeiras',
        tipo_obrigacao: 'Inspeção',
        nr_ref: 'NR-12',
        empresa: 'Velora Log',
        filial: 'Matriz',
        responsavel: 'Joao Santos',
        data_prevista: '2025-10-01',
        periodicidade: 'Semestral',
        proxima_data: '2026-04-01',
        prioridade: 'Media',
        situacao: 'Pendente',
      },
      'titulo = "Inspeção Empilhadeiras"',
    )

    seed(
      'sst_obligations',
      {
        titulo: 'Simulado de Emergência',
        tipo_obrigacao: 'Simulado',
        nr_ref: 'NR-23',
        empresa: 'Velora Log',
        filial: 'Matriz',
        responsavel: 'Joao Santos',
        data_prevista: '2025-11-01',
        periodicidade: 'Semestral',
        proxima_data: '2026-05-01',
        prioridade: 'Media',
        situacao: 'Pendente',
      },
      'titulo = "Simulado de Emergência"',
    )

    seed(
      'sst_obligations',
      {
        titulo: 'Reunião Mensal CIPA',
        tipo_obrigacao: 'CIPA',
        nr_ref: 'NR-5',
        empresa: 'Velora Log',
        filial: 'Matriz',
        responsavel: 'Carlos Eduardo Pereira',
        data_prevista: '2025-09-01',
        periodicidade: 'Mensal',
        proxima_data: '2025-10-01',
        prioridade: 'Media',
        situacao: 'Agendada',
      },
      'titulo = "Reunião Mensal CIPA"',
    )

    seed(
      'sst_audit_checklists',
      {
        titulo: 'Auditoria Interna NR-1 - GRO/PGR',
        tipo_auditoria: 'Interna',
        nr_ref: 'NR-1',
        empresa: 'Velora Log',
        filial: 'Matriz',
        auditor: 'Joao Santos',
        data_auditoria: '2025-08-15',
        itens_checklist: JSON.stringify([
          { item: 'PGR documentado e assinado', conforme: true, evidencia: 'Documento PGR 2025' },
          { item: 'Inventário de riscos atualizado', conforme: true, evidencia: 'Inventário 2025' },
          { item: 'Plano de ação com prazos', conforme: false, evidencia: '3 ações atrasadas' },
          { item: 'Revisão periódica programada', conforme: true, evidencia: 'Agenda 2026-01' },
          { item: 'Responsáveis designados', conforme: true, evidencia: 'Designação formal' },
        ]),
        achados: JSON.stringify([
          'Plano de ação com 3 itens atrasados',
          'Necessário atualizar GHE Motoristas',
        ]),
        nao_conformidades: JSON.stringify(['NC-001: Ações PGR atrasadas']),
        pontuacao: '80',
        conformidade_percent: '80',
        responsavel: 'Joao Santos',
        situacao: 'Concluida',
      },
      'titulo = "Auditoria Interna NR-1 - GRO/PGR"',
    )

    seed(
      'sst_nr12_machines',
      {
        maquina: 'Empilhadeira Toyota 8FGU25',
        codigo: 'EQP-001',
        setor: 'Operacional',
        area: 'Galpao Operacional',
        tipo: 'Empilhadeira a gas',
        fabricante: 'Toyota',
        modelo: '8FGU25',
        num_serie: 'SN-12345',
        riscos: JSON.stringify(['Esmagamento', 'Queda de carga', 'Ruido', 'Vibracao']),
        protecoes: JSON.stringify(['Capota protetora (ROPS)', 'Cinto de seguranca']),
        dispositivos_seguranca: JSON.stringify([
          'Freio de servico',
          'Freio de estacionamento',
          'Buzina',
          'Luz de reversa',
        ]),
        ultima_inspecao: '2025-06-01',
        proxima_inspecao: '2025-12-01',
        capacitacao_req: 'NR-11 - Movimentação de Cargas',
        bloqueio: '',
        interdiacao: '',
        responsavel: 'Joao Santos',
        situacao: 'Ativo',
      },
      'maquina = "Empilhadeira Toyota 8FGU25"',
    )

    seed(
      'sst_nr10_electrical',
      {
        employee_name: 'Carlos Eduardo Pereira',
        funcao: 'Analista Administrativo',
        setor: 'Administrativo',
        autorizacao: 'AUT-001',
        data_autorizacao: '2025-01-15',
        validade_autorizacao: '2026-01-15',
        treinamento: 'NR-10 - Segurança em Instalações Elétricas',
        data_treinamento: '2025-01-10',
        validade_treinamento: '2027-01-10',
        prontuario: 'PRT-NR10-001',
        procedimentos: JSON.stringify(['Lockout/Tagout', 'Inspeção visual pré-operação']),
        riscos: JSON.stringify(['Choque elétrico', 'Arco elétrico']),
        instalacao: 'Quadro de distribuição principal',
        tensao: '220V',
        nivel_risco: 'Medio',
        responsavel: 'Joao Santos',
        situacao: 'Ativo',
      },
      'employee_name = "Carlos Eduardo Pereira" && autorizacao = "AUT-001"',
    )

    seed(
      'sst_nr15_insalubridade',
      {
        employee_name: 'Marcos Vinicius Rocha',
        funcao: 'Motorista',
        setor: 'Operacional',
        ambiente: 'Cabine do veiculo',
        agente: 'Ruido',
        tipo_agente: 'Fisico',
        intensidade: '82',
        unidade: 'dB(A)',
        limite_tolerancia: '85 dB(A) para 8h',
        base_legal: 'NR-15 - Anexo 1 (Ruido)',
        grau_insalubridade: 'Não insalubre (abaixo do LT)',
        adicional: 'Não aplicável',
        data_avaliacao: '2025-08-01',
        avaliador: 'Eng. Joao Santos',
        responsavel_tecnico: 'Eng. Joao Santos - CREA-ES 12345',
        ltcat_ref: 'LTCAT 2025',
        pgr_ref: 'PGR 2025',
        epc: JSON.stringify(['Enclausuramento da cabine']),
        epi: JSON.stringify(['Protetor auricular tipo concha']),
        situacao: 'Ativo',
      },
      'employee_name = "Marcos Vinicius Rocha" && agente = "Ruido"',
    )

    seed(
      'sst_nr16_periculosidade',
      {
        employee_name: 'Marcos Vinicius Rocha',
        funcao: 'Motorista',
        setor: 'Operacional',
        ambiente: 'Abastecimento de veiculos',
        atividade: 'Transporte e abastecimento de combustivel',
        tipo_perigo: 'Liquidos inflamaveis',
        base_legal: 'NR-16 - Anexo 2',
        adicional: '30% sobre o salario base',
        data_avaliacao: '2025-08-01',
        avaliador: 'Eng. Joao Santos',
        responsavel_tecnico: 'Eng. Joao Santos - CREA-ES 12345',
        riscos: JSON.stringify(['Inflamabilidade', 'Toxicidade']),
        epc: JSON.stringify(['Extintor proximo', 'Sinalização de area']),
        epi: JSON.stringify(['Luva nitrilica', 'Calçado antiestatico']),
        situacao: 'Ativo',
      },
      'employee_name = "Marcos Vinicius Rocha" && tipo_perigo = "Liquidos inflamaveis"',
    )

    seed(
      'sst_nr13_boilers',
      {
        equipamento: 'Caldeira de vapor horizontal',
        codigo: 'CLD-001',
        categoria: 'Categoria A',
        setor: 'Utilidades',
        area: 'Casa de Caldeiras',
        fabricante: 'Bosch',
        num_registro: 'REG-CLD-001',
        pressao_max: '8 bar',
        capacidade: '500 kg/h',
        data_instalacao: '2020-01-15',
        ultima_inspecao: '2025-06-15',
        proxima_inspecao: '2026-06-15',
        inspetor: 'Eng. Joao Santos',
        responsavel_tecnico: 'Eng. Joao Santos',
        registro_crea: 'CREA-ES 12345',
        prontuario: JSON.stringify([
          'ART de instalação',
          'Relatorio de inspecao 2025',
          'Certificado de seguranca',
        ]),
        documentos_tecnicos: JSON.stringify(['Manual do fabricante', 'Diagrama de tubulacao']),
        situacao: 'Ativo',
      },
      'equipamento = "Caldeira de vapor horizontal"',
    )

    seed(
      'sst_nr11_material_handling',
      {
        operador: 'Marcos Vinicius Rocha',
        funcao: 'Motorista',
        equipamento: 'Empilhadeira Toyota 8FGU25',
        tipo_equipamento: 'Empilhadeira',
        codigo: 'EQP-001',
        setor: 'Operacional',
        autorizacao: 'AUT-NR11-001',
        data_autorizacao: '2025-01-15',
        validade_autorizacao: '2026-01-15',
        treinamento: 'NR-11 - Movimentação de Cargas',
        data_treinamento: '2023-01-15',
        validade_treinamento: '2025-01-15',
        ultima_inspecao: '2025-06-01',
        proxima_inspecao: '2025-12-01',
        riscos: JSON.stringify(['Esmagamento', 'Queda de carga']),
        responsavel: 'Joao Santos',
        situacao: 'Ativo',
      },
      'operador = "Marcos Vinicius Rocha" && equipamento = "Empilhadeira Toyota 8FGU25"',
    )
  },
  (app) => {},
)
