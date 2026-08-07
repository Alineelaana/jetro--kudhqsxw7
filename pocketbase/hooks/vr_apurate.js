routerAdd(
  'POST',
  '/backend/v1/vr/apurate',
  (e) => {
    const body = e.requestInfo().body || {}
    const now = new Date()
    const competencia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    try {
      const rules = $app.findRecordsByFilter(
        'commission_rules',
        "status = 'ativa'",
        '-created',
        0,
        0,
      )
      const apurations = $app.findRecordsByFilter('sales_orders', '', '-created', 0, 0)

      const results = []
      for (const rule of rules) {
        const calcType = rule.getString('calc_type')
        const baseField = rule.getString('base_field')
        const value = parseFloat(rule.getString('value') || '0')
        const vendedor = rule.getString('vendedor_name') || ''
        const empresa = rule.getString('empresa') || ''
        const filial = rule.getString('filial') || ''

        let matchingApurations = apurations
        if (vendedor) {
          matchingApurations = matchingApurations.filter(function (a) {
            return a.getString('salesperson_name') === vendedor
          })
        }

        let totalBase = 0
        for (const ap of matchingApurations) {
          totalBase += parseFloat(ap.getString('total_value') || '0')
        }

        let commissionValue = 0
        if (calcType === 'percent') {
          commissionValue = (totalBase * value) / 100
        } else if (calcType === 'fixed') {
          commissionValue = value
        } else if (calcType === 'per_unit') {
          commissionValue = matchingApurations.length * value
        } else {
          commissionValue = (totalBase * value) / 100
        }

        if (commissionValue > 0) {
          const col = $app.findCollectionByNameOrId('commission_apurations')
          const record = new Record(col)
          record.set('competencia', competencia)
          record.set('vendedor_id', rule.getString('vendedor_id') || '')
          record.set('vendedor_name', vendedor)
          record.set('empresa', empresa)
          record.set('filial', filial)
          record.set('base_value', String(totalBase))
          record.set('commission_value', String(commissionValue))
          record.set('rule_id', rule.id)
          record.set('rule_name', rule.getString('name') || '')
          record.set('calc_type', calcType)
          record.set('situacao', 'apurada')
          record.set('company', empresa)
          record.set('branch', filial)
          $app.save(record)
          results.push({ rule: rule.getString('name'), vendedor: vendedor, value: commissionValue })
        }
      }

      return e.json(200, results)
    } catch (err) {
      return e.json(500, { error: 'Apuration failed', detail: String(err) })
    }
  },
  $apis.requireAuth(),
)
