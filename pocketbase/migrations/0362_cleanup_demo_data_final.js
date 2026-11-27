/// <reference path="../pb_data/types.d.ts" />
// 0362 — Limpeza FINAL dos dados de demonstração antigos (segunda leva).
//
// A 0359/0360/0361 apagaram pedidos TESTE-*/PV-000004..7, NFs 2/3/4/1546,
// produtos TESTE-PROD-*, parceiros fictícios e títulos REC-001..008.
// Esta migração apaga o que AINDA restava (confirmado via db_query em 2026-11-27):
//
//  1) Pedidos de venda demo PED-0001/0002/0003 (seed 0036) — clientes fictícios
//     "Transportadora Capixaba Ltda", "Distribuidora ES S.A.", "Logística Rápida ME".
//  2) NF-e local nº 9592 (ambiente HOMOLOGAÇÃO, chave 32261145143101000150550010000095921291271254)
//     vinculada à PED-0001 — a CHAVE É LOGADA para o usuário cancelar na Focus NFe;
//     aqui só o registro local é apagado. (fiscal_document_artifacts não existe — nada lá.)
//  3) Financeiro demo do seed 0057: recebíveis TR-2026-0001..0004 + PRV-PED-000x,
//     pagáveis TP-2026-0001/0002, movimentos/extratos/conciliação da conta fictícia
//     "Banco do Brasil - Conta 12345-6", boleto 000123456, PIX-2026-0001,
//     caixa "Caixa Operacional 01" e template de e-mail demo.
//  4) Produtos demo do seed 0028: PROD-2026-0001..0004 (Caixa de Papelao, Pallet,
//     Stretch, Fita Adesiva — marcas fictícias PackLog/MadeiraLog/AdesivaLog).
//     (P001/P002/P003 NÃO existem na coleção products — conferido via db_query.)
//  5) Fluxo operacional fictício dos seeds 0157/0159 (empresa fictícia "Velora Log"):
//     veículos VEIC-001..005, motoristas por CPF fictício, rotas RT-*, entregas
//     ENT-001..005, fretes FRE-001/002, tracking, custos, viagens VIA-001..006 e WMS
//     (ROM-001/002, REC-001, WAVE-001, SEP-001/002, EXP-001/002).
//
// Padrão JSVM: findRecordsByFilter + app.delete(rec) — deleteRecordsByFilter NÃO
// existe na JSVM (lição da 0358/0359). Todo campo de filtro foi conferido no schema
// real ou num seed que gravou com sucesso naquela coleção.
//
// NUNCA tocado aqui: empresas, filiais, users, perfis_permissoes, vínculos,
// fiscal_focus_nfe_config, security_login_logs, settings, system_parameters,
// numerations, bancos, contas_bancarias (config), formas/condições de pagamento.
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
            console.log('0362 delete falhou em ' + col + ' id=' + recs[i].id + ': ' + e2)
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
    // 1) Pedidos de venda demo PED-0001/0002/0003 — coletar ids antes
    // ------------------------------------------------------------------
    var orderFilter =
      "order_number = 'PED-0001' || order_number = 'PED-0002' || order_number = 'PED-0003'"
    var orderIds = []
    try {
      var orders = app.findRecordsByFilter('sales_orders', orderFilter, '-created', 100, 0)
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
    // 2) NF-e LOCAL da PED-0001 (nº 9592, homologação) — logar chave p/ Focus NFe
    // ------------------------------------------------------------------
    var nfeFilter =
      "sales_order_number = 'PED-0001' || nfe_number = '9592' || " +
      "chave_acesso = '32261145143101000150550010000095921291271254'"
    if (orderIds.length > 0) {
      var byOrder = idList(orderIds)
      if (byOrder) nfeFilter = nfeFilter + ' || ' + byOrder
    }
    try {
      var nfes = app.findRecordsByFilter('nfe_records', nfeFilter, '-created', 200, 0)
      for (var n = 0; n < nfes.length; n++) {
        nfeReport.push({
          nfe_number: nfes[n].getString('nfe_number'),
          serie: nfes[n].getString('serie'),
          chave_acesso: nfes[n].getString('chave_acesso'),
          ambiente: nfes[n].getString('ambiente'),
          sales_order_number: nfes[n].getString('sales_order_number'),
        })
      }
    } catch (_) {}
    del('nfe_records', nfeFilter)

    // ------------------------------------------------------------------
    // 3) Faturamento/devoluções vinculados aos pedidos demo
    // ------------------------------------------------------------------
    del('sales_invoices', orderFilter)
    del('sales_returns', orderFilter)

    // ------------------------------------------------------------------
    // 4) Financeiro demo (seed 0057) — conta fictícia e títulos
    // ------------------------------------------------------------------
    del(
      'financial_receivables',
      "numero_titulo = 'TR-2026-0001' || numero_titulo = 'TR-2026-0002' || " +
        "numero_titulo = 'TR-2026-0003' || numero_titulo = 'TR-2026-0004' || " +
        "numero_titulo = 'PRV-PED-0001' || numero_titulo = 'PRV-PED-0002' || " +
        "numero_titulo = 'PRV-PED-0003' || " +
        "numero_pedido = 'PED-0001' || numero_pedido = 'PED-0002' || numero_pedido = 'PED-0003'",
    )
    del(
      'financial_payables',
      "numero_titulo = 'TP-2026-0001' || numero_titulo = 'TP-2026-0002' || " +
        "conta_bancaria = 'Banco do Brasil - Conta 12345-6'",
    )
    del('financial_movements', "conta = 'Banco do Brasil - Conta 12345-6'")
    del('financial_bank_statements', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_reconciliation', "conta_bancaria = 'Banco do Brasil - Conta 12345-6'")
    del('financial_boletos', "nosso_numero = '000123456'")
    del('financial_pix', "identificador_transacao = 'PIX-2026-0001'")
    del('financial_cash_registers', "nome_caixa = 'Caixa Operacional 01'")
    del('email_templates', "name = 'Confirmacao de Recebimento'")

    // ------------------------------------------------------------------
    // 5) Pedidos demo (por último — dependências já limpas)
    // ------------------------------------------------------------------
    del('sales_orders', orderFilter)

    // ------------------------------------------------------------------
    // 6) Produtos demo do seed 0028
    // ------------------------------------------------------------------
    del(
      'products',
      "code = 'PROD-2026-0001' || code = 'PROD-2026-0002' || " +
        "code = 'PROD-2026-0003' || code = 'PROD-2026-0004'",
    )

    // ------------------------------------------------------------------
    // 7) Fluxo operacional fictício "Velora Log" (seeds 0157/0159)
    // ------------------------------------------------------------------
    del(
      'logistics_vehicles',
      "codigo = 'VEIC-001' || codigo = 'VEIC-002' || codigo = 'VEIC-003' || codigo = 'VEIC-004' || codigo = 'VEIC-005'",
    )
    del(
      'logistics_drivers',
      "cpf = '123.456.789-01' || cpf = '234.567.890-12' || cpf = '345.678.901-23' || " +
        "cpf = '456.789.012-34' || cpf = '567.890.123-45'",
    )
    del(
      'logistics_routes',
      "codigo_rota = 'RT-NORTE-01' || codigo_rota = 'RT-SUL-01' || " +
        "codigo_rota = 'RT-METRO-01' || codigo_rota = 'RT-CENTRAL-01'",
    )
    del(
      'logistics_deliveries',
      "numero_entrega = 'ENT-001' || numero_entrega = 'ENT-002' || numero_entrega = 'ENT-003' || " +
        "numero_entrega = 'ENT-004' || numero_entrega = 'ENT-005'",
    )
    del('logistics_freights', "numero_frete = 'FRE-001' || numero_frete = 'FRE-002'")
    del('logistics_tracking', "entrega = 'ENT-001' || entrega = 'ENT-003'")
    del(
      'logistics_costs',
      "descricao = 'Combustível - VIA-004' || descricao = 'Pedágio - VIA-004' || " +
        "descricao = 'Combustível - VIA-001' || descricao = 'Pedágio - VIA-001' || " +
        "descricao = 'Combustível - VIA-003 (Finalizada)'",
    )
    del(
      'transport_journeys',
      "numero_viagem = 'VIA-001' || numero_viagem = 'VIA-002' || numero_viagem = 'VIA-003' || " +
        "numero_viagem = 'VIA-004' || numero_viagem = 'VIA-005' || numero_viagem = 'VIA-006'",
    )
    del('wms_romaneios', "numero_romaneio = 'ROM-001' || numero_romaneio = 'ROM-002'")
    del('wms_receipts', "numero_recebimento = 'REC-001'")
    del('wms_waves', "numero_wave = 'WAVE-001'")
    del('wms_separations', "numero_separacao = 'SEP-001' || numero_separacao = 'SEP-002'")
    del('wms_shippings', "numero_expedicao = 'EXP-001' || numero_expedicao = 'EXP-002'")

    // ------------------------------------------------------------------
    // Relatório
    // ------------------------------------------------------------------
    console.log('0362 cleanup report: ' + JSON.stringify(report))
    if (nfeReport.length > 0) {
      console.log(
        '0362 NFs de teste apagadas localmente (CANCELAR NA FOCUS NFE se transmitidas): ' +
          JSON.stringify(nfeReport),
      )
    }
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
