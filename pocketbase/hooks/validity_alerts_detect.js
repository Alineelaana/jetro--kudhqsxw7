cronAdd('validity_alerts_detect', '0 6 * * *', () => {
  var created = 0
  var updated = 0
  var now = new Date()
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  var todayStr = today.toISOString().substring(0, 10)

  var rules = []
  try {
    rules = $app.findRecordsByFilter('validity_rules', 'active = true', '', 200, 0)
  } catch (_) {
    return
  }

  var notifCol = $app.findCollectionByNameOrId('notifications')
  var alertCol = $app.findCollectionByNameOrId('validity_alerts')

  function getNameFields() {
    return [
      'name',
      'full_name',
      'company_name',
      'produto_nome',
      'title',
      'tipo',
      'titular',
      'table_name',
      'numero_lote',
      'placa',
      'plate',
    ]
  }

  function getCompanyFields() {
    return ['company', 'empresa']
  }

  function getBranchFields() {
    return ['branch', 'filial']
  }

  function getField(record, fields) {
    for (var fi = 0; fi < fields.length; fi++) {
      try {
        var v = record.getString(fields[fi])
        if (v) return v
      } catch (_) {}
    }
    return ''
  }

  function parseJSON(str, fallback) {
    try {
      return JSON.parse(str || fallback)
    } catch (_) {
      return fallback
    }
  }

  function resolveCriticidade(daysRemaining, antecedentDays, criticidadeMap) {
    if (daysRemaining < 0) return 'Vencido'
    var sorted = antecedentDays.slice().sort(function (a, b) {
      return b - a
    })
    for (var i = 0; i < sorted.length; i++) {
      if (daysRemaining <= sorted[i]) {
        var key = String(sorted[i])
        return criticidadeMap[key] || 'Informativo'
      }
    }
    return null
  }

  function sendNotifications(alert, recipientsConfig, criticidade, entityName, daysRemaining) {
    var groups = []
    if (
      recipientsConfig &&
      recipientsConfig.escalation &&
      recipientsConfig.escalation[criticidade]
    ) {
      groups = recipientsConfig.escalation[criticidade]
    } else {
      groups = ['responsible']
    }

    var users = []
    try {
      users = $app.findRecordsByFilter('users', 'active != false', '', 100, 0)
    } catch (_) {
      return
    }

    var msg =
      'Alerta de Validade: ' + entityName + ' — ' + daysRemaining + ' dia(s) — ' + criticidade

    for (var u = 0; u < users.length; u++) {
      var user = users[u]
      var shouldNotify = false

      if (groups.indexOf('responsible') !== -1) {
        shouldNotify = true
      }
      if (groups.indexOf('gestor') !== -1) {
        if (user.getString('role') === 'SUP' || user.getString('role') === 'COMERCIAL')
          shouldNotify = true
      }
      if (groups.indexOf('diretoria') !== -1) {
        if (user.getString('role') === 'SUP') shouldNotify = true
      }
      if (!shouldNotify && user.getString('role') === 'SUP') shouldNotify = true

      if (shouldNotify) {
        try {
          var n = new Record(notifCol)
          n.set('title', 'Validade: ' + entityName)
          n.set('message', msg)
          n.set('type', 'other')
          n.set('recipient', user.id)
          n.set('read', false)
          n.set('link', '/admin/validade')
          $app.save(n)
        } catch (_) {}
      }
    }
  }

  for (var r = 0; r < rules.length; r++) {
    var rule = rules[r]
    var entityType = rule.getString('entity_type')
    var validityField = rule.getString('validity_field')
    var antecedentDays = parseJSON(rule.getString('antecedent_days'), '[]')
    var criticidadeMap = parseJSON(rule.getString('criticidade_mapping'), '{}')
    var recipientsConfig = parseJSON(rule.getString('recipients'), '{}')

    if (!antecedentDays || antecedentDays.length === 0) continue

    var maxDays = 0
    for (var d = 0; d < antecedentDays.length; d++) {
      if (antecedentDays[d] > maxDays) maxDays = antecedentDays[d]
    }
    var maxDate = new Date(today.getTime() + maxDays * 86400000)
    var maxDateStr = maxDate.toISOString().substring(0, 10)

    var records = []
    try {
      records = $app.findRecordsByFilter(
        entityType,
        validityField +
          ' != "" && ' +
          validityField +
          ' >= "' +
          todayStr +
          '" && ' +
          validityField +
          ' <= "' +
          maxDateStr +
          '"',
        validityField,
        500,
        0,
      )
    } catch (_) {
      try {
        records = $app.findRecordsByFilter(entityType, validityField + ' != ""', '', 500, 0)
      } catch (e2) {
        continue
      }
    }

    var expiredRecords = []
    try {
      expiredRecords = $app.findRecordsByFilter(
        entityType,
        validityField + ' != "" && ' + validityField + ' < "' + todayStr + '"',
        '',
        100,
        0,
      )
    } catch (_) {}

    var allRecords = records.concat(expiredRecords)

    for (var i = 0; i < allRecords.length; i++) {
      var record = allRecords[i]
      var validityStr = record.getString(validityField)
      if (!validityStr) continue

      var validityDate = new Date(validityStr.substring(0, 10))
      if (isNaN(validityDate.getTime())) continue

      var daysRemaining = Math.ceil((validityDate.getTime() - today.getTime()) / 86400000)
      var criticidade = resolveCriticidade(daysRemaining, antecedentDays, criticidadeMap)
      if (!criticidade) continue

      var entityName = getField(record, getNameFields()) || record.id
      var companyVal = getField(record, getCompanyFields())
      var branchVal = getField(record, getBranchFields())

      var existing = []
      try {
        existing = $app.findRecordsByFilter(
          'validity_alerts',
          'entity_type = "' +
            entityType +
            '" && entity_id = "' +
            record.id +
            '" && status != "Resolvido" && status != "Ignorado"',
          '-created',
          1,
          0,
        )
      } catch (_) {}

      if (existing.length > 0) {
        var alert = existing[0]
        var oldCrit = alert.getString('criticidade')
        var oldDays = alert.getInt('days_remaining')
        if (oldCrit !== criticidade || oldDays !== daysRemaining) {
          alert.set('criticidade', criticidade)
          alert.set('days_remaining', daysRemaining)
          if (criticidade === 'Vencido' && alert.getString('status') !== 'Em Tratamento') {
            alert.set('status', 'Vencido')
          }
          var tl = parseJSON(alert.getString('timeline'), '[]')
          tl.push({
            action: 'updated',
            timestamp: now.toISOString(),
            days_remaining: daysRemaining,
            criticidade: criticidade,
          })
          alert.set('timeline', JSON.stringify(tl))
          $app.save(alert)
          updated++
        }
      } else {
        var newAlert = new Record(alertCol)
        newAlert.set('rule_id', rule.id)
        newAlert.set('entity_type', entityType)
        newAlert.set('entity_id', record.id)
        newAlert.set('entity_name', entityName)
        newAlert.set('validity_field', validityField)
        newAlert.set('validity_date', validityStr.substring(0, 10))
        newAlert.set('days_remaining', daysRemaining)
        newAlert.set('criticidade', criticidade)
        newAlert.set('status', criticidade === 'Vencido' ? 'Vencido' : 'Novo')
        newAlert.set('module', rule.getString('module'))
        newAlert.set('company', companyVal)
        newAlert.set('branch', branchVal)

        var meta = {}
        var metaFields = [
          'code',
          'numero_lote',
          'quantidade_disponivel',
          'cpf',
          'cnpj',
          'plate',
          'placa',
          'phone',
          'numero',
        ]
        for (var mf = 0; mf < metaFields.length; mf++) {
          try {
            var mv = record.getString(metaFields[mf])
            if (mv) meta[metaFields[mf]] = mv
          } catch (_) {}
        }
        newAlert.set('metadata', JSON.stringify(meta))

        var tl2 = [
          {
            action: 'created',
            timestamp: now.toISOString(),
            days_remaining: daysRemaining,
            criticidade: criticidade,
          },
        ]
        newAlert.set('timeline', JSON.stringify(tl2))
        $app.save(newAlert)
        created++

        sendNotifications(newAlert, recipientsConfig, criticidade, entityName, daysRemaining)
      }
    }
  }

  $app.logger().info('validity alerts detect completed', 'created', created, 'updated', updated)
})
