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
      'rh_employees',
      [
        T('nome_completo'),
        T('nome_social'),
        T('cpf'),
        T('rg'),
        T('data_nascimento'),
        T('sexo'),
        T('estado_civil'),
        T('nacionalidade'),
        T('naturalidade'),
        T('telefone'),
        T('email_pessoal'),
        T('endereco'),
        T('foto'),
        T('contato_emergencia'),
        T('matricula'),
        T('empresa'),
        T('filial'),
        T('departamento'),
        T('cargo'),
        T('gestor_responsavel'),
        T('data_admissao'),
        T('tipo_contrato'),
        T('jornada_trabalho'),
        T('salario'),
        T('centro_custo'),
        T('local_trabalho'),
        T('email_corporativo'),
        T('telefone_corporativo'),
        T('situacao'),
        T('banco'),
        T('agencia'),
        T('conta'),
        T('tipo_conta'),
        T('chave_pix'),
        T('scale_id'),
        T('observacoes'),
        J('dependentes'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_rh_emp_sit ON rh_employees (situacao)',
        'CREATE INDEX idx_rh_emp_dep ON rh_employees (departamento)',
      ],
    )

    mk(
      'rh_positions',
      [
        T('code'),
        T('name'),
        T('description'),
        T('departamento'),
        T('gestor_cargo'),
        T('faixa_salarial_inicial'),
        T('faixa_salarial_final'),
        T('jornada_padrao'),
        T('responsabilidades'),
        T('competencias'),
        T('escolaridade_minima'),
        T('situacao'),
        T('centro_custo'),
        J('treinamentos_obrigatorios'),
        J('beneficios'),
        J('equipamentos'),
        J('metas'),
      ],
      ['CREATE INDEX idx_rh_pos_sit ON rh_positions (situacao)'],
    )

    mk(
      'rh_departments',
      [
        T('code'),
        T('name'),
        T('empresa'),
        T('filial'),
        T('departamento_superior'),
        T('gestor_responsavel'),
        T('centro_custo'),
        T('description'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_dep_sit ON rh_departments (situacao)'],
    )

    mk(
      'rh_time_records',
      [
        T('employee_id'),
        T('employee_name'),
        T('data'),
        T('entrada'),
        T('saida_intervalo'),
        T('retorno_intervalo'),
        T('saida'),
        T('horas_trabalhadas'),
        T('horas_extras'),
        T('banco_horas'),
        T('atrasos'),
        T('faltas'),
        T('adicional_noturno'),
        T('observacoes'),
        T('situacao'),
        T('justificativa'),
        F('atestado'),
      ],
      [
        'CREATE INDEX idx_rh_tr_emp ON rh_time_records (employee_id)',
        'CREATE INDEX idx_rh_tr_data ON rh_time_records (data)',
      ],
    )

    mk(
      'rh_scales',
      [
        T('name'),
        T('tipo_escala'),
        T('turno'),
        T('horario_entrada'),
        T('horario_saida'),
        T('intervalo_inicio'),
        T('intervalo_fim'),
        T('tolerancia'),
        T('dias_trabalho'),
        T('folgas'),
        T('jornada_diaria'),
        T('jornada_semanal'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_rh_sc_sit ON rh_scales (situacao)'],
    )

    mk(
      'rh_vacations',
      [
        T('employee_id'),
        T('employee_name'),
        T('data_admissao'),
        T('periodo_aquisitivo_inicio'),
        T('periodo_aquisitivo_fim'),
        T('periodo_concessivo_inicio'),
        T('periodo_concessivo_fim'),
        N('dias_disponiveis'),
        N('dias_utilizados'),
        N('dias_vendidos'),
        T('data_inicio'),
        T('data_fim'),
        T('data_prevista'),
        T('situacao'),
        T('observacoes'),
        F('recibo'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_rh_vac_emp ON rh_vacations (employee_id)',
        'CREATE INDEX idx_rh_vac_sit ON rh_vacations (situacao)',
      ],
    )

    mk(
      'rh_employee_history',
      [
        T('employee_id'),
        T('employee_name'),
        T('tipo_alteracao'),
        T('descricao'),
        T('valor_anterior'),
        T('valor_novo'),
        T('data_alteracao'),
        T('responsavel'),
        T('justificativa'),
      ],
      ['CREATE INDEX idx_rh_hist_emp ON rh_employee_history (employee_id)'],
    )

    mk(
      'rh_dismissals',
      [
        T('employee_id'),
        T('employee_name'),
        T('data_desligamento'),
        T('tipo_desligamento'),
        T('motivo'),
        T('aviso_previo'),
        T('data_ultimo_dia'),
        T('responsavel'),
        T('observacoes'),
        T('valor_rescisao'),
        J('documentos'),
        J('entrevista'),
      ],
      ['CREATE INDEX idx_rh_dis_emp ON rh_dismissals (employee_id)'],
    )
  },
  (app) => {
    var cols = [
      'rh_employees',
      'rh_positions',
      'rh_departments',
      'rh_time_records',
      'rh_scales',
      'rh_vacations',
      'rh_employee_history',
      'rh_dismissals',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
