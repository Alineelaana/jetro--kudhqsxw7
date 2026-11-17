/**
 * 0326: Correção da migração 0325 — as regras de leitura (list/view) ficaram
 * nulas porque as coleções cte_records, mdfe_records, nfse_records e
 * fiscal_corrections foram criadas como casca SEM nenhum campo (migração 0067):
 * qualquer regra citando `company` ou `empresa` falha com "unknown field" e o
 * try/catch da 0325 engoliu o erro.
 *
 * Solução, no padrão de fallback da própria 0269:
 * - nfce_records (tem campo `company`): regra RLS de multitenancy
 *   (SUP, ou vínculo por company, incluindo company vazio).
 * - cte_records, mdfe_records, nfse_records, fiscal_corrections (sem campos):
 *   regra de autenticação simples `@request.auth.id != ''` — liberando
 *   list/view para qualquer usuário logado, sem 403.
 *
 * Alteração aditiva: create/update/delete permanecem como estão.
 */
migrate(
  (app) => {
    var ruleCompany =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || company = @request.auth.empresa_id || company = '' || (company = '' && @request.auth.empresa_id = ''))"

    var ruleAuthenticated = "@request.auth.id != ''"

    var colNfce = app.findCollectionByNameOrId('nfce_records')
    if (colNfce) {
      colNfce.listRule = ruleCompany
      colNfce.viewRule = ruleCompany
      app.save(colNfce)
    }

    var names = ['cte_records', 'mdfe_records', 'nfse_records', 'fiscal_corrections']
    for (var i = 0; i < names.length; i++) {
      var col = app.findCollectionByNameOrId(names[i])
      if (col) {
        col.listRule = ruleAuthenticated
        col.viewRule = ruleAuthenticated
        app.save(col)
      }
    }
  },
  (app) => {
    var names = [
      'nfce_records',
      'cte_records',
      'mdfe_records',
      'nfse_records',
      'fiscal_corrections',
    ]
    for (var i = 0; i < names.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(names[i])
        if (col) {
          col.listRule = null
          col.viewRule = null
          app.save(col)
        }
      } catch (_) {}
    }
  },
)
