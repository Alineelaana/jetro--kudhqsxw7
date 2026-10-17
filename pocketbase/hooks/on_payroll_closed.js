onRecordAfterUpdateSuccess((e) => {
  const oldStatus = e.record.original().getString('situacao') || ''
  const newStatus = e.record.getString('situacao') || ''

  if (oldStatus === newStatus) return e.next()
  if (newStatus !== 'Fechada') return e.next()

  const competencia = e.record.getString('competencia') || ''
  const empresa = e.record.getString('empresa') || 'Jetro'
  const filial = e.record.getString('filial') || 'Matriz'
  const centroCusto = e.record.getString('centro_custo') || 'Folha'
  const docOrigem = 'Folha de Pagamento - ' + competencia

  try {
    var existing = $app.findRecordsByFilter(
      'financial_payables',
      'documento_origem = "' + docOrigem + '"',
      '-created',
      1,
      0,
    )
    if (existing.length > 0) return e.next()
  } catch (_) {}

  var itemsStr = e.record.getString('itens') || '[]'
  var items = []
  try {
    items = JSON.parse(itemsStr)
  } catch (_) {}
  if (!items || items.length === 0) return e.next()

  var payCol = $app.findCollectionByNameOrId('financial_payables')
  var auditCol = $app.findCollectionByNameOrId('audit_logs')

  var parts = competencia.split('-')
  var year = parseInt(parts[0]) || new Date().getFullYear()
  var month = parseInt(parts[1]) || new Date().getMonth() + 1
  var nextMonth = month + 1
  var nextYear = year
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear++
  }
  var pad = function (n) {
    return n < 10 ? '0' + n : '' + n
  }
  var salaryDue = nextYear + '-' + pad(nextMonth) + '-05'
  var taxDue = nextYear + '-' + pad(nextMonth) + '-20'
  var todayStr = new Date().toISOString().split('T')[0]
  var compDate = competencia + '-01'

  var totalSalarios = 0,
    totalFGTS = 0,
    totalINSS = 0,
    totalIRRF = 0

  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    var empName = item.employee_name || 'Colaborador'
    var liquido = parseFloat(item.valor_liquido) || 0
    var inssVal = parseFloat(item.inss_value) || 0
    var irrfVal = parseFloat(item.irrf_value) || 0
    var fgtsVal = parseFloat(item.fgts_value) || 0

    totalSalarios += liquido
    totalFGTS += fgtsVal
    totalINSS += inssVal
    totalIRRF += irrfVal

    try {
      var payRec = new Record(payCol)
      payRec.set('numero_titulo', 'FP-' + competencia + '-' + (i + 1))
      payRec.set('fornecedor', empName)
      payRec.set('empresa', empresa)
      payRec.set('filial', filial)
      payRec.set('documento_origem', docOrigem)
      payRec.set('data_emissao', todayStr)
      payRec.set('data_competencia', compDate)
      payRec.set('data_vencimento', salaryDue)
      payRec.set('valor_original', String(liquido.toFixed(2)))
      payRec.set('valor_atualizado', String(liquido.toFixed(2)))
      payRec.set('forma_pagamento', 'Transferencia')
      payRec.set('status', 'Em Aberto')
      payRec.set('centro_custo', centroCusto)
      payRec.set('plano_contas', 'Folha de Pagamento')
      payRec.set('observacoes', 'Salario liquido - ' + competencia + ' - ' + empName)
      $app.save(payRec)
    } catch (err) {
      $app
        .logger()
        .error('Failed to create salary payable', 'error', String(err), 'employee', empName)
    }
  }

  var encargos = [
    {
      titulo: 'FGTS-' + competencia,
      fornec: 'Caixa Economica Federal - FGTS',
      valor: totalFGTS,
      plano: 'Encargos Sociais - FGTS',
    },
    {
      titulo: 'INSS-' + competencia,
      fornec: 'Receita Federal - INSS',
      valor: totalINSS,
      plano: 'Encargos Sociais - INSS',
    },
    {
      titulo: 'IRRF-' + competencia,
      fornec: 'Receita Federal - IRRF',
      valor: totalIRRF,
      plano: 'Encargos Sociais - IRRF',
    },
  ]

  for (var j = 0; j < encargos.length; j++) {
    var enc = encargos[j]
    if (enc.valor <= 0) continue
    try {
      var rec = new Record(payCol)
      rec.set('numero_titulo', enc.titulo)
      rec.set('fornecedor', enc.fornec)
      rec.set('empresa', empresa)
      rec.set('filial', filial)
      rec.set('documento_origem', docOrigem)
      rec.set('data_emissao', todayStr)
      rec.set('data_competencia', compDate)
      rec.set('data_vencimento', taxDue)
      rec.set('valor_original', String(enc.valor.toFixed(2)))
      rec.set('valor_atualizado', String(enc.valor.toFixed(2)))
      rec.set('forma_pagamento', 'Guia')
      rec.set('status', 'Em Aberto')
      rec.set('centro_custo', centroCusto)
      rec.set('plano_contas', enc.plano)
      rec.set('observacoes', enc.titulo + ' - ' + competencia)
      $app.save(rec)
    } catch (err) {
      $app
        .logger()
        .error('Failed to create encargo payable', 'error', String(err), 'encargo', enc.titulo)
    }
  }

  try {
    var log = new Record(auditCol)
    log.set('action', 'create')
    log.set('module', 'finance')
    log.set('target_collection', 'financial_payables')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'Folha ' + competencia + ' fechada - ' + items.length + ' titulos gerados',
    )
    log.set('new_value', {
      salarios: totalSalarios.toFixed(2),
      fgts: totalFGTS.toFixed(2),
      inss: totalINSS.toFixed(2),
      irrf: totalIRRF.toFixed(2),
      total: (totalSalarios + totalFGTS + totalINSS + totalIRRF).toFixed(2),
    })
    log.set('criticidade', 'Alta')
    log.set('origem', 'Automacao')
    $app.save(log)
  } catch (_) {}

  return e.next()
}, 'rh_payroll')
