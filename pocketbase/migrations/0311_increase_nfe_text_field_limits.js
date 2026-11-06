/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. Assegurar coleção fiscal_document_artifacts com limites ampliados
    try {
      var artCol = null
      try {
        artCol = app.findCollectionByNameOrId('fiscal_document_artifacts')
      } catch (_) {}

      if (!artCol) {
        var ruleAdminOrAuth = "@request.auth.id != ''"
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
        // Atualizar campos existentes para limites maiores
        var fieldsArt = artCol.fields || []
        for (var a = 0; a < fieldsArt.length; a++) {
          var fldA = fieldsArt[a]
          if (fldA.type === 'text') {
            if (fldA.name === 'xml_conteudo') {
              fldA.max = 2000000
            } else if (fldA.name === 'motivo_status' || fldA.name === 'focus_nfe_motivo') {
              fldA.max = 20000
            } else if (
              fldA.name === 'protocolo_autorizacao' ||
              fldA.name === 'focus_nfe_protocolo' ||
              fldA.name === 'status_sefaz'
            ) {
              fldA.max = 2000
            }
          }
        }
        app.save(artCol)
      }
    } catch (errArt) {
      console.log('Aviso ao atualizar/criar fiscal_document_artifacts: ' + errArt)
    }

    // 2. Atualizar nfe_records aumentando o limite de xml_conteudo e campos textuais
    try {
      var nfeCol = app.findCollectionByNameOrId('nfe_records')
      if (nfeCol) {
        var nfeFields = nfeCol.fields || []
        var fieldNames = {}
        for (var i = 0; i < nfeFields.length; i++) {
          var f = nfeFields[i]
          fieldNames[f.name] = true
          if (f.type === 'text') {
            if (f.name === 'xml_conteudo') {
              f.max = 2000000
            } else if (
              f.name === 'motivo' ||
              f.name === 'motivo_status' ||
              f.name === 'mensagem_retorno' ||
              f.name === 'homologacao_pendencia' ||
              f.name === 'focus_nfe_motivo' ||
              f.name === 'observacoes' ||
              f.name === 'erros'
            ) {
              f.max = 50000
            } else if (
              f.name === 'protocolo' ||
              f.name === 'recibo' ||
              f.name === 'focus_nfe_protocolo' ||
              f.name === 'status'
            ) {
              f.max = 5000
            }
          }
        }

        // Se xml_conteudo não existir em nfe_records, adiciona com max 2000000
        if (!fieldNames['xml_conteudo']) {
          nfeCol.fields.add(
            new TextField({
              name: 'xml_conteudo',
              max: 2000000,
              required: false,
            }),
          )
        }

        // Campos auxiliares fiscais caso não existam
        var camposParaGarantir = [
          { name: 'homologacao_pendencia', max: 50000 },
          { name: 'focus_nfe_motivo', max: 50000 },
          { name: 'focus_nfe_protocolo', max: 5000 },
          { name: 'recibo', max: 5000 },
          { name: 'protocolo', max: 5000 },
          { name: 'motivo', max: 50000 },
        ]

        for (var c = 0; c < camposParaGarantir.length; c++) {
          var cfgField = camposParaGarantir[c]
          if (!fieldNames[cfgField.name]) {
            nfeCol.fields.add(
              new TextField({
                name: cfgField.name,
                max: cfgField.max,
                required: false,
              }),
            )
          }
        }

        app.save(nfeCol)
      }
    } catch (errNfe) {
      console.log('Aviso ao atualizar nfe_records: ' + errNfe)
    }

    // 3. Atualizar sales_invoices se existir
    try {
      var invCol = app.findCollectionByNameOrId('sales_invoices')
      if (invCol) {
        var invFields = invCol.fields || []
        for (var j = 0; j < invFields.length; j++) {
          var invFld = invFields[j]
          if (invFld.type === 'text') {
            if (invFld.name === 'xml_conteudo' || invFld.name === 'xml') {
              invFld.max = 2000000
            } else if (
              invFld.name === 'motivo' ||
              invFld.name === 'mensagem' ||
              invFld.name === 'observacoes'
            ) {
              invFld.max = 50000
            }
          }
        }
        app.save(invCol)
      }
    } catch (errInv) {
      console.log('Aviso ao atualizar sales_invoices: ' + errInv)
    }
  },
  () => {
    // Reversão no-op para migração aditiva
  },
)
