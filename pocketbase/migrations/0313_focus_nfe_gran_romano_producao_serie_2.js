// Migração 0313 — Configuração de Série e Produção Focus NFe da Gran Romano (ADITIVA e idempotente)
migrate(
  (app) => {
    var col = null
    try {
      col = app.findCollectionByNameOrId('fiscal_focus_nfe_config')
    } catch (_) {
      return // coleção ainda não existe nesta base: no-op
    }

    // 1. Garantir campo serie na coleção fiscal_focus_nfe_config
    try {
      var hasSerie = false
      var fields = col.fields
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].name === 'serie') {
          hasSerie = true
          break
        }
      }
      if (!hasSerie) {
        col.fields.add(new TextField({ name: 'serie' }))
        app.save(col)
      }
    } catch (fErr) {
      // Ignora erro se campo já existir
    }

    // 2. Localizar Gran Romano por CNPJ 23890124000145 ou código
    var gran = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj ~ "23890124000145" || cnpj ~ "23.890.124/0001-45" || code = "GRAN-ROMANO"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) gran = found[0]
    } catch (_) {}

    if (!gran) return // Base vazia ou Gran Romano não cadastrada: no-op

    var empresaId = gran.id

    // 3. Atualizar ou criar registro em fiscal_focus_nfe_config com ambiente producao e serie 2
    var cfg = null
    try {
      cfg = app.findFirstRecordByFilter(
        'fiscal_focus_nfe_config',
        'empresa_id = "' + empresaId + '"',
      )
    } catch (_) {}

    if (!cfg) {
      cfg = new Record(col)
      cfg.set('empresa_id', empresaId)
      cfg.set(
        'empresa_nome',
        gran.getString('nome_fantasia') || gran.getString('name') || 'Gran Romano',
      )
    }

    cfg.set('cnpj_emitente', (gran.getString('cnpj') || '').replace(/\D/g, ''))
    cfg.set('ambiente', 'producao')
    cfg.set('serie', '2')
    cfg.set('emitente_ref', '282422')
    if (!cfg.getString('auth_mode')) cfg.set('auth_mode', 'b64')

    app.saveNoValidate(cfg)
  },
  (app) => {
    // Down migration
    try {
      var gran = app.findFirstRecordByFilter(
        'empresas',
        'cnpj ~ "23890124000145" || cnpj ~ "23.890.124/0001-45" || code = "GRAN-ROMANO"',
      )
      if (gran) {
        var cfg = app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + gran.id + '"',
        )
        if (cfg) {
          cfg.set('ambiente', 'homologacao')
          cfg.set('serie', '1')
          app.saveNoValidate(cfg)
        }
      }
    } catch (_) {}
  },
)
