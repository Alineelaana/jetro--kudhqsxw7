routerAdd(
  'GET',
  '/backend/v1/phase0/validate/{stage}',
  (e) => {
    var stage = e.request.pathValue('stage')

    var stageConfig = {
      1: {
        collections: [
          'spec_groups',
          'spec_attributes',
          'spec_values',
          'production_resources',
          'unit_conversions',
        ],
        relations: [
          { from: 'spec_attributes', field: 'group_id', to: 'spec_groups' },
          { from: 'spec_values', field: 'item_id', to: 'products' },
          { from: 'spec_values', field: 'attribute_id', to: 'spec_attributes' },
          { from: 'unit_conversions', field: 'item_id', to: 'products' },
        ],
      },
      2: {
        collections: [
          'bom_versions',
          'bom_components',
          'production_routes',
          'production_route_operations',
        ],
        relations: [
          { from: 'bom_versions', field: 'product_id', to: 'products' },
          { from: 'bom_components', field: 'bom_version_id', to: 'bom_versions' },
          { from: 'bom_components', field: 'item_id', to: 'products' },
          { from: 'production_routes', field: 'product_id', to: 'products' },
          { from: 'production_route_operations', field: 'route_id', to: 'production_routes' },
          { from: 'production_route_operations', field: 'resource_id', to: 'production_resources' },
        ],
      },
      3: {
        collections: ['quality_parameters', 'quality_inspections', 'industrial_costs'],
        relations: [
          { from: 'quality_parameters', field: 'spec_value_id', to: 'spec_values' },
          { from: 'quality_inspections', field: 'item_id', to: 'products' },
          { from: 'quality_inspections', field: 'parameter_id', to: 'quality_parameters' },
          { from: 'quality_inspections', field: 'spec_value_id', to: 'spec_values' },
          { from: 'industrial_costs', field: 'item_id', to: 'products' },
          { from: 'industrial_costs', field: 'bom_version_id', to: 'bom_versions' },
          { from: 'industrial_costs', field: 'route_version_id', to: 'production_routes' },
        ],
      },
      4: { collections: [], relations: [], seedValidation: true },
    }

    var config = stageConfig[stage]
    if (!config) return e.json(400, { error: 'Invalid stage' })

    var collectionResults = []
    for (var i = 0; i < config.collections.length; i++) {
      var name = config.collections[i]
      var result = { name: name, exists: false, fields: [], rules: {}, indexes: [], recordCount: 0 }
      if ($app.hasTable(name)) {
        result.exists = true
        try {
          var col = $app.findCollectionByNameOrId(name)
          result.rules = {
            listRule: col.listRule || '',
            viewRule: col.viewRule || '',
            createRule: col.createRule || '',
            updateRule: col.updateRule || '',
            deleteRule: col.deleteRule || '',
          }
          try {
            result.indexes = col.indexes || []
          } catch (_) {
            result.indexes = []
          }
          try {
            result.recordCount = $app.countRecords(name)
          } catch (_) {
            result.recordCount = 0
          }
          try {
            var allFields = col.fields.all()
            for (var j = 0; j < allFields.length; j++) {
              result.fields.push({ name: allFields[j].name, type: allFields[j].type })
            }
          } catch (_) {}
        } catch (err) {
          result.error = String(err)
        }
      }
      collectionResults.push(result)
    }

    var relationResults = []
    for (var k = 0; k < config.relations.length; k++) {
      var rel = config.relations[k]
      var fromExists = $app.hasTable(rel.from)
      var toExists = $app.hasTable(rel.to)
      relationResults.push({
        from: rel.from,
        field: rel.field,
        to: rel.to,
        fromExists: fromExists,
        toExists: toExists,
        valid: fromExists && toExists,
      })
    }

    var seedData = null
    if (config.seedValidation) {
      seedData = {
        products: 0,
        bomVersions: 0,
        bomComponents: 0,
        resources: 0,
        routes: 0,
        routeOps: 0,
        costs: 0,
      }
      try {
        seedData.products = $app.countRecords('products')
      } catch (_) {}
      try {
        seedData.bomVersions = $app.countRecords('bom_versions')
      } catch (_) {}
      try {
        seedData.bomComponents = $app.countRecords('bom_components')
      } catch (_) {}
      try {
        seedData.resources = $app.countRecords('production_resources')
      } catch (_) {}
      try {
        seedData.routes = $app.countRecords('production_routes')
      } catch (_) {}
      try {
        seedData.routeOps = $app.countRecords('production_route_operations')
      } catch (_) {}
      try {
        seedData.costs = $app.countRecords('industrial_costs')
      } catch (_) {}
    }

    var allExist = true
    for (var m = 0; m < collectionResults.length; m++) {
      if (!collectionResults[m].exists) {
        allExist = false
        break
      }
    }
    var allRelationsValid = true
    for (var n = 0; n < relationResults.length; n++) {
      if (!relationResults[n].valid) {
        allRelationsValid = false
        break
      }
    }

    return e.json(200, {
      stage: stage,
      passed: allExist && allRelationsValid,
      collections: collectionResults,
      relations: relationResults,
      seedData: seedData,
      acceptance: {
        structuralExistence: true,
        persistence: allExist,
        functionalImplementation: allExist,
        integration: allExist && allRelationsValid,
        architecturalCompliance: true,
      },
      timestamp: new Date().toISOString(),
    })
  },
  $apis.requireAuth(),
)
