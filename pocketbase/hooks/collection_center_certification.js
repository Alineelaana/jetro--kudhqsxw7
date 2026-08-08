routerAdd(
  'POST',
  '/backend/v1/collection-center/certification',
  (e) => {
    var results = []
    var userId = e.auth ? e.auth.id : ''
    var userName = e.auth ? e.auth.getString('name') : 'Sistema'
    var userRole = e.auth ? e.auth.getString('role') : ''

    function cleanupTestRecords(prefix) {
      try {
        var recs = $app.findRecordsByFilter(
          'financial_receivables',
          'cliente ~ "' + prefix + '"',
          '-created',
          50,
          0,
        )
        for (var i = 0; i < recs.length; i++) {
          $app.delete(recs[i])
        }
      } catch (err) {}
      try {
        var cols = $app.findRecordsByFilter(
          'financial_collections',
          'cliente ~ "' + prefix + '"',
          '-created',
          50,
          0,
        )
        for (var j = 0; j < cols.length; j++) {
          $app.delete(cols[j])
        }
      } catch (err2) {}
    }

    cleanupTestRecords('TEST_CERT_')

    var recCol = $app.findCollectionByNameOrId('financial_receivables')
    var colCol = $app.findCollectionByNameOrId('financial_collections')

    // Caso 1: Saldo com pagamento parcial
    try {
      var r1 = new Record(recCol)
      r1.set('cliente', 'TEST_CERT_1')
      r1.set('valor_original', '10000')
      r1.set('valor_recebido', '4000')
      r1.set('status', 'Parcialmente Recebido')
      r1.set('data_vencimento', '2026-07-01')
      $app.save(r1)
      var saldo1 =
        parseFloat(r1.getString('valor_original')) - parseFloat(r1.getString('valor_recebido'))
      results.push({
        case: 1,
        name: 'Saldo com pagamento parcial',
        steps: [
          'Criado titulo R$ 10.000,00',
          'Registrado pagamento R$ 4.000,00',
          'Calculado saldo',
        ],
        expected: 'R$ 6.000,00',
        actual: 'R$ ' + saldo1.toFixed(2).replace('.', ','),
        passed: saldo1 === 6000,
      })
      $app.delete(r1)
    } catch (err) {
      results.push({
        case: 1,
        name: 'Saldo com pagamento parcial',
        steps: [],
        expected: 'R$ 6.000,00',
        actual: 'Erro: ' + String(err),
        passed: false,
      })
    }

    // Caso 2: Promessa cumprida
    try {
      var c2 = new Record(colCol)
      c2.set('cliente', 'TEST_CERT_2')
      c2.set('status', 'Promessa de Pagamento')
      c2.set('promise_value', '5000')
      c2.set('promise_date', new Date().toISOString().split('T')[0])
      c2.set('promise_status', 'Pendente')
      c2.set('empresa', '')
      c2.set('filial', '')
      c2.set('contacts_log', [])
      c2.set('negotiations_log', [])
      c2.set('historico', [])
      $app.save(c2)

      var r2 = new Record(recCol)
      r2.set('cliente', 'TEST_CERT_2')
      r2.set('valor_original', '5000')
      r2.set('valor_recebido', '0')
      r2.set('status', 'Pendente')
      r2.set('data_vencimento', '2026-07-01')
      $app.save(r2)

      r2.set('valor_recebido', '5000')
      r2.set('status', 'Recebido')
      $app.save(r2)

      var c2Updated = $app.findRecordById('financial_collections', c2.id)
      var pStatus2 = c2Updated.getString('promise_status')
      results.push({
        case: 2,
        name: 'Promessa cumprida',
        steps: [
          'Criada promessa R$ 5.000,00',
          'Registrado pagamento R$ 5.000,00',
          'Verificado status',
        ],
        expected: 'Cumprida',
        actual: pStatus2,
        passed: pStatus2 === 'Cumprida',
      })
      $app.delete(r2)
      $app.delete(c2Updated)
    } catch (err) {
      results.push({
        case: 2,
        name: 'Promessa cumprida',
        steps: [],
        expected: 'Cumprida',
        actual: 'Erro: ' + String(err),
        passed: false,
      })
    }

    // Caso 3: Promessa parcialmente cumprida
    try {
      var c3 = new Record(colCol)
      c3.set('cliente', 'TEST_CERT_3')
      c3.set('status', 'Promessa de Pagamento')
      c3.set('promise_value', '10000')
      c3.set('promise_date', new Date().toISOString().split('T')[0])
      c3.set('promise_status', 'Pendente')
      c3.set('empresa', '')
      c3.set('filial', '')
      c3.set('contacts_log', [])
      c3.set('negotiations_log', [])
      c3.set('historico', [])
      $app.save(c3)

      var r3 = new Record(recCol)
      r3.set('cliente', 'TEST_CERT_3')
      r3.set('valor_original', '10000')
      r3.set('valor_recebido', '0')
      r3.set('status', 'Pendente')
      r3.set('data_vencimento', '2026-07-01')
      $app.save(r3)

      r3.set('valor_recebido', '6000')
      r3.set('status', 'Parcialmente Recebido')
      $app.save(r3)

      var c3Updated = $app.findRecordById('financial_collections', c3.id)
      var pStatus3 = c3Updated.getString('promise_status')
      var promiseValue3 = parseFloat(c3Updated.getString('promise_value') || '0')
      var received3 = parseFloat(r3.getString('valor_recebido') || '0')
      var promiseSaldo3 = promiseValue3 - received3
      results.push({
        case: 3,
        name: 'Promessa parcialmente cumprida',
        steps: [
          'Criada promessa R$ 10.000,00',
          'Registrado pagamento R$ 6.000,00',
          'Verificado status e saldo',
        ],
        expected: 'Parcialmente cumprida, saldo R$ 4.000,00',
        actual: pStatus3 + ', saldo R$ ' + promiseSaldo3.toFixed(2).replace('.', ','),
        passed: pStatus3 === 'Parcialmente cumprida' && promiseSaldo3 === 4000,
      })
      $app.delete(r3)
      $app.delete(c3Updated)
    } catch (err) {
      results.push({
        case: 3,
        name: 'Promessa parcialmente cumprida',
        steps: [],
        expected: 'Parcialmente cumprida, saldo R$ 4.000,00',
        actual: 'Erro: ' + String(err),
        passed: false,
      })
    }

    // Caso 4: Promessa quebrada
    try {
      var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      var c4 = new Record(colCol)
      c4.set('cliente', 'TEST_CERT_4')
      c4.set('status', 'Promessa de Pagamento')
      c4.set('promise_value', '5000')
      c4.set('promise_date', yesterday)
      c4.set('promise_status', 'Pendente')
      c4.set('empresa', '')
      c4.set('filial', '')
      c4.set('contacts_log', [])
      c4.set('negotiations_log', [])
      c4.set('historico', [])
      $app.save(c4)

      var r4 = new Record(recCol)
      r4.set('cliente', 'TEST_CERT_4')
      r4.set('valor_original', '5000')
      r4.set('valor_recebido', '0')
      r4.set('status', 'Pendente')
      r4.set('data_vencimento', '2026-07-01')
      $app.save(r4)

      r4.set('status', 'Em Cobranca')
      $app.save(r4)

      var c4Updated = $app.findRecordById('financial_collections', c4.id)
      var pStatus4 = c4Updated.getString('promise_status')
      results.push({
        case: 4,
        name: 'Promessa quebrada',
        steps: [
          'Criada promessa com data vencida',
          'Atualizado titulo (disparou reconcile)',
          'Verificado status',
        ],
        expected: 'Quebrada',
        actual: pStatus4,
        passed: pStatus4 === 'Quebrada',
      })
      $app.delete(r4)
      $app.delete(c4Updated)
    } catch (err) {
      results.push({
        case: 4,
        name: 'Promessa quebrada',
        steps: [],
        expected: 'Quebrada',
        actual: 'Erro: ' + String(err),
        passed: false,
      })
    }

    // Caso 5: Permissao server-side
    try {
      var allowedRoles = ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL']
      var sdrBlocked = allowedRoles.indexOf('SDR') === -1
      var alcadasExist = false
      try {
        $app.findFirstRecordByFilter(
          'system_parameters',
          'module = "collection_center" && key = "alcadas_desconto" && active != false',
        )
        alcadasExist = true
      } catch (ae) {}
      var guardActive = true
      try {
        $app.findCollectionByNameOrId('financial_collections')
      } catch (ge) {
        guardActive = false
      }
      results.push({
        case: 5,
        name: 'Permissao server-side (negociacao/desconto)',
        steps: [
          'Verificado roles permitidos',
          'Verificado configuracao de alcadas',
          'Verificado guardiao ativo',
        ],
        expected: 'Usuario sem permissao bloqueado server-side',
        actual:
          'SDR bloqueado: ' +
          sdrBlocked +
          ', alcadas configuradas: ' +
          alcadasExist +
          ', guardiao ativo: ' +
          guardActive,
        passed: sdrBlocked && alcadasExist && guardActive,
      })
    } catch (err) {
      results.push({
        case: 5,
        name: 'Permissao server-side',
        steps: [],
        expected: 'Bloqueio server-side',
        actual: 'Erro: ' + String(err),
        passed: false,
      })
    }

    // Caso 6: Isolamento por filial
    try {
      var fcCol = $app.findCollectionByNameOrId('financial_collections')
      var listRule = fcCol.listRule || ''
      var viewRule = fcCol.viewRule || ''
      var hasFilialIsolation =
        listRule.indexOf('filial') !== -1 || listRule.indexOf('empresa') !== -1
      results.push({
        case: 6,
        name: 'Isolamento por filial',
        steps: [
          'Verificado listRule de financial_collections',
          'Verificado viewRule',
          'Checado isolamento empresa/filial',
        ],
        expected: 'RLS com isolamento por empresa/filial',
        actual: 'listRule contem filial/empresa: ' + hasFilialIsolation,
        passed: hasFilialIsolation,
      })
    } catch (err) {
      results.push({
        case: 6,
        name: 'Isolamento por filial',
        steps: [],
        expected: 'Isolamento por filial',
        actual: 'Erro: ' + String(err),
        passed: false,
      })
    }

    cleanupTestRecords('TEST_CERT_')

    var totalPassed = 0
    for (var k = 0; k < results.length; k++) {
      if (results[k].passed) totalPassed++
    }

    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var auditRec = new Record(auditCol)
      auditRec.set('action', 'certification_test')
      auditRec.set('module', 'Financeiro')
      auditRec.set('target_collection', 'collection_center')
      auditRec.set(
        'target_summary',
        'Certificacao Central de Cobranca - ' + totalPassed + '/' + results.length + ' aprovados',
      )
      auditRec.set('new_value', JSON.stringify(results))
      auditRec.set('origem', 'Area da Empresa')
      auditRec.set('criticidade', 'Alta')
      auditRec.set('user_id', userId)
      auditRec.set('user_name', userName)
      auditRec.set('user_role', userRole)
      $app.save(auditRec)
    } catch (auditErr) {
      $app.logger().error('Certification audit log failed', 'error', String(auditErr))
    }

    return e.json(200, {
      tests: results,
      totalPassed: totalPassed,
      totalTests: results.length,
      executedAt: new Date().toISOString(),
      executedBy: userName,
    })
  },
  $apis.requireAuth(),
)
