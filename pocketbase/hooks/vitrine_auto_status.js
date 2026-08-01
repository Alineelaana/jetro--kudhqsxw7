cronAdd('vitrine_auto_status', '* * * * *', () => {
  const now = new Date().toISOString()
  let items = []
  try {
    items = $app.findRecordsByFilter(
      'vitrine_items',
      "status = 'agendada' || status = 'publicada'",
      '',
      0,
      0,
    )
  } catch (_) {
    return
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const startDate = item.getString('start_date')
    const endDate = item.getString('end_date')
    const status = item.getString('status')

    if (status === 'agendada' && startDate && startDate <= now) {
      item.set('status', 'publicada')
      item.set('active', true)
      item.set('has_publish_history', true)
      $app.save(item)
    } else if (status === 'publicada' && endDate && endDate <= now) {
      item.set('status', 'encerrada')
      item.set('active', false)
      $app.save(item)
    }
  }
})
