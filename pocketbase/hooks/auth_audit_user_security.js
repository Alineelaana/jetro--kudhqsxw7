onRecordUpdateRequest((e) => {
  var authUser = e.auth
  if (!authUser) {
    return e.forbiddenError('Autenticação necessária para alterar registros de usuários.')
  }

  // 1. Obter estado ORIGINAL e CONFIÁVEL do solicitante diretamente do banco
  var isSup = false
  try {
    var realCaller = $app.findRecordById('users', authUser.id)
    isSup =
      realCaller && realCaller.getString('role') === 'SUP' && realCaller.getBool('active') !== false
  } catch (_) {
    isSup = false
  }

  var isSelf = authUser.id === e.record.id

  // Se não for SUP nem o próprio usuário, rejeita sumariamente
  if (!isSup && !isSelf) {
    return e.forbiddenError('Você não tem permissão para alterar os dados de outros usuários.')
  }

  var original = e.record.original()
  if (!original) {
    return e.badRequestError('Registro original não localizado para validação.')
  }

  // 2. CAMPOS SENSÍVEIS E DE ACESSO
  // Campos que NUNCA podem ser alterados por usuários comuns
  var ACCESS_CONTROL_FIELDS = [
    'role',
    'perfil_acesso',
    'perfil_id',
    'empresa_id',
    'filial_id',
    'empresas_ids',
    'active',
    'codigo',
    'force_password_change',
    'must_change_password',
  ]

  // Campos de MFA tratados EXCLUSIVAMENTE pelos fluxos próprios (/mfa/setup, /mfa/verify, /mfa/disable)
  var MFA_FIELDS = ['mfa_secret', 'mfa_enabled', 'mfa_verified_at']

  // 3. Validação para usuário comum (não SUP)
  if (!isSup) {
    // Bloqueia qualquer alteração em campos de controle de acesso
    for (var i = 0; i < ACCESS_CONTROL_FIELDS.length; i++) {
      var f = ACCESS_CONTROL_FIELDS[i]
      var oldVal = original.get(f)
      var newVal = e.record.get(f)
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        return e.forbiddenError(
          'Elevação de privilégio negada: você não tem permissão para alterar o campo sensível "' +
            f +
            '".',
        )
      }
    }

    // Bloqueia alterações manuais em campos de MFA via API de records
    for (var m = 0; m < MFA_FIELDS.length; m++) {
      var mf = MFA_FIELDS[m]
      var oldMfa = original.get(mf)
      var newMfa = e.record.get(mf)
      if (JSON.stringify(oldMfa) !== JSON.stringify(newMfa)) {
        return e.badRequestError(
          'Campos de MFA são gerenciados exclusivamente pelo fluxo de autenticação em duas etapas.',
        )
      }
    }
  }

  // 4. Se for SUP tentando alterar mfa_secret diretamente via API pública
  // MFA deve ser alterado apenas pelos endpoints dedicados
  if (isSup) {
    var oldSec = original.getString('mfa_secret')
    var newSec = e.record.getString('mfa_secret')
    if (oldSec !== newSec && newSec !== '') {
      var reqUrl = ''
      try {
        reqUrl = (e.request && e.request.url && e.request.url.path) || ''
      } catch (_) {}
      if (reqUrl.indexOf('/mfa/') === -1) {
        return e.badRequestError('O segredo MFA não pode ser manipulado diretamente por esta rota.')
      }
    }
  }

  // 5. Auditoria de alterações sensíveis
  var AUDIT_TRACKED_FIELDS = [
    'role',
    'perfil_acesso',
    'perfil_id',
    'empresa_id',
    'filial_id',
    'empresas_ids',
    'active',
    'mfa_enabled',
    'codigo',
    'inactivity_timeout_minutes',
  ]

  var changes = []
  for (var k = 0; k < AUDIT_TRACKED_FIELDS.length; k++) {
    var trackField = AUDIT_TRACKED_FIELDS[k]
    var oVal = original.get(trackField)
    var nVal = e.record.get(trackField)
    if (JSON.stringify(oVal) !== JSON.stringify(nVal)) {
      changes.push({
        field: trackField,
        old_value: oVal,
        new_value: nVal,
      })
    }
  }

  if (changes.length > 0) {
    e.set('audit_security_changes', JSON.stringify(changes))
    e.set('audit_auth_user_id', authUser.id)
    e.set('audit_auth_user_name', authUser.getString('name') || authUser.email || '')
    e.set('audit_auth_user_role', isSup ? 'SUP' : authUser.getString('role') || 'PADRAO')
    e.set('audit_target_id', e.record.id)
    e.set('audit_target_name', e.record.getString('name') || e.record.getString('email') || '')
  }

  e.next()

  var changesJson = ''
  try {
    changesJson = e.get('audit_security_changes')
  } catch (_) {}
  if (!changesJson) return

  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', e.get('audit_auth_user_id') || '')
    log.set('user_name', e.get('audit_auth_user_name') || '')
    log.set('user_role', e.get('audit_auth_user_role') || '')
    log.set('action', 'security_update')
    log.set('module', 'auth')
    log.set('target_collection', 'users')
    log.set('target_id', e.get('audit_target_id') || '')
    log.set('target_summary', e.get('audit_target_name') || '')
    log.set('new_value', JSON.parse(changesJson))
    log.set('origem', 'Área da Empresa')
    log.set('criticidade', 'Alta')
    log.set('is_suspicious', false)
    log.set('archived', false)
    $app.save(log)
  } catch (err) {
    $app.logger().error('security audit log failed', 'error', String(err))
  }
}, 'users')
