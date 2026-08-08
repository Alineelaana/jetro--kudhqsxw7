onRecordAfterCreateSuccess((e) => {
  var text = (e.record.getString('conclusion') + '\n\n' + e.record.getString('reason')).trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('performance_ai_analysis', e.record.id)
    record.set('embedding', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding failed for performance_ai_analysis ' + e.record.id, err.message)
  }
  return e.next()
}, 'performance_ai_analysis')
