/**
 * 0325: Libera leitura (list/view) das coleções fiscais para usuários autenticados
 * e não-superuser vinculados à empresa do registro (ou SUP), corrigindo os erros
 * 403 "Only superusers can perform this action" ao carregar as listas de
 * CT-e, MDF-e, NFS-e e Correções Fiscais na tela Fiscal.
 *
 * Antes: listRule/viewRule = null (superusers only).
 * Agora: mesma regra RLS de multitenancy aplicada na migração 0269 às coleções
 * operacionais (SUP ou vínculo por company/empresa). Sem alterar create/update/
 * delete — alteração aditiva e segura.
 */
migrate(
  (app) => {
    var ruleCompany =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || company = @request.auth.empresa_id || company = '' || (company = '' && @request.auth.empresa_id = ''))"

    var ruleEmpresa =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa = @request.auth.empresa_id || empresa = '' || (empresa = '' && @request.auth.empresa_id = ''))"

    var collectionsCompany = ['cte_records', 'nfse_records', 'nfce_records']
    var collectionsEmpresa = ['mdfe_records', 'fiscal_corrections']

    for (var i = 0; i < collectionsCompany.length; i++) {
      try {
        var colC = app.findCollectionByNameOrId(collectionsCompany[i])
        if (colC) {
          colC.listRule = ruleCompany
          colC.viewRule = ruleCompany
          app.save(colC)
        }
      } catch (errC) {
        console.log('RLS leitura fiscal ' + collectionsCompany[i] + ':', errC)
      }
    }

    for (var j = 0; j < collectionsEmpresa.length; j++) {
      try {
        var colE = app.findCollectionByNameOrId(collectionsEmpresa[j])
        if (colE) {
          colE.listRule = ruleEmpresa
          colE.viewRule = ruleEmpresa
          app.save(colE)
        }
      } catch (errE) {
        console.log('RLS leitura fiscal ' + collectionsEmpresa[j] + ':', errE)
      }
    }
  },
  (app) => {
    var names = [
      'cte_records',
      'nfse_records',
      'nfce_records',
      'mdfe_records',
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
