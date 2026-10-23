routerAdd(
  'GET',
  '/backend/v1/mfa/status',
  (e) => {
    var authUser = e.auth
    if (!authUser) return e.unauthorizedError('auth required')

    var record = $app.findRecordById('users', authUser.id)
    var mfaEnabled = record.getBool('mfa_enabled') === true
    var mfaVerifiedAt = record.getString('mfa_verified_at') || null

    // NUNCA expor mfa_secret nesta resposta
    return e.json(200, {
      enabled: mfaEnabled,
      has_secret: !!record.getString('mfa_secret'),
      verified_at: mfaVerifiedAt,
    })
  },
  $apis.requireAuth(),
)
