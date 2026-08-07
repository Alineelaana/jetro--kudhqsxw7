routerAdd(
  'POST',
  '/backend/v1/phase0/approve/{stage}',
  (e) => {
    var stage = e.request.pathValue('stage')
    if (['1', '2', '3', '4'].indexOf(stage) === -1) {
      return e.json(400, { error: 'Invalid stage number' })
    }

    if (stage !== '1') {
      var prevStage = String(parseInt(stage) - 1)
      var prevKey = 'phase0_stage' + prevStage + '_approved'
      try {
        var prevRec = $app.findFirstRecordByData('settings', 'key', prevKey)
        if (prevRec.getString('value') !== 'true') {
          return e.json(403, { error: 'Stage ' + prevStage + ' must be approved first' })
        }
      } catch (_) {
        return e.json(403, { error: 'Stage ' + prevStage + ' must be approved first' })
      }
    }

    var stageCols = {
      1: [
        'spec_groups',
        'spec_attributes',
        'spec_values',
        'production_resources',
        'unit_conversions',
      ],
      2: ['bom_versions', 'bom_components', 'production_routes', 'production_route_operations'],
      3: ['quality_parameters', 'quality_inspections', 'industrial_costs'],
      4: [],
    }
    var cols = stageCols[stage]
    for (var i = 0; i < cols.length; i++) {
      if (!$app.hasTable(cols[i])) {
        return e.json(400, {
          error: 'Collection ' + cols[i] + ' does not exist. Run validation first.',
        })
      }
    }

    if (stage === '4') {
      var hasSeed = false
      try {
        $app.findFirstRecordByData('products', 'code', 'IND-PA-0001')
        hasSeed = true
      } catch (_) {}
      if (!hasSeed) {
        return e.json(400, {
          error: 'Seed data not found. Ensure migration 0084 has been applied.',
        })
      }
    }

    var key = 'phase0_stage' + stage + '_approved'
    var settingsCol = $app.findCollectionByNameOrId('settings')
    try {
      var rec = $app.findFirstRecordByData('settings', 'key', key)
      rec.set('value', 'true')
      $app.save(rec)
    } catch (_) {
      var newRec = new Record(settingsCol)
      newRec.set('key', key)
      newRec.set('value', 'true')
      $app.save(newRec)
    }

    return e.json(200, {
      stage: stage,
      approved: true,
      message: 'Stage ' + stage + ' approved successfully',
    })
  },
  $apis.requireAuth(),
)
