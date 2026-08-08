routerAdd(
  'GET',
  '/backend/v1/projection/comparative',
  (e) => {
    var query = e.requestInfo().query || {}
    var competencia = query.competencia || ''
    if (!competencia) return e.badRequestError('competencia is required')

    var parts = competencia.split('-')
    var y = parseInt(parts[0])
    var m = parseInt(parts[1])

    function pad2(n) {
      return n < 10 ? '0' + n : String(n)
    }

    var authUser = e.auth
    var userRole = authUser ? authUser.getString('role') : ''
    var userEmp = authUser ? authUser.getString('empresa_id') : ''
    var userFil = authUser ? authUser.getString('filial_id') : ''

    var qEmp = query.empresa || ''
    var qFil = query.filial || ''
    if (userRole !== 'SUP') {
      qEmp = userEmp
      qFil = userFil
    }

    function orgFilter() {
      var f = []
      if (qEmp) f.push('company = "' + qEmp + '"')
      if (qFil) f.push('branch = "' + qFil + '"')
      return f.join(' && ')
    }

    function computeFaturado(comp) {
      var cp = comp.split('-')
      var cy = parseInt(cp[0])
      var cm = parseInt(cp[1])
      var lastDay = new Date(cy, cm, 0).getDate()
      var dateF =
        'invoice_date >= "' +
        cy +
        '-' +
        pad2(cm) +
        '-01 00:00:00" && invoice_date <= "' +
        cy +
        '-' +
        pad2(cm) +
        '-' +
        lastDay +
        ' 23:59:59"'
      var of = orgFilter()
      var filter = of ? dateF + ' && ' + of : dateF
      try {
        var records = $app.findRecordsByFilter('sales_invoices', filter, '', 0, 0)
        var total = 0
        for (var i = 0; i < records.length; i++) {
          total += parseFloat(records[i].getString('total_value') || '0') || 0
        }
        return total
      } catch (_) {
        return 0
      }
    }

    function mkPeriod(key, label, comp, fat) {
      return {
        key: key,
        label: label,
        competencia: comp,
        faturado: fat,
        vendido: fat,
        projecao: fat,
        meta: 0,
        pct_meta: 0,
        hasData: fat > 0,
      }
    }

    var periods = []

    var prevD = new Date(y, m - 2, 1)
    var prevComp = prevD.getFullYear() + '-' + pad2(prevD.getMonth() + 1)
    periods.push(mkPeriod('prev_month', 'Mês Anterior', prevComp, computeFaturado(prevComp)))

    var prevYearComp = y - 1 + '-' + pad2(m)
    periods.push(
      mkPeriod(
        'prev_year',
        'Mesmo Mês (Ano Anterior)',
        prevYearComp,
        computeFaturado(prevYearComp),
      ),
    )

    var months3 = []
    for (var i3 = 1; i3 <= 3; i3++) {
      var d3 = new Date(y, m - 1 - i3, 1)
      months3.push(d3.getFullYear() + '-' + pad2(d3.getMonth() + 1))
    }
    var sum3 = 0,
      cnt3 = 0
    for (var j3 = 0; j3 < months3.length; j3++) {
      var f3 = computeFaturado(months3[j3])
      if (f3 > 0) {
        sum3 += f3
        cnt3++
      }
    }
    var avg3 = cnt3 > 0 ? sum3 / cnt3 : 0
    periods.push({
      key: 'avg_3m',
      label: 'Média 3 Meses',
      competencia: months3.join(','),
      faturado: avg3,
      vendido: avg3,
      projecao: avg3,
      meta: 0,
      pct_meta: 0,
      hasData: cnt3 > 0,
    })

    var months6 = []
    for (var i6 = 1; i6 <= 6; i6++) {
      var d6 = new Date(y, m - 1 - i6, 1)
      months6.push(d6.getFullYear() + '-' + pad2(d6.getMonth() + 1))
    }
    var sum6 = 0,
      cnt6 = 0
    for (var j6 = 0; j6 < months6.length; j6++) {
      var f6 = computeFaturado(months6[j6])
      if (f6 > 0) {
        sum6 += f6
        cnt6++
      }
    }
    var avg6 = cnt6 > 0 ? sum6 / cnt6 : 0
    periods.push({
      key: 'avg_6m',
      label: 'Média 6 Meses',
      competencia: months6.join(','),
      faturado: avg6,
      vendido: avg6,
      projecao: avg6,
      meta: 0,
      pct_meta: 0,
      hasData: cnt6 > 0,
    })

    return e.json(200, { periods: periods })
  },
  $apis.requireAuth(),
)
