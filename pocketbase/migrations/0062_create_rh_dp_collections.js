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
      'rh_performance_evaluations',
      [
        T('employee_name'),
        T('employee_id'),
        T('cargo'),
        T('departamento'),
        T('avaliador'),
        T('periodo'),
        T('nota_final'),
        T('tipo_avaliacao'),
        T('observacoes'),
        J('criterios'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_pe_emp ON rh_performance_evaluations (employee_name)'],
    )
    mk(
      'rh_career_plans',
      [
        T('employee_name'),
        T('employee_id'),
        T('cargo_atual'),
        T('cargo_desejado'),
        T('prazo'),
        T('acoes_necessarias'),
        T('sucessor_de'),
        T('observacoes'),
        J('historico_promocoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_cp_emp ON rh_career_plans (employee_name)'],
    )
    mk(
      'rh_climate_surveys',
      [
        T('titulo'),
        T('periodo_inicio'),
        T('periodo_fim'),
        N('participantes'),
        T('taxa_participacao'),
        T('nota_geral'),
        T('observacoes'),
        J('resultados'),
        J('perguntas'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_cs_sit ON rh_climate_surveys (situacao)'],
    )
    mk(
      'rh_internal_communications',
      [
        T('titulo'),
        T('tipo'),
        T('data_publicacao'),
        T('destinatarios'),
        T('conteudo'),
        T('autor'),
        B('destaque'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_ic_sit ON rh_internal_communications (situacao)'],
    )

    mk(
      'dp_admissions',
      [
        T('employee_name'),
        T('cpf'),
        T('cargo'),
        T('departamento'),
        T('data_admissao'),
        T('tipo_contrato'),
        T('salario'),
        T('jornada'),
        T('empresa'),
        T('filial'),
        T('centro_custo'),
        T('gestor'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_dp_adm_emp ON dp_admissions (employee_name)'],
    )
    mk(
      'dp_work_contracts',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_contrato'),
        T('data_inicio'),
        T('data_fim'),
        T('salario'),
        T('jornada'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_dp_wc_emp ON dp_work_contracts (employee_name)'],
    )
    mk(
      'dp_leaves',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_afastamento'),
        T('data_inicio'),
        T('data_fim'),
        T('data_retorno'),
        T('motivo'),
        T('cid'),
        T('atestado_numero'),
        T('medico'),
        T('observacoes'),
        T('situacao'),
        F('atestado'),
      ],
      ['CREATE INDEX idx_dp_lv_emp ON dp_leaves (employee_name)'],
    )
    mk(
      'dp_licenses',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_licenca'),
        T('data_inicio'),
        T('data_fim'),
        T('motivo'),
        T('documento_numero'),
        T('observacoes'),
        T('situacao'),
        F('documento'),
      ],
      ['CREATE INDEX dp_dp_lc_emp ON dp_licenses (employee_name)'],
    )
    mk(
      'dp_13th_salary',
      [
        T('employee_name'),
        T('employee_id'),
        T('competencia'),
        T('valor_primeira'),
        T('valor_segunda'),
        T('data_primeira'),
        T('data_segunda'),
        T('situacao'),
        T('observacoes'),
      ],
      ['CREATE INDEX idx_dp_13_emp ON dp_13th_salary (employee_name)'],
    )
    mk(
      'dp_labor_charges',
      [
        T('tipo_encargo'),
        T('competencia'),
        T('valor'),
        T('data_vencimento'),
        T('data_pagamento'),
        T('empresa'),
        T('filial'),
        T('documento'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_lc_tipo ON dp_labor_charges (tipo_encargo)'],
    )
    mk(
      'dp_esocial_events',
      [
        T('tipo_evento'),
        T('codigo'),
        T('competencia'),
        T('employee_name'),
        T('employee_id'),
        T('data_envio'),
        T('protocolo'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_dp_es_tipo ON dp_esocial_events (tipo_evento)'],
    )
    mk(
      'dp_occupational_exams',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_exame'),
        T('data_realizacao'),
        T('data_validade'),
        T('resultado'),
        T('medico'),
        T('clinica'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_dp_oe_emp ON dp_occupational_exams (employee_name)'],
    )
    mk(
      'dp_uniforms_epis',
      [
        T('employee_name'),
        T('employee_id'),
        T('item'),
        T('tipo'),
        T('categoria'),
        T('data_entrega'),
        N('quantidade'),
        T('tamanho'),
        T('ca'),
        T('observacoes'),
        T('situacao'),
        F('comprovante'),
      ],
      ['CREATE INDEX idx_dp_ue_emp ON dp_uniforms_epis (employee_name)'],
    )
    mk(
      'dp_mandatory_docs',
      [
        T('employee_name'),
        T('employee_id'),
        T('documento'),
        T('categoria'),
        T('data_entrega'),
        T('data_validade'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_dp_md_emp ON dp_mandatory_docs (employee_name)'],
    )
  },
  (app) => {
    var cols = [
      'rh_performance_evaluations',
      'rh_career_plans',
      'rh_climate_surveys',
      'rh_internal_communications',
      'dp_admissions',
      'dp_work_contracts',
      'dp_leaves',
      'dp_licenses',
      'dp_13th_salary',
      'dp_labor_charges',
      'dp_esocial_events',
      'dp_occupational_exams',
      'dp_uniforms_epis',
      'dp_mandatory_docs',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
