onRecordCreate((e) => {
  var action = e.record.getString('action')
  var module = e.record.getString('module')

  if (!e.record.getString('criticidade')) {
    var crit = 'Baixa'
    if (
      action === 'permission_change' ||
      action === 'settings_change' ||
      action === 'delete' ||
      action === 'deactivate'
    ) {
      crit = 'Crítica'
    } else if (
      action === 'create' ||
      action === 'update' ||
      action === 'activate' ||
      action === 'upload'
    ) {
      if (module === 'pricing' || module === 'stock') {
        crit = 'Alta'
      } else if (module === 'users' || module === 'settings') {
        crit = 'Crítica'
      } else {
        crit = 'Média'
      }
    }
    e.record.set('criticidade', crit)
  }

  if (!e.record.getString('origem')) {
    e.record.set('origem', 'Área da Empresa')
  }

  var ua = e.record.getString('user_agent')
  if (ua && !e.record.getString('browser')) {
    var browser = 'Desconhecido'
    var osName = 'Desconhecido'
    var device = 'Desktop'
    if (ua.indexOf('Edg/') > -1) browser = 'Microsoft Edge'
    else if (ua.indexOf('Chrome') > -1) browser = 'Google Chrome'
    else if (ua.indexOf('Firefox') > -1) browser = 'Mozilla Firefox'
    else if (ua.indexOf('Safari') > -1) browser = 'Safari'
    if (ua.indexOf('Windows') > -1) osName = 'Windows'
    else if (ua.indexOf('Mac OS') > -1) osName = 'macOS'
    else if (ua.indexOf('Android') > -1) osName = 'Android'
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) osName = 'iOS'
    else if (ua.indexOf('Linux') > -1) osName = 'Linux'
    if (ua.indexOf('Mobile') > -1 || ua.indexOf('iPhone') > -1) device = 'Mobile'
    else if (ua.indexOf('iPad') > -1) device = 'Tablet'
    e.record.set('browser', browser)
    e.record.set('os', osName)
    e.record.set('device', device)
  }

  if (!e.record.get('is_suspicious')) e.record.set('is_suspicious', false)
  if (!e.record.get('archived')) e.record.set('archived', false)

  e.next()
}, 'audit_logs')
