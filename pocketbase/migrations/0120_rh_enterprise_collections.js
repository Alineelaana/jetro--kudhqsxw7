migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]
    function mk(n, f, i) {
      try {
        app.findCollectionByNameOrId(n)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: n,
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: f.concat(ad),
          indexes: i || [],
        }),
      )
    }
    function T(n) {
      return { name: n, type: 'text' }
    }
    function N(n) {
      return { name: n, type: 'number' }
    }
    function J(n) {
      return { name: n, type: 'json' }
    }
    function B(n) {
      return { name: n, type: 'bool' }
    }

    mk(
      'rh_competencies',
      [
        T('name'),
        T('code'),
        T('description'),
        {
          name: 'tipo',
          type: 'select',
          values: ['Tecnica', 'Comportamental', 'Lideranca', 'Corporativa', 'Especifica'],
        },
        T('categoria'),
        N('nivel_maximo'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_comp_name ON rh_competencies (name)'],
    )

    mk(
      'rh_cargo_competencies',
      [
        T('cargo_id'),
        T('cargo_name'),
        T('competency_id'),
        T('competency_name'),
        T('tipo_competencia'),
        N('nivel_exigido'),
        N('peso'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_cc_cargo ON rh_cargo_competencies (cargo_id)'],
    )

    mk(
      'rh_employee_competencies',
      [
        T('employee_id'),
        T('employee_name'),
        T('competency_id'),
        T('competency_name'),
        N('nivel_atual'),
        N('nivel_exigido'),
        T('gap'),
        T('data_avaliacao'),
        T('avaliador'),
        T('origem_avaliacao'),
        T('observacoes'),
        T('situacao'),
      ],
      [
        'CREATE INDEX idx_rh_ec_emp ON rh_employee_competencies (employee_id)',
        'CREATE INDEX idx_rh_ec_comp ON rh_employee_competencies (competency_id)',
      ],
    )

    mk(
      'rh_pdi',
      [
        T('employee_id'),
        T('employee_name'),
        T('cargo_atual'),
        T('cargo_desejado'),
        T('competency_gap'),
        T('objetivo_geral'),
        T('responsavel'),
        T('gestor'),
        T('data_inicio'),
        T('data_fim'),
        N('progresso'),
        T('situacao'),
        J('itens'),
        J('historico'),
      ],
      ['CREATE INDEX idx_rh_pdi_emp ON rh_pdi (employee_id)'],
    )

    mk(
      'rh_pdi_items',
      [
        T('pdi_id'),
        T('employee_id'),
        T('employee_name'),
        T('competency_id'),
        T('competency_name'),
        T('objetivo'),
        T('acao'),
        T('treinamento'),
        T('mentor'),
        T('prazo'),
        T('evidencia'),
        N('progresso'),
        T('resultado'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_pdi_item_pdi ON rh_pdi_items (pdi_id)'],
    )

    mk(
      'rh_calibration_sessions',
      [
        T('titulo'),
        T('competencia'),
        T('ciclo_avaliacao'),
        T('gestor_responsavel'),
        T('comite'),
        T('data_sessao'),
        T('justificativa_geral'),
        T('decisao_final'),
        T('revisor_rh'),
        T('situacao'),
        J('ajustes'),
        J('historico'),
      ],
      ['CREATE INDEX idx_rh_cal_sit ON rh_calibration_sessions (situacao)'],
    )

    mk(
      'rh_feedback',
      [
        T('employee_id'),
        T('employee_name'),
        T('autor_id'),
        T('autor_name'),
        {
          name: 'tipo',
          type: 'select',
          values: [
            'Positivo',
            'Desenvolvimento',
            'Reconhecimento',
            'Corretivo',
            '1:1',
            'Acompanhamento',
          ],
        },
        T('data'),
        T('contexto'),
        T('acao_esperada'),
        T('follow_up'),
        T('status'),
        T('observacoes'),
        B('confidencial'),
      ],
      ['CREATE INDEX idx_rh_fb_emp ON rh_feedback (employee_id)'],
    )

    mk(
      'rh_succession_plans',
      [
        T('posicao_critica'),
        T('cargo_id'),
        T('cargo_name'),
        T('employee_id'),
        T('employee_name'),
        {
          name: 'nivel_prontidao',
          type: 'select',
          values: ['Pronto agora', 'Pronto em 1 ano', 'Pronto em 2 anos', 'Em desenvolvimento'],
        },
        T('risco_perda'),
        T('impacto'),
        T('competencias_faltantes'),
        T('plano_desenvolvimento'),
        T('gestor_responsavel'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_suc_emp ON rh_succession_plans (employee_id)'],
    )

    mk(
      'rh_recognitions',
      [
        T('employee_id'),
        T('employee_name'),
        T('autor_id'),
        T('autor_name'),
        { name: 'tipo', type: 'select', values: ['Elogio', 'Badge', 'Premiacao', 'Campanha'] },
        T('titulo'),
        T('descricao'),
        T('data'),
        { name: 'visibilidade', type: 'select', values: ['Publico', 'Privado'] },
        T('campanha'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_rec_emp ON rh_recognitions (employee_id)'],
    )

    mk(
      'rh_onboarding_flows',
      [
        T('employee_id'),
        T('employee_name'),
        T('cargo'),
        T('departamento'),
        T('gestor'),
        T('data_inicio'),
        T('workflow_id'),
        J('etapas'),
        N('progresso'),
        T('avaliacao_30'),
        T('avaliacao_60'),
        T('avaliacao_90'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_onb_emp ON rh_onboarding_flows (employee_id)'],
    )

    mk(
      'rh_offboarding_flows',
      [
        T('employee_id'),
        T('employee_name'),
        T('cargo'),
        T('departamento'),
        T('gestor'),
        T('data_solicitacao'),
        T('data_desligamento'),
        T('tipo_desligamento'),
        T('motivo'),
        T('workflow_id'),
        J('etapas'),
        N('progresso'),
        T('entrevista_desligamento'),
        T('transferencia_conhecimento'),
        T('devolucao_ativos'),
        T('revogacao_acessos'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_off_emp ON rh_offboarding_flows (employee_id)'],
    )

    mk(
      'rh_positions_slots',
      [
        T('cargo_id'),
        T('cargo_name'),
        T('employee_id'),
        T('employee_name'),
        T('departamento'),
        T('gestor_responsavel'),
        T('empresa'),
        T('filial'),
        T('unidade'),
        { name: 'tipo_posicao', type: 'select', values: ['Ocupada', 'Vaga', 'Planejada'] },
        T('data_ocupacao'),
        T('situacao'),
      ],
      [
        'CREATE INDEX idx_rh_ps_cargo ON rh_positions_slots (cargo_id)',
        'CREATE INDEX idx_rh_ps_emp ON rh_positions_slots (employee_id)',
      ],
    )

    mk(
      'rh_performance_cycles',
      [
        T('titulo'),
        T('competencia'),
        T('ciclo'),
        T('data_abertura'),
        T('data_fechamento'),
        {
          name: 'modalidade',
          type: 'select',
          values: ['Auto', 'Gestor', 'Pares', 'Subordinados', '180', '270', '360'],
        },
        J('criterios'),
        J('etapas'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_pc_sit ON rh_performance_cycles (situacao)'],
    )
  },
  (app) => {
    var cols = [
      'rh_competencies',
      'rh_cargo_competencies',
      'rh_employee_competencies',
      'rh_pdi',
      'rh_pdi_items',
      'rh_calibration_sessions',
      'rh_feedback',
      'rh_succession_plans',
      'rh_recognitions',
      'rh_onboarding_flows',
      'rh_offboarding_flows',
      'rh_positions_slots',
      'rh_performance_cycles',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
