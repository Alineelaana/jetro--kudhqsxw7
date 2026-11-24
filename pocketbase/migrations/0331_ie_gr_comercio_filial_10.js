// 0331: Preenche a Inscrição Estadual da filial "GR COMÉRCIO - FILIAL 10"
// (GR COMERCIO DE ALIMENTOS LTDA, CNPJ 33531059000165) com 83562320.
// A 0330 criou a empresa com IE vazia porque o Comprovante de Inscrição CNPJ da
// Receita não traz o campo; o usuário informou agora a IE. Grava sem pontuação,
// mesmo formato dos demais cadastros (ex.: GR FILIAL SP - 12 tem IE 162545386113).
// Idempotente: localiza pelo código GR-FILIAL-10 ou CNPJ (pontuado/não/raiz) e
// apenas preenche a IE quando estiver diferente do valor informado. Nada mais é
// alterado — nome de exibição, cores, vínculo de matriz e config fiscal ficam como estão.
migrate(
  (app) => {
    var rec = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'code = "GR-FILIAL-10" || cnpj = "33531059000165" || cnpj = "33.531.059/0001-65" || cnpj ~ "33531059"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        rec = found[0]
      }
    } catch (eFind) {
      console.log('0331: falha ao buscar empresa GR-FILIAL-10:', eFind)
    }

    if (!rec) {
      console.log('0331: empresa GR-FILIAL-10 não encontrada — nada a fazer')
      return
    }

    var ieAtual = rec.getString('inscricao_estadual') || ''
    if (ieAtual === '83562320') {
      console.log('0331: IE já é 83562320 — nada a fazer (id ' + rec.id + ')')
      return
    }

    rec.set('inscricao_estadual', '83562320')
    app.save(rec)
    console.log(
      '0331: IE da empresa ' + rec.id + ' atualizada para 83562320 (antes: "' + ieAtual + '")',
    )
  },
  (app) => {
    // Reversão: volta a IE para vazio apenas se ela for exatamente o valor desta migração
    try {
      var recs = app.findRecordsByFilter('empresas', 'code = "GR-FILIAL-10"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        if ((recs[i].getString('inscricao_estadual') || '') === '83562320') {
          recs[i].set('inscricao_estadual', '')
          app.save(recs[i])
        }
      }
    } catch (eDown) {
      console.log('0331 down: ', eDown)
    }
  },
)
