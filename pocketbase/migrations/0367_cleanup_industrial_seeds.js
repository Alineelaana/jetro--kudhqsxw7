/// <reference path="../pb_data/types.d.ts" />
// 0367 — Limpeza dos seeds do MÓDULO INDUSTRIAL de azeitonas (e seeds de módulo restantes).
//
// A 0358-0362 apagaram pedidos/financeiro/Velora/WMS/NFs/produtos TESTE-*. O que restava
// eram os seeds das migrações 0080/0099/0101/0105 do módulo industrial, criados em LOTE
// na madrugada de 2026-08-07 (products com created 00:07:59.876-877Z).
//
// IDENTIFICAÇÃO SEGURA — só apaga registro que atenda a UM destes critérios:
//   a) products com código IND-MP-* / IND-EMB-* / IND-PA-* (nunca criados pelo usuário —
//      os produtos reais têm códigos/EANs próprios, ex. EAN 7898647930841, criado 2026-11-10);
//   b) códigos/nomes EXATOS semeados pelas migrações (ECR-2026-001, ECO-2026-001,
//      MPP-2026-08, DEM-2026-001, RES-0001, LOT-REC-001/002, LOT-PROD-001, LOT-EXP-001...);
//   c) criados em 2026-08-07 (janela do dia inteiro do lote de aplicação das seeds) nas
//      coleções do módulo industrial — o uso real do usuário começa em novembro/2026.
//
// NUNCA tocado aqui: empresas, users, perfis/vínculos, fiscal_focus_nfe_config,
// security_login_logs, settings, system_parameters, numerations, projetos "Geral" e os
// 17 tipos da governança AvatarSi (0365/0366), nem QUALQUER registro criado pelo uso real.
//
// Padrão JSVM: findRecordsByFilter + app.delete(rec) — deleteRecordsByFilter NÃO existe
// na JSVM (lição da 0358/0362). Idempotente: delete por filtro; rerun em banco limpo é no-op.

migrate(
  (app) => {
    var report = {}

    function del(col, filter) {
      var key = col + ' :: ' + filter
      try {
        var recs = app.findRecordsByFilter(col, filter, '-created', 500, 0)
        var ok = 0
        for (var i = 0; i < recs.length; i++) {
          try {
            app.delete(recs[i])
            ok++
          } catch (e2) {
            console.log('0367 delete falhou em ' + col + ' id=' + recs[i].id + ': ' + e2)
          }
        }
        report[key] = ok
        return ok
      } catch (err) {
        // coleção ou campo inexistente: ignora (idempotente/pacífico)
        report[key] = 'SKIP: ' + String(err)
        return 0
      }
    }

    // Janela do dia do lote de seeds (uso real do usuário só começa em 2026-11)
    var SEED_DAY = "created >= '2026-08-07 00:00:00.000Z' && created <= '2026-08-07 23:59:59.999Z'"

    function idList(ids) {
      var parts = []
      for (var i = 0; i < ids.length; i++) {
        parts.push('id = "' + ids[i] + '"')
      }
      return parts.join(' || ')
    }
    function fieldIn(field, ids) {
      var parts = []
      for (var i = 0; i < ids.length; i++) {
        parts.push(field + ' = "' + ids[i] + '"')
      }
      return parts.join(' || ')
    }

    // ------------------------------------------------------------------
    // 1) Produtos seed do módulo industrial (0080) — coletar ids ANTES
    // ------------------------------------------------------------------
    var indIds = []
    try {
      var inds = app.findRecordsByFilter('products', "code ~ 'IND-'", '-created', 500, 0)
      for (var i = 0; i < inds.length; i++) {
        indIds.push(inds[i].id)
      }
    } catch (_) {}

    // ------------------------------------------------------------------
    // 2) Dependências diretas desses produtos (BOM, rotas, custos)
    // ------------------------------------------------------------------
    if (indIds.length > 0) {
      // BOM: componentes das versões desses produtos + componentes que usam os itens
      var bomVersionIds = []
      try {
        var bvs = app.findRecordsByFilter(
          'bom_versions',
          fieldIn('product_id', indIds),
          '-created',
          100,
          0,
        )
        for (var b = 0; b < bvs.length; b++) bomVersionIds.push(bvs[b].id)
      } catch (_) {}
      if (bomVersionIds.length > 0) {
        del(
          'bom_components',
          fieldIn('item_id', indIds) + ' || ' + fieldIn('bom_version_id', bomVersionIds),
        )
        del('bom_versions', fieldIn('id', bomVersionIds))
      } else {
        del('bom_components', fieldIn('item_id', indIds))
      }

      // Rotos de produção desses produtos
      var routeIds = []
      try {
        var rts = app.findRecordsByFilter(
          'production_routes',
          fieldIn('product_id', indIds),
          '-created',
          100,
          0,
        )
        for (var r = 0; r < rts.length; r++) routeIds.push(rts[r].id)
      } catch (_) {}
      if (routeIds.length > 0) {
        del('production_route_operations', fieldIn('route_id', routeIds))
        del('production_routes', fieldIn('id', routeIds))
      }

      // Custos industriais calculados para esses produtos
      del('industrial_costs', fieldIn('item_id', indIds))
    }

    // ------------------------------------------------------------------
    // 3) Recursos/engenharia/PCP semeados (0080/0099/0101) — códigos exatos
    //    + janela do dia de seed
    // ------------------------------------------------------------------
    del('production_resources', "code = 'RES-0001' || (" + SEED_DAY + ')')
    del('engineering_change_requests', "ecr_number = 'ECR-2026-001' || (" + SEED_DAY + ')')
    del('engineering_change_orders', "eco_number = 'ECO-2026-001' || (" + SEED_DAY + ')')
    del('master_production_plans', "plan_number = 'MPP-2026-08' || (" + SEED_DAY + ')')
    del('production_simulations', "name = 'Simulacao Capacidade Agosto' || (" + SEED_DAY + ')')
    del(
      'engineering_documents',
      "name = 'Especificacao Tecnica Azeitona 200ml' || (" + SEED_DAY + ')',
    )
    del('industrial_demand', "demand_number = 'DEM-2026-001' || (" + SEED_DAY + ')')

    // Fases e custos de fase do seed 0101
    var phaseIds = []
    try {
      var phs = app.findRecordsByFilter('industrial_phases', SEED_DAY, '-created', 200, 0)
      for (var p = 0; p < phs.length; p++) phaseIds.push(phs[p].id)
    } catch (_) {}
    if (phaseIds.length > 0) {
      del('industrial_phase_costs', fieldIn('phase_id', phaseIds))
      del('industrial_phases', fieldIn('id', phaseIds))
    }

    // ------------------------------------------------------------------
    // 4) Simulação e2e (0105): ordens de produção, rastreabilidade e lotes
    // ------------------------------------------------------------------
    del('industrial_traceability', "lot_number ~ 'LOT-' || (" + SEED_DAY + ')')
    del('production_orders', SEED_DAY)

    // ------------------------------------------------------------------
    // 5) Elo agrícola do módulo de azeitonas (coleções da 0300; seeds do e2e 0105)
    // ------------------------------------------------------------------
    var oliveCols = [
      'olive_harvest_tickets',
      'curing_tanks',
      'curing_batches',
      'curing_measurements',
      'production_line_losses',
      'laboratory_analysis_plans',
      'laboratory_analyses',
      'laboratory_laudos',
      'agricultural_producers',
    ]
    for (var c = 0; c < oliveCols.length; c++) {
      del(oliveCols[c], SEED_DAY)
    }

    // ------------------------------------------------------------------
    // 6) Por último: os produtos seed IND-*
    // ------------------------------------------------------------------
    del('products', "code ~ 'IND-'")

    console.log('0367 cleanup report: ' + JSON.stringify(report))
  },
  (app) => {
    // down: no-op — dados de teste não são recriados
  },
)
