routerAdd(
  'GET',
  '/backend/v1/phase0/foundation/validate',
  (e) => {
    var userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')
    var userRole = ''
    try {
      userRole = e.auth.getString('role') || ''
    } catch (_) {}
    if (userRole !== 'SUP') return e.forbiddenError('SUP role required')

    var result = {
      collections: [],
      extendedFields: [],
      errors: [],
      warnings: [],
    }

    function fieldType(field) {
      if (!field) return 'missing'
      try {
        if (typeof field.type === 'string') return field.type
      } catch (_) {}
      try {
        if (typeof field.Type === 'function') return String(field.Type())
      } catch (_) {}
      try {
        if (typeof field.getType === 'function') return String(field.getType())
      } catch (_) {}
      return 'unknown'
    }

    function validateCollection(name, expectedFields, expectedIndexes, expectedRules) {
      var colRes = { name: name, exists: false, fields: [], indexes: [], rules: {}, status: 'pass' }
      if (!$app.hasTable(name)) {
        colRes.status = 'fail'
        result.errors.push('Collection ' + name + ' does not exist')
        return colRes
      }
      var col = null
      try {
        col = $app.findCollectionByNameOrId(name)
      } catch (err) {
        colRes.status = 'fail'
        result.errors.push('Cannot load ' + name + ': ' + String(err))
        return colRes
      }
      colRes.exists = true

      for (var i = 0; i < expectedFields.length; i++) {
        var ef = expectedFields[i]
        var field = null
        try {
          field = col.fields.getByName(ef.name)
        } catch (_) {}
        var fExists = !!field
        var fType = fieldType(field)
        var fRequired = false
        try {
          fRequired = !!field.required
        } catch (_) {}
        var fStatus = 'pass'
        if (!fExists) {
          fStatus = 'fail'
          colRes.status = 'fail'
          result.errors.push('Field ' + ef.name + ' missing in ' + name)
        } else if (ef.type && fType !== 'unknown' && fType !== ef.type) {
          fStatus = 'warn'
          result.warnings.push(
            'Field ' + ef.name + ' type mismatch: expected ' + ef.type + ', got ' + fType,
          )
        } else if (ef.required !== undefined && fRequired !== ef.required) {
          fStatus = 'warn'
          result.warnings.push('Field ' + ef.name + ' required mismatch in ' + name)
        }
        colRes.fields.push({
          name: ef.name,
          exists: fExists,
          type: fType,
          expectedType: ef.type,
          required: fRequired,
          expectedRequired: ef.required,
          status: fStatus,
        })
      }

      var idxMap = {}
      try {
        idxMap = $app.tableIndexes(name) || {}
      } catch (_) {}
      for (var j = 0; j < expectedIndexes.length; j++) {
        var idxName = expectedIndexes[j]
        var idxExists = false
        try {
          idxExists = idxMap !== null && typeof idxMap === 'object' && idxMap[idxName] !== undefined
        } catch (_) {}
        if (!idxExists) {
          colRes.status = colRes.status === 'fail' ? 'fail' : 'warn'
          result.warnings.push('Index ' + idxName + ' not found in ' + name)
        }
        colRes.indexes.push({
          name: idxName,
          exists: idxExists,
          status: idxExists ? 'pass' : 'warn',
        })
      }

      var ruleNames = ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule']
      for (var k = 0; k < ruleNames.length; k++) {
        var rn = ruleNames[k]
        var actual = 'null'
        try {
          actual = col[rn] === null || col[rn] === undefined ? 'null' : String(col[rn])
        } catch (_) {}
        var expected = expectedRules[rn] || ''
        var rStatus = actual === expected ? 'pass' : 'warn'
        if (rStatus === 'warn')
          result.warnings.push(
            'Rule ' +
              rn +
              ' mismatch in ' +
              name +
              ": expected '" +
              expected +
              "', got '" +
              actual +
              "'",
          )
        colRes.rules[rn] = { expected: expected, actual: actual, status: rStatus }
      }
      return colRes
    }

    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var SCHEMA = [
      {
        name: 'spec_groups',
        fields: [
          ['name', 'text', true],
          ['item_category', 'text', false],
          ['description', 'text', false],
          ['active', 'bool', false],
          ['responsible', 'text', false],
          ['created', 'autodate', false],
          ['updated', 'autodate', false],
        ],
        indexes: ['idx_spec_groups_name', 'idx_spec_groups_active'],
        rules: [R, R, R, R, SA],
      },
      {
        name: 'spec_attributes',
        fields: [
          ['group_id', 'relation', false],
          ['name', 'text', true],
          ['label', 'text', true],
          ['type', 'select', false],
          ['unit', 'text', false],
          ['required', 'bool', false],
          ['options', 'json', false],
          ['order', 'number', false],
          ['active', 'bool', false],
          ['created', 'autodate', false],
          ['updated', 'autodate', false],
        ],
        indexes: ['idx_spec_attrs_group', 'idx_spec_attrs_active'],
        rules: [R, R, R, R, SA],
      },
      {
        name: 'spec_values',
        fields: [
          ['item_id', 'relation', true],
          ['attribute_id', 'relation', true],
          ['value', 'text', false],
          ['version', 'number', false],
          ['vigencia_inicial', 'text', false],
          ['vigencia_final', 'text', false],
          ['status', 'select', false],
          ['responsible', 'text', false],
          ['approval_date', 'text', false],
          ['created', 'autodate', false],
          ['updated', 'autodate', false],
        ],
        indexes: [
          'idx_spec_values_item',
          'idx_spec_values_attr',
          'idx_spec_values_status',
          'idx_spec_values_version',
        ],
        rules: [R, R, R, R, SA],
      },
      {
        name: 'production_resources',
        fields: [
          ['code', 'text', false],
          ['name', 'text', true],
          ['tipo', 'select', false],
          ['description', 'text', false],
          ['capacity_per_hour', 'number', false],
          ['active', 'bool', false],
          ['responsible_user', 'text', false],
          ['modulo_origem', 'text', false],
          ['created', 'autodate', false],
          ['updated', 'autodate', false],
        ],
        indexes: ['idx_prod_res_tipo', 'idx_prod_res_active', 'idx_prod_res_code'],
        rules: [R, R, R, R, SA],
      },
      {
        name: 'unit_conversions',
        fields: [
          ['from_unit', 'text', true],
          ['to_unit', 'text', true],
          ['factor', 'number', true],
          ['scope', 'select', false],
          ['item_id', 'relation', false],
          ['version', 'number', false],
          ['vigencia_inicial', 'text', false],
          ['vigencia_final', 'text', false],
          ['active', 'bool', false],
          ['responsible', 'text', false],
          ['created', 'autodate', false],
          ['updated', 'autodate', false],
        ],
        indexes: [
          'idx_unit_conv_scope',
          'idx_unit_conv_item',
          'idx_unit_conv_active',
          'idx_unit_conv_units',
        ],
        rules: [R, R, R, R, SA],
      },
    ]

    for (var s = 0; s < SCHEMA.length; s++) {
      var sc = SCHEMA[s]
      var fields = []
      for (var fi = 0; fi < sc.fields.length; fi++) {
        fields.push({ name: sc.fields[fi][0], type: sc.fields[fi][1], required: sc.fields[fi][2] })
      }
      var rules = {
        listRule: sc.rules[0],
        viewRule: sc.rules[1],
        createRule: sc.rules[2],
        updateRule: sc.rules[3],
        deleteRule: sc.rules[4],
      }
      result.collections.push(validateCollection(sc.name, fields, sc.indexes, rules))
    }

    function fieldType2(field) {
      return fieldType(field)
    }
    var EXTENDED = [
      {
        collection: 'products',
        field: 'item_type',
        type: 'select',
        values: [
          'Não Classificado',
          'Matéria-prima',
          'Embalagem',
          'Produto Acabado',
          'Insumo',
          'Componente',
          'Subproduto',
        ],
      },
      { collection: 'products', field: 'is_industrial', type: 'bool' },
      { collection: 'unidades_medida', field: 'is_industrial', type: 'bool' },
    ]
    for (var ei = 0; ei < EXTENDED.length; ei++) {
      var ext = EXTENDED[ei]
      var extRes = {
        collection: ext.collection,
        field: ext.field,
        exists: false,
        type: 'unknown',
        expectedType: ext.type,
        duplicated: false,
        status: 'pass',
      }
      try {
        var eCol = $app.findCollectionByNameOrId(ext.collection)
        var eField = null
        try {
          eField = eCol.fields.getByName(ext.field)
        } catch (_) {}
        if (eField) {
          extRes.exists = true
          extRes.type = fieldType2(eField)
          if (ext.type && extRes.type !== 'unknown' && extRes.type !== ext.type) {
            extRes.status = 'warn'
            result.warnings.push(
              'Extended field ' +
                ext.field +
                ' type mismatch: expected ' +
                ext.type +
                ', got ' +
                extRes.type,
            )
          }
          if (ext.values) {
            try {
              var fv = eField.values || []
              extRes.values = fv
              var allPresent = true
              for (var vi = 0; vi < ext.values.length; vi++) {
                if (fv.indexOf(ext.values[vi]) === -1) {
                  allPresent = false
                  break
                }
              }
              if (!allPresent) {
                extRes.status = 'warn'
                result.warnings.push('Extended field ' + ext.field + ' values mismatch')
              }
            } catch (_) {}
          }
        } else {
          extRes.status = 'fail'
          result.errors.push('Extended field ' + ext.field + ' missing in ' + ext.collection)
        }
      } catch (err) {
        extRes.status = 'fail'
        result.errors.push('Cannot check extended field ' + ext.field + ': ' + String(err))
      }
      result.extendedFields.push(extRes)
    }

    return e.json(200, result)
  },
  $apis.requireAuth(),
)
