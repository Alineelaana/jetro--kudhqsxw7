/// <reference path="../pb_data/types.d.ts" />

/**
 * Rota POST /backend/v1/audit/auth
 * Manipula eventos de autenticação: login, login_failed, logout, session_activity
 * Registra tanto na coleção legado audit_logs e audit_sessions quanto na nova auth_events e avalia audit_alerts.
 * NOTA DE ESCOPO: Todas as funções auxiliares estão inline dentro do callback do routerAdd.
 */
routerAdd('POST', '/backend/v1/audit/auth', (e) => {
  // Funções inline para compatibilidade com o pool JSVM do PocketBase
  function extractTrustedIp(reqEvent) {
    var ip = ''
    try {
      if (reqEvent.request && reqEvent.request.remoteAddr) {
        ip = reqEvent.request.remoteAddr
      }
    } catch (_) {}

    if (ip) {
      if (ip.startsWith('[') && ip.indexOf(']') > 0) {
        ip = ip.substring(1, ip.indexOf(']'))
      } else if (ip.indexOf(':') > -1 && ip.indexOf('.') > -1) {
        ip = ip.split(':')[0]
      }
    }

    try {
      var headers = reqEvent.requestInfo().headers || {}
      var cfIp = headers['cf_connecting_ip'] || headers['cf-connecting-ip']
      if (cfIp && typeof cfIp === 'string' && cfIp.trim().length > 0) {
        ip = cfIp.trim()
      }
    } catch (_) {}

    return ip || '127.0.0.1'
  }

  function detectIpVersion(ip) {
    if (!ip) return 'IPv4'
    if (ip.indexOf(':') > -1) return 'IPv6'
    return 'IPv4'
  }

  function parseUserAgent(ua) {
    var browser = 'Desconhecido'
    var osName = 'Desconhecido'
    var device = 'Desktop'

    if (!ua) return { browser: browser, os: osName, device: device }

    if (ua.indexOf('Edg/') > -1) browser = 'Microsoft Edge'
    else if (ua.indexOf('Chrome') > -1) browser = 'Google Chrome'
    else if (ua.indexOf('Firefox') > -1) browser = 'Mozilla Firefox'
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari'
    else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera'

    if (ua.indexOf('Windows') > -1) osName = 'Windows'
    else if (ua.indexOf('Mac OS') > -1) osName = 'macOS'
    else if (ua.indexOf('Android') > -1) osName = 'Android'
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) osName = 'iOS'
    else if (ua.indexOf('Linux') > -1) osName = 'Linux'

    if (
      ua.indexOf('Mobile') > -1 ||
      ua.indexOf('iPhone') > -1 ||
      (ua.indexOf('Android') > -1 && ua.indexOf('Mobile') > -1)
    ) {
      device = 'Mobile'
    } else if (ua.indexOf('iPad') > -1 || ua.indexOf('Tablet') > -1) {
      device = 'Tablet'
    }

    return { browser: browser, os: osName, device: device }
  }

  function lookupIpLocation(ip) {
    if (
      !ip ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('172.16.')
    ) {
      return {
        origin: 'nao_disponivel',
        city: '',
        state: '',
        country: '',
        isp: '',
        lat: null,
        lon: null,
      }
    }

    try {
      var cleanIp = ip.trim()
      var res = $http.send({
        url:
          'http://ip-api.com/json/' +
          cleanIp +
          '?fields=status,message,country,regionName,city,lat,lon,isp',
        method: 'GET',
        timeout: 3,
      })

      if (res.statusCode === 200 && res.json && res.json.status === 'success') {
        var data = res.json
        return {
          origin: 'ip',
          city: data.city || '',
          state: data.regionName || '',
          country: data.country || 'Brasil',
          isp: data.isp || '',
          lat: typeof data.lat === 'number' ? data.lat : null,
          lon: typeof data.lon === 'number' ? data.lon : null,
        }
      }
    } catch (err) {
      $app.logger().warn('IP geolocation lookup skipped or failed', 'error', String(err))
    }

    return {
      origin: 'nao_disponivel',
      city: '',
      state: '',
      country: '',
      isp: '',
      lat: null,
      lon: null,
    }
  }

  var body = e.requestInfo().body || {}
  var action = body.action || ''
  if (
    action !== 'login' &&
    action !== 'logout' &&
    action !== 'login_failed' &&
    action !== 'session_activity' &&
    action !== 'session_terminate'
  ) {
    return e.badRequestError('invalid action')
  }

  var identity = body.identity || ''
  var authUser = e.auth
  var ip = extractTrustedIp(e)
  var ipVer = detectIpVersion(ip)

  var ua = ''
  try {
    ua =
      (e.requestInfo().headers || {})['user_agent'] ||
      (e.requestInfo().headers || {})['user-agent'] ||
      ''
  } catch (_) {}

  var parsedUa = parseUserAgent(ua)
  var browser = parsedUa.browser
  var osName = parsedUa.os
  var device = parsedUa.device

  // Localização precisa fornecida pelo cliente (apenas com autorização expressa no momento do login)
  var clientLat = typeof body.latitude === 'number' ? body.latitude : null
  var clientLon = typeof body.longitude === 'number' ? body.longitude : null
  var clientAccuracy = typeof body.accuracy === 'number' ? body.accuracy : null
  var clientCity = body.city || ''
  var clientState = body.state || ''
  var clientCountry = body.country || ''

  var locationOrigin = 'nao_disponivel'
  var finalLat = null
  var finalLon = null
  var finalAccuracy = null
  var finalCity = ''
  var finalState = ''
  var finalCountry = ''
  var finalIsp = ''

  if (clientLat !== null && clientLon !== null) {
    locationOrigin = 'geolocalizacao_autorizada'
    finalLat = clientLat
    finalLon = clientLon
    finalAccuracy = clientAccuracy
    finalCity = clientCity
    finalState = clientState
    finalCountry = clientCountry || 'Brasil'
  } else if (action === 'login') {
    var ipGeo = lookupIpLocation(ip)
    if (ipGeo.origin === 'ip') {
      locationOrigin = 'ip'
      finalCity = ipGeo.city
      finalState = ipGeo.state
      finalCountry = ipGeo.country
      finalIsp = ipGeo.isp
      finalLat = ipGeo.lat
      finalLon = ipGeo.lon
    }
  }

  // Identificação da sessão
  var session_id = body.session_id || ''
  if (!session_id && authUser) {
    try {
      var authHeader = (e.requestInfo().headers || {})['authorization'] || ''
      var token = authHeader.replace(/^Bearer\s+/i, '')
      if (token) {
        session_id = $security.sha256(token).substring(0, 16)
      }
    } catch (_) {}
  }
  if (!session_id && action === 'login') {
    session_id = $security.randomString(16)
  }

  var nowIso = new Date().toISOString()
  var nowFormatted = nowIso.replace('T', ' ').substring(0, 19)

  // 1. Manutenção de audit_sessions
  if (action === 'login' && session_id) {
    try {
      var sessCol = $app.findCollectionByNameOrId('audit_sessions')
      var existing = null
      try {
        existing = $app.findFirstRecordByData('audit_sessions', 'session_id', session_id)
      } catch (_) {}

      var targetUserId = authUser ? authUser.id : ''
      var targetUserName = authUser
        ? authUser.getString('name') || authUser.email || identity
        : identity

      if (!existing) {
        var sess = new Record(sessCol)
        sess.set('session_id', session_id)
        sess.set('user_id', targetUserId)
        sess.set('user_name', targetUserName)
        sess.set('login_time', nowFormatted)
        sess.set('ip_address', ip)
        sess.set('browser', browser)
        sess.set('os', osName)
        sess.set('device', device)
        sess.set('origin', 'Área da Empresa')
        sess.set('status', 'active')
        sess.set('last_activity', nowFormatted)
        sess.set('is_invalidated', false)
        sess.set('location_origin', locationOrigin)
        sess.set('city', finalCity)
        sess.set('state', finalState)
        sess.set('country', finalCountry)
        $app.save(sess)
      } else {
        existing.set('last_activity', nowFormatted)
        existing.set('status', 'active')
        existing.set('is_invalidated', false)
        $app.save(existing)
      }
    } catch (err) {
      $app.logger().error('audit_sessions save error', 'error', String(err))
    }
  } else if ((action === 'logout' || action === 'session_terminate') && session_id) {
    try {
      var sessRec = $app.findFirstRecordByData('audit_sessions', 'session_id', session_id)
      if (sessRec) {
        sessRec.set('logout_time', nowFormatted)
        sessRec.set('status', 'closed')
        sessRec.set('is_invalidated', true)
        sessRec.set('ended_by', authUser ? authUser.id : 'user')
        sessRec.set(
          'terminated_reason',
          body.reason || (action === 'logout' ? 'logout_voluntario' : 'encerramento_manual'),
        )
        $app.save(sessRec)
      }
    } catch (_) {}
  } else if (action === 'session_activity' && session_id) {
    try {
      var actSess = $app.findFirstRecordByData('audit_sessions', 'session_id', session_id)
      if (actSess) {
        if (actSess.getBool('is_invalidated') || actSess.getString('status') === 'closed') {
          return e.json(200, { ok: false, invalidated: true, session_id: session_id })
        }
        actSess.set('last_activity', nowFormatted)
        $app.save(actSess)
      }
    } catch (_) {}
  }

  // 2. Gravar em auth_events (Nova coleção estruturada, imutável, completa)
  var authEventId = ''
  try {
    var authEventsCol = $app.findCollectionByNameOrId('auth_events')
    var ev = new Record(authEventsCol)
    var resolvedUserId = authUser ? authUser.id : ''
    var resolvedUserName = authUser
      ? authUser.getString('name') || authUser.email || identity
      : identity
    var resolvedUserEmail = authUser ? authUser.email : identity.indexOf('@') > -1 ? identity : ''
    var resolvedUserRole = authUser ? authUser.getString('role') : ''

    var eventType = 'login'
    var result = 'sucesso'
    var failureReason = ''

    if (action === 'login_failed') {
      eventType = 'login_failed'
      result = 'falha'
      failureReason = body.failure_reason || 'Credenciais inválidas'
    } else if (action === 'logout') {
      eventType = 'logout'
    } else if (action === 'session_terminate') {
      eventType = 'session_terminated'
      failureReason = body.reason || 'Encerrada remotamente pelo administrador'
    } else if (action === 'session_activity') {
      eventType = 'session_activity'
    }

    ev.set('user_id', resolvedUserId)
    ev.set('user_name', resolvedUserName)
    ev.set('user_email', resolvedUserEmail)
    ev.set('user_role', resolvedUserRole)
    ev.set('event_type', eventType)
    ev.set('result', result)
    ev.set('failure_reason', failureReason)
    ev.set('session_id', session_id)
    ev.set('auth_method', body.auth_method || 'senha')
    ev.set('ip_address', ip)
    ev.set('ip_version', ipVer)
    ev.set('device_type', device)
    ev.set('os_name', osName)
    ev.set('browser_name', browser)
    ev.set('user_agent', ua)
    ev.set('location_origin', locationOrigin)
    if (finalLat !== null) ev.set('latitude', finalLat)
    if (finalLon !== null) ev.set('longitude', finalLon)
    if (finalAccuracy !== null) ev.set('accuracy_meters', finalAccuracy)
    ev.set('city', finalCity)
    ev.set('state', finalState)
    ev.set('country', finalCountry)
    ev.set('isp_network', finalIsp)
    if (action === 'logout' || action === 'session_terminate') {
      ev.set('session_ended_at', nowFormatted)
    }

    $app.save(ev)
    authEventId = ev.id
  } catch (err) {
    $app.logger().error('auth_events save failed', 'error', String(err))
  }

  // 3. Manter audit_logs legado sincronizado para retrocompatibilidade
  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser ? authUser.id : '')
    log.set(
      'user_name',
      authUser ? authUser.getString('name') || authUser.email || identity : identity,
    )
    log.set('user_role', authUser ? authUser.getString('role') : '')
    log.set('action', action)
    log.set('module', 'auth')
    log.set('target_collection', 'users')
    log.set('target_id', authUser ? authUser.id : '')
    log.set(
      'target_summary',
      action === 'login_failed'
        ? 'Tentativa de login falhou: ' + identity
        : authUser
          ? authUser.getString('name') || authUser.email || identity
          : identity,
    )
    log.set('ip_address', ip)
    log.set('user_agent', ua)
    log.set('session_id', session_id)
    log.set('browser', browser)
    log.set('os', osName)
    log.set('device', device)
    log.set('origem', 'Área da Empresa')
    log.set('criticidade', action === 'login_failed' ? 'Média' : 'Baixa')
    log.set('is_suspicious', false)
    log.set('archived', false)
    $app.save(log)
  } catch (err) {
    $app.logger().error('audit_logs legacy save failed', 'error', String(err))
  }

  // 4. Detecção cautelosa de alertas de segurança
  if (action === 'login' && authUser) {
    try {
      var userId = authUser.id
      var alertCol = $app.findCollectionByNameOrId('audit_alerts')

      // A) Novo dispositivo ou novo SO para este usuário
      var pastDeviceLogins = $app.findRecordsByFilter(
        'auth_events',
        'user_id = "' +
          userId +
          '" && event_type = "login" && id != "' +
          authEventId +
          '" && device_type = "' +
          device +
          '" && os_name = "' +
          osName +
          '"',
        '-created',
        1,
        0,
      )
      if (pastDeviceLogins.length === 0) {
        var alt1 = new Record(alertCol)
        alt1.set('alert_type', 'new_device_login')
        alt1.set('severity', 'info')
        alt1.set(
          'description',
          'Acesso identificado a partir de um novo dispositivo/SO: ' +
            device +
            ' (' +
            osName +
            ' / ' +
            browser +
            ')',
        )
        alt1.set('session_id', session_id)
        alt1.set('user_id', userId)
        alt1.set('resolved', false)
        $app.save(alt1)
      }

      // B) Novo país
      if (finalCountry) {
        var pastCountryLogins = $app.findRecordsByFilter(
          'auth_events',
          'user_id = "' +
            userId +
            '" && event_type = "login" && id != "' +
            authEventId +
            '" && country = "' +
            finalCountry +
            '"',
          '-created',
          1,
          0,
        )
        if (pastCountryLogins.length === 0) {
          var alt2 = new Record(alertCol)
          alt2.set('alert_type', 'new_country_login')
          alt2.set('severity', 'warning')
          alt2.set(
            'description',
            'Acesso identificado a partir de um novo país de origem: ' +
              finalCountry +
              ' (considerar possível VPN ou rota de rede)',
          )
          alt2.set('session_id', session_id)
          alt2.set('user_id', userId)
          alt2.set('resolved', false)
          $app.save(alt2)
        }
      }

      // C) Múltiplas sessões simultâneas ativas
      var activeSessions = $app.findRecordsByFilter(
        'audit_sessions',
        'user_id = "' + userId + '" && status = "active" && is_invalidated = false',
        '-created',
        10,
        0,
      )
      if (activeSessions.length >= 3) {
        var alt3 = new Record(alertCol)
        alt3.set('alert_type', 'multiple_concurrent_sessions')
        alt3.set('severity', 'warning')
        alt3.set(
          'description',
          'Detectadas ' +
            activeSessions.length +
            ' sessões ativas simultâneas para o mesmo usuário',
        )
        alt3.set('session_id', session_id)
        alt3.set('user_id', userId)
        alt3.set('resolved', false)
        $app.save(alt3)
      }
    } catch (alertErr) {
      $app.logger().warn('Cautious alert detection skipped or failed', 'error', String(alertErr))
    }
  }

  return e.json(200, {
    ok: true,
    session_id: session_id,
    auth_event_id: authEventId,
    location_origin: locationOrigin,
    city: finalCity,
    state: finalState,
    country: finalCountry,
  })
})
