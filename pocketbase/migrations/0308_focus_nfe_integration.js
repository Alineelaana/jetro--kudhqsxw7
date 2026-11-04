// Migração 0308 — Integração Focus NFe (ADITIVA: nunca altera ou destrói dados)
// 1. Nova coleção fiscal_focus_nfe_config (configuração por empresa:
//    ambiente homologação/produção, ref do emitente, status da última validação).
// 2. Campos de transmissão Focus NFe em fiscal_document_artifacts
//    (status SEFAZ normalizado, protocolo, ref, ambiente, histórico CCe/cancel).
// 3. Campos de transmissão Focus NFe em nfe_records (espelho para as telas).
// 4. Campos focus_nfe_ambiente / focus_nfe_emitente_id em fiscal_configurations
//    (quando a coleção existir nesta base).
migrate(
  (app) => {
    var ruleAuth = "@request.auth.id != ''"

    // ---------- 1. fiscal_focus_nfe_config ----------
    if (!app.hasTable('fiscal_focus_nfe_config')) {
      var cfgCol = new Collection({
        name: 'fiscal_focus_nfe_config',
        type: 'base',
        listRule: ruleAuth,
        viewRule: ruleAuth,
        createRule: ruleAuth,
        updateRule: ruleAuth,
        deleteRule: ruleAuth,
        fields: [
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'empresa_nome', type: 'text' },
          { name: 'cnpj_emitente', type: 'text' },
          { name: 'ambiente', type: 'select', values: ['homologacao', 'producao'] },
          { name: 'emitente_ref', type: 'text' },
          { name: 'auth_mode', type: 'text' },
          { name: 'status_ultima_validacao', type: 'text' },
          { name: 'updated_by', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_ffc_empresa ON fiscal_focus_nfe_config (empresa_id)'],
      })
      app.save(cfgCol)
    }

    // ---------- helper: adicionar campo text/json se não existir ----------
    var fieldExists = function (col, name) {
      try {
        var fields = col.fields
        for (var i = 0; i < fields.length; i++) {
          if (fields[i].name === name) return true
        }
      } catch (_) {}
      return false
    }
    var addField = function (col, spec) {
      try {
        if (spec.type === 'json') col.fields.add(new JSONField({ name: spec.name }))
        else col.fields.add(new TextField({ name: spec.name }))
      } catch (_) {}
    }

    // ---------- 2. fiscal_document_artifacts ----------
    try {
      var artCol = app.findCollectionByNameOrId('fiscal_document_artifacts')
      var artFields = [
        { name: 'focus_nfe_ref' },
        { name: 'focus_nfe_ambiente' },
        { name: 'focus_nfe_status_sefaz' },
        { name: 'focus_nfe_codigo_status' },
        { name: 'focus_nfe_motivo' },
        { name: 'focus_nfe_protocolo' },
        { name: 'focus_nfe_data_hora' },
      ]
      for (var a = 0; a < artFields.length; a++) {
        if (!fieldExists(artCol, artFields[a].name)) addField(artCol, artFields[a])
      }
      if (!fieldExists(artCol, 'focus_nfe_cce_historico'))
        artCol.fields.add(new JSONField({ name: 'focus_nfe_cce_historico' }))
      app.save(artCol)
    } catch (_) {}

    // ---------- 3. nfe_records ----------
    try {
      var nfeCol = app.findCollectionByNameOrId('nfe_records')
      var nfeFields = [
        { name: 'focus_nfe_ref' },
        { name: 'focus_nfe_ambiente' },
        { name: 'focus_nfe_status_sefaz' },
        { name: 'focus_nfe_codigo_status' },
        { name: 'focus_nfe_motivo' },
        { name: 'focus_nfe_protocolo' },
        { name: 'focus_nfe_data_hora' },
      ]
      for (var n = 0; n < nfeFields.length; n++) {
        if (!fieldExists(nfeCol, nfeFields[n].name)) addField(nfeCol, nfeFields[n])
      }
      if (!fieldExists(nfeCol, 'focus_nfe_cce_historico'))
        nfeCol.fields.add(new JSONField({ name: 'focus_nfe_cce_historico' }))
      app.save(nfeCol)
    } catch (_) {}

    // ---------- 4. fiscal_configurations (se existir nesta base) ----------
    try {
      var fcCol = app.findCollectionByNameOrId('fiscal_configurations')
      if (!fieldExists(fcCol, 'focus_nfe_ambiente')) {
        fcCol.fields.add(new TextField({ name: 'focus_nfe_ambiente' }))
      }
      if (!fieldExists(fcCol, 'focus_nfe_emitente_id')) {
        fcCol.fields.add(new TextField({ name: 'focus_nfe_emitente_id' }))
      }
      app.save(fcCol)
    } catch (_) {}
  },
  (app) => {
    // Down: apenas remove a coleção criada nesta migração; campos adicionados
    // em coleções pré-existentes são deixados (down aditivo seguro).
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_focus_nfe_config'))
    } catch (_) {}
  },
)
