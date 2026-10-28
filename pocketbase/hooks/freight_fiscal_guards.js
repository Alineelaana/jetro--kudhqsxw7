// pocketbase/hooks/freight_fiscal_guards.js
// Guards e endpoints para o módulo CT-e (mod 57) e MDF-e (mod 58) do ERP HURAM

// ---------------------------------------------------------------------------
// 1. GUARDS CT-E (cte_documents)
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  function calcDvMod11(chave43) {
    if (!chave43 || chave43.length !== 43) return -1
    var peso = 2
    var soma = 0
    for (var i = chave43.length - 1; i >= 0; i--) {
      var n = parseInt(chave43.charAt(i), 10)
      if (isNaN(n)) return -1
      soma += n * peso
      peso++
      if (peso > 9) peso = 2
    }
    var resto = soma % 11
    var dv = 11 - resto
    if (dv >= 10) return 0
    return dv
  }

  function validaChave(chave) {
    if (!chave) return false
    var limpa = String(chave).replace(/\D/g, '')
    if (limpa.length !== 44) return false
    var base43 = limpa.substring(0, 43)
    var dvEsperado = calcDvMod11(base43)
    var dvReal = parseInt(limpa.charAt(43), 10)
    return dvEsperado === dvReal
  }

  var chave = e.record.getString('chave_acesso') || ''
  if (chave && !validaChave(chave)) {
    return e.badRequestError(
      'Chave de acesso de 44 dígitos do CT-e possui formato ou dígito verificador inválido (Módulo 11).',
    )
  }

  var status = e.record.getString('status') || 'rascunho'
  var tipo = e.record.getString('tipo_cte') || 'normal'

  if (
    status === 'autorizado_homologacao' ||
    status === 'autorizado_producao' ||
    status === 'validado'
  ) {
    if (tipo === 'normal') {
      var tomador = e.record.getString('tomador_id') || e.record.getString('tomador_nome') || ''
      var remetente =
        e.record.getString('remetente_id') || e.record.getString('remetente_nome') || ''
      var dest =
        e.record.getString('destinatario_id') || e.record.getString('destinatario_nome') || ''
      if (!tomador || !remetente || !dest) {
        return e.badRequestError('CT-e exige identificação de tomador, remetente e destinatário.')
      }

      var componentes = e.record.get('componentes_prestacao')
      if (!componentes || (Array.isArray(componentes) && componentes.length === 0)) {
        return e.badRequestError('CT-e exige ao menos um componente da prestação de serviço.')
      }

      var docs = e.record.get('documentos_vinculados')
      if (!docs || (Array.isArray(docs) && docs.length === 0)) {
        return e.badRequestError(
          'CT-e exige ao menos um documento fiscal transportado vinculado (NF-e).',
        )
      }
    }
  }

  e.next()

  try {
    var authUser = e.auth
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    if (authUser) {
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', authUser.getString('role') || 'USER')
    } else {
      log.set('user_name', 'Sistema / Hook')
    }
    log.set('action', 'cte_created')
    log.set('module', 'fiscal_frete')
    log.set('target_collection', 'cte_documents')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'CT-e nº ' + e.record.getString('numero') + ' criado com status ' + status,
    )
    log.set('new_value', e.record)
    log.set('criticidade', 'Alta')
    log.set('origem', 'Área da Empresa')
    $app.save(log)
  } catch (_) {}
}, 'cte_documents')

onRecordUpdateRequest((e) => {
  function calcDvMod11(chave43) {
    if (!chave43 || chave43.length !== 43) return -1
    var peso = 2
    var soma = 0
    for (var i = chave43.length - 1; i >= 0; i--) {
      var n = parseInt(chave43.charAt(i), 10)
      if (isNaN(n)) return -1
      soma += n * peso
      peso++
      if (peso > 9) peso = 2
    }
    var resto = soma % 11
    var dv = 11 - resto
    if (dv >= 10) return 0
    return dv
  }

  function validaChave(chave) {
    if (!chave) return false
    var limpa = String(chave).replace(/\D/g, '')
    if (limpa.length !== 44) return false
    var base43 = limpa.substring(0, 43)
    var dvEsperado = calcDvMod11(base43)
    var dvReal = parseInt(limpa.charAt(43), 10)
    return dvEsperado === dvReal
  }

  var original = e.record.original()
  var prevStatus = original ? original.getString('status') || '' : ''
  var nextStatus = e.record.getString('status') || ''

  // Imutabilidade pós-autorização: CT-e já autorizado só pode sofrer cancelamento ou inutilização
  if (prevStatus === 'autorizado_homologacao' || prevStatus === 'autorizado_producao') {
    if (nextStatus !== 'cancelado' && nextStatus !== 'inutilizado' && nextStatus !== prevStatus) {
      return e.badRequestError(
        'CT-e já autorizado é imutável. Apenas o evento de cancelamento homologado é permitido.',
      )
    }
  }

  // Cancelado ou inutilizado não pode ser alterado de forma alguma
  if (prevStatus === 'cancelado' || prevStatus === 'inutilizado') {
    return e.badRequestError('CT-e ' + prevStatus + ' não permite nenhuma alteração posterior.')
  }

  // Se estiver cancelando, motivo é obrigatório com no mínimo 15 caracteres
  if (nextStatus === 'cancelado' && prevStatus !== 'cancelado') {
    var motivo = e.record.getString('motivo_cancelamento') || ''
    if (motivo.trim().length < 15) {
      return e.badRequestError(
        'Cancelamento de CT-e exige motivo detalhado com no mínimo 15 caracteres.',
      )
    }
  }

  // Validação de chave de acesso se informada/alterada
  var chave = e.record.getString('chave_acesso') || ''
  if (chave && !validaChave(chave)) {
    return e.badRequestError(
      'Chave de acesso de 44 dígitos do CT-e possui formato ou dígito verificador inválido.',
    )
  }

  // Se transitando para validado ou autorizado, checar requisitos
  var tipo = e.record.getString('tipo_cte') || 'normal'
  if (
    nextStatus === 'autorizado_homologacao' ||
    nextStatus === 'autorizado_producao' ||
    nextStatus === 'validado'
  ) {
    if (tipo === 'normal') {
      var tomador = e.record.getString('tomador_id') || e.record.getString('tomador_nome') || ''
      var remetente =
        e.record.getString('remetente_id') || e.record.getString('remetente_nome') || ''
      var dest =
        e.record.getString('destinatario_id') || e.record.getString('destinatario_nome') || ''
      if (!tomador || !remetente || !dest) {
        return e.badRequestError('CT-e exige identificação de tomador, remetente e destinatário.')
      }

      var componentes = e.record.get('componentes_prestacao')
      if (!componentes || (Array.isArray(componentes) && componentes.length === 0)) {
        return e.badRequestError('CT-e exige ao menos um componente da prestação cadastrado.')
      }

      var docs = e.record.get('documentos_vinculados')
      if (!docs || (Array.isArray(docs) && docs.length === 0)) {
        return e.badRequestError('CT-e exige ao menos um documento fiscal vinculado (NF-e).')
      }
    }
  }

  e.next()

  try {
    var authUser = e.auth
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    if (authUser) {
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', authUser.getString('role') || 'USER')
    } else {
      log.set('user_name', 'Sistema / Hook')
    }
    log.set('action', 'cte_updated')
    log.set('module', 'fiscal_frete')
    log.set('target_collection', 'cte_documents')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'CT-e nº ' +
        e.record.getString('numero') +
        ' atualizado de ' +
        prevStatus +
        ' para ' +
        nextStatus,
    )
    log.set('previous_value', original)
    log.set('new_value', e.record)
    log.set('criticidade', 'Alta')
    log.set('origem', 'Área da Empresa')
    $app.save(log)
  } catch (_) {}
}, 'cte_documents')

// ---------------------------------------------------------------------------
// 2. GUARDS MDF-E (mdfe_documents)
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  function calcDvMod11(chave43) {
    if (!chave43 || chave43.length !== 43) return -1
    var peso = 2
    var soma = 0
    for (var i = chave43.length - 1; i >= 0; i--) {
      var n = parseInt(chave43.charAt(i), 10)
      if (isNaN(n)) return -1
      soma += n * peso
      peso++
      if (peso > 9) peso = 2
    }
    var resto = soma % 11
    var dv = 11 - resto
    if (dv >= 10) return 0
    return dv
  }

  function validaChave(chave) {
    if (!chave) return false
    var limpa = String(chave).replace(/\D/g, '')
    if (limpa.length !== 44) return false
    var base43 = limpa.substring(0, 43)
    var dvEsperado = calcDvMod11(base43)
    var dvReal = parseInt(limpa.charAt(43), 10)
    return dvEsperado === dvReal
  }

  var chave = e.record.getString('chave_acesso') || ''
  if (chave && !validaChave(chave)) {
    return e.badRequestError(
      'Chave de acesso de 44 dígitos do MDF-e possui formato ou dígito verificador inválido (Módulo 11).',
    )
  }

  var status = e.record.getString('status') || 'rascunho'
  if (
    status === 'autorizado_homologacao' ||
    status === 'autorizado_producao' ||
    status === 'validado' ||
    status === 'em_transito'
  ) {
    var placa = e.record.getString('placa_veiculo') || ''
    var rntrc = e.record.getString('rntrc') || ''
    if (!placa || !rntrc) {
      return e.badRequestError('MDF-e exige placa do veículo e RNTRC do transportador.')
    }
    var condutores = e.record.get('condutores')
    if (!condutores || (Array.isArray(condutores) && condutores.length === 0)) {
      return e.badRequestError('MDF-e exige ao menos um condutor cadastrado (Nome e CPF).')
    }
    var ctes = e.record.get('cte_vinculados')
    if (!ctes || (Array.isArray(ctes) && ctes.length === 0)) {
      return e.badRequestError('MDF-e exige ao menos um CT-e vinculado para transporte.')
    }
  }

  e.next()

  try {
    var authUser = e.auth
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    if (authUser) {
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', authUser.getString('role') || 'USER')
    } else {
      log.set('user_name', 'Sistema / Hook')
    }
    log.set('action', 'mdfe_created')
    log.set('module', 'fiscal_frete')
    log.set('target_collection', 'mdfe_documents')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'MDF-e nº ' + e.record.getString('numero') + ' criado com status ' + status,
    )
    log.set('new_value', e.record)
    log.set('criticidade', 'Alta')
    log.set('origem', 'Área da Empresa')
    $app.save(log)
  } catch (_) {}
}, 'mdfe_documents')

onRecordUpdateRequest((e) => {
  function calcDvMod11(chave43) {
    if (!chave43 || chave43.length !== 43) return -1
    var peso = 2
    var soma = 0
    for (var i = chave43.length - 1; i >= 0; i--) {
      var n = parseInt(chave43.charAt(i), 10)
      if (isNaN(n)) return -1
      soma += n * peso
      peso++
      if (peso > 9) peso = 2
    }
    var resto = soma % 11
    var dv = 11 - resto
    if (dv >= 10) return 0
    return dv
  }

  function validaChave(chave) {
    if (!chave) return false
    var limpa = String(chave).replace(/\D/g, '')
    if (limpa.length !== 44) return false
    var base43 = limpa.substring(0, 43)
    var dvEsperado = calcDvMod11(base43)
    var dvReal = parseInt(limpa.charAt(43), 10)
    return dvEsperado === dvReal
  }

  var original = e.record.original()
  var prevStatus = original ? original.getString('status') || '' : ''
  var nextStatus = e.record.getString('status') || ''

  // MDF-e encerrado ou cancelado não aceita novas alterações
  if (prevStatus === 'encerrado') {
    return e.badRequestError(
      'MDF-e já ENCERRADO é estritamente imutável e não aceita novos CT-e ou modificações.',
    )
  }
  if (prevStatus === 'cancelado') {
    return e.badRequestError('MDF-e CANCELADO é estritamente imutável.')
  }

  // MDF-e só pode ser encerrado se estiver autorizado ou em trânsito
  if (nextStatus === 'encerrado') {
    if (
      prevStatus !== 'autorizado_homologacao' &&
      prevStatus !== 'autorizado_producao' &&
      prevStatus !== 'em_transito'
    ) {
      return e.badRequestError(
        'MDF-e só pode ser encerrado se estiver previamente autorizado pela SEFAZ ou em trânsito (status atual: ' +
          prevStatus +
          ').',
      )
    }
    var ufEnc = e.record.getString('uf_encerramento') || ''
    var munEnc = e.record.getString('municipio_encerramento') || ''
    if (!ufEnc || !munEnc) {
      return e.badRequestError(
        'Encerramento de MDF-e exige indicação da UF e Município de encerramento.',
      )
    }
  }

  // Cancelamento exige motivo com min 15 caracteres
  if (nextStatus === 'cancelado' && prevStatus !== 'cancelado') {
    var motivo = e.record.getString('motivo_cancelamento') || ''
    if (motivo.trim().length < 15) {
      return e.badRequestError(
        'Cancelamento de MDF-e exige motivo detalhado com no mínimo 15 caracteres.',
      )
    }
  }

  // MDF-e autorizado só pode transitar para em_transito, encerrado ou cancelado
  if (prevStatus === 'autorizado_homologacao' || prevStatus === 'autorizado_producao') {
    if (
      nextStatus !== 'em_transito' &&
      nextStatus !== 'encerrado' &&
      nextStatus !== 'cancelado' &&
      nextStatus !== prevStatus
    ) {
      return e.badRequestError(
        'MDF-e já autorizado é imutável em seus dados fiscais. Permitido apenas trânsito, encerramento ou cancelamento.',
      )
    }
  }

  // Validação de chave de acesso
  var chave = e.record.getString('chave_acesso') || ''
  if (chave && !validaChave(chave)) {
    return e.badRequestError(
      'Chave de acesso de 44 dígitos do MDF-e possui formato ou dígito verificador inválido.',
    )
  }

  // Requisitos operacionais para validação/autorização
  if (
    nextStatus === 'autorizado_homologacao' ||
    nextStatus === 'autorizado_producao' ||
    nextStatus === 'validado'
  ) {
    var placa = e.record.getString('placa_veiculo') || ''
    var rntrc = e.record.getString('rntrc') || ''
    if (!placa || !rntrc) {
      return e.badRequestError('MDF-e exige placa do veículo e RNTRC do transportador.')
    }
    var condutores = e.record.get('condutores')
    if (!condutores || (Array.isArray(condutores) && condutores.length === 0)) {
      return e.badRequestError('MDF-e exige ao menos um condutor cadastrado (Nome e CPF).')
    }
    var ctes = e.record.get('cte_vinculados')
    if (!ctes || (Array.isArray(ctes) && ctes.length === 0)) {
      return e.badRequestError('MDF-e exige ao menos um CT-e vinculado para transporte.')
    }
  }

  e.next()

  try {
    var authUser = e.auth
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    if (authUser) {
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('user_role', authUser.getString('role') || 'USER')
    } else {
      log.set('user_name', 'Sistema / Hook')
    }
    log.set('action', 'mdfe_updated')
    log.set('module', 'fiscal_frete')
    log.set('target_collection', 'mdfe_documents')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'MDF-e nº ' +
        e.record.getString('numero') +
        ' alterado de ' +
        prevStatus +
        ' para ' +
        nextStatus,
    )
    log.set('previous_value', original)
    log.set('new_value', e.record)
    log.set('criticidade', 'Alta')
    log.set('origem', 'Área da Empresa')
    $app.save(log)
  } catch (_) {}
}, 'mdfe_documents')

// ---------------------------------------------------------------------------
// 3. ENDPOINTS PARA NUMERAÇÃO SEQUENCIAL CT-E E MDF-E
// ---------------------------------------------------------------------------
routerAdd(
  'GET',
  '/backend/v1/cte-numbers/next',
  (e) => {
    try {
      var empresaId = e.request.url.query().get('empresa_id') || ''
      var serie = e.request.url.query().get('serie') || '1'

      var nextNum = 1
      var cfgRecord = null

      try {
        if (empresaId) {
          cfgRecord = $app.findFirstRecordByFilter(
            'cte_configs',
            "empresa_id = '" + empresaId + "' && serie = '" + serie + "'",
          )
        }
      } catch (_) {}

      if (cfgRecord) {
        nextNum = (cfgRecord.getInt('ultimo_sequencial') || 0) + 1
      } else {
        var filter = "serie = '" + serie + "'"
        if (empresaId) filter += " && empresa_id = '" + empresaId + "'"
        try {
          var docs = $app.findRecordsByFilter('cte_documents', filter, '-numero', 1)
          if (docs && docs.length > 0) {
            var ult = parseInt(docs[0].getString('numero'), 10)
            if (!isNaN(ult)) nextNum = ult + 1
          }
        } catch (_) {}
      }

      var numStr = String(nextNum).padStart(9, '0')
      return e.json(200, {
        numero: numStr,
        serie: serie,
        sequencial: nextNum,
        empresa_id: empresaId,
      })
    } catch (err) {
      $app.logger().error('cte number next failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao obter próximo número de CT-e' })
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/mdfe-numbers/next',
  (e) => {
    try {
      var empresaId = e.request.url.query().get('empresa_id') || ''
      var serie = e.request.url.query().get('serie') || '1'

      var nextNum = 1
      var cfgRecord = null

      try {
        if (empresaId) {
          cfgRecord = $app.findFirstRecordByFilter(
            'mdfe_configs',
            "empresa_id = '" + empresaId + "' && serie = '" + serie + "'",
          )
        }
      } catch (_) {}

      if (cfgRecord) {
        nextNum = (cfgRecord.getInt('ultimo_sequencial') || 0) + 1
      } else {
        var filter = "serie = '" + serie + "'"
        if (empresaId) filter += " && empresa_id = '" + empresaId + "'"
        try {
          var docs = $app.findRecordsByFilter('mdfe_documents', filter, '-numero', 1)
          if (docs && docs.length > 0) {
            var ult = parseInt(docs[0].getString('numero'), 10)
            if (!isNaN(ult)) nextNum = ult + 1
          }
        } catch (_) {}
      }

      var numStr = String(nextNum).padStart(9, '0')
      return e.json(200, {
        numero: numStr,
        serie: serie,
        sequencial: nextNum,
        empresa_id: empresaId,
      })
    } catch (err) {
      $app.logger().error('mdfe number next failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao obter próximo número de MDF-e' })
    }
  },
  $apis.requireAuth(),
)
