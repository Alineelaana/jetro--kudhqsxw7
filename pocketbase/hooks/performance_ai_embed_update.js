onRecordAfterUpdateSuccess((e) => {
  var conclusionChanged =
    e.record.getString('conclusion') !== e.record.original().getString('conclusion')
  var reasonChanged = e.record.getString('reason') !== e.record.original().getString('reason')
  if (!conclusionChanged && !reasonChanged) return e.next()
  var text = (e.record.getString('conclusion') + '\n\n' + e.record.getString('reason')).trim()
  if (!text) return e.next()
  try {
    var res = $ai.embed({ input: text })
    var record = $app.findRecordById('performance_ai_analysis', e.record.id)
    record.set('embedding', res.data[0].embedding)
    $app.save(record)
  } catch (err) {
    console.log('embedding update failed for performance_ai_analysis ' + e.record.id, err.message)
  }
  return e.next()
}, 'performance_ai_analysis')
