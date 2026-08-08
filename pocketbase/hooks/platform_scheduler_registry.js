onServe((e) => {
  e.next()

  var REGISTRY = [
    { name: 'audit_auto_archive', type: 'cron', schedule: '0 * * * *', module: 'audit' },
    { name: 'audit_scheduled_report', type: 'cron', schedule: '0 6 * * *', module: 'audit' },
    { name: 'audit_alerts_detect', type: 'cron', schedule: '*/5 * * * *', module: 'audit' },
    { name: 'audit_auto_archive_cron', type: 'cron', schedule: '0 * * * *', module: 'audit' },
    { name: 'backup_auto_check', type: 'cron', schedule: '0 2 * * *', module: 'backup' },
    { name: 'wms_alerts_detect', type: 'cron', schedule: '*/10 * * * *', module: 'wms' },
    { name: 'wms_replenishment_auto', type: 'cron', schedule: '*/15 * * * *', module: 'wms' },
    { name: 'atendimento_sla_check', type: 'cron', schedule: '*/5 * * * *', module: 'atendimento' },
    { name: 'price_table_approval_scan', type: 'cron', schedule: '0 8 * * *', module: 'pricing' },
    { name: 'price_table_expiry_alert', type: 'cron', schedule: '0 7 * * *', module: 'pricing' },
    { name: 'vitrine_auto_status', type: 'cron', schedule: '0 * * * *', module: 'cms' },
    {
      name: 'industrial_intelligence_cron',
      type: 'cron',
      schedule: '*/30 * * * *',
      module: 'industry',
    },
    { name: 'promotion_evaluate', type: 'cron', schedule: '0 */6 * * *', module: 'promotions' },
    { name: 'validity_alerts_detect', type: 'cron', schedule: '0 6 * * *', module: 'validity' },
  ]

  try {
    var monCol = $app.findCollectionByNameOrId('platform_monitoring')
    for (var i = 0; i < REGISTRY.length; i++) {
      var entry = REGISTRY[i]
      try {
        var existing = $app.findFirstRecordByFilter(
          'platform_monitoring',
          'service_name = "' + entry.name + '" && service_type = "' + entry.type + '"',
        )
        existing.set('details', { schedule: entry.schedule, module: entry.module })
        existing.set('next_run_at', entry.schedule)
        $app.save(existing)
      } catch (_) {
        var rec = new Record(monCol)
        rec.set('service_name', entry.name)
        rec.set('service_type', entry.type)
        rec.set('status', 'unknown')
        rec.set('details', { schedule: entry.schedule, module: entry.module })
        rec.set('error_count', 0)
        rec.set('success_count', 0)
        rec.set('avg_duration_ms', 0)
        $app.save(rec)
      }
    }
    $app.logger().info('platform scheduler registry initialized', 'entries', REGISTRY.length)
  } catch (err) {
    $app.logger().error('platform scheduler registry failed', 'error', String(err))
  }
})
