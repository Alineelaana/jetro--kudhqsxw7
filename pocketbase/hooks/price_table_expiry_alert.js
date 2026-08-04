cronAdd('price_table_expiry_alert', '0 9 * * *', () => {
  try {
    var now = new Date()
    var sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    var nowStr = now.toISOString().slice(0, 10)
    var sevenDaysStr = sevenDaysLater.toISOString().slice(0, 10)

    var tables = $app.findRecordsByFilter(
      'price_tables',
      'status = "ativa" && active != false && data_final != "" && data_final >= "' +
        nowStr +
        '" && data_final <= "' +
        sevenDaysStr +
        '"',
      'data_final',
      0,
      0,
    )

    if (tables.length === 0) return

    var recipients = $app.findRecordsByFilter(
      'users',
      "active != false && (role = 'SUP' || role = 'COMERCIAL')",
      '',
      0,
      0,
    )
    if (recipients.length === 0) return

    var notifCol = $app.findCollectionByNameOrId('notifications')
    var created = 0

    for (var t = 0; t < tables.length; t++) {
      var table = tables[t]
      var tableName = table.getString('table_name')
      var dataFinal = table.getString('data_final')
      var tableId = table.id

      var existing = []
      try {
        existing = $app.findRecordsByFilter(
          'notifications',
          "type = 'other' && read = false && link ~ '" + tableId + "'",
          '',
          1,
          0,
        )
      } catch (_) {
        existing = []
      }
      if (existing.length > 0) continue

      var daysLeft = Math.ceil(
        (new Date(dataFinal).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      var msg =
        'A tabela de precos "' +
        tableName +
        '" expira em ' +
        daysLeft +
        ' dia(s) (' +
        dataFinal +
        '). Renove ou atualize a vigencia para evitar interrupcoes.'

      for (var r = 0; r < recipients.length; r++) {
        var n = new Record(notifCol)
        n.set('title', 'Tabela de precos proxima da validade')
        n.set('message', msg)
        n.set('type', 'other')
        n.set('recipient', recipients[r].id)
        n.set('read', false)
        n.set('link', '/admin/tabelas-precos')
        $app.save(n)
        created++
      }
    }

    if (created > 0) {
      $app.logger().info('price table expiry alert sent', 'notifications_created', created)
    }
  } catch (err) {
    $app.logger().error('price table expiry alert failed', 'error', String(err))
  }
})
