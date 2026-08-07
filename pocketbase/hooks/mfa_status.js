routerAdd(
  'GET',
  '/backend/v1/mfa/status',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var record = $app.findRecordById('users', authUser.id)
    var enabled = record.getBool('mfa_enabled')
    var hasSecret = !!record.getString('mfa_secret')
    var verifiedAt = record.getString('mfa_verified_at')

    var mfaRequiredForAdmins = false
    try {
      var cfg = $app.findFirstRecordByData('security_config', 'key', 'mfa_required_for_admins')
      mfaRequiredForAdmins = cfg.getString('value') === 'true'
    } catch (_) {}

    var role = record.getString('role') || ''
    var isAdmin = role === 'SUP'

    return e.json(200, {
      enabled: enabled,
      has_secret: hasSecret,
      verified_at: verifiedAt,
      mfa_required_for_admins: mfaRequiredForAdmins,
      is_admin: isAdmin,
      mfa_active: enabled && hasSecret,
    })
  },
  $apis.requireAuth(),
)
