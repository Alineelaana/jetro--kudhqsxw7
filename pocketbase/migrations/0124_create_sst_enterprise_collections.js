migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var MED = "@request.auth.role = 'SUP' || @request.auth.cargo = 'Medico do Trabalho'"
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]
    function mk(n, f, i, lr, vr, cr, ur, dr) {
      try {
        app.findCollectionByNameOrId(n)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: n,
          type: 'base',
          listRule: lr || R,
          viewRule: vr || R,
          createRule: cr || R,
          updateRule: ur || R,
          deleteRule: dr || SA,
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
      'sst_risk_matrix_config',
      [
        T('nome'),
        T('metodologia'),
        J('probabilidades'),
        J('severidades'),
        J('niveis'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_rmc_sit ON sst_risk_matrix_config (situacao)'],
    )
    mk(
      'sst_environmental_assessments',
      [
        T('tipo_agente'),
        T('ambiente'),
        T('setor'),
        T('metodologia'),
        T('equipamento'),
        T('calibracao'),
        T('responsavel_tecnico'),
        T('data_avaliacao'),
        T('resultado'),
        T('unidade'),
        T('limite'),
        T('conclusao'),
        T('registro'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_sst_ea_amb ON sst_environmental_assessments (ambiente)'],
    )
    mk(
      'sst_ltcat',
      [
        T('documento'),
        T('versao'),
        T('empresa'),
        T('estabelecimento'),
        T('data_elaboracao'),
        T('data_validade'),
        T('responsavel_tecnico'),
        T('metodologia'),
        J('ambientes'),
        J('agentes'),
        J('epis'),
        J('epcs'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_sst_ltcat_sit ON sst_ltcat (situacao)'],
    )
    mk(
      'sst_occupational_medical_records',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_exame'),
        T('data_exame'),
        T('resultado_clinico'),
        T('aptidao'),
        T('restricoes'),
        T('medico'),
        T('crm'),
        T('proxima_avaliacao'),
        J('historico'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_omr_emp ON sst_occupational_medical_records (employee_name)'],
      R,
      MED,
      MED,
      MED,
      SA,
    )
    mk(
      'sst_exposure_groups',
      [
        T('nome'),
        T('setor'),
        T('cargo'),
        T('atividade'),
        T('ambiente'),
        T('agente'),
        T('exposicao'),
        N('num_trabalhadores'),
        J('trabalhadores'),
        J('avaliacoes'),
        J('controles'),
        T('responsavel'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_eg_set ON sst_exposure_groups (setor)'],
    )
    mk(
      'sst_work_environments',
      [
        T('nome'),
        T('setor'),
        T('area'),
        T('empresa'),
        T('filial'),
        J('riscos'),
        J('maquinas'),
        J('epcs'),
        J('exposicoes'),
        N('num_trabalhadores'),
        T('responsavel_tecnico'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_we_set ON sst_work_environments (setor)'],
    )
    mk(
      'sst_cipa',
      [
        T('gestao'),
        T('empresa'),
        T('estabelecimento'),
        T('presidente'),
        T('vice_presidente'),
        J('membros'),
        J('reunioes'),
        J('treinamentos'),
        J('documentos'),
        J('pendencias'),
        T('data_posse'),
        T('data_fim_mandato'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_cipa_sit ON sst_cipa (situacao)'],
    )
    mk(
      'sst_sesmt',
      [
        T('empresa'),
        T('estabelecimento'),
        J('profissionais'),
        T('dimensionamento'),
        J('atribuicoes'),
        J('agenda'),
        J('acoes'),
        T('responsavel'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_sesmt_sit ON sst_sesmt (situacao)'],
    )
    mk(
      'sst_ergonomics',
      [
        T('ambiente'),
        T('setor'),
        T('posto'),
        T('tipo_analise'),
        T('data_avaliacao'),
        T('responsavel'),
        J('riscos_identificados'),
        J('recomendacoes'),
        J('plano_acao'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_erg_amb ON sst_ergonomics (ambiente)'],
    )
    mk(
      'sst_emergencies',
      [
        T('plano'),
        T('empresa'),
        T('estabelecimento'),
        J('rotas'),
        J('pontos_encontro'),
        J('equipamentos'),
        J('contatos'),
        J('simulados'),
        J('ocorrencias'),
        T('responsavel'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_emer_sit ON sst_emergencies (situacao)'],
    )
    mk(
      'sst_brigade',
      [
        T('membro'),
        T('funcao'),
        T('treinamento'),
        T('data_treinamento'),
        T('validade_treinamento'),
        T('escala'),
        J('simulados'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_bri_mem ON sst_brigade (membro)'],
    )
    mk(
      'sst_training_matrix',
      [
        T('employee_name'),
        T('cargo'),
        T('setor'),
        T('treinamento'),
        T('nr'),
        T('data_realizacao'),
        T('validade'),
        T('carga_horaria'),
        T('instrutor'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_tm_emp ON sst_training_matrix (employee_name)'],
    )
    mk(
      'sst_esocial_sst_events',
      [
        T('tipo_evento'),
        T('employee_name'),
        T('employee_id'),
        T('competencia'),
        T('protocolo'),
        T('recibo'),
        T('data_envio'),
        T('data_retorno'),
        T('status_retorno'),
        T('erro_descricao'),
        J('dados_evento'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_ese_tipo ON sst_esocial_sst_events (tipo_evento)'],
    )
    mk(
      'sst_compliance_status',
      [
        T('nr'),
        T('empresa'),
        T('filial'),
        T('unidade'),
        T('status'),
        J('pendencias'),
        T('responsavel'),
        T('data_avaliacao'),
        T('proxima_avaliacao'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_cs_nr ON sst_compliance_status (nr)'],
    )
    mk(
      'sst_management_of_change',
      [
        T('titulo'),
        T('tipo_mudanca'),
        T('descricao'),
        T('area_afetada'),
        T('responsavel'),
        T('data_solicitacao'),
        T('data_implantacao'),
        J('riscos_identificados'),
        B('requer_reavaliacao'),
        J('plano_acao'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_moc_sit ON sst_management_of_change (situacao)'],
    )
    mk(
      'sst_lockout',
      [
        T('equipamento'),
        T('area'),
        T('motivo'),
        T('responsavel'),
        T('data_inicio'),
        T('data_fim'),
        T('aprovador'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_lock_sit ON sst_lockout (situacao)'],
    )
    mk(
      'sst_nr_catalog',
      [
        T('nr_numero'),
        T('titulo'),
        T('versao'),
        T('data_vigencia'),
        T('data_publicacao'),
        T('orgao'),
        J('resumo'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_nrc_nr ON sst_nr_catalog (nr_numero)'],
    )
    mk(
      'sst_audit_trail',
      [T('acao'), T('modulo'), T('usuario'), T('detalhe'), T('ip'), T('situacao')],
      ['CREATE INDEX idx_sst_at_mod ON sst_audit_trail (modulo)'],
    )
    mk(
      'sst_confined_spaces',
      [
        T('nome'),
        T('local'),
        T('setor'),
        J('riscos'),
        T('pet'),
        T('supervisor'),
        T('sentinela'),
        J('trabalhadores_autorizados'),
        J('medicoes'),
        J('treinamentos'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_cs_nom ON sst_confined_spaces (nome)'],
    )
    mk(
      'sst_height_work',
      [
        T('atividade'),
        T('local'),
        T('altura'),
        T('responsavel'),
        T('autorizacao'),
        T('validade_autorizacao'),
        T('aptidao'),
        J('equipamentos'),
        J('riscos'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_hw_sit ON sst_height_work (situacao)'],
    )
  },
  (app) => {
    var cols = [
      'sst_risk_matrix_config',
      'sst_environmental_assessments',
      'sst_ltcat',
      'sst_occupational_medical_records',
      'sst_exposure_groups',
      'sst_work_environments',
      'sst_cipa',
      'sst_sesmt',
      'sst_ergonomics',
      'sst_emergencies',
      'sst_brigade',
      'sst_training_matrix',
      'sst_esocial_sst_events',
      'sst_compliance_status',
      'sst_management_of_change',
      'sst_lockout',
      'sst_nr_catalog',
      'sst_audit_trail',
      'sst_confined_spaces',
      'sst_height_work',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
