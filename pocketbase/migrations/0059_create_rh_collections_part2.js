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
    function F(n) {
      return {
        name: n,
        type: 'file',
        maxSelect: 5,
        maxSize: 5242880,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      }
    }

    mk(
      'rh_payroll',
      [
        T('competencia'),
        T('empresa'),
        T('filial'),
        T('departamento'),
        T('centro_custo'),
        T('tipo_folha'),
        T('situacao'),
        T('valor_bruto'),
        T('valor_liquido'),
        T('total_descontos'),
        T('total_encargos'),
        N('quantidade_colaboradores'),
        T('responsavel'),
        T('observacoes'),
        J('itens'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_rh_pay_sit ON rh_payroll (situacao)',
        'CREATE INDEX idx_rh_pay_comp ON rh_payroll (competencia)',
      ],
    )

    mk(
      'rh_payroll_events',
      [
        T('code'),
        T('name'),
        T('tipo'),
        T('forma_calculo'),
        T('percentual'),
        T('valor_fixo'),
        B('incide_inss'),
        B('incide_fgts'),
        B('incide_irrf'),
        B('integra_contabilidade'),
        T('conta_contabil'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_pe_sit ON rh_payroll_events (situacao)'],
    )

    mk(
      'rh_benefits',
      [
        T('name'),
        T('tipo_beneficio'),
        T('fornecedor'),
        T('valor'),
        T('participacao_empresa'),
        T('participacao_colaborador'),
        T('forma_desconto'),
        T('cargo_elegivel'),
        T('departamento_elegivel'),
        T('data_inicio'),
        T('data_termino'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_ben_sit ON rh_benefits (situacao)'],
    )

    mk(
      'rh_employee_benefits',
      [
        T('employee_id'),
        T('employee_name'),
        T('benefit_id'),
        T('benefit_name'),
        T('valor_empresa'),
        T('valor_descontado'),
        T('data_inclusao'),
        T('data_termino'),
        T('situacao'),
        J('dependentes'),
      ],
      ['CREATE INDEX idx_rh_eb_emp ON rh_employee_benefits (employee_id)'],
    )

    mk(
      'rh_trainings',
      [
        T('name'),
        T('categoria'),
        T('description'),
        T('instrutor'),
        T('instituicao'),
        T('modalidade'),
        T('data'),
        T('horario'),
        T('carga_horaria'),
        T('local'),
        T('valor'),
        T('validade_certificado'),
        B('obrigatorio'),
        T('situacao'),
        J('participantes'),
      ],
      ['CREATE INDEX idx_rh_tr_sit ON rh_trainings (situacao)'],
    )

    mk(
      'rh_training_participants',
      [
        T('training_id'),
        T('training_name'),
        T('employee_id'),
        T('employee_name'),
        T('presenca'),
        T('nota'),
        T('resultado'),
        T('certificado'),
        T('data_validade'),
        T('observacoes'),
      ],
      ['CREATE INDEX idx_rh_tp_emp ON rh_training_participants (employee_id)'],
    )

    mk(
      'rh_documents',
      [
        T('employee_id'),
        T('employee_name'),
        T('categoria'),
        T('documento'),
        T('numero'),
        T('data_emissao'),
        T('data_validade'),
        T('orgao_emissor'),
        T('situacao'),
        F('arquivo'),
      ],
      [
        'CREATE INDEX idx_rh_doc_emp ON rh_documents (employee_id)',
        'CREATE INDEX idx_rh_doc_val ON rh_documents (data_validade)',
      ],
    )

    mk(
      'rh_approvals',
      [
        T('tipo_solicitacao'),
        T('employee_id'),
        T('employee_name'),
        T('solicitante'),
        T('aprovador'),
        T('data_hora'),
        T('valor_anterior'),
        T('valor_novo'),
        T('decisao'),
        T('justificativa'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_appr_sit ON rh_approvals (situacao)'],
    )
  },
  (app) => {
    var cols = [
      'rh_payroll',
      'rh_payroll_events',
      'rh_benefits',
      'rh_employee_benefits',
      'rh_trainings',
      'rh_training_participants',
      'rh_documents',
      'rh_approvals',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
