migrate(
  (app) => {
    function seed(colName, data, idField) {
      try {
        if (idField) {
          app.findFirstRecordByData(colName, idField, data[idField])
          return
        }
      } catch (_) {}
      var col = app.findCollectionByNameOrId(colName)
      var rec = new Record(col)
      var keys = Object.keys(data)
      for (var j = 0; j < keys.length; j++) rec.set(keys[j], data[keys[j]])
      app.save(rec)
    }

    seed(
      'dp_tax_tables_versioned',
      {
        tipo: 'inss',
        versao: '2024',
        vigencia_inicio: '2024-01-01',
        vigencia_fim: '2024-12-31',
        tabela_dados: JSON.stringify([
          { min: 0, max: 1412.0, rate: 7.5, deduction: 0 },
          { min: 1412.01, max: 2666.68, rate: 9, deduction: 21.18 },
          { min: 2666.69, max: 4000.03, rate: 12, deduction: 101.18 },
          { min: 4000.04, max: 7786.02, rate: 14, deduction: 181.18 },
        ]),
        teto: '908.85',
        aliquota: '14',
        situacao: 'Ativo',
      },
      'tipo',
    )

    seed(
      'dp_tax_tables_versioned',
      {
        tipo: 'irrf',
        versao: '2024',
        vigencia_inicio: '2024-01-01',
        vigencia_fim: '2024-12-31',
        tabela_dados: JSON.stringify([
          { min: 0, max: 2259.2, rate: 0, deduction: 0 },
          { min: 2259.21, max: 2826.65, rate: 7.5, deduction: 169.44 },
          { min: 2826.66, max: 3751.05, rate: 15, deduction: 381.44 },
          { min: 3751.06, max: 4664.68, rate: 22.5, deduction: 662.77 },
          { min: 4664.69, max: 999999, rate: 27.5, deduction: 896.0 },
        ]),
        aliquota: '27.5',
        deducao: '896',
        dependent_deduction: '189.59',
        situacao: 'Ativo',
      },
      'tipo',
    )

    seed(
      'dp_tax_tables_versioned',
      {
        tipo: 'fgts',
        versao: '2024',
        vigencia_inicio: '2024-01-01',
        vigencia_fim: '9999-12-31',
        aliquota: '8',
        situacao: 'Ativo',
      },
      'tipo',
    )

    var esocialEvents = ['S-2200', 'S-2205', 'S-2206', 'S-2230', 'S-1200', 'S-1210', 'S-2299']
    for (var i = 0; i < esocialEvents.length; i++) {
      seed('dp_esocial_layouts', {
        versao_layout: 'S-1.3',
        tipo_evento: esocialEvents[i],
        descricao: 'Layout eSocial ' + esocialEvents[i] + ' versao S-1.3',
        layout_def: JSON.stringify({ evento: esocialEvents[i], versao: 'S-1.3' }),
        validation_rules: JSON.stringify({ required: true }),
        vigencia_inicio: '2024-01-01',
        situacao: 'Ativo',
      })
    }

    seed('dp_unions', {
      nome: 'Sindicato dos Trabalhadores em Logistica',
      codigo: 'STL-001',
      cnpj: '12.345.678/0001-90',
      categoria: 'Logistica',
      data_base: '2024-09-01',
      piso_salarial: '2800',
      situacao: 'Ativo',
    })

    seed('dp_collective_agreements', {
      titulo: 'Convencao Coletiva 2024 - Logistica',
      sindicato_nome: 'Sindicato dos Trabalhadores em Logistica',
      tipo: 'convencao',
      data_inicio: '2024-09-01',
      data_fim: '2025-08-31',
      reajuste_percentual: '5',
      piso_salarial: '2800',
      beneficios: JSON.stringify([]),
      adicionais: JSON.stringify([]),
      situacao: 'Ativo',
    })

    seed('dp_bank_hours_ledger', {
      employee_name: 'Carlos Eduardo Pereira',
      employee_id: '',
      data: '2025-08-15',
      tipo: 'credito',
      descricao: 'Horas extras - ponto',
      minutos: 120,
      saldo_anterior: 0,
      saldo_atual: 120,
      validade: '2026-08-15',
      origem: 'ponto',
      aprovado: true,
      aprovador: 'Admin',
      situacao: 'Ativo',
    })

    seed('dp_fgts_digital', {
      competencia: '2025-08',
      tipo: 'mensal',
      employee_name: 'Carlos Eduardo Pereira',
      base_calculo: '4500',
      aliquota: '8',
      valor_devido: '360',
      data_vencimento: '2025-09-07',
      situacao: 'Em Aberto',
      empresa: 'Velora Log',
      divergencia: false,
    })

    $ai.agents.define(app, {
      slug: 'adapta-dp',
      name: 'ADAPTA DP',
      description:
        'Assistente de Departamento Pessoal com base em dados reais de folha, ponto, férias, rescisões, eSocial e encargos.',
      systemPrompt:
        'Voce e o ADAPTA DP, assistente especializado em Departamento Pessoal. Responda perguntas sobre custo de folha, horas extras, ferias proximas do vencimento, centros de custo, eventos eSocial, divergencias entre folha e financeiro, provisoes, encargos, consignados e sindicatos. Respeite LGPD: nunca exponha dados medicos, salarios individuais ou dados protegidos sem permissao explicita. Use apenas dados autorizados pelo perfil do usuario. Gestores veem apenas sua equipe. SUP ve toda a empresa.',
      tier: 'fast',
      tools: [
        { collection: 'rh_employees', perms: { list: true, read: true } },
        { collection: 'rh_payroll', perms: { list: true, read: true } },
        { collection: 'rh_payroll_events', perms: { list: true, read: true } },
        { collection: 'rh_time_records', perms: { list: true, read: true } },
        { collection: 'rh_scales', perms: { list: true, read: true } },
        { collection: 'rh_vacations', perms: { list: true, read: true } },
        { collection: 'rh_benefits', perms: { list: true, read: true } },
        { collection: 'rh_employee_benefits', perms: { list: true, read: true } },
        { collection: 'dp_admissions', perms: { list: true, read: true } },
        { collection: 'dp_work_contracts', perms: { list: true, read: true } },
        { collection: 'dp_leaves', perms: { list: true, read: true } },
        { collection: 'dp_13th_salary', perms: { list: true, read: true } },
        { collection: 'dp_labor_charges', perms: { list: true, read: true } },
        { collection: 'dp_esocial_events', perms: { list: true, read: true } },
        { collection: 'rh_dismissals', perms: { list: true, read: true } },
        { collection: 'dp_bank_hours_ledger', perms: { list: true, read: true } },
        { collection: 'dp_fgts_digital', perms: { list: true, read: true } },
        { collection: 'dp_consignments', perms: { list: true, read: true } },
        { collection: 'dp_provisions', perms: { list: true, read: true } },
        { collection: 'dp_contract_changes', perms: { list: true, read: true } },
        { collection: 'dp_unions', perms: { list: true, read: true } },
        { collection: 'dp_collective_agreements', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'ADAPTA DP deve respeitar LGPD: dados medicos, salarios individuais e dados pessoais sensiveis so sao exibidos com permissao explicita. Gestores veem apenas sua equipe. SUP ve toda a empresa. Nunca recomende hardcoded de valores legais - sempre referencie tabelas versionadas.',
          },
        },
      ],
    })

    console.log('0123: DP Enterprise seeds and ADAPTA DP agent created')
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'adapta-dp')
    } catch (_) {}
  },
)
