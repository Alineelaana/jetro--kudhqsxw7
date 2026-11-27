/// <reference path="../pb_data/types.d.ts" />
// 0368 — Correção da 0367 (limpeza dos seeds do módulo industrial): filtro da
// industrial_traceability era inseguro — "lot_number ~ 'LOT-' || (SEED_DAY)" apagaria
// rastreabilidade REAL criada depois pelo usuário (o "~ 'LOT-'" solto fora da janela).
// A 0367 já foi aplicada e a plataforma não permite editá-la; esta migração corretiva
// idempotente executa a limpeza com o filtro SEGURO: janela do dia do seed (2026-08-07)
// apenas, restrita a lot_number ~ 'LOT-'.
//
// Idempotente: delete por filtro; em banco limpo é no-op. Down: no-op.

migrate(
  (app) => {
    var SEED_DAY = "created >= '2026-08-07 00:00:00.000Z' && created <= '2026-08-07 23:59:59.999Z'"
    var filter = "lot_number ~ 'LOT-' && (" + SEED_DAY + ')'

    try {
      var recs = app.findRecordsByFilter('industrial_traceability', filter, '-created', 500, 0)
      var ok = 0
      for (var i = 0; i < recs.length; i++) {
        try {
          app.delete(recs[i])
          ok++
        } catch (e2) {
          console.log('0368 delete falhou em industrial_traceability id=' + recs[i].id + ': ' + e2)
        }
      }
      console.log('0368 corrective traceability cleanup: deleted=' + ok)
    } catch (err) {
      // coleção inexistente: ignora (idempotente/pacífico)
      console.log('0368 skip industrial_traceability: ' + String(err))
    }
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
