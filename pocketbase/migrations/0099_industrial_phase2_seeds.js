migrate(
  (app) => {
    var ecrCol = app.findCollectionByNameOrId('engineering_change_requests')
    try {
      app.findFirstRecordByData('engineering_change_requests', 'ecr_number', 'ECR-2026-001')
    } catch (_) {
      var products = []
      try {
        products = app.findRecordsByFilter('products', 'is_industrial = true', '-created', 5, 0)
      } catch (_) {}
      var ecr = new Record(ecrCol)
      ecr.set('ecr_number', 'ECR-2026-001')
      ecr.set('title', 'Revisao de formula - reducao de perda')
      ecr.set('description', 'Ajustar concentracao para reduzir perda no envase')
      ecr.set('reason', 'Reducao de custo operacional')
      ecr.set('type', 'melhoria')
      ecr.set('priority', 'alta')
      ecr.set('status', 'em_analise')
      ecr.set('requested_by', 'Admin')
      ecr.set('impact_assessment', 'Baixo impacto em qualidade, médio em custo')
      if (products.length > 0) ecr.set('product_id', products[0].id)
      app.save(ecr)
    }

    var ecoCol = app.findCollectionByNameOrId('engineering_change_orders')
    try {
      app.findFirstRecordByData('engineering_change_orders', 'eco_number', 'ECO-2026-001')
    } catch (_) {
      var ecrRec = null
      try {
        ecrRec = app.findFirstRecordByData(
          'engineering_change_requests',
          'ecr_number',
          'ECR-2026-001',
        )
      } catch (_) {}
      var eco = new Record(ecoCol)
      eco.set('eco_number', 'ECO-2026-001')
      eco.set('title', 'Implementar revisao de formula v2')
      eco.set('description', 'Aprovada implementacao da nova concentracao')
      eco.set('status', 'em_aprovacao')
      eco.set('change_details', JSON.stringify({ field: 'concentration', old: '60%', new: '58%' }))
      if (ecrRec) eco.set('ecr_id', ecrRec.id)
      app.save(eco)
    }

    var mppCol = app.findCollectionByNameOrId('master_production_plans')
    try {
      app.findFirstRecordByData('master_production_plans', 'plan_number', 'MPP-2026-08')
    } catch (_) {
      var pa = null
      try {
        pa = app.findFirstRecordByData('products', 'code', 'IND-PA-0001')
      } catch (_) {}
      var mpp = new Record(mppCol)
      mpp.set('plan_number', 'MPP-2026-08')
      mpp.set('period', '2026-08')
      mpp.set('forecast_quantity', 10000)
      mpp.set('actual_quantity', 0)
      mpp.set('status', 'aprovado')
      mpp.set('responsible', 'PCP')
      mpp.set(
        'items',
        JSON.stringify([
          { week: 1, quantity: 2500 },
          { week: 2, quantity: 2500 },
          { week: 3, quantity: 2500 },
          { week: 4, quantity: 2500 },
        ]),
      )
      if (pa) mpp.set('product_id', pa.id)
      app.save(mpp)
    }

    var simCol = app.findCollectionByNameOrId('production_simulations')
    try {
      app.findFirstRecordByData('production_simulations', 'name', 'Simulacao Capacidade Agosto')
    } catch (_) {
      var sim = new Record(simCol)
      sim.set('name', 'Simulacao Capacidade Agosto')
      sim.set('description', 'Simulacao de capacidade para o mes de agosto')
      sim.set('scenario_type', 'capacidade')
      sim.set(
        'parameters',
        JSON.stringify({ resources: 1, shifts: 2, hours_per_shift: 7.5, days: 22 }),
      )
      sim.set(
        'results',
        JSON.stringify({
          available_hours: 330,
          committed_hours: 280,
          utilization: 84.8,
          bottleneck: 'Linha de Envase Gran Romano',
        }),
      )
      sim.set('status', 'concluido')
      sim.set('responsible', 'PCP')
      app.save(sim)
    }

    var docCol = app.findCollectionByNameOrId('engineering_documents')
    try {
      app.findFirstRecordByData(
        'engineering_documents',
        'name',
        'Especificacao Tecnica Azeitona 200ml',
      )
    } catch (_) {
      var docPa = null
      try {
        docPa = app.findFirstRecordByData('products', 'code', 'IND-PA-0001')
      } catch (_) {}
      var doc = new Record(docCol)
      doc.set('name', 'Especificacao Tecnica Azeitona 200ml')
      doc.set('description', 'Especificacao tecnica do produto acabado')
      doc.set('doc_type', 'especificacao')
      doc.set('version', '1.0')
      doc.set('uploaded_by', 'Engenharia')
      if (docPa) doc.set('product_id', docPa.id)
      app.save(doc)
    }

    console.log('0099: industrial phase2 seed data created')
  },
  (app) => {},
)
