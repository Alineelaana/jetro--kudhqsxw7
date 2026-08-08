routerAdd('POST', '/backend/v1/performance/compute', (e) => {
  var internalSecret = $secrets.get('PB_SUPERUSER_TOKEN') || ''
  var providedSecret = e.request.header.get('X-Internal-Secret') || ''
  if (!e.auth && !(internalSecret && providedSecret && providedSecret === internalSecret)) {
    return e.unauthorizedError('Authentication required')
  }

  var results = { scores: 0, alerts: 0, benchmarks: 0 }
  var dt = new Date()
  var periodStr = dt.toISOString().substring(0, 10)

  function J(o) {
    return JSON.stringify(o)
  }
  function saveScore(entityType, entityId, entityName, module, score, components) {
    try {
      var col = $app.findCollectionByNameOrId('performance_scores')
      var rec = new Record(col)
      rec.set('entity_type', entityType)
      rec.set('entity_id', entityId)
      rec.set('entity_name', entityName)
      rec.set('company', '')
      rec.set('branch', '')
      rec.set('period', periodStr)
      rec.set('score', Math.round(score))
      rec.set('components', J({ module: module, metrics: components }))
      $app.save(rec)
      results.scores++
    } catch (err) {
      $app.logger().error('perf score save failed', 'error', String(err))
    }
  }
  function saveAlert(module, severity, message, reason, action) {
    try {
      var col = $app.findCollectionByNameOrId('performance_alerts')
      var rec = new Record(col)
      rec.set('module', module)
      rec.set('entity_type', 'empresa')
      rec.set('severity', severity)
      rec.set('message', message)
      rec.set('reason', reason)
      rec.set('suggested_action', action)
      rec.set('resolved', false)
      $app.save(rec)
      results.alerts++
    } catch (_) {}
  }
  function saveBenchmark(metric, value, percentile) {
    try {
      var col = $app.findCollectionByNameOrId('performance_benchmarks')
      var rec = new Record(col)
      rec.set('entity_type', 'empresa')
      rec.set('metric', metric)
      rec.set('value', String(value))
      rec.set('percentile', percentile)
      rec.set('period', periodStr)
      $app.save(rec)
      results.benchmarks++
    } catch (_) {}
  }
  function clamp(v) {
    return Math.max(0, Math.min(100, v))
  }

  var moduleScores = {}

  // Comercial
  try {
    var orders = $app.findRecordsByFilter('sales_orders', '', '-created', 500, 0)
    var totalVal = 0,
      count = orders.length
    for (var i = 0; i < orders.length; i++) {
      var v = parseFloat(orders[i].getString('total_value') || '0') || 0
      totalVal += v
    }
    var ticket = count > 0 ? totalVal / count : 0
    var score = clamp(20 + count * 2 + Math.min(40, totalVal / 10000))
    moduleScores['comercial'] = score
    saveScore('empresa', 'global', 'Empresa', 'comercial', score, {
      faturamento: totalVal,
      pedidos: count,
      ticket_medio: ticket,
    })
    if (count === 0)
      saveAlert(
        'comercial',
        'critical',
        'Sem pedidos no período',
        'Nenhum pedido registrado',
        'Verificar equipe comercial',
      )
    if (ticket < 100)
      saveAlert(
        'comercial',
        'warning',
        'Ticket médio baixo',
        'Ticket médio: R$ ' + ticket.toFixed(2),
        'Revisar estratégia de precificação',
      )
    saveBenchmark('faturamento', totalVal, 50)
    saveBenchmark('ticket_medio', ticket, 50)
  } catch (_) {}

  // Financeiro
  try {
    var recs = $app.findRecordsByFilter('financial_receivables', '', '-created', 500, 0)
    var pays = $app.findRecordsByFilter('financial_payables', '', '-created', 500, 0)
    var overdue = 0
    for (var j = 0; j < recs.length; j++) {
      if (recs[j].getString('status') === 'overdue' || recs[j].getString('status') === 'atrasado')
        overdue++
    }
    var inadimp = recs.length > 0 ? (overdue / recs.length) * 100 : 0
    var score = clamp(80 - inadimp * 2 + Math.min(20, recs.length))
    moduleScores['financeiro'] = score
    saveScore('empresa', 'global', 'Empresa', 'financeiro', score, {
      titulos: recs.length + pays.length,
      inadimplencia: inadimp,
    })
    if (inadimp > 20)
      saveAlert(
        'financeiro',
        'critical',
        'Alta inadimplência',
        'Inadimplência: ' + inadimp.toFixed(1) + '%',
        'Intensificar cobranças',
      )
    saveBenchmark('inadimplencia', inadimp, 50)
  } catch (_) {}

  // Compras
  try {
    var pos = $app.findRecordsByFilter('purchase_orders', '', '-created', 500, 0)
    var score = clamp(30 + pos.length * 3)
    moduleScores['compras'] = score
    saveScore('empresa', 'global', 'Empresa', 'compras', score, { pedidos_compra: pos.length })
  } catch (_) {}

  // Estoque
  try {
    var prods = $app.findRecordsByFilter('products', '', '', 500, 0)
    var lowStock = 0
    for (var k = 0; k < prods.length; k++) {
      var stock = prods[k].getFloat('stock') || 0
      var minStock = prods[k].getFloat('min_stock') || 0
      if (minStock > 0 && stock <= minStock) lowStock++
    }
    var rupture = prods.length > 0 ? (lowStock / prods.length) * 100 : 0
    var score = clamp(90 - rupture * 3)
    moduleScores['estoque'] = score
    saveScore('empresa', 'global', 'Empresa', 'estoque', score, {
      produtos: prods.length,
      ruptura: rupture,
    })
    if (rupture > 15)
      saveAlert(
        'estoque',
        'critical',
        'Alta taxa de ruptura',
        'Ruptura: ' + rupture.toFixed(1) + '%',
        'Revisar estoque mínimo',
      )
  } catch (_) {}

  // Logística
  try {
    var dels = $app.findRecordsByFilter('logistics_deliveries', '', '-created', 500, 0)
    var onTime = 0
    for (var l = 0; l < dels.length; l++) {
      if (dels[l].getString('status') === 'entregue' || dels[l].getString('status') === 'concluido')
        onTime++
    }
    var onTimeRate = dels.length > 0 ? (onTime / dels.length) * 100 : 100
    var score = clamp(onTimeRate)
    moduleScores['logistica'] = score
    saveScore('empresa', 'global', 'Empresa', 'logistica', score, {
      entregas: dels.length,
      no_prazo: onTimeRate,
    })
    if (onTimeRate < 70)
      saveAlert(
        'logistica',
        'critical',
        'Baixo índice de entregas no prazo',
        'Apenas ' + onTimeRate.toFixed(1) + '% no prazo',
        'Revisar rotas e transportadoras',
      )
  } catch (_) {}

  // Produção
  try {
    var ops = $app.findRecordsByFilter('production_orders', '', '-created', 500, 0)
    var completed = 0
    for (var m = 0; m < ops.length; m++) {
      if (ops[m].getString('status') === 'concluida' || ops[m].getString('status') === 'fechada')
        completed++
    }
    var completion = ops.length > 0 ? (completed / ops.length) * 100 : 100
    var score = clamp(completion)
    moduleScores['producao'] = score
    saveScore('empresa', 'global', 'Empresa', 'producao', score, {
      ordens: ops.length,
      concluidas: completed,
    })
  } catch (_) {}

  // Marketing
  try {
    var leads = $app.findRecordsByFilter('crm_leads', '', '-created', 500, 0)
    var score = clamp(30 + leads.length * 2)
    moduleScores['marketing'] = score
    saveScore('empresa', 'global', 'Empresa', 'marketing', score, { leads: leads.length })
  } catch (_) {}

  // RH
  try {
    var emps = $app.findRecordsByFilter('rh_employees', '', '', 500, 0)
    var score = clamp(50 + Math.min(50, emps.length * 2))
    moduleScores['rh'] = score
    saveScore('empresa', 'global', 'Empresa', 'rh', score, { colaboradores: emps.length })
  } catch (_) {}

  // TI
  try {
    var logs = $app.findRecordsByFilter('api_request_logs', '', '-created', 200, 0)
    var errors = 0
    for (var n = 0; n < logs.length; n++) {
      var code = logs[n].get('response_code') || logs[n].get('result_code') || 200
      if (parseInt(code) >= 400) errors++
    }
    var errorRate = logs.length > 0 ? (errors / logs.length) * 100 : 0
    var score = clamp(90 - errorRate * 2)
    moduleScores['ti'] = score
    saveScore('empresa', 'global', 'Empresa', 'ti', score, {
      requests: logs.length,
      errors: errors,
    })
    if (errorRate > 10)
      saveAlert(
        'ti',
        'warning',
        'Alta taxa de erro de API',
        'Erro: ' + errorRate.toFixed(1) + '%',
        'Investigar integrações',
      )
  } catch (_) {}

  // Administrativo
  try {
    var audits = $app.findRecordsByFilter('audit_logs', '', '-created', 200, 0)
    var score = clamp(40 + Math.min(60, audits.length * 0.5))
    moduleScores['administrativo'] = score
    saveScore('empresa', 'global', 'Empresa', 'administrativo', score, {
      audit_logs: audits.length,
    })
  } catch (_) {}

  // Estratégico
  try {
    var comScore = moduleScores['comercial'] || 0
    var finScore = moduleScores['financeiro'] || 0
    var score = clamp((comScore + finScore) / 2)
    moduleScores['estrategico'] = score
    saveScore('empresa', 'global', 'Empresa', 'estrategico', score, {
      comercial: comScore,
      financeiro: finScore,
    })
  } catch (_) {}

  // Geral
  try {
    var allScores = Object.keys(moduleScores).map(function (k) {
      return moduleScores[k]
    })
    var avg =
      allScores.length > 0
        ? allScores.reduce(function (a, b) {
            return a + b
          }, 0) / allScores.length
        : 0
    saveScore('empresa', 'global', 'Empresa', 'geral', avg, { modules: moduleScores })
  } catch (_) {}

  return e.json(200, results)
})
