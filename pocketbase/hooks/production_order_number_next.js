// production_order_number_next.js — Número de Ordem de Produção sequencial
// NUMÉRICO puro, sem prefixo (pedido do usuário: sem "OP-ANO-"). Continua do
// maior número já gravado em production_orders (numérico puro ou sufixo de
// "OP-ANO-NNNN") para não colidir/repitir com os antigos; a lógica é embutida
// inline no callback (limitação do JSVM do PocketBase: callbacks não podem
// referenciar funções de nível superior — "Hook scoping error").
routerAdd(
  'GET',
  '/backend/v1/production-order-number/next',
  (e) => {
    try {
      // 1) Maior número já gravado (numérico puro ou sufixo de OP-ANO-NNNN)
      var maxNum = 0
      try {
        var recs = $app.findRecordsByFilter('production_orders', 'order_number != ""', '', 500, 0)
        for (var i = 0; i < recs.length; i++) {
          var raw = String(recs[i].get('order_number') || '').trim()
          if (!raw) continue
          var direto = parseInt(raw, 10)
          if (!isNaN(direto) && direto > maxNum) maxNum = direto
          var parts = raw.split('-')
          if (parts.length === 3 && parts[0] === 'OP') {
            var suf = parseInt(parts[2], 10)
            if (!isNaN(suf) && suf > maxNum) maxNum = suf
          }
        }
      } catch (_) {}

      var nextNum = maxNum + 1
      var seqStr = String(nextNum)
      while (seqStr.length < 4) seqStr = '0' + seqStr
      var orderNumber = seqStr

      return e.json(200, { number: orderNumber, sequence: nextNum })
    } catch (err) {
      $app.logger().error('production order number generation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar número de ordem de produção' })
    }
  },
  $apis.requireAuth(),
)
