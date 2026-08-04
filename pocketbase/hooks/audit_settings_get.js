routerAdd(
  'GET',
  '/backend/v1/audit/settings',
  (e) => {
    if (!e.auth || e.auth.getString('role') !== 'SUP') {
      return e.forbiddenError('Apenas SUP pode acessar configuracoes de auditoria')
    }

    var defaults = {
      allowed_hours_start: '06:00',
      allowed_hours_end: '22:00',
      max_failed_logins: 5,
      max_failed_logins_window_min: 5,
      max_logins_per_hour: 3,
      max_changes_per_15min: 20,
      max_exports_per_hour: 10,
      max_imports_per_hour: 10,
      price_change_threshold_pct: 20,
      margin_change_threshold_pct: 15,
      cost_change_threshold_pct: 15,
      tax_change_threshold_pct: 10,
      multi_device_login_alert: true,
      email_notifications_enabled: false,
      notification_email: '',
      auto_archive_enabled: false,
      auto_archive_days: 90,
      scheduled_report_enabled: false,
      scheduled_report_frequency: 'weekly',
      scheduled_report_email: '',
      scheduled_report_format: 'pdf',
    }

    try {
      var rec = $app.findFirstRecordByData('settings', 'key', 'audit_alert_config')
      var saved = JSON.parse(rec.getString('value'))
      for (var k in saved) {
        defaults[k] = saved[k]
      }
    } catch (_) {}

    return e.json(200, defaults)
  },
  $apis.requireAuth(),
)
