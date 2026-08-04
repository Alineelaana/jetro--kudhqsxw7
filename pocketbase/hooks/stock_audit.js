onRecordCreateRequest(
  (e) => {
    var ip = ''
    var ua = ''
    var authUser = null
    try {
      ip = e.request.remoteAddr || ''
    } catch (_) {}
    try {
      ua = (e.requestInfo().headers || {})['user_agent'] || ''
    } catch (_) {}
    try {
      authUser = e.auth
    } catch (_) {}

    e.next()

    var collection = e.record.collectionName
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var summary = e.record.id
      var nameFields = [
        'produto_nome',
        'numero_inventario',
        'numero_transferencia',
        'numero_ajuste',
        'numero_separacao',
        'documento',
        'numero_expedicao',
        'numero_lote',
      ]
      for (var fi = 0; fi < nameFields.length; fi++) {
        try {
          var sv = e.record.getString(nameFields[fi])
          if (sv) {
            summary = sv
            break
          }
        } catch (_) {}
      }

      var newVal = {
        tipo:
          e.record.getString('tipo_movimentacao') ||
          e.record.getString('tipo_ajuste') ||
          e.record.getString('status') ||
          '',
        quantidade: e.record.getInt('quantidade') || 0,
        saldo_anterior: e.record.getInt('saldo_anterior') || 0,
        saldo_atual: e.record.getInt('saldo_atual') || 0,
        motivo: e.record.getString('motivo') || '',
        documento:
          e.record.getString('documento_origem') ||
          e.record.getString('documento_referencia') ||
          '',
      }

      var log = new Record(auditCol)
      log.set('user_id', authUser ? authUser.id : '')
      log.set(
        'user_name',
        authUser
          ? authUser.getString('name') || authUser.email || ''
          : e.record.getString('responsavel') || 'Sistema',
      )
      log.set('user_role', authUser ? authUser.getString('role') : '')
      log.set('action', 'create')
      log.set('module', 'stock')
      log.set('target_collection', collection)
      log.set('target_id', e.record.id)
      log.set('target_summary', summary)
      log.set('previous_value', null)
      log.set('new_value', newVal)
      log.set('ip_address', ip)
      log.set('user_agent', ua)
      $app.save(log)
    } catch (err) {
      $app.logger().error('stock audit log failed', 'error', String(err))
    }
  },
  'stock_movements',
  'stock_adjustments',
  'stock_transfers',
  'stock_inventories',
  'stock_pickings',
  'stock_checkings',
  'stock_expeditions',
  'stock_batches',
)
