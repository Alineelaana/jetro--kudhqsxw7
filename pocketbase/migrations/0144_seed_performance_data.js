migrate(
  (app) => {
    var SA = "@request.auth.role = 'SUP'"

    var kpis = [
      {
        code: 'KPI-001',
        name: 'Faturamento Mensal',
        module: 'comercial',
        category: 'Receita',
        formula_source: 'sales_orders.total_value',
        unit: 'BRL',
        direction: 'higher_is_better',
        weight: 10,
        periodicity: 'mensal',
        active: true,
      },
      {
        code: 'KPI-002',
        name: 'Entregas no Prazo',
        module: 'logistica',
        category: 'Eficiência',
        formula_source: 'logistics_deliveries.on_time',
        unit: '%',
        direction: 'higher_is_better',
        weight: 8,
        periodicity: 'semanal',
        active: true,
      },
      {
        code: 'KPI-003',
        name: 'Custo Operacional',
        module: 'financeiro',
        category: 'Custo',
        formula_source: 'financial_payables.total',
        unit: 'BRL',
        direction: 'lower_is_better',
        weight: 7,
        periodicity: 'mensal',
        active: true,
      },
      {
        code: 'KPI-004',
        name: 'Satisfação do Cliente',
        module: 'comercial',
        category: 'Qualidade',
        formula_source: 'chat_ratings.rating',
        unit: 'pontos',
        direction: 'higher_is_better',
        weight: 9,
        periodicity: 'mensal',
        active: true,
      },
      {
        code: 'KPI-005',
        name: 'Giro de Estoque',
        module: 'estoque',
        category: 'Eficiência',
        formula_source: 'products.stock / sales',
        unit: 'x',
        direction: 'higher_is_better',
        weight: 6,
        periodicity: 'mensal',
        active: true,
      },
    ]

    var kpisCol = app.findCollectionByNameOrId('performance_kpis')
    for (var i = 0; i < kpis.length; i++) {
      try {
        app.findFirstRecordByData('performance_kpis', 'code', kpis[i].code)
      } catch (_) {
        var rec = new Record(kpisCol)
        rec.set('code', kpis[i].code)
        rec.set('name', kpis[i].name)
        rec.set('module', kpis[i].module)
        rec.set('category', kpis[i].category)
        rec.set('formula_source', kpis[i].formula_source)
        rec.set('unit', kpis[i].unit)
        rec.set('direction', kpis[i].direction)
        rec.set('weight', kpis[i].weight)
        rec.set('periodicity', kpis[i].periodicity)
        rec.set('active', kpis[i].active)
        app.save(rec)
      }
    }

    try {
      app.findFirstRecordByData('performance_config', 'company', 'VeloraLog')
    } catch (_) {
      var cfgCol = app.findCollectionByNameOrId('performance_config')
      var cfg = new Record(cfgCol)
      cfg.set('company', 'VeloraLog')
      cfg.set('periodicity', 'mensal')
      cfg.set('gamification_enabled', true)
      cfg.set('indicators', JSON.stringify(['KPI-001', 'KPI-002', 'KPI-003', 'KPI-004', 'KPI-005']))
      cfg.set(
        'weights',
        JSON.stringify({ 'KPI-001': 10, 'KPI-002': 8, 'KPI-003': 7, 'KPI-004': 9, 'KPI-005': 6 }),
      )
      cfg.set(
        'goals',
        JSON.stringify({
          'KPI-001': 'Crescimento 15%',
          'KPI-002': '98% no prazo',
          'KPI-003': 'Redução 5%',
          'KPI-004': '4.5/5',
          'KPI-005': 'Giro 6x',
        }),
      )
      cfg.set('departments', JSON.stringify(['Comercial', 'Logística', 'Financeiro', 'Operações']))
      cfg.set('dashboards', JSON.stringify(['executive', 'commercial', 'logistics', 'financial']))
      app.save(cfg)
    }

    var games = [
      {
        type: 'medalha',
        name: 'Top Entregador',
        description: 'Melhor taxa de entregas no prazo do mês',
        icon: 'trophy',
        active: true,
      },
      {
        type: 'conquista',
        name: 'Meta de Faturamento',
        description: 'Atingir 110% da meta de faturamento mensal',
        icon: 'target',
        active: true,
      },
      {
        type: 'ranking',
        name: 'Ranking Comercial',
        description: 'Ranking mensal dos melhores resultados comerciais',
        icon: 'bar-chart',
        active: true,
      },
    ]
    var gameCol = app.findCollectionByNameOrId('performance_gamification')
    for (var j = 0; j < games.length; j++) {
      try {
        app.findFirstRecordByData('performance_gamification', 'name', games[j].name)
      } catch (_) {
        var g = new Record(gameCol)
        g.set('type', games[j].type)
        g.set('name', games[j].name)
        g.set('description', games[j].description)
        g.set('icon', games[j].icon)
        g.set('active', games[j].active)
        g.set('company', 'VeloraLog')
        app.save(g)
      }
    }

    var scores = [
      {
        entity_type: 'empresa',
        entity_name: 'VeloraLog',
        period: '2026-07-01',
        score: 82,
        components: JSON.stringify({ comercial: 85, logistica: 88, financeiro: 73 }),
      },
      {
        entity_type: 'departamento',
        entity_name: 'Logística',
        period: '2026-07-01',
        score: 88,
        components: JSON.stringify({ entregas: 92, custo: 84 }),
      },
      {
        entity_type: 'departamento',
        entity_name: 'Comercial',
        period: '2026-07-01',
        score: 85,
        components: JSON.stringify({ faturamento: 90, satisfacao: 80 }),
      },
    ]
    var scoreCol = app.findCollectionByNameOrId('performance_scores')
    for (var k = 0; k < scores.length; k++) {
      var s = new Record(scoreCol)
      s.set('entity_type', scores[k].entity_type)
      s.set('entity_name', scores[k].entity_name)
      s.set('period', scores[k].period)
      s.set('score', scores[k].score)
      s.set('components', scores[k].components)
      s.set('company', 'VeloraLog')
      app.save(s)
    }

    var alerts = [
      {
        module: 'financeiro',
        entity_type: 'empresa',
        entity_name: 'VeloraLog',
        severity: 'warning',
        message: 'Custo operacional acima da meta',
        reason: 'Aumento de 8% no custo de frete',
        suggested_action: 'Renegociar contratos com transportadoras',
        resolved: false,
      },
      {
        module: 'logistica',
        entity_type: 'departamento',
        entity_name: 'Logística',
        severity: 'info',
        message: 'Taxa de entregas no prazo em 94%',
        reason: 'Meta é 98%',
        suggested_action: 'Otimizar rotas de entrega no ES',
        resolved: false,
      },
    ]
    var alertCol = app.findCollectionByNameOrId('performance_alerts')
    for (var a = 0; a < alerts.length; a++) {
      var al = new Record(alertCol)
      al.set('module', alerts[a].module)
      al.set('entity_type', alerts[a].entity_type)
      al.set('entity_name', alerts[a].entity_name)
      al.set('severity', alerts[a].severity)
      al.set('message', alerts[a].message)
      al.set('reason', alerts[a].reason)
      al.set('suggested_action', alerts[a].suggested_action)
      al.set('resolved', alerts[a].resolved)
      app.save(al)
    }
  },
  (app) => {
    var cols = [
      'performance_alerts',
      'performance_scores',
      'performance_gamification',
      'performance_config',
      'performance_kpis',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        var col = app.findCollectionByNameOrId(cols[i])
        var records = app.findRecordsByFilter(cols[i], '1=1', '', 500, 0)
        for (var j = 0; j < records.length; j++) {
          app.delete(records[j])
        }
      } catch (e) {}
    }
  },
)
