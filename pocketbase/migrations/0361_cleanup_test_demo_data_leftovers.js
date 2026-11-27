/// <reference path="../pb_data/types.d.ts" />
// 0361 — Resquícios de teste/demo que a 0360 não pegou (mesma intenção da 0359).
//
// A 0360 apagou NFs 2/3/4/1546, pedidos PV-000004/5/6/7 e PED-FAT-TESTE-001,
// mas ainda restavam: pedidos TESTE-PED-0001/0002 (client_name "TESTE ..."),
// títulos demo REC-001..008 (seed 0150: Empresa Alpha, Comercio Beta, etc.),
// o título REC-PED-FAT-001 (vínculo do pedido PED-FAT-TESTE-001) e o parceiro
// fictício 52.519.350 ALEF CORDEIRO GONCALVES.
//
// Padrão JSVM: findRecordsByFilter + app.delete(rec) (deleteRecordsByFilter
// NÃO existe na JSVM — a 0359 falhou silenciosamente por causa disso).
//
// NUNCA tocado aqui: empresas, users, perfis_permissoes, security_login_logs,
// fiscal_focus_nfe_config, settings, system_parameters, numerations.
//
// Idempotente: rodar de novo em banco limpo é no-op.

migrate(
  (app) => {
    var report = {}

    function del(col, filter) {
      var key = col + ' :: ' + filter
      try {
        var recs = app.findRecordsByFilter(col, filter, '-created', 500, 0)
        for (var i = 0; i < recs.length; i++) {
          try {
            app.delete(recs[i])
          } catch (e2) {
            console.log('0361 delete falhou em ' + col + ' id=' + recs[i].id + ': ' + e2)
          }
        }
        report[key] = recs.length
        return recs.length
      } catch (err) {
        report[key] = 'SKIP: ' + String(err)
        return 0
      }
    }

    // 1) Pedidos de venda de teste restantes (TESTE-PED-*, cliente "TESTE ...")
    del(
      'sales_orders',
      "order_number ~ 'TESTE-' || client_name ~ 'TESTE ' || items ~ 'TESTE-PROD-'",
    )

    // 2) Dependências dos pedidos TESTE-PED (faturamento, devoluções, reservas)
    del('sales_invoices', "client_name ~ 'TESTE ' || items ~ 'TESTE-PROD-'")
    del('sales_returns', "client_name ~ 'TESTE ' || items ~ 'TESTE-PROD-'")
    del('stock_reservations', "order_number ~ 'TESTE-' || product_code ~ 'TESTE-PROD-'")

    // 3) Financeiro de teste/demo: títulos REC-001..008 (seed 0150) e
    //    REC-PED-FAT-001 (provisão do pedido PED-FAT-TESTE-001)
    del(
      'financial_receivables',
      "numero_titulo ~ 'REC-' || cliente ~ 'Empresa Alpha' || cliente ~ 'Comercio Beta' || " +
        "cliente ~ 'Distribuidora Gamma' || cliente ~ 'Delta Comercio' || " +
        "cliente ~ 'Epsilon Distribuidora' || cliente ~ 'Zeta Mercantil' || " +
        "cliente ~ 'TESTE ' || numero_pedido = 'PED-FAT-TESTE-001' || " +
        "conta_bancaria = 'Banco do Brasil - Conta 12345-6'",
    )
    del('financial_payables', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_bank_statements', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_boletos', "cliente = 'Comercio Vitoria Ltda' || nosso_numero = '000123456'")
    del(
      'financial_collections',
      "cliente ~ 'Empresa Alpha' || cliente ~ 'Comercio Beta' || cliente ~ 'Distribuidora Gamma' || " +
        "cliente ~ 'Delta Comercio' || cliente ~ 'Epsilon Distribuidora' || cliente ~ 'Zeta Mercantil' || " +
        "cliente ~ 'TESTE '",
    )

    // 4) Parceiros/clientes fictícios de seed
    del(
      'partners',
      "company_name ~ 'TESTE ' || trade_name ~ 'TESTE ' || company_name ~ '52.519.350 ALEF' || " +
        "cnpj = '52.519.350/0001-62' || observations ~ 'CLIENTE DE TESTE'",
    )
    del(
      'clients',
      "name ~ 'TESTE ' || cnpj ~ '12.345.678' || cnpj ~ '23.456.789' || cnpj ~ '34.567.890' || cnpj ~ '52519350'",
    )

    // 5) CRM/atendimentos de teste remanescentes
    del('crm_leads', "name ~ 'TESTE ' || client_name ~ 'TESTE '")
    del('crm_opportunities', "client_name ~ 'TESTE '")
    del('crm_activities', "client_name ~ 'TESTE '")
    del('crm_proposals', "client_name ~ 'TESTE '")

    // 6) Produtos de teste (reforço — itens marcados TESTE no nome)
    del('products', "code ~ 'TESTE-PROD-' || name ~ 'TESTE '")

    console.log('0361 cleanup report: ' + JSON.stringify(report))
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
