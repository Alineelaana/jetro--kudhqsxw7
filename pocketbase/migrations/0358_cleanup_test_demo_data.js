/// <reference path="../pb_data/types.d.ts" />
// 0358 — Limpeza de dados de teste/demo criados pelas seeds do sistema
// (0055/0057/0150/0159 etc.) e pelos fluxos de validação com prefixo TESTE.
//
// PRESERVADO de propósito: empresas (todas as reais), users, perfis_permissoes,
// security_config, settings, system_parameters, numerations, fiscal_configurations,
// integrations, api_credentials, audit_logs, audit_sessions, plano_contas e
// demais estruturas de referência. Nada estrutural é alterado — só DELETE de dados.
//
// Idempotente: rodar de novo em banco limpo é no-op (delete por filtro).

migrate(
  (app) => {
    var report = {}

    function del(col, filter) {
      var key = col + ' :: ' + filter
      try {
        var c = app.countRecordsByFilter(col, filter)
        app.deleteRecordsByFilter(col, filter)
        report[key] = c
      } catch (err) {
        // coleção inexistente ou campo inexistente: ignora (idempotente/pacífico)
        report[key] = 'SKIP: ' + String(err)
      }
    }

    // ------------------------------------------------------------------
    // 1) Seed financeiro (0057 + 0150) e testes de faturamento
    // ------------------------------------------------------------------
    del('financial_receivables', "numero_titulo ~ 'TR-2026-'")
    del('financial_receivables', "numero_titulo ~ 'TR-TESTE-'")
    del('financial_receivables', "numero_titulo ~ 'PRV-TESTE-'")
    del('financial_receivables', "numero_titulo ~ 'PRV-PED-000'")
    del('financial_receivables', "numero_titulo ~ 'REC-00'")
    del('financial_receivables', "numero_pedido ~ 'TESTE-'")
    del('financial_receivables', "numero_pedido ~ 'PED-FAT-TESTE-'")
    del('financial_receivables', "numero_nota_fiscal ~ 'TESTE-NF-'")
    del('financial_receivables', "cliente ~ 'TESTE '")

    del('financial_payables', "numero_titulo ~ 'TP-2026-'")
    del('financial_payables', "numero_titulo ~ 'TP-TESTE-'")

    del('financial_movements', "documento ~ 'TR-2026-' || documento ~ 'TP-2026-'")
    del('financial_reconciliation', "documento ~ 'TR-2026-' || documento ~ 'TP-2026-'")
    del('financial_bank_statements', "documento ~ 'TR-2026-' || documento ~ 'TP-2026-'")
    del('financial_boletos', "cliente ~ 'Comercio Vitoria'")
    del('financial_pix', "identificador_transacao ~ 'PIX-2026-'")
    del('financial_cash_registers', "nome_caixa = 'Caixa Operacional 01'")
    del(
      'financial_collections',
      "cliente ~ 'Empresa Alpha' || cliente ~ 'Comercio Beta' || cliente ~ 'Distribuidora Gamma' || cliente ~ 'Delta Comercio' || cliente ~ 'Epsilon Distribuidora' || cliente ~ 'Zeta Mercantil' || cliente ~ 'TESTE '",
    )

    // template de e-mail demo criado pela seed 0057
    del('email_templates', "name = 'Confirmacao de Recebimento'")

    // ------------------------------------------------------------------
    // 2) Seed operacional end-to-end (0159) — tudo da empresa fictícia Velora Log
    // ------------------------------------------------------------------
    del('logistics_vehicles', "empresa ~ 'Velora'")
    del('logistics_drivers', "empresa ~ 'Velora'")
    del('logistics_routes', "empresa ~ 'Velora'")
    del('logistics_deliveries', "empresa ~ 'Velora'")
    del('logistics_costs', "empresa ~ 'Velora'")
    del('wms_romaneios', "numero_romaneio ~ 'ROM-00'")
    del('wms_receipts', "numero_recebimento ~ 'REC-0'")
    del('wms_waves', "numero_wave ~ 'WAVE-'")
    del('transport_journeys', "numero_viagem ~ 'VIA-00'")

    // ------------------------------------------------------------------
    // 3) Registro TESTE / demo em coleções de negócio (pedidos, NFs, cadastros)
    // ------------------------------------------------------------------
    del('sales_orders', "numero ~ 'TESTE-' || numero ~ 'PED-FAT-TESTE-' || codigo ~ 'TESTE-'")
    del('sales_invoices', "numero ~ 'TESTE-NF-'")
    del('customers', "nome ~ 'TESTE ' || razao_social ~ 'TESTE '")
    del('partners', "nome ~ 'TESTE ' || razao_social ~ 'TESTE '")
    del('purchase_invoices', "numero ~ 'TESTE-' || numero_pedido ~ 'PED-FAT-TESTE-'")

    // ------------------------------------------------------------------
    // 4) Simulação industrial e2e (0105) e RH/DP/SST (0066) da Velora Log
    // ------------------------------------------------------------------
    del('industrial_traceability', "lot_number ~ 'LOT-REC-00' || empresa ~ 'Velora'")
    var veloraCandidates = [
      'industrial_harvest_tickets',
      'industrial_cure_tanks',
      'industrial_line_losses',
      'industrial_lab_reports',
      'rh_funcionarios',
      'rh_escalas',
      'dp_folha',
      'dp_eventos',
      'sst_ocorrencias',
    ]
    for (var i = 0; i < veloraCandidates.length; i++) {
      del(veloraCandidates[i], "empresa ~ 'Velora'")
    }

    console.log('0358 cleanup report: ' + JSON.stringify(report))
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
