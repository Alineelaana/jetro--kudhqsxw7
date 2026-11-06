/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const ruleAdminOrAuth = "@request.auth.id != ''"

    // 1. Assegurar coleção fiscal_document_artifacts com limite max de xml_conteudo = 2000000
    let artCol = null
    try {
      artCol = app.findCollectionByNameOrId('fiscal_document_artifacts')
    } catch (_) {
      artCol = null
    }

    if (!artCol) {
      artCol = new Collection({
        name: 'fiscal_document_artifacts',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          { name: 'tipo_documento', type: 'text', max: 500 },
          { name: 'empresa_id', type: 'text', max: 500 },
          { name: 'document_id', type: 'text', max: 500 },
          { name: 'document_number', type: 'text', max: 500 },
          { name: 'serie', type: 'text', max: 100 },
          { name: 'chave_acesso', type: 'text', max: 200 },
          { name: 'ambiente', type: 'text', max: 100 },
          { name: 'status_sefaz', type: 'text', max: 2000 },
          { name: 'codigo_status', type: 'text', max: 500 },
          { name: 'motivo_status', type: 'text', max: 20000 },
          { name: 'protocolo_autorizacao', type: 'text', max: 2000 },
          { name: 'data_autorizacao', type: 'text', max: 500 },
          { name: 'xml_conteudo', type: 'text', max: 2000000 },
          { name: 'digest_value', type: 'text', max: 500 },
          { name: 'external_idempotency_key', type: 'text', max: 500 },
          { name: 'divergencias_importacao', type: 'json' },
          { name: 'pendencias_de_para', type: 'json' },
          { name: 'created_by_user', type: 'text', max: 500 },
          { name: 'focus_nfe_ref', type: 'text', max: 500 },
          { name: 'focus_nfe_ambiente', type: 'text', max: 100 },
          { name: 'focus_nfe_status_sefaz', type: 'text', max: 500 },
          { name: 'focus_nfe_codigo_status', type: 'text', max: 500 },
          { name: 'focus_nfe_motivo', type: 'text', max: 20000 },
          { name: 'focus_nfe_protocolo', type: 'text', max: 2000 },
          { name: 'focus_nfe_data_hora', type: 'text', max: 500 },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_fda_chave_amb ON fiscal_document_artifacts (chave_acesso, ambiente)',
          'CREATE INDEX idx_fda_empresa ON fiscal_document_artifacts (empresa_id)',
          'CREATE INDEX idx_fda_status ON fiscal_document_artifacts (status_sefaz)',
          'CREATE INDEX idx_fda_created ON fiscal_document_artifacts (created DESC)',
        ],
      })
      app.save(artCol)
    } else {
      const xmlField = artCol.fields.getByName('xml_conteudo')
      if (xmlField) {
        xmlField.max = 2000000
      } else {
        artCol.fields.add(
          new TextField({
            name: 'xml_conteudo',
            max: 2000000,
            required: false,
          }),
        )
      }
      app.save(artCol)
    }

    // 2. Garantir que nfe_records tenha xml_conteudo com max: 2000000
    const nfeCol = app.findCollectionByNameOrId('nfe_records')
    const nfeXmlField = nfeCol.fields.getByName('xml_conteudo')
    if (nfeXmlField) {
      nfeXmlField.max = 2000000
    } else {
      nfeCol.fields.add(
        new TextField({
          name: 'xml_conteudo',
          max: 2000000,
          required: false,
        }),
      )
    }
    app.save(nfeCol)
  },
  () => {
    // Reversão no-op para migração aditiva
  },
)
