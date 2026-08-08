migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var A = [
      new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
      new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
    ]
    function T(n) {
      return new TextField({ name: n })
    }
    function N(n) {
      return new NumberField({ name: n })
    }
    function J(n) {
      return new JSONField({ name: n })
    }
    function B(n) {
      return new BoolField({ name: n })
    }
    function S(n, v) {
      return new SelectField({ name: n, values: v, maxSelect: 1 })
    }
    function mk(name, fields, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: SA,
          fields: fields.concat(A),
          indexes: indexes || [],
        }),
      )
    }
    function addFields(colName, fields) {
      var col = app.findCollectionByNameOrId(colName)
      for (var i = 0; i < fields.length; i++) {
        if (!col.fields.getByName(fields[i].name)) col.fields.add(fields[i])
      }
      app.save(col)
    }

    mk(
      'dp_bank_hours_ledger',
      [
        T('employee_name'),
        T('employee_id'),
        T('data'),
        S('tipo', ['credito', 'debito', 'ajuste', 'compensacao', 'expiracao']),
        T('descricao'),
        N('minutos'),
        N('saldo_anterior'),
        N('saldo_atual'),
        T('validade'),
        T('origem'),
        B('aprovado'),
        T('aprovador'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_bhl_emp ON dp_bank_hours_ledger (employee_name)'],
    )

    mk(
      'dp_fgts_digital',
      [
        T('competencia'),
        S('tipo', ['mensal', 'rescisorio']),
        T('employee_name'),
        T('employee_id'),
        T('base_calculo'),
        T('aliquota'),
        T('valor_devido'),
        T('valor_pago'),
        T('data_vencimento'),
        T('data_pagamento'),
        T('guia_numero'),
        T('esocial_event_id'),
        T('empresa'),
        T('filial'),
        B('divergencia'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_fgts_comp ON dp_fgts_digital (competencia)'],
    )

    mk(
      'dp_tax_tables_versioned',
      [
        S('tipo', ['inss', 'irrf', 'fgts', 'encargos']),
        T('versao'),
        T('vigencia_inicio'),
        T('vigencia_fim'),
        J('tabela_dados'),
        T('aliquota'),
        T('teto'),
        T('deducao'),
        T('dependent_deduction'),
        T('empresa'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_tt_tipo ON dp_tax_tables_versioned (tipo, vigencia_inicio)'],
    )

    mk(
      'dp_consignments',
      [
        T('employee_name'),
        T('employee_id'),
        S('tipo', ['emprestimo', 'consignacao', 'pensao', 'convenio', 'diverso']),
        T('descricao'),
        T('valor_parcela'),
        N('total_parcelas'),
        N('parcelas_pagas'),
        T('valor_total'),
        T('data_inicio'),
        T('data_fim'),
        T('fornecedor'),
        T('conta_contabil'),
        T('competencia'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_cons_emp ON dp_consignments (employee_name)'],
    )

    mk(
      'dp_unions',
      [
        T('nome'),
        T('codigo'),
        T('cnpj'),
        T('categoria'),
        T('data_base'),
        T('piso_salarial'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_un_cod ON dp_unions (codigo)'],
    )

    mk(
      'dp_collective_agreements',
      [
        T('titulo'),
        T('sindicato_id'),
        T('sindicato_nome'),
        S('tipo', ['convencao', 'acordo']),
        T('data_inicio'),
        T('data_fim'),
        T('reajuste_percentual'),
        T('piso_salarial'),
        J('beneficios'),
        J('adicionais'),
        T('empresa'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_ca_sind ON dp_collective_agreements (sindicato_id)'],
    )

    mk(
      'dp_wage_adjustments',
      [
        T('titulo'),
        S('tipo', ['dissidio', 'reajuste', 'retroativo']),
        T('competencia'),
        T('sindicato_nome'),
        T('acordo_id'),
        T('reajuste_percentual'),
        T('data_inicio'),
        T('data_fim'),
        J('reflexos'),
        T('valor_total'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_wa_comp ON dp_wage_adjustments (competencia)'],
    )

    mk(
      'dp_provisions',
      [
        S('tipo', ['ferias', '13', 'encargos', 'beneficios']),
        T('competencia'),
        T('employee_name'),
        T('employee_id'),
        T('valor_base'),
        T('valor_provisao'),
        T('aliquota'),
        T('conta_debito'),
        T('conta_credito'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_prov_comp ON dp_provisions (competencia, tipo)'],
    )

    mk(
      'dp_reinstatements',
      [
        T('employee_name'),
        T('employee_id'),
        T('data_reintegracao'),
        T('data_desligamento_original'),
        T('dismissal_id'),
        T('motivo'),
        J('reflexos'),
        T('esocial_event_id'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_rein_emp ON dp_reinstatements (employee_name)'],
    )

    mk(
      'dp_esocial_layouts',
      [
        T('versao_layout'),
        T('tipo_evento'),
        T('descricao'),
        J('layout_def'),
        J('validation_rules'),
        T('vigencia_inicio'),
        T('vigencia_fim'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_el_tipo ON dp_esocial_layouts (tipo_evento, versao_layout)'],
    )

    mk(
      'dp_payroll_snapshots',
      [
        T('payroll_id'),
        T('competencia'),
        J('snapshot_data'),
        T('hash'),
        T('created_by'),
        T('created_by_name'),
        T('empresa'),
        T('filial'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_ps_payroll ON dp_payroll_snapshots (payroll_id)'],
    )

    mk(
      'dp_contract_changes',
      [
        T('employee_name'),
        T('employee_id'),
        S('change_type', [
          'Salário',
          'Cargo',
          'Função',
          'Jornada',
          'Local',
          'Filial',
          'Centro de Custo',
          'Sindicato',
          'Modalidade',
          'Gestor',
          'Lotação',
        ]),
        T('field_name'),
        T('old_value'),
        T('new_value'),
        T('effective_date'),
        T('vigencia'),
        T('motivo'),
        T('responsavel'),
        T('esocial_event_id'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_cc_emp ON dp_contract_changes (employee_name)'],
    )

    addFields('rh_employees', [
      T('categoria'),
      T('cbo'),
      T('sindicato'),
      T('tipo_vinculo'),
      T('local_trabalho'),
    ])
    addFields('dp_work_contracts', [
      S('modalidade', [
        'Indeterminado',
        'Determinado',
        'Experiência',
        'Temporário',
        'Aprendiz',
        'Estágio',
        'Intermitente',
      ]),
      N('experiencia_dias'),
      T('experiencia_fim'),
    ])
    addFields('rh_scales', [
      S('escala_tipo', [
        '5x2',
        '6x1',
        '12x36',
        'Turno Fixo',
        'Turno Alternado',
        'Horário Flexível',
      ]),
      B('compensacao'),
      B('horario_flexivel'),
    ])
    addFields('rh_payroll_events', [
      J('incidencias'),
      T('formula'),
      T('vigencia_inicio'),
      T('vigencia_fim'),
      T('categoria_rubrica'),
      T('conta_debito'),
      T('conta_credito'),
      T('esocial_codigo'),
      T('centro_custo'),
      T('empresa'),
    ])
    addFields('dp_esocial_events', [
      T('layout_versao'),
      T('recibo'),
      T('protocolo'),
      S('tipo_operacao', ['envio', 'retificacao', 'exclusao']),
    ])
    addFields('rh_dismissals', [
      T('workflow_id'),
      T('calculo_previo'),
      T('aviso_data_inicio'),
      T('aviso_data_fim'),
      J('verbas_rescisorias'),
    ])

    console.log('0122: DP Enterprise collections created and existing extended')
  },
  (app) => {
    var cols = [
      'dp_bank_hours_ledger',
      'dp_fgts_digital',
      'dp_tax_tables_versioned',
      'dp_consignments',
      'dp_unions',
      'dp_collective_agreements',
      'dp_wage_adjustments',
      'dp_provisions',
      'dp_reinstatements',
      'dp_esocial_layouts',
      'dp_payroll_snapshots',
      'dp_contract_changes',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
