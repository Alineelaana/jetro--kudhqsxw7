// Migração 0309 — Configuração Focus NFe da empresa Gran Romano (ADITIVA e idempotente)
// Cria (ou atualiza, se já existir) o registro em fiscal_focus_nfe_config para a
// empresa Gran Romano (CNPJ 23.890.124/0001-45):
//   - emitente_ref: "282422" (ID do emitente no painel Focus NFe, informado pelo usuário)
//   - ambiente: "homologacao" (tpAmb=2 — ambiente de teste)
//   - status_ultima_validacao: deixado VAZIO — é exatamente o estado "Nunca validada"
//     que a tela (focus-nfe-config-section.tsx) e o hook (focus_nfe_api.js) já reconhecem;
//     nenhum estado novo é inventado.
//   - auth_mode: "b64" apenas se o registro não tiver um modo já gravado (valor padrão
//     que o hook devolve quando o campo está vazio).
// A empresa é resolvida por CNPJ/código (não por id fixo), para a migração replayar com
// segurança em qualquer cópia do projeto. Nenhum registro de outra empresa é tocado.
migrate(
  (app) => {
    var col = null
    try {
      col = app.findCollectionByNameOrId('fiscal_focus_nfe_config')
    } catch (_) {
      return // coleção ainda não existe nesta base: nada a fazer
    }

    // 1. Resolver a empresa Gran Romano por CNPJ ou código
    var gran = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "23.890.124/0001-45" || code = "GRAN-ROMANO"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) gran = found[0]
    } catch (_) {}
    if (!gran) return // empresa não existe nesta base: nada a fazer

    var empresaId = gran.id

    // 2. Localizar registro existente da Gran Romano (nunca tocar o de outra empresa)
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
    cfg.set('ambiente', 'homologacao')
    cfg.set('emitente_ref', '282422')
    if (!cfg.getString('auth_mode')) cfg.set('auth_mode', 'b64')
    // status_ultima_validacao permanece vazio até o primeiro "Testar credencial" na tela
    app.saveNoValidate(cfg)
  },
  (app) => {
    // Down: remove SOMENTE o registro semeado por esta migração (empresa Gran Romano
    // com emitente_ref 282422), nunca registros de outras empresas.
    try {
      var gran = app.findFirstRecordByFilter(
        'empresas',
        'cnpj = "23.890.124/0001-45" || code = "GRAN-ROMANO"',
      )
      var cfg = app.findFirstRecordByFilter(
        'fiscal_focus_nfe_config',
        'empresa_id = "' + gran.id + '" && emitente_ref = "282422"',
      )
      if (cfg) app.delete(cfg)
    } catch (_) {}
  },
)
