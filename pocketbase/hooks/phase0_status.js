routerAdd(
  'GET',
  '/backend/v1/phase0/status',
  (e) => {
    var stageKeys = [
      'phase0_stage1_approved',
      'phase0_stage2_approved',
      'phase0_stage3_approved',
      'phase0_stage4_approved',
    ]
    var stages = []
    for (var i = 0; i < stageKeys.length; i++) {
      var approved = false
      try {
        var rec = $app.findFirstRecordByData('settings', 'key', stageKeys[i])
        approved = rec.getString('value') === 'true'
      } catch (_) {}
      stages.push({ stage: i + 1, approved: approved, key: stageKeys[i] })
    }
    var allApproved = true
    for (var j = 0; j < stages.length; j++) {
      if (!stages[j].approved) {
        allApproved = false
        break
      }
    }
    return e.json(200, { stages: stages, allApproved: allApproved })
  },
  $apis.requireAuth(),
)
