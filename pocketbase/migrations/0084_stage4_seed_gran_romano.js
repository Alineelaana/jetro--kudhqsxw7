migrate(
  (app) => {
    var required = [
      'products',
      'bom_versions',
      'bom_components',
      'production_resources',
      'production_routes',
      'production_route_operations',
      'industrial_costs',
    ]
    for (var i = 0; i < required.length; i++) {
      if (!app.hasTable(required[i])) return
    }

    var prodCol = app.findCollectionByNameOrId('products')
    var bvCol = app.findCollectionByNameOrId('bom_versions')
    var bcCol = app.findCollectionByNameOrId('bom_components')
    var prCol = app.findCollectionByNameOrId('production_resources')
    var rtCol = app.findCollectionByNameOrId('production_routes')
    var roCol = app.findCollectionByNameOrId('production_route_operations')
    var icCol = app.findCollectionByNameOrId('industrial_costs')

    function createItem(name, desc, ncm, ean, code, unit, price, brand, category, itemType, isInd) {
      try {
        return app.findFirstRecordByData('products', 'code', code)
      } catch (_) {}
      var r = new Record(prodCol)
      r.set('name', name)
      r.set('description', desc)
      r.set('ncm', ncm)
      r.set('ean', ean)
      r.set('code', code)
      r.set('unit', unit)
      r.set('price', price)
      r.set('brand', brand)
      r.set('category', category)
      r.set('active', true)
      r.set('item_type', itemType)
      r.set('is_industrial', isInd)
      r.set('stock', 0)
      r.set('min_stock', 0)
      app.save(r)
      return r
    }

    var az = createItem(
      'Azeitona Verde Selecionada',
      'Azeitona verde tipo espanhola',
      '2005.70.00',
      '7890001000011',
      'IND-MP-0001',
      'kg',
      '12.00',
      'Gran Romano',
      'Matéria-prima',
      'Matéria-prima',
      true,
    )
    var sal = createItem(
      'Sal Refinado',
      'Sal refinado para salmoura',
      '2501.00.20',
      '7890001000028',
      'IND-MP-0002',
      'kg',
      '2.50',
      'Sal Mar',
      'Matéria-prima',
      'Matéria-prima',
      true,
    )
    var ac = createItem(
      'Açúcar Cristal',
      'Açúcar para formulação',
      '1701.99.00',
      '7890001000035',
      'IND-MP-0003',
      'kg',
      '4.20',
      'DoceVale',
      'Matéria-prima',
      'Matéria-prima',
      true,
    )
    var pv = createItem(
      'Pote de Vidro 200ml',
      'Pote de vidro 200ml',
      '7010.90.00',
      '7890001000042',
      'IND-EMB-0001',
      'un',
      '1.80',
      'VidroArte',
      'Embalagem',
      'Embalagem',
      true,
    )
    var tp = createItem(
      'Tampa Metálica 70mm',
      'Tampa metálica 70mm',
      '8306.10.00',
      '7890001000059',
      'IND-EMB-0002',
      'un',
      '0.45',
      'MetalPack',
      'Embalagem',
      'Embalagem',
      true,
    )
    var rt = createItem(
      'Rótulo Adesivo Azeitona',
      'Rótulo adesivo pote 200ml',
      '4821.10.00',
      '7890001000066',
      'IND-EMB-0003',
      'un',
      '0.30',
      'PrintLog',
      'Embalagem',
      'Embalagem',
      true,
    )
    var cx = createItem(
      'Caixa de Papelão 24un',
      'Caixa para 24 potes 200ml',
      '4819.10.00',
      '7890001000073',
      'IND-EMB-0004',
      'un',
      '3.50',
      'PackLog',
      'Embalagem',
      'Embalagem',
      true,
    )
    var pa = createItem(
      'Azeitona Verde Gran Romano 200ml',
      'Azeitona verde em salmoura 200ml',
      '2005.70.00',
      '7890001000080',
      'IND-PA-0001',
      'un',
      '8.90',
      'Gran Romano',
      'Produto Acabado',
      'Produto Acabado',
      true,
    )

    var bomVersion = null
    try {
      bomVersion = app.findFirstRecordByData('bom_versions', 'version', 1)
    } catch (_) {
      bomVersion = new Record(bvCol)
      bomVersion.set('product_id', pa.id)
      bomVersion.set('version', 1)
      bomVersion.set('type', 'formulacao')
      bomVersion.set('status', 'ativo')
      bomVersion.set('vigencia_inicial', new Date().toISOString().split('T')[0])
      bomVersion.set('rendimento', '1000')
      bomVersion.set('concentration', '60% azeitona / 40% salmoura')
      bomVersion.set('ph', '3.8 - 4.2')
      bomVersion.set('density', '1.05 g/ml')
      bomVersion.set('temperature', '85°C envase')
      bomVersion.set(
        'mixing_sequence',
        '1-Preparar salmoura 2-Misturar 3-Envase 4-Tampa 5-Rotulo 6-Cartonagem 7-Paletização',
      )
      bomVersion.set('tolerances', '±2% peso, ±0.2 pH')
      bomVersion.set('instructions', 'Salmoura 8%. Envase 85°C.')
      bomVersion.set('responsible', 'Admin')
      app.save(bomVersion)
    }

    var comps = [
      [az, '0.120', 'kg', '2%', 1],
      [sal, '0.008', 'kg', '1%', 2],
      [ac, '0.003', 'kg', '1%', 3],
      [pv, '1', 'un', '0.5%', 4],
      [tp, '1', 'un', '0.5%', 5],
      [rt, '1', 'un', '1%', 6],
      [cx, '0.0417', 'un', '0%', 7],
    ]
    comps.forEach(function (c) {
      try {
        app.findFirstRecordByFilter(
          'bom_components',
          'bom_version_id = "' + bomVersion.id + '" && item_id = "' + c[0].id + '"',
        )
      } catch (_) {
        var bc = new Record(bcCol)
        bc.set('bom_version_id', bomVersion.id)
        bc.set('item_id', c[0].id)
        bc.set('quantidade', c[1])
        bc.set('unidade', c[2])
        bc.set('perda_prevista', c[3])
        bc.set('substituto_permitido', false)
        bc.set('ordem', c[4])
        app.save(bc)
      }
    })

    var resource = null
    try {
      resource = app.findFirstRecordByData(
        'production_resources',
        'name',
        'Linha de Envase Gran Romano',
      )
    } catch (_) {
      resource = new Record(prCol)
      resource.set('code', 'RES-0001')
      resource.set('name', 'Linha de Envase Gran Romano')
      resource.set('tipo', 'linha_producao')
      resource.set('description', 'Linha completa de envase')
      resource.set('capacity_per_hour', 500)
      resource.set('active', true)
      resource.set('modulo_origem', 'engenharia')
      app.save(resource)
    }

    var route = null
    try {
      route = app.findFirstRecordByData(
        'production_routes',
        'name',
        'Roteiro Padrão Azeitona 200ml',
      )
    } catch (_) {
      route = new Record(rtCol)
      route.set('product_id', pa.id)
      route.set('version', 1)
      route.set('name', 'Roteiro Padrão Azeitona 200ml')
      route.set('description', 'Roteiro de produção')
      route.set('status', 'ativo')
      route.set('vigencia_inicial', new Date().toISOString().split('T')[0])
      route.set('responsible', 'Admin')
      app.save(route)
    }

    var ops = [
      [1, 'Preparação da Salmoura', 'Preparar salmoura 8% 85°C', '10', '30', '1%'],
      [2, 'Mistura Azeitona + Salmoura', 'Misturar', '5', '15', '0.5%'],
      [3, 'Envase', 'Envasar nos potes 200ml', '5', '45', '0.5%'],
      [4, 'Colocação de Tampa', 'Aplicar tampa', '2', '20', '0.3%'],
      [5, 'Rotulagem', 'Aplicar rótulo', '2', '15', '1%'],
      [6, 'Encartonagem', 'Colocar 24 potes em caixa', '3', '10', '0%'],
      [7, 'Paletização', 'Paletizar caixas', '5', '20', '0%'],
    ]
    ops.forEach(function (o) {
      try {
        app.findFirstRecordByFilter(
          'production_route_operations',
          'route_id = "' + route.id + '" && "order" = ' + o[0],
        )
      } catch (_) {
        var ro = new Record(roCol)
        ro.set('route_id', route.id)
        ro.set('order', o[0])
        ro.set('name', o[1])
        ro.set('description', o[2])
        if (resource) ro.set('resource_id', resource.id)
        ro.set('tempo_setup', o[3])
        ro.set('tempo_operacao', o[4])
        ro.set('perda_prevista', o[5])
        ro.set('responsible', 'Admin')
        app.save(ro)
      }
    })

    try {
      app.findFirstRecordByFilter(
        'industrial_costs',
        'item_id = "' + pa.id + '" && cost_type = "padrao"',
      )
    } catch (_) {
      var cost = new Record(icCol)
      cost.set('item_id', pa.id)
      cost.set('bom_version_id', bomVersion.id)
      cost.set('route_version_id', route.id)
      cost.set('cost_type', 'padrao')
      cost.set('version', 1)
      cost.set('cost_materia_prima', '1.74')
      cost.set('cost_embalagem', '2.60')
      cost.set('cost_mao_obra', '0.80')
      cost.set('cost_recurso', '0.45')
      cost.set('cost_energia', '0.15')
      cost.set('cost_perdas', '0.08')
      cost.set('cost_indiretos', '0.50')
      cost.set('cost_cambio', '0.00')
      cost.set('cost_landing', '0.00')
      cost.set('total_cost', '6.32')
      cost.set('unit_cost', '6.32')
      cost.set('responsible', 'Admin')
      cost.set('calculation_date', new Date().toISOString().split('T')[0])
      app.save(cost)
    }
  },
  (app) => {
    function safeDelete(col, filter) {
      try {
        var rs = app.findRecordsByFilter(col, filter, '-created', 50, 0)
        for (var i = 0; i < rs.length; i++) {
          try {
            app.delete(rs[i])
          } catch (_) {}
        }
      } catch (_) {}
    }
    safeDelete('industrial_costs', 'version = 1')
    safeDelete('production_route_operations', 'route_id != ""')
    safeDelete('production_routes', 'name = "Roteiro Padrão Azeitona 200ml"')
    safeDelete('bom_components', 'bom_version_id != ""')
    safeDelete('bom_versions', 'version = 1')
    safeDelete('production_resources', 'code = "RES-0001"')
    safeDelete('products', 'code ~ "IND-"')
  },
)
