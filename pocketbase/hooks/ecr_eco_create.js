routerAdd(
  'POST',
  '/backend/v1/industrial/engineering-change/create',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')

      var changeType = body.change_type || 'ecr'
      if (changeType !== 'ecr' && changeType !== 'eco')
        return e.badRequestError('change_type must be ecr or eco')

      var colName =
        changeType === 'ecr' ? 'engineering_change_requests' : 'engineering_change_orders'
      var numberField = changeType === 'ecr' ? 'ecr_number' : 'eco_number'
      var prefix = changeType === 'ecr' ? 'ECR' : 'ECO'
      var year = new Date().getFullYear()

      var counter = null
      try {
        counter = $app.findFirstRecordByData('settings', 'key', prefix.toLowerCase() + '_sequence')
      } catch (_) {}

      var nextNum = 1
      if (counter) {
        nextNum = parseInt(counter.getString('value') || '0', 10) + 1
        counter.set('value', String(nextNum))
        $app.save(counter)
      } else {
        var settingsCol = $app.findCollectionByNameOrId('settings')
        var rec = new Record(settingsCol)
        rec.set('key', prefix.toLowerCase() + '_sequence')
        rec.set('value', '1')
        $app.save(rec)
      }

      var seqStr = String(nextNum)
      while (seqStr.length < 4) seqStr = '0' + seqStr
      var changeNumber = prefix + '-' + year + '-' + seqStr

      var col = $app.findCollectionByNameOrId(colName)
      var record = new Record(col)
      record.set(numberField, changeNumber)
      record.set('title', body.title || '')
      record.set('description', body.description || '')
      record.set('status', 'rascunho')

      if (changeType === 'ecr') {
        record.set('type', body.type || 'melhoria')
        record.set('priority', body.priority || 'media')
        record.set('reason', body.reason || '')
        record.set('requested_by', authUser.getString('name') || authUser.email)
        if (body.product_id) record.set('product_id', body.product_id)
        if (body.bom_version_id) record.set('bom_version_id', body.bom_version_id)
        record.set('impact_assessment', body.impact_assessment || '')
      } else {
        if (body.ecr_id) record.set('ecr_id', body.ecr_id)
        record.set('change_details', JSON.stringify(body.change_details || {}))
      }

      if (body.company) record.set('company', body.company)
      if (body.branch) record.set('branch', body.branch)

      $app.save(record)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('user_role', authUser.getString('role') || '')
        log.set('action', changeType + '_created')
        log.set('module', 'industrial')
        log.set('target_collection', colName)
        log.set('target_id', record.id)
        log.set('target_summary', changeNumber + ' - ' + (body.title || ''))
        $app.save(log)
      } catch (_) {}

      return e.json(201, { id: record.id, number: changeNumber, type: changeType })
    } catch (err) {
      $app.logger().error('Engineering change create failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao criar cambio de engenharia' })
    }
  },
  $apis.requireAuth(),
)
