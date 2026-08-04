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
      'sst_cat',
      [
        T('employee_name'),
        T('employee_id'),
        T('data_acidente'),
        T('hora'),
        T('tipo_cat'),
        T('numero_cat'),
        T('data_comunicacao'),
        T('descricao'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_cat_emp ON sst_cat (employee_name)'],
    )
    mk(
      'sst_epis',
      [
        T('employee_name'),
        T('employee_id'),
        T('item'),
        T('ca'),
        T('tamanho'),
        T('data_entrega'),
        N('quantidade'),
        T('validade'),
        T('observacoes'),
        T('situacao'),
        F('comprovante'),
      ],
      ['CREATE INDEX idx_sst_epi_emp ON sst_epis (employee_name)'],
    )
    mk(
      'sst_epcs',
      [
        T('item'),
        T('area'),
        T('tipo'),
        T('data_instalacao'),
        T('data_manutencao'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
        F('foto'),
      ],
      ['CREATE INDEX idx_sst_epc_sit ON sst_epcs (situacao)'],
    )
    mk(
      'sst_dds',
      [
        T('titulo'),
        T('data'),
        T('instrutor'),
        T('area'),
        T('participantes'),
        T('tema'),
        T('observacoes'),
        N('num_participantes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_dds_data ON sst_dds (data)'],
    )
    mk(
      'sst_apr',
      [
        T('titulo'),
        T('area'),
        T('responsavel'),
        T('data'),
        T('atividade'),
        T('riscos_identificados'),
        T('medidas_controle'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_apr_sit ON sst_apr (situacao)'],
    )
    mk(
      'sst_work_permits',
      [
        T('titulo'),
        T('area'),
        T('responsavel'),
        T('data_inicio'),
        T('data_fim'),
        T('tipo_trabalho'),
        T('riscos'),
        T('medidas_controle'),
        T('aprovador'),
        T('observacoes'),
        T('situacao'),
        F('documentos'),
      ],
      ['CREATE INDEX idx_sst_wp_sit ON sst_work_permits (situacao)'],
    )
    mk(
      'sst_aso',
      [
        T('employee_name'),
        T('employee_id'),
        T('tipo_aso'),
        T('data_realizacao'),
        T('data_validade'),
        T('resultado'),
        T('medico'),
        T('clinica'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_sst_aso_emp ON sst_aso (employee_name)'],
    )
    mk(
      'sst_pcmso',
      [
        T('documento'),
        T('versao'),
        T('data_elaboracao'),
        T('data_revisao'),
        T('data_validade'),
        T('responsavel'),
        T('medico_coordenador'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_pcmso_sit ON sst_pcmso (situacao)'],
    )
    mk(
      'sst_vaccination',
      [
        T('employee_name'),
        T('employee_id'),
        T('vacina'),
        T('dose'),
        T('data_aplicacao'),
        T('data_validade'),
        T('aplicador'),
        T('lote'),
        T('observacoes'),
        T('situacao'),
        F('comprovante'),
      ],
      ['CREATE INDEX idx_sst_vac_emp ON sst_vaccination (employee_name)'],
    )
    mk(
      'sst_certificates',
      [
        T('employee_name'),
        T('employee_id'),
        T('certificado'),
        T('tipo'),
        T('data_emissao'),
        T('data_validade'),
        T('emissor'),
        T('carga_horaria'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_sst_cert_emp ON sst_certificates (employee_name)'],
    )
    mk(
      'sst_documents',
      [
        T('titulo'),
        T('categoria'),
        T('versao'),
        T('data_elaboracao'),
        T('data_revisao'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
        F('arquivo'),
      ],
      ['CREATE INDEX idx_sst_doc_sit ON sst_documents (situacao)'],
    )
    mk(
      'sst_indicators',
      [
        T('indicador'),
        T('categoria'),
        T('periodo'),
        T('valor'),
        T('meta'),
        T('unidade'),
        T('responsavel'),
        T('observacoes'),
        T('situacao'),
      ],
      ['CREATE INDEX idx_sst_ind_cat ON sst_indicators (categoria)'],
    )
  },
  (app) => {
    var cols = [
      'sst_cat',
      'sst_epis',
      'sst_epcs',
      'sst_dds',
      'sst_apr',
      'sst_work_permits',
      'sst_aso',
      'sst_pcmso',
      'sst_vaccination',
      'sst_certificates',
      'sst_documents',
      'sst_indicators',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
