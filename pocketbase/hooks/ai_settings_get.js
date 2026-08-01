routerAdd('GET', '/backend/v1/ai-settings', (e) => {
  try {
    var active = false
    try {
      var setting = $app.findFirstRecordByData('settings', 'key', 'ai_fulltime_active')
      if (setting && setting.getString('value') === 'true') {
        active = true
      }
    } catch (_) {}
    return e.json(200, { active: active })
  } catch (err) {
    return e.json(200, { active: false })
  }
})
