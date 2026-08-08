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
      'sst_ppp',
      [
        T('employee_name'),
        T('employee_id'),
        T('empresa'),
        T('filial'),
        T('funcao'),
        T('atividade'),
        T('setor'),
        T('ambiente'),
        T('data_admissao'),
        T('data_demissao'),
        J('agentes_nocivos'),
        J('epc'),
        J('epi'),
        J('exposicoes'),
        J('responsaveis_tecnicos'),
        T('ltcat_ref'),
        T('pgr_ref'),
        T('data_emissao'),
        T('data_validade'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_sst_ppp_emp ON sst_ppp (employee_name)'],
    )

    mk(
      'sst_investigations',
      [
        T('titulo'),
        T('accident_id'),
        T('employee_name'),
        T('tipo_evento'),
        T('data_evento'),
        T('data_investigacao'),
        T('metodologia'),
        J('causas_imediatas'),
        J('causas_basicas'),
        J('causas_organizacionais'),
        J('fatores_contribuintes'),
        J('5_porques'),
        J('ishikawa'),
        J('arvore_causas'),
        J('plano_acao'),
        T('responsavel'),
        T('status_investigacao'),
        T('conclusao'),
        T('observacoes'),
        T('situacao'),
        F('anexos'),
      ],
      ['CREATE INDEX idx_sst_inv_acc ON sst_investigations (accident_id)'],
    )

    mk(
      'sst_nr10_electrical',
      [
        T('employee_name'),
        T('funcao'),
        T('setor'),
        T('autorizacao'),
        T('data_autorizacao'),
        T('validade_autorizacao'),
        T('treinamento'),
        T('data_treinamento'),
        T('validade_treinamento'),
        T('prontuario'),
        J('procedimentos'),
        J('riscos'),
        T('instalacao'),
        T('tensao'),
        T('nivel_risco'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_nr10_emp ON sst_nr10_electrical (employee_name)'],
    )

    mk(
      'sst_nr12_machines',
      [
        T('maquina'),
        T('codigo'),
        T('setor'),
        T('area'),
        T('tipo'),
        T('fabricante'),
        T('modelo'),
        T('num_serie'),
        J('riscos'),
        J('protecoes'),
        J('dispositivos_seguranca'),
        T('ultima_inspecao'),
        T('proxima_inspecao'),
        T('capacitacao_req'),
        T('bloqueio'),
        T('interdiacao'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_nr12_maq ON sst_nr12_machines (maquina)'],
    )

    mk(
      'sst_nr13_boilers',
      [
        T('equipamento'),
        T('codigo'),
        T('categoria'),
        T('setor'),
        T('area'),
        T('fabricante'),
        T('num_registro'),
        T('pressao_max'),
        T('capacidade'),
        T('data_instalacao'),
        T('ultima_inspecao'),
        T('proxima_inspecao'),
        T('inspetor'),
        T('responsavel_tecnico'),
        T('registro_crea'),
        J('prontuario'),
        J('documentos_tecnicos'),
        T('observacoes'),
        T('situacao'),
        F('arquivos'),
      ],
      ['CREATE INDEX idx_sst_nr13_eqp ON sst_nr13_boilers (equipamento)'],
    )

    mk(
      'sst_nr11_material_handling',
      [
        T('operador'),
        T('funcao'),
        T('equipamento'),
        T('tipo_equipamento'),
        T('codigo'),
        T('setor'),
        T('autorizacao'),
        T('data_autorizacao'),
        T('validade_autorizacao'),
        T('treinamento'),
        T('data_treinamento'),
        T('validade_treinamento'),
        T('ultima_inspecao'),
        T('proxima_inspecao'),
        J('riscos'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_nr11_op ON sst_nr11_material_handling (operador)'],
    )

    mk(
      'sst_nr15_insalubridade',
      [
        T('employee_name'),
        T('funcao'),
        T('setor'),
        T('ambiente'),
        T('agente'),
        T('tipo_agente'),
        T('intensidade'),
        T('unidade'),
        T('limite_tolerancia'),
        T('base_legal'),
        T('grau_insalubridade'),
        T('adicional'),
        T('data_avaliacao'),
        T('avaliador'),
        T('responsavel_tecnico'),
        T('ltcat_ref'),
        T('pgr_ref'),
        J('epc'),
        J('epi'),
        T('observacoes'),
        T('situacao'),
        F('laudo'),
      ],
      ['CREATE INDEX idx_sst_nr15_emp ON sst_nr15_insalubridade (employee_name)'],
      R,
      R,
      R,
      SA,
      SA,
    )

    mk(
      'sst_nr16_periculosidade',
      [
        T('employee_name'),
        T('funcao'),
        T('setor'),
        T('ambiente'),
        T('atividade'),
        T('tipo_perigo'),
        T('base_legal'),
        T('adicional'),
        T('data_avaliacao'),
        T('avaliador'),
        T('responsavel_tecnico'),
        J('riscos'),
        J('epc'),
        J('epi'),
        T('observacoes'),
        T('situacao'),
        F('laudo'),
      ],
      ['CREATE INDEX idx_sst_nr16_emp ON sst_nr16_periculosidade (employee_name)'],
      R,
      R,
      R,
      SA,
      SA,
    )

    mk(
      'sst_obligations',
      [
        T('titulo'),
        T('tipo_obrigacao'),
        T('nr_ref'),
        T('empresa'),
        T('filial'),
        T('responsavel'),
        T('data_prevista'),
        T('data_realizada'),
        T('periodicidade'),
        T('proxima_data'),
        T('prioridade'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_obl_data ON sst_obligations (data_prevista)'],
    )

    mk(
      'sst_audit_checklists',
      [
        T('titulo'),
        T('tipo_auditoria'),
        T('nr_ref'),
        T('empresa'),
        T('filial'),
        T('auditor'),
        T('data_auditoria'),
        T('data_relatorio'),
        J('itens_checklist'),
        J('achados'),
        J('nao_conformidades'),
        T('pontuacao'),
        T('conformidade_percent'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
        F('relatorio'),
      ],
      ['CREATE INDEX idx_sst_acl_tipo ON sst_audit_checklists (tipo_auditoria)'],
    )

    try {
      var ri = app.findCollectionByNameOrId('sst_risk_inventory')
      var fieldsToAdd = [
        'empresa',
        'filial',
        'estabelecimento',
        'perigo',
        'fonte_geradora',
        'evento_perigoso',
        'numero_trabalhadores_expostos',
        'probabilidade',
        'severidade',
        'nivel_risco',
        'controles_recomendados',
        'prazo',
        'evidencia',
        'metodologia_avaliacao',
        'risco_inicial',
        'risco_residual',
        'hierarquia_controle',
      ]
      var changed = false
      for (var i = 0; i < fieldsToAdd.length; i++) {
        if (!ri.fields.getByName(fieldsToAdd[i])) {
          ri.fields.add(new TextField({ name: fieldsToAdd[i] }))
          changed = true
        }
      }
      if (changed) app.save(ri)
    } catch (_) {}
  },
  (app) => {
    var cols = [
      'sst_ppp',
      'sst_investigations',
      'sst_nr10_electrical',
      'sst_nr12_machines',
      'sst_nr13_boilers',
      'sst_nr11_material_handling',
      'sst_nr15_insalubridade',
      'sst_nr16_periculosidade',
      'sst_obligations',
      'sst_audit_checklists',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
