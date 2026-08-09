onRecordAfterCreateSuccess((e) => {
  var record = e.record
  var chapterId = record.getString('chapter_id') || ''
  var route = record.getString('screen_route') || ''

  if (chapterId) {
    return e.next()
  }

  try {
    var gapCol = $app.findCollectionByNameOrId('blueprint_gaps')
    var gap = new Record(gapCol)
    gap.set('gap_type', 'screen')
    gap.set('gap_key', route)
    gap.set('gap_label', record.getString('screen_label') || route)
    gap.set('description', 'Tela sem documentação vinculada no Blueprint')
    gap.set('status', 'pendente')
    gap.set('detected_at', new Date().toISOString())
    $app.save(gap)

    $app.logger().info('blueprint gap detected', 'route', route)
  } catch (err) {
    $app.logger().error('blueprint gap detect failed', 'error', String(err))
  }

  return e.next()
}, 'blueprint_screen_links')
