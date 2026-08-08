routerAdd(
  'POST',
  '/backend/v1/dre/compute',
  (e) => {
    var body = e.requestInfo().body || {}
    var period = body.period || ''
    var version = body.version || 'contabil'
    var orgFilter = body.orgFilter || ''

    if (!period) return e.badRequestError('period is required')

    function evalFormula(expr, values) {
      try {
        var resolved = expr
        var keys = Object.keys(values)
        for (var i = 0; i < keys.length; i++) {
          resolved = resolved.replace(
            new RegExp('\\b' + keys[i] + '\\b', 'g'),
            String(values[keys[i]]),
          )
        }
        resolved = resolved.replace(/[^0-9+\-*/().\s]/g, '')
        if (!resolved.trim()) return 0
        return Function('"use strict"; return (' + resolved + ')')()
      } catch (_) {
        return 0
      }
    }

    function buildPeriodFilter() {
      var parts = period.split('-')
      var y = parts[0]
      var m = parts[1]
      var start = y + '-' + m + '-01'
      var nm, ny
      if (m === '12') {
        nm = '01'
        ny = String(parseInt(y) + 1)
      } else {
        nm = String(parseInt(m) + 1).padStart(2, '0')
        ny = y
      }
      var end = ny + '-' + nm + '-01'
      return 'data >= "' + start + '" && data < "' + end + '"'
    }

    var filterParts = [buildPeriodFilter()]
    if (orgFilter) filterParts.push('(' + orgFilter + ')')
    if (body.company) filterParts.push('company = "' + body.company + '"')
    if (body.branch) filterParts.push('branch = "' + body.branch + '"')
    var lancFilter = filterParts.join(' && ')

    var structure = []
    var mappings = []
    var reclassifications = []
    try {
      structure = $app.findRecordsByFilter('controladoria_dre_structure', '', 'order', 0, 0)
    } catch (_) {}
    try {
      mappings = $app.findRecordsByFilter('controladoria_account_mapping', '', '', 0, 0)
    } catch (_) {}
    try {
      reclassifications = $app.findRecordsByFilter(
        'controladoria_reclassifications',
        'status = "approved" && period = "' + period + '"',
        '',
        0,
        0,
      )
    } catch (_) {}

    var mappingMap = {}
    for (var mi = 0; mi < mappings.length; mi++) {
      if (mappings[mi].get('is_active') !== false) {
        var mk = mappings[mi].getString('dre_line_key')
        if (mk) mappingMap[mappings[mi].getString('account_code')] = mk
      }
    }

    var reclassMap = {}
    for (var ri = 0; ri < reclassifications.length; ri++) {
      reclassMap[reclassifications[ri].getString('source_account_code')] =
        reclassifications[ri].getString('target_dre_line')
    }

    var lineValues = {}
    for (var si = 0; si < structure.length; si++) {
      lineValues[structure[si].getString('line_key')] = 0
    }

    var batchSize = 500
    var batch = 0
    var hasMore = true
    while (hasMore) {
      var records = []
      try {
        records = $app.findRecordsByFilter(
          'contabil_lancamentos',
          lancFilter,
          '',
          batchSize,
          batch * batchSize,
        )
      } catch (_) {}
      if (records.length < batchSize) hasMore = false
      for (var r = 0; r < records.length; r++) {
        var conta = records[r].getString('conta_debito')
        var lineKey = mappingMap[conta]
        if (version === 'gerencial') {
          lineKey = reclassMap[conta] || lineKey
        }
        if (lineKey && lineValues[lineKey] !== undefined) {
          var val = parseFloat(records[r].getString('valor') || '0')
          if (isNaN(val)) val = 0
          lineValues[lineKey] += val
        }
      }
      batch++
      if (batch > 200) hasMore = false
    }

    var lines = []
    for (var li = 0; li < structure.length; li++) {
      var sRec = structure[li]
      var key = sRec.getString('line_key')
      var isCalc = sRec.get('is_calculated') === true
      var value = lineValues[key] || 0
      if (isCalc && sRec.getString('formula_expression')) {
        value = evalFormula(sRec.getString('formula_expression'), lineValues)
      }
      if (sRec.getString('sign') === 'negative') value = -Math.abs(value)
      lines.push({
        line_key: key,
        label: sRec.getString('label'),
        group: sRec.getString('group'),
        order: sRec.getInt('order'),
        value: value,
        is_calculated: isCalc,
        sign: sRec.getString('sign'),
        percentage_of_revenue: 0,
      })
    }

    var receitaLiquida =
      lineValues['receita_liquida'] ||
      evalFormula('receita_bruta - deducoes - impostos', lineValues)
    for (var pi = 0; pi < lines.length; pi++) {
      lines[pi].percentage_of_revenue =
        receitaLiquida > 0 ? (lines[pi].value / receitaLiquida) * 100 : 0
    }
    lines.sort(function (a, b) {
      return a.order - b.order
    })

    return e.json(200, {
      version: version,
      period: period,
      lines: lines,
      totals: {
        receita_liquida: receitaLiquida,
        lucro_bruto: lineValues['lucro_bruto'] || evalFormula('receita_liquida - cmv', lineValues),
        resultado_operacional: lineValues['resultado_operacional'] || 0,
        ebitda: lineValues['ebitda'] || 0,
        resultado_liquido: lineValues['resultado_liquido'] || 0,
      },
    })
  },
  $apis.requireAuth(),
)
