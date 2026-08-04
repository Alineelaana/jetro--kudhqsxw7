migrate(
  (app) => {
    var settingsCol = app.findCollectionByNameOrId('settings')
    var seeds = [
      { key: 'pricing_approval_small_threshold', value: '5' },
      { key: 'pricing_approval_medium_threshold', value: '15' },
      { key: 'pricing_approval_critical_threshold', value: '30' },
      { key: 'pricing_approval_small_role', value: 'SDR' },
      { key: 'pricing_approval_medium_role', value: 'COMERCIAL' },
      { key: 'pricing_approval_critical_role', value: 'SUP' },
      { key: 'pricing_allowed_hours_start', value: '07' },
      { key: 'pricing_allowed_hours_end', value: '20' },
      { key: 'pricing_max_changes_per_user_per_hour', value: '20' },
    ]
    for (var i = 0; i < seeds.length; i++) {
      try {
        app.findFirstRecordByData('settings', 'key', seeds[i].key)
      } catch (_) {
        var rec = new Record(settingsCol)
        rec.set('key', seeds[i].key)
        rec.set('value', seeds[i].value)
        app.save(rec)
      }
    }
  },
  (app) => {
    var keys = [
      'pricing_approval_small_threshold',
      'pricing_approval_medium_threshold',
      'pricing_approval_critical_threshold',
      'pricing_approval_small_role',
      'pricing_approval_medium_role',
      'pricing_approval_critical_role',
      'pricing_allowed_hours_start',
      'pricing_allowed_hours_end',
      'pricing_max_changes_per_user_per_hour',
    ]
    for (var i = 0; i < keys.length; i++) {
      try {
        var rec = app.findFirstRecordByData('settings', 'key', keys[i])
        app.delete(rec)
      } catch (_) {}
    }
  },
)
