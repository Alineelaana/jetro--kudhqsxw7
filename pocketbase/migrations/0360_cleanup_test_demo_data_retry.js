/// <reference path="../pb_data/types.d.ts" />
// 0360 — Correção da 0359: mesma limpeza, com o padrão que FUNCIONA nesta JSVM.
//
// A 0359 usou app.countRecordsByFilter / app.deleteRecordsByFilter, que não
// existem na JSVM do PocketBase — os erros foram engolidos pelo catch e nada
// foi apagado. Aqui repetimos os MESMOS filtros com findRecordsByFilter +
// app.delete(rec) (padrão validado na 0195 e em todo o histórico do projeto).
//
// NUNCA tocado aqui: empresas, users, perfis_permissoes, security_login_logs,
// fiscal_focus_nfe_config, settings, system_parameters, numerations.
//
// Idempotente: delete por filtro; rodar de novo em banco limpo é no-op.

migrate(
  (app) => {
    var report = {}
    var nfeReport = []

    function del(col, filter) {
      var key = col + ' :: ' + filter
      try {
        var recs = app.findRecordsByFilter(col, filter, '-created', 500, 0)
        for (var i = 0; i < recs.length; i++) {
          try {
            app.delete(recs[i])
          } catch (e2) {
            console.log('0360 delete falhou em ' + col + ' id=' + recs[i].id + ': ' + e2)
          }
        }
        report[key] = recs.length
        return recs.length
      } catch (err) {
        report[key] = 'SKIP: ' + String(err)
        return 0
      }
    }

    // ------------------------------------------------------------------
    // 0) Pedidos de teste — coletar ids antes de apagar dependências
    // ------------------------------------------------------------------
    var orderFilter =
      "order_number = 'PED-FAT-TESTE-001' || " +
      "order_number = 'PV-000004' || order_number = 'PV-000005' || " +
      "order_number = 'PV-000006' || order_number = 'PV-000007' || " +
      "internal_notes ~ 'Pedido teste'"
    var orderIds = []
    try {
      var orders = app.findRecordsByFilter('sales_orders', orderFilter, '-created', 500, 0)
      for (var i = 0; i < orders.length; i++) {
        orderIds.push(orders[i].id)
      }
    } catch (_) {}

    function idList(ids) {
      var parts = []
      for (var i = 0; i < ids.length; i++) {
        parts.push('order_id = "' + ids[i] + '"')
      }
      return parts.join(' || ')
    }

    // ------------------------------------------------------------------
    // 1) Fiscais LOCAIS criados pelos pedidos de teste (NF-e 2/3/4/1546)
    //    Lista as chaves de acesso para cancelamento EXTERNO na Focus NFe.
    // ------------------------------------------------------------------
    var nfeFilter =
      "nfe_number = '2' || nfe_number = '3' || nfe_number = '4' || nfe_number = '1546'"
    try {
      var nfes = app.findRecordsByFilter('nfe_records', nfeFilter, '-created', 200, 0)
      for (var n = 0; n < nfes.length; n++) {
        nfeReport.push({
          nfe_number: nfes[n].getString('nfe_number'),
          serie: nfes[n].getString('serie'),
          chave_acesso: nfes[n].getString('chave_acesso'),
          client_name: nfes[n].getString('client_name'),
        })
      }
    } catch (_) {}
    del('nfe_records', nfeFilter)

    // ------------------------------------------------------------------
    // 2) Faturamento e dependências dos pedidos de teste
    // ------------------------------------------------------------------
    var invFilter =
      "order_number = 'PED-FAT-TESTE-001' || order_number = 'PV-000004' || " +
      "order_number = 'PV-000005' || order_number = 'PV-000006' || " +
      "order_number = 'PV-000007'"
    del('sales_invoices', invFilter)

    if (orderIds.length > 0) {
      del('stock_reservations', idList(orderIds))
      del('sales_returns', idList(orderIds))
    }

    // ------------------------------------------------------------------
    // 3) Financeiro vinculado aos pedidos/clientes de teste
    // ------------------------------------------------------------------
    var recPedido = invFilter
    del('financial_receivables', recPedido)
    del('financial_receivables', "numero_titulo ~ 'REC-TESTE-' || numero_titulo ~ 'REC-PV-'")
    del('financial_receivables', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_payables', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_bank_statements', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_boletos', "cliente = 'Comercio Vitoria Ltda' || nosso_numero = '000123456'")

    // ------------------------------------------------------------------
    // 4) Pedidos de venda de teste (por último — dependências já limpas)
    // ------------------------------------------------------------------
    del('sales_orders', orderFilter)

    // ------------------------------------------------------------------
    // 5) Produtos de teste
    // ------------------------------------------------------------------
    del('products', "code ~ 'TESTE-PROD-'")

    // ------------------------------------------------------------------
    // Relatório
    // ------------------------------------------------------------------
    console.log('0360 cleanup report: ' + JSON.stringify(report))
    if (nfeReport.length > 0) {
      console.log(
        '0360 NFEs de teste apagadas localmente (CANCELAR NA FOCUS NFE): ' +
          JSON.stringify(nfeReport),
      )
    }
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
