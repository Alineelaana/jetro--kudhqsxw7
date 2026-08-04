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
      'sst_nr1_management',
      [
        T('documento'),
        T('versao'),
        T('data_elaboracao'),
        T('data_revisao'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_nr1_sit ON sst_nr1_management (situacao)'],
    )
    mk(
      'sst_risk_inventory',
      [
        T('processo'),
        T('setor'),
        T('tipo_risco'),
        T('fonte_geradora'),
        T('intensidade'),
        T('exposicao'),
        T('medidas_controle'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_ri_set ON sst_risk_inventory (setor)'],
    )
    mk(
      'sst_gro',
      [
        T('documento'),
        T('versao'),
        T('data_elaboracao'),
        T('data_revisao'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_gro_sit ON sst_gro (situacao)'],
    )
    mk(
      'sst_pgr',
      [
        T('documento'),
        T('versao'),
        T('data_elaboracao'),
        T('data_revisao'),
        T('data_validade'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_pgr_sit ON sst_pgr (situacao)'],
    )
    mk(
      'sst_psychosocial_assessments',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_avaliacao'),
        T('data_realizacao'),
        T('resultado'),
        T('avaliador'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_pa_emp ON sst_psychosocial_assessments (employee_name)'],
    )
    mk(
      'sst_psychosocial_management',
      [
        T('titulo'),
        T('area'),
        T('responsavel'),
        T('data_inicio'),
        T('data_fim'),
        T('observacoes'),
        J('acoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_pm_sit ON sst_psychosocial_management (situacao)'],
    )
    mk(
      'sst_action_plans',
      [
        T('titulo'),
        T('origem'),
        T('prioridade'),
        T('responsavel'),
        T('data_inicio'),
        T('data_fim'),
        T('descricao'),
        N('progresso'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_ap_sit ON sst_action_plans (situacao)'],
    )
    mk(
      'sst_corrective_actions',
      [
        T('titulo'),
        T('origem'),
        T('responsavel'),
        T('prazo'),
        T('data_conclusao'),
        T('acao'),
        T('eficacia'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_ca_sit ON sst_corrective_actions (situacao)'],
    )
    mk(
      'sst_inspections',
      [
        T('titulo'),
        T('area'),
        T('inspetor'),
        T('data'),
        T('tipo'),
        T('observacoes'),
        J('itens_inspecionados'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_in_sit ON sst_inspections (situacao)'],
    )
    mk(
      'sst_internal_audits',
      [
        T('titulo'),
        T('area'),
        T('auditor'),
        T('data'),
        T('escopo'),
        T('observacoes'),
        J('achados'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_ia_sit ON sst_internal_audits (situacao)'],
    )
    mk(
      'sst_non_conformities',
      [
        T('descricao'),
        T('origem'),
        T('gravidade'),
        T('area_responsavel'),
        T('responsavel'),
        T('prazo'),
        T('data_criacao'),
        T('data_fechamento'),
        T('acao_corretiva'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_nc_sit ON sst_non_conformities (situacao)'],
    )
    mk(
      'sst_incidents',
      [
        T('titulo'),
        T('employee_name'),
        T('area'),
        T('data'),
        T('tipo'),
        T('descricao'),
        T('causa'),
        T('acao'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_inc_sit ON sst_incidents (situacao)'],
    )
    mk(
      'sst_accidents',
      [
        T('employee_name'),
        T('employee_id'),
        T('data'),
        T('hora'),
        T('local'),
        T('tipo_acidente'),
        T('descricao'),
        T('causa'),
        T('atestado_dias'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_acc_emp ON sst_accidents (employee_name)'],
    )
  },
  (app) => {
    var cols = [
      'sst_nr1_management',
      'sst_risk_inventory',
      'sst_gro',
      'sst_pgr',
      'sst_psychosocial_assessments',
      'sst_psychosocial_management',
      'sst_action_plans',
      'sst_corrective_actions',
      'sst_inspections',
      'sst_internal_audits',
      'sst_non_conformities',
      'sst_incidents',
      'sst_accidents',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
