routerAdd('GET', '/backend/v1/response-time/average', (e) => {
  try {
    var records = $app.findRecordsByFilter(
      'budget_requests',
      "quote_created_at != ''",
      '-created',
      0,
      0,
    )

    if (records.length === 0) {
      return e.json(200, { averageMs: 0, count: 0, formatted: '' })
    }

    var totalMs = 0
    var validCount = 0
    for (var i = 0; i < records.length; i++) {
      var createdStr = records[i].getString('created')
      var quoteStr = records[i].getString('quote_created_at')
      if (!createdStr || !quoteStr) continue
      var createdMs = new Date(createdStr).getTime()
      var quoteMs = new Date(quoteStr).getTime()
      if (isNaN(createdMs) || isNaN(quoteMs)) continue
      totalMs += quoteMs - createdMs
      validCount++
    }

    if (validCount === 0) {
      return e.json(200, { averageMs: 0, count: 0, formatted: '' })
    }

    var avgMs = totalMs / validCount
    var seconds = Math.floor(avgMs / 1000)
    var minutes = Math.floor(seconds / 60)
    var hours = Math.floor(minutes / 60)
    var days = Math.floor(hours / 24)

    var formatted = ''
    if (days > 0) {
      formatted = days + ' dia' + (days > 1 ? 's' : '')
    } else if (hours > 0) {
      formatted = hours + ' hora' + (hours > 1 ? 's' : '')
    } else if (minutes > 0) {
      formatted = minutes + ' minuto' + (minutes > 1 ? 's' : '')
    } else {
      formatted = 'menos de 1 minuto'
    }

    return e.json(200, { averageMs: avgMs, count: validCount, formatted: formatted })
  } catch (err) {
    $app.logger().error('response time calculation failed', 'error', String(err))
    return e.json(200, { averageMs: 0, count: 0, formatted: '' })
  }
})
