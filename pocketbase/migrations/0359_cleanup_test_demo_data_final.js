/// <reference path="../pb_data/types.d.ts" />
// 0359 — Limpeza FINAL dos resquícios de dados de teste/demo (complementa a 0358).
//
// A 0358 usou os campos "numero"/"codigo" em sales_orders/sales_invoices, que não
// existem — os campos reais são order_number/invoice_number/client_name/items —
// então os filtros falharam (engolidos pelo catch) e nada foi apagado nessas
// coleções. Esta migração repete a intenção com os CAMPOS REAIS e apaga também
// o que a 0358 não contemplava (itens, dependências por order_id, CRM, clientes).
//
// NUNCA tocado aqui: empresas, users, perfis_permissoes, security_login_logs,
// fiscal_focus_nfe_config, settings, system_parameters, numerations, screen docs.
//
// Idempotente: delete por filtro; rodar de novo em banco limpo é no-op.

migrate(
  (app) => {
    var report = {}
    var nfeReport = []

    function del(col, filter) {
      var key = col + ' :: ' + filter
      try {
        var c = app.countRecordsByFilter(col, filter)
        app.deleteRecordsByFilter(col, filter)
        report[key] = c
        return c
      } catch (err) {
        report[key] = 'SKIP: ' + String(err)
        return 0
      }
    }

    // ------------------------------------------------------------------
    // 0) Pedidos de teste — coletar ids antes de apagar dependências
    // ------------------------------------------------------------------
    var orderNumbers = ['PED-FAT-TESTE-001', 'PV-000004', 'PV-000005', 'PV-000006', 'PV-000007']
    var orderFilter =
      "order_number ~ 'TESTE-' || order_number = 'PED-FAT-TESTE-001' || " +
      "order_number = 'PV-000004' || order_number = 'PV-000005' || " +
      "order_number = 'PV-000006' || order_number = 'PV-000007' || " +
      "items ~ 'TESTE-PROD-' || internal_notes ~ 'Pedido teste'"
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
    // 1) Fiscais LOCAIS criados pelos pedidos de teste (NF-e 2/3/4/1546 etc.)
    //    Lista as chaves de acesso para cancelamento EXTERNO na Focus NFe.
    // ------------------------------------------------------------------
    var nfeFilter =
      "items ~ 'TESTE-PROD-' || client_name ~ 'TESTE ' || " +
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

    var artFilter =
      "document_number = '2' || document_number = '3' || document_number = '4' || " +
      "document_number = '1546' || document_id ~ 'TESTE-'"
    if (orderIds.length > 0) artFilter = '(' + artFilter + ') || (' + idList(orderIds) + ')'
    del('fiscal_document_artifacts', artFilter)

    // ------------------------------------------------------------------
    // 2) Faturamento e dependências dos pedidos de teste
    // ------------------------------------------------------------------
    var invFilter =
      "invoice_number ~ 'TESTE-NF-' || order_number ~ 'TESTE-' || " +
      "order_number = 'PED-FAT-TESTE-001' || order_number = 'PV-000004' || " +
      "order_number = 'PV-000005' || order_number = 'PV-000006' || " +
      "order_number = 'PV-000007' || client_name ~ 'TESTE ' || items ~ 'TESTE-PROD-'"
    del('sales_invoices', invFilter)

    if (orderIds.length > 0) {
      del('stock_reservations', idList(orderIds))
      del('sales_returns', idList(orderIds))
    }
    del('stock_reservations', "product_code ~ 'TESTE-PROD-' || order_number ~ 'TESTE-'")
    del('sales_returns', "order_number ~ 'TESTE-' || client_name ~ 'TESTE '")

    // ------------------------------------------------------------------
    // 3) Financeiro vinculado aos pedidos/ clientes de teste
    // ------------------------------------------------------------------
    var recPedido =
      "numero_pedido = 'PED-FAT-TESTE-001' || numero_pedido = 'PV-000004' || " +
      "numero_pedido = 'PV-000005' || numero_pedido = 'PV-000006' || " +
      "numero_pedido = 'PV-000007' || documento_origem ~ 'PED-FAT-TESTE-'"
    del('financial_receivables', recPedido)
    del('financial_receivables', "numero_titulo ~ 'REC-TESTE-' || numero_titulo ~ 'REC-PV-'")
    del('financial_receivables', "cliente ~ 'TESTE ' || cliente ~ 'Alef Cordeiro'")
    del('financial_receivables', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_payables', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_bank_statements', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_boletos', "cliente = 'Comercio Vitoria Ltda' || nosso_numero = '000123456'")
    // carteira de cobrança de seed (0150) — reforço caso a 0358 não tenha pegado
    del(
      'financial_collections',
      "cliente ~ 'Empresa Alpha' || cliente ~ 'Comercio Beta' || cliente ~ 'Distribuidora Gamma' || cliente ~ 'Delta Comercio' || cliente ~ 'Epsilon Distribuidora' || cliente ~ 'Zeta Mercantil' || cliente ~ 'TESTE '",
    )

    // ------------------------------------------------------------------
    // 4) Pedidos de venda de teste (por último — dependências já limpas)
    // ------------------------------------------------------------------
    del('sales_orders', orderFilter)

    // Também os pedidos demo de seed (Velora Log) que sobraram sem marcador TESTE
    del(
      'sales_orders',
      "company ~ 'Velora' || client_name ~ 'Transportadora Capixaba' || client_name ~ 'Distribuidora ES S.A.' || client_name ~ 'Logística Rápida'",
    )

    // ------------------------------------------------------------------
    // 5) Produtos de teste
    // ------------------------------------------------------------------
    del(
      'products',
      "code ~ 'TESTE-PROD-' || name ~ 'TESTE ' || brand ~ 'TESTE ' || description ~ 'Produto de TESTE'",
    )

    // ------------------------------------------------------------------
    // 6) Clientes/parceiros fictícios de seed
    // ------------------------------------------------------------------
    var partnerFilter =
      "company_name ~ 'TESTE ' || trade_name ~ 'TESTE ' || " +
      "cnpj = '12.345.678/0001-90' || cnpj = '23.456.789/0001-01' || cnpj = '34.567.890/0001-12' || " +
      "cnpj = '52.519.350/0001-62' || observations ~ 'CLIENTE DE TESTE' || company_name ~ '52.519.350 ALEF'"
    del('partners', partnerFilter)
    del(
      'clients',
      "name ~ 'TESTE ' || cnpj ~ '12.345.678' || cnpj ~ '23.456.789' || cnpj ~ '34.567.890' || cnpj ~ '52519350'",
    )
    del('customers', "nome ~ 'TESTE ' || razao_social ~ 'TESTE '")

    // ------------------------------------------------------------------
    // 7) CRM de teste (0074) e atendimentos de teste remanescentes
    // ------------------------------------------------------------------
    del('crm_leads', "name ~ 'TESTE ' || client_name ~ 'TESTE '")
    del('crm_opportunities', "client_name ~ 'TESTE '")
    del('crm_activities', "client_name ~ 'TESTE '")
    del('crm_proposals', "client_name ~ 'TESTE '")
    del('service_centers', "client_name ~ 'TESTE ' || descricao ~ 'TESTE-ATEND-'")

    // ------------------------------------------------------------------
    // 8) Tabelas de preço e cofre de preço de seed (guardado por filtro)
    // ------------------------------------------------------------------
    del('price_tables', "numero_tabela ~ 'TESTE' || nome ~ 'TESTE '")
    del('price_vault', "code ~ 'TESTE-' || name ~ 'TESTE '")

    // ------------------------------------------------------------------
    // Relatório
    // ------------------------------------------------------------------
    console.log('0359 cleanup report: ' + JSON.stringify(report))
    if (nfeReport.length > 0) {
      console.log(
        '0359 NFEs de teste apagadas localmente (CANCELAR NA FOCUS NFE): ' +
          JSON.stringify(nfeReport),
      )
    }
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
