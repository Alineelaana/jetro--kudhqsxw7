// 0329: Correção da 0328 — vincula a matriz Gran Romano (matriz_id) na filial
// "GR FILIAL SP - 12", que ficou vazia porque a linha da 0328 que gravava o vínculo
// foi removida por engano durante a revisão. Idempotente: só grava se estiver vazio.
migrate(
  (app) => {
    try {
      var filiais = app.findRecordsByFilter(
        'empresas',
        'cnpj = "33516806000277" || code = "GR-FILIAL-SP-12"',
        '',
        10,
        0,
      )
      var matriz = app.findRecordsByFilter(
        'empresas',
        'code = "GRAN-ROMANO" || cnpj = "33.516.806/0001-96"',
        '',
        1,
        0,
      )
      if (!matriz || matriz.length === 0) {
        console.log('0329: matriz Gran Romano não encontrada — nada a vincular')
        return
      }
      for (var i = 0; i < filiais.length; i++) {
        var rec = filiais[i]
        var atual = rec.getString('matriz_id') || ''
        if (!atual) {
          rec.set('matriz_id', matriz[0].id)
          app.save(rec)
          console.log('0329: matriz_id vinculada em ' + rec.id)
        }
      }
    } catch (e) {
      console.log('0329 error:', e)
    }
  },
  (app) => {
    // Reversão no-op (não desfaz vínculo de dados)
  },
)
