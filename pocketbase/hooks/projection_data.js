routerAdd(
  'GET',
  '/backend/v1/projection/data',
  (e) => {
    const q = e.requestInfo().query || {}
    const auth = e.auth
    if (!auth) return e.unauthorizedError('auth required')
    const userRole = auth.getString('role') || 'PADRAO'

    const competencia = q.competencia || ''
    let mes, ano
    if (competencia) {
      const parts = competencia.split('-')
      ano = parseInt(parts[0]) || new Date().getFullYear()
      mes = parseInt(parts[1]) || new Date().getMonth() + 1
    } else {
      const n = new Date()
      mes = n.getMonth() + 1
      ano = n.getFullYear()
    }

    let empF = q.empresa || '',
      filF = q.filial || ''
    if (userRole !== 'SUP') {
      const uEmp = auth.getString('empresa_id') || ''
      const uFil = auth.getString('filial_id') || ''
      if (uEmp) empF = uEmp
      if (uFil) filF = uFil
    }

    let totalDays = 22
    try {
      const c = $app.findFirstRecordByFilter(
        'business_days_configs',
        'mes = ' +
          mes +
          ' && ano = ' +
          ano +
          ' && empresa = "' +
          empF +
          '" && filial = "' +
          filF +
          '"',
      )
      totalDays = c.getInt('total_business_days')
    } catch (_) {
      try {
        const gc = $app.findFirstRecordByFilter(
          'business_days_configs',
          'mes = ' + mes + ' && ano = ' + ano + ' && empresa = "" && filial = ""',
        )
        totalDays = gc.getInt('total_business_days')
      } catch (__) {}
    }

    const now = new Date()
    const today = now.getDate(),
      curM = now.getMonth() + 1,
      curY = now.getFullYear()
    let elapsed = 0
    if (ano < curY || (ano === curY && mes < curM)) {
      elapsed = totalDays
    } else if (ano === curY && mes === curM) {
      for (let d = 1; d <= today; d++) {
        const dt = new Date(ano, mes - 1, d),
          dow = dt.getDay()
        if (dow !== 0 && dow !== 6) elapsed++
      }
    }

    const mStr = String(mes).padStart(2, '0')
    const fp = [
      'created >= "' + ano + '-' + mStr + '-01 00:00:00"',
      'created <= "' + ano + '-' + mStr + '-31 23:59:59"',
    ]
    if (empF) fp.push('company = "' + empF + '"')
    if (filF) fp.push('branch = "' + filF + '"')
    if (q.rca) fp.push('salesperson_name = "' + q.rca + '"')
    if (q.cliente) fp.push('client_name ~ "' + q.cliente + '"')
    const ordFilter = fp.join(' && ')

    let orders = []
    try {
      orders = $app.findRecordsByFilter('sales_orders', ordFilter, '-created', 1000, 0)
    } catch (_) {}

    const vendGer = {}
    try {
      const vs = $app.findRecordsByFilter('vendedores', 'active = true', '', 500, 0)
      vs.forEach(function (v) {
        const nm = v.getString('name') || '',
          sp = v.getString('supervisor') || ''
        if (nm) vendGer[nm] = sp
      })
    } catch (_) {}

    const compStr = ano + '-' + mStr
    const gByRca = {},
      gByGer = {}
    let totalMeta = 0
    try {
      const gs = $app.findRecordsByFilter(
        'sales_goals',
        'competencia = "' + compStr + '" && status = "ativa"',
        '',
        200,
        0,
      )
      gs.forEach(function (g) {
        const tv = parseFloat(g.getString('target_value') || '0')
        const rc = g.getString('rca') || '',
          gr = g.getString('gerente') || ''
        totalMeta += tv
        if (rc) gByRca[rc] = (gByRca[rc] || 0) + tv
        if (gr) gByGer[gr] = (gByGer[gr] || 0) + tv
      })
    } catch (_) {}

    let tVend = 0,
      tFat = 0
    const rcaM = {},
      gerM = {},
      proM = {},
      fornM = {},
      regM = {},
      dayM = {}
    const FAT = ['Faturado Totalmente', 'Faturado Parcialmente', 'Entregue']

    orders.forEach(function (o) {
      const val = parseFloat(o.getString('total_value') || '0')
      const st = o.getString('status') || ''
      const sp = o.getString('salesperson_name') || 'N/A'
      const cr = o.getString('created') || ''
      const addr = o.getString('delivery_address') || ''
      tVend += val
      const isF = FAT.indexOf(st) !== -1
      if (isF) tFat += val
      if (!rcaM[sp]) rcaM[sp] = { v: 0, f: 0 }
      rcaM[sp].v += val
      if (isF) rcaM[sp].f += val
      const gr = vendGer[sp] || 'N/A'
      if (!gerM[gr]) gerM[gr] = { v: 0, f: 0 }
      gerM[gr].v += val
      if (isF) gerM[gr].f += val
      try {
        const its = JSON.parse(o.getString('items') || '[]')
        if (Array.isArray(its))
          its.forEach(function (it) {
            const pn = it.product || it.name || 'N/A'
            const qtd = parseFloat(it.quantity || '0') || 1
            const pr = parseFloat(it.unit_price || it.total || '0') || 0
            const iv = pr * qtd
            if (!proM[pn]) proM[pn] = { v: 0, f: 0 }
            proM[pn].v += iv
            if (isF) proM[pn].f += iv
            const fo = it.supplier || it.fornecedor || ''
            if (fo) {
              if (!fornM[fo]) fornM[fo] = { v: 0, f: 0 }
              fornM[fo].v += iv
              if (isF) fornM[fo].f += iv
            }
          })
      } catch (_) {}
      if (addr) {
        const ap = addr.split(',')
        const rn = ap.length > 1 ? ap[ap.length - 1].trim() : 'N/A'
        if (!regM[rn]) regM[rn] = { v: 0, f: 0 }
        regM[rn].v += val
        if (isF) regM[rn].f += val
      }
      if (cr) {
        const dy = cr.substring(8, 10)
        if (!dayM[dy]) dayM[dy] = 0
        if (isF) dayM[dy] += val
      }
    })

    function buildRows(mp, gm) {
      return Object.keys(mp)
        .map(function (nm) {
          const d = mp[nm],
            meta = gm[nm] || 0
          const avg = elapsed > 0 ? d.f / elapsed : 0
          const proj = avg * totalDays
          const pm = meta > 0 ? (d.f / meta) * 100 : 0
          const pp = meta > 0 ? (proj / meta) * 100 : 0
          const df = proj - meta
          let s = 'sem_meta'
          if (meta > 0) {
            s = pp >= 100 ? 'acima' : pp >= 90 ? 'proximo' : 'abaixo'
          }
          return {
            name: nm,
            meta: meta,
            vendido: d.v,
            faturado: d.f,
            pct_meta: pm,
            media_dia: avg,
            projecao: proj,
            pct_projetado: pp,
            diferenca: df,
            status: s,
          }
        })
        .sort(function (a, b) {
          return b.faturado - a.faturado
        })
    }

    const avgDay = elapsed > 0 ? tFat / elapsed : 0
    const proj = avgDay * totalDays
    const pMeta = totalMeta > 0 ? (tFat / totalMeta) * 100 : 0
    const pProj = totalMeta > 0 ? (proj / totalMeta) * 100 : 0
    const rest = Math.max(0, totalMeta - tFat)
    const dProj = proj - totalMeta
    const dRest = totalDays - elapsed
    let tend = 'neutro'
    if (totalMeta > 0) {
      tend = pProj >= 100 ? 'acima' : pProj >= 90 ? 'proximo' : 'abaixo'
    }

    const dayArr = Object.keys(dayM)
      .sort()
      .map(function (d) {
        return { date: d, faturado: dayM[d] }
      })

    return e.json(200, {
      kpis: {
        meta: totalMeta,
        vendido: tVend,
        faturado: tFat,
        pct_meta: pMeta,
        restante: rest,
        media_dia: avgDay,
        dias_uteis_decorridos: elapsed,
        dias_uteis_restantes: dRest,
        dias_uteis_totais: totalDays,
        projecao: proj,
        pct_projetado: pProj,
        diferenca_projetada: dProj,
        tendencia: tend,
      },
      dimensions: {
        rca: buildRows(rcaM, gByRca),
        gerente: buildRows(gerM, gByGer),
        produto: buildRows(proM, {}),
        fornecedor: buildRows(fornM, {}),
        regiao: buildRows(regM, {}),
      },
      daily_evolution: dayArr,
      competencia: compStr,
      elapsed_days: elapsed,
      total_days: totalDays,
    })
  },
  $apis.requireAuth(),
)
