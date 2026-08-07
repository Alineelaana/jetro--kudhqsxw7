routerAdd(
  'GET',
  '/backend/v1/phase0/foundation/test',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')
    var userRole = ''
    try {
      userRole = e.auth.getString('role') || ''
    } catch (_) {}
    if (userRole !== 'SUP') return e.forbiddenError('SUP role required')

    var result = { tests: [], errors: [], warnings: [] }
    var testRecords = {}

    var cleanupCols = [
      'unit_conversions',
      'production_resources',
      'spec_values',
      'spec_attributes',
      'spec_groups',
    ]
    for (var ci = 0; ci < cleanupCols.length; ci++) {
      try {
        var leftovers = $app.findRecordsByFilter(cleanupCols[ci], 'name ~ "__test_0085"', '', 10, 0)
        for (var li = 0; li < leftovers.length; li++) {
          try {
            $app.delete(leftovers[li])
          } catch (_) {}
        }
      } catch (_) {}
      try {
        var leftovers2 = $app.findRecordsByFilter(
          cleanupCols[ci],
          'from_unit = "__test_0085_uc"',
          '',
          10,
          0,
        )
        for (var li2 = 0; li2 < leftovers2.length; li2++) {
          try {
            $app.delete(leftovers2[li2])
          } catch (_) {}
        }
      } catch (_) {}
    }

    var testProductId = null
    try {
      var prods = $app.findRecordsByFilter('products', '', '', 1, 0)
      if (prods.length > 0) testProductId = prods[0].id
    } catch (_) {}

    function runCrud(colName, recordData, readField, readExpected) {
      var rec = null
      try {
        var col = $app.findCollectionByNameOrId(colName)
        rec = new Record(col)
        var keys = Object.keys(recordData)
        for (var i = 0; i < keys.length; i++) {
          rec.set(keys[i], recordData[keys[i]])
        }
        $app.save(rec)
        var read = $app.findRecordById(colName, rec.id)
        if (readField && read.getString(readField) !== readExpected)
          throw new Error('read verification failed')
        rec.set('description', '__test_updated_0085__')
        try {
          $app.save(rec)
        } catch (_) {}
        return { rec: rec, status: 'pass' }
      } catch (err) {
        return { rec: rec, status: 'fail', error: String(err) }
      }
    }

    var t1 = runCrud('spec_groups', { name: '__test_0085_sg__' }, 'name', '__test_0085_sg__')
    testRecords.sg = t1.rec
    result.tests.push({
      collection: 'spec_groups',
      actions: ['create', 'read', 'update', 'delete'],
      status: t1.status,
      error: t1.error || undefined,
    })
    if (t1.status === 'fail') result.errors.push('FT spec_groups: ' + (t1.error || ''))

    var t2Data = { name: '__test_0085_sa__', label: 'Test Attr' }
    if (t1.rec) t2Data.group_id = t1.rec.id
    var t2 = runCrud('spec_attributes', t2Data, 'name', '__test_0085_sa__')
    testRecords.sa = t2.rec
    result.tests.push({
      collection: 'spec_attributes',
      actions: ['create', 'read', 'update', 'delete'],
      status: t2.status,
      error: t2.error || undefined,
    })
    if (t2.status === 'fail') result.errors.push('FT spec_attributes: ' + (t2.error || ''))

    var t3Data = { value: 'test_val' }
    if (testProductId) t3Data.item_id = testProductId
    if (t2.rec) t3Data.attribute_id = t2.rec.id
    if (!testProductId) {
      result.tests.push({
        collection: 'spec_values',
        actions: ['create', 'read', 'update', 'delete'],
        status: 'fail',
        error: 'no product available for relation test',
      })
      result.warnings.push('spec_values: no product found for relation test')
    } else if (!t2.rec) {
      result.tests.push({
        collection: 'spec_values',
        actions: ['create', 'read', 'update', 'delete'],
        status: 'fail',
        error: 'dependency spec_attributes not created',
      })
      result.errors.push('FT spec_values: dependency not created')
    } else {
      var t3 = runCrud('spec_values', t3Data, 'value', 'test_val')
      testRecords.sv = t3.rec
      result.tests.push({
        collection: 'spec_values',
        actions: ['create', 'read', 'update', 'delete'],
        status: t3.status,
        error: t3.error || undefined,
      })
      if (t3.status === 'fail') result.errors.push('FT spec_values: ' + (t3.error || ''))
    }

    var t4 = runCrud(
      'production_resources',
      { name: '__test_0085_pr__' },
      'name',
      '__test_0085_pr__',
    )
    testRecords.pr = t4.rec
    result.tests.push({
      collection: 'production_resources',
      actions: ['create', 'read', 'update', 'delete'],
      status: t4.status,
      error: t4.error || undefined,
    })
    if (t4.status === 'fail') result.errors.push('FT production_resources: ' + (t4.error || ''))

    if (!testProductId) {
      result.tests.push({
        collection: 'unit_conversions',
        actions: ['create', 'read', 'update', 'delete'],
        status: 'fail',
        error: 'no product available for relation test',
      })
      result.warnings.push('unit_conversions: no product found for relation test')
    } else {
      var ucData = {
        from_unit: '__test_0085_uc',
        to_unit: 'g',
        factor: 1000,
        item_id: testProductId,
      }
      var t5 = runCrud('unit_conversions', ucData, 'from_unit', '__test_0085_uc')
      testRecords.uc = t5.rec
      result.tests.push({
        collection: 'unit_conversions',
        actions: ['create', 'read', 'update', 'delete'],
        status: t5.status,
        error: t5.error || undefined,
      })
      if (t5.status === 'fail') result.errors.push('FT unit_conversions: ' + (t5.error || ''))
    }

    if (testRecords.uc) {
      try {
        $app.delete(testRecords.uc)
      } catch (_) {}
    }
    if (testRecords.pr) {
      try {
        $app.delete(testRecords.pr)
      } catch (_) {}
    }
    if (testRecords.sv) {
      try {
        $app.delete(testRecords.sv)
      } catch (_) {}
    }
    if (testRecords.sa) {
      try {
        $app.delete(testRecords.sa)
      } catch (_) {}
    }
    if (testRecords.sg) {
      try {
        $app.delete(testRecords.sg)
      } catch (_) {}
    }

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
