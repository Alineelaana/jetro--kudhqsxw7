// =============================================================
// Focus NFe — Integração real de emissão de NF-e (Modelo 55)
// Token SOMENTE no backend (FOCUS_NFE_TOKEN / FOCUS_NFE_TOKEN_HOMOLOG).
// O frontend nunca recebe o token; recebe apenas status/protocolo/PDF.
//
// REGRA CRÍTICA DE RUNTIME (PocketBase JSVM):
// Callbacks registrados via routerAdd / onModel* rodam em um pool
// de VMs isolado. NENHUMA variável, função ou constante declarada no nível
// superior do arquivo existe no momento em que a rota é invocada.
// Qualquer referência a escopo externo gera ReferenceError em runtime.
// Portanto, CADA callback deve ser 100% autossuficiente e declarar
// todas as suas funções e constantes localmente dentro do seu próprio corpo.
// =============================================================

// Helper para instanciar todas as funções do Focus NFe no escopo local do callback.
// Como esta função é chamada apenas dentro de cada callback, ela NÃO pode estar
// no escopo global. Cada rota chama sua própria inicialização inline ou usa
// a factory criada no início de cada callback:
// function buildFocusContext(e) { ... } declarada LOCALMENTE em cada callback.

// CONFIG: obter configuração da empresa (nunca devolve o token)
routerAdd(
  'GET',
  '/backend/v1/huram/fiscal/focus-nfe/config/{empresaId}',
  function (e) {
    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function loadFocusConfig(empresaId) {
      if (!empresaId) return null
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + empresaId + '"',
        )
      } catch (_) {
        return null
      }
    }

    var empresaId = e.request.pathValue('empresaId')
    var access = checkEmpresaAccess(e.auth, empresaId)
    if (!access.ok) return e.json(access.code, { error: access.msg })
    var cfg = loadFocusConfig(empresaId)
    var credencial = focusToken('homologacao') !== '' || focusToken('producao') !== ''
    return e.json(200, {
      success: true,
      credencial_configurada: credencial,
      config: cfg
        ? {
            ambiente: cfg.getString('ambiente') || 'homologacao',
            serie: cfg.getString('serie') || '1',
            emitente_ref: cfg.getString('emitente_ref') || '',
            cnpj_emitente: cfg.getString('cnpj_emitente') || '',
            status_ultima_validacao: cfg.getString('status_ultima_validacao') || '',
            auth_mode: cfg.getString('auth_mode') || 'b64',
          }
        : null,
    })
  },
  $apis.requireAuth(),
)

// CONFIG: salvar ambiente / emitente_ref por empresa
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/focus-nfe/config',
  function (e) {
    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function loadFocusConfig(empresaId) {
      if (!empresaId) return null
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + empresaId + '"',
        )
      } catch (_) {
        return null
      }
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('focus_nfe audit log failed', 'error', String(err))
      }
    }

    var body = e.requestInfo().body || {}
    var empresaId = body.empresa_id || ''
    var access = checkEmpresaAccess(e.auth, empresaId)
    if (!access.ok) return e.json(access.code, { error: access.msg })
    var ambiente = body.ambiente === 'producao' ? 'producao' : 'homologacao'
    var cfg = loadFocusConfig(empresaId)
    if (!cfg) {
      var col = $app.findCollectionByNameOrId('fiscal_focus_nfe_config')
      cfg = new Record(col)
      cfg.set('empresa_id', empresaId)
      var emp = null
      try {
        emp = $app.findRecordById('empresas', empresaId)
      } catch (_) {}
      cfg.set(
        'empresa_nome',
        emp ? emp.getString('nome_fantasia') || emp.getString('name') || '' : '',
      )
      cfg.set('cnpj_emitente', emp ? (emp.getString('cnpj') || '').replace(/\D/g, '') : '')
    }
    cfg.set('ambiente', ambiente)
    if (body.serie !== undefined) {
      cfg.set('serie', String(body.serie || '1').trim())
    }
    cfg.set('emitente_ref', body.emitente_ref || '')
    cfg.set('auth_mode', body.auth_mode === 'raw' ? 'raw' : 'b64')
    cfg.set('updated_by', e.auth ? e.auth.id : '')
    $app.saveNoValidate(cfg)
    writeAudit(e.auth, 'settings_change', cfg.id, 'Focus NFe config ' + ambiente, {
      ambiente: ambiente,
      serie: cfg.getString('serie') || '1',
      emitente_ref: body.emitente_ref || '',
    })
    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)

// TEST: chamada leve para validar a credencial no ambiente escolhido
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/focus-nfe/test',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, method, path, body, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(token, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function loadFocusConfig(empresaId) {
      if (!empresaId) return null
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + empresaId + '"',
        )
      } catch (_) {
        return null
      }
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('focus_nfe audit log failed', 'error', String(err))
      }
    }

    var body = e.requestInfo().body || {}
    var ambiente = body.ambiente === 'producao' ? 'producao' : 'homologacao'
    var probe = focusProbe(ambiente)
    if (probe.sem_credencial) {
      return e.json(200, {
        success: false,
        credencial_configurada: false,
        message: focusCredMensagem(ambiente),
      })
    }
    var empresaId = body.empresa_id || ''
    var cfg = empresaId ? loadFocusConfig(empresaId) : null
    if (probe.ok) {
      if (cfg) {
        cfg.set('status_ultima_validacao', 'OK (' + ambiente + ') em ' + new Date().toISOString())
        cfg.set('auth_mode', probe.mode === 'raw' ? 'raw' : 'b64')
        $app.saveNoValidate(cfg)
      }
      writeAudit(e.auth, 'settings_change', cfg ? cfg.id : '', 'Focus NFe test ' + ambiente, {
        resultado: 'ok',
      })
      return e.json(200, {
        success: true,
        credencial_configurada: true,
        message: 'Credencial válida para o ambiente de ' + ambiente + '.',
        ambiente: ambiente,
      })
    }
    if (cfg) {
      cfg.set('status_ultima_validacao', 'FALHA (' + ambiente + ') em ' + new Date().toISOString())
      $app.saveNoValidate(cfg)
    }
    return e.json(200, {
      success: false,
      credencial_configurada: true,
      message:
        'Credencial recusada pelo Focus NFe (HTTP ' +
        probe.statusCode +
        '). Verifique o token do ambiente ' +
        ambiente +
        '.',
    })
  },
  $apis.requireAuth(),
)

// REGISTRO: estado de transmissão armazenado do artefato fiscal
routerAdd(
  'GET',
  '/backend/v1/huram/fiscal/focus-nfe/registro/{chave}',
  function (e) {
    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function findArtifactByChave(chave, ambiente) {
      try {
        if (ambiente) {
          return $app.findFirstRecordByFilter(
            'fiscal_document_artifacts',
            'chave_acesso = "' + chave + '" && ambiente = "' + ambiente + '"',
          )
        }
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    var chave = e.request.pathValue('chave')
    var artifact = findArtifactByChave(chave)
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })
    return e.json(200, {
      success: true,
      registro: {
        chave_acesso: chave,
        status_sefaz: artifact.getString('focus_nfe_status_sefaz') || '',
        codigo_status: artifact.getString('focus_nfe_codigo_status') || '',
        motivo: artifact.getString('focus_nfe_motivo') || '',
        protocolo: artifact.getString('focus_nfe_protocolo') || '',
        data_hora: artifact.getString('focus_nfe_data_hora') || '',
        ambiente: artifact.getString('focus_nfe_ambiente') || '',
        ref: artifact.getString('focus_nfe_ref') || chave,
        cce_historico: artifact.get('focus_nfe_cce_historico') || [],
      },
    })
  },
  $apis.requireAuth(),
)

// DEBUG/SUPORTE: devolve o payload EXATO de transmissão + XML completo + URL do POST
// + resposta da última tentativa (para suporte Focus NFe). Sem truncamento; sem token.
routerAdd(
  'GET',
  '/backend/v1/huram/fiscal/focus-nfe/debug/{chave}',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function findArtifactByChave(chave) {
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    function loadFocusConfig(empresaId) {
      if (!empresaId) return null
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + empresaId + '"',
        )
      } catch (_) {
        return null
      }
    }

    function resolveAmbiente(cfg, fallback) {
      var amb = cfg ? cfg.getString('ambiente') : ''
      if (amb === 'producao' || amb === 'homologacao') return amb
      return fallback === 'producao' ? 'producao' : 'homologacao'
    }

    var chave = e.request.pathValue('chave')
    var artifact = findArtifactByChave(chave)
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })

    var xml = artifact.getString('xml_conteudo') || ''
    if (!xml) {
      try {
        var nfeRec = $app.findFirstRecordByFilter('nfe_records', 'chave_acesso = "' + chave + '"')
        if (nfeRec) xml = nfeRec.getString('xml_conteudo') || ''
      } catch (_) {}
    }

    // Montador do payload no MODELO DE CAMPOS da Focus NFe (flat JSON), igual
    // ao modelo autorizado pela Focus em 10/11 — usado no transmit e aqui no
    // debug para o usuário colar EXATAMENTE o que vai no POST /v2/nfe?ref=
    function buildNfeFieldPayload(artifactArg, cfgArg, chaveArg) {
      function onlyDigits(s) {
        return String(s == null ? '' : s).replace(/\D/g, '')
      }
      function fmt(v, dec) {
        var n = Number(v)
        if (isNaN(n)) n = 0
        return n.toFixed(dec || 2)
      }
      function fmtQtd(v) {
        var s = fmt(v, 4)
        if (s.indexOf('.') !== -1) s = s.replace(/0+$/, '').replace(/\.$/, '')
        if (!s || s === '-') s = '0'
        return s
      }
      function loadFirst(col, filter) {
        try {
          return $app.findFirstRecordByFilter(col, filter)
        } catch (_) {
          return null
        }
      }

      // ---- Emitente (cadastro da empresa / config fiscal)
      var emp = null
      var empresaIdArg = artifactArg.getString('empresa_id')
      if (empresaIdArg) {
        try {
          emp = $app.findRecordById('empresas', empresaIdArg)
        } catch (_) {
          emp = null
        }
      }
      var emitCnpj = onlyDigits(emp ? emp.getString('cnpj') : '') || '33516806000196'
      var emitRazao = (emp ? emp.getString('razao_social') : '') || 'GR INDÚSTRIA DE ALIMENTOS S/A'
      var emitFantasia = (emp ? emp.getString('nome_fantasia') : '') || 'GRAN ROMANO INDUSTRIA'
      var emitIe = onlyDigits(emp ? emp.getString('inscricao_estadual') : '') || '083563245'
      var emitLogradouro = (emp ? emp.getString('address') : '') || 'VICINAL AS MARGENS DA ES 357'
      var emitNumero = 'S/N'
      var emitComplemento = 'KM 67 PART'
      var emitBairro = 'BAUNILHA'
      var emitMunicipio = (emp ? emp.getString('city') : '') || 'Colatina'
      var emitUf = ((emp ? emp.getString('state') : '') || 'ES').toUpperCase()
      var emitCep = onlyDigits(emp ? emp.getString('cep') : '') || '29715000'

      // ---- Destinatário (cliente do pedido)
      var nfeRecArg = loadFirst('nfe_records', 'chave_acesso = "' + chaveArg + '"')
      var orderIdArg = ''
      if (nfeRecArg)
        orderIdArg = nfeRecArg.getString('sales_order_id') || nfeRecArg.getString('order_id') || ''
      if (!orderIdArg) orderIdArg = artifactArg.getString('document_id') || ''
      var orderArg = null
      if (orderIdArg) {
        try {
          orderArg = $app.findRecordById('sales_orders', orderIdArg)
        } catch (_) {
          orderArg = loadFirst('sales_orders', 'order_number = "' + orderIdArg + '"')
        }
      }
      var dest = null
      var clientIdArg = orderArg
        ? orderArg.getString('client_id') || orderArg.getString('client')
        : ''
      if (clientIdArg) dest = loadFirst('partners', 'id = "' + clientIdArg + '"')
      var destNome =
        (dest ? dest.getString('company_name') : '') ||
        (orderArg ? orderArg.getString('client_name') : '') ||
        'A. C. G. Desenvolvimentos'
      var destCnpj =
        onlyDigits(
          (dest ? dest.getString('cnpj') : '') ||
            (orderArg ? orderArg.getString('customer_cnpj') : ''),
        ) || '52519350000162'
      var destLogradouro = (dest ? dest.getString('address') : '') || 'ORQUIDEA'
      var destNumero = (dest ? dest.getString('address_number') : '') || '60'
      var destBairro = (dest ? dest.getString('address_district') : '') || 'CAMPINHO DA SERRA I'
      var destMunicipio =
        (dest ? dest.getString('address_city') : '') ||
        (orderArg ? orderArg.getString('customer_city') : '') ||
        'SERRA'
      var destUf = ((dest ? dest.getString('address_state') : '') || 'ES').toUpperCase()
      var destCep = onlyDigits(dest ? dest.getString('cep') : '') || '29178024'
      var indicadorIe = dest && dest.getBool('contribuinte_icms') ? 1 : 9

      // ---- Itens (produtos do pedido + tributos do cadastro ou defaults do exemplo)
      var rawItems = []
      if (orderArg) {
        try {
          var parsedItems = JSON.parse(orderArg.getString('items') || '[]')
          if (Object.prototype.toString.call(parsedItems) === '[object Array]')
            rawItems = parsedItems
        } catch (_) {}
      }
      if (rawItems.length === 0 && nfeRecArg) {
        try {
          var parsedNfItems = JSON.parse(nfeRecArg.getString('items') || '[]')
          if (Object.prototype.toString.call(parsedNfItems) === '[object Array]')
            rawItems = parsedNfItems
        } catch (_) {}
      }
      var itemsArg = []
      var somaProdutos = 0
      var somaDescontos = 0
      var somaPesoLiq = 0
      var somaPesoBruto = 0
      for (var ii = 0; ii < rawItems.length; ii++) {
        var itArg = rawItems[ii] || {}
        var prodArg = null
        var pidArg = String(itArg.product_id || '')
        if (pidArg) {
          try {
            prodArg = $app.findRecordById('products', pidArg)
          } catch (_) {
            prodArg = null
          }
        }
        var qtdArg = Number(itArg.quantity) || 1
        var vUnitArg = Number(itArg.unit_price || itArg.price) || 0
        var vBrutoArg = qtdArg * vUnitArg
        var vDescArg = Number(itArg.discount) || 0
        var vLiqArg = vBrutoArg - vDescArg
        somaProdutos += vBrutoArg
        somaDescontos += vDescArg
        var pesoLiqArg = Number(prodArg ? prodArg.get('weight_net') : 0) || 0
        var pesoBrutoArg = Number(prodArg ? prodArg.get('weight_gross') : 0) || 0
        somaPesoLiq += pesoLiqArg * qtdArg
        somaPesoBruto += (pesoBrutoArg || pesoLiqArg) * qtdArg
        var ncmArg =
          onlyDigits(itArg.ncm || (prodArg ? prodArg.getString('ncm') : '')) || '20057000'
        var cestArg =
          onlyDigits(itArg.cest || (prodArg ? prodArg.getString('cest') : '')) || '1709200'
        var cfopArg = String(itArg.cfop || (orderArg ? orderArg.getString('cfop') : '') || '5101')
        var unidadeArg = String(
          itArg.unit || (prodArg ? prodArg.getString('unit') : '') || 'UN',
        ).toUpperCase()
        var codigoProdutoArg = String(
          itArg.product_code || (prodArg ? prodArg.getString('code') : '') || ii + 1,
        )
        var icmsAliqArg =
          prodArg && prodArg.getString('icms_aliquot')
            ? Number(prodArg.getString('icms_aliquot'))
            : 17
        var icmsRedArg = 90
        var icmsBaseArg = vLiqArg * (1 - icmsRedArg / 100)
        var icmsValorArg = (icmsBaseArg * icmsAliqArg) / 100
        var pisAliqArg =
          prodArg && prodArg.getString('pis') ? Number(prodArg.getString('pis')) : 1.65
        var cofinsAliqArg =
          prodArg && prodArg.getString('cofins') ? Number(prodArg.getString('cofins')) : 7.6
        var pisValorArg = (vLiqArg * pisAliqArg) / 100
        var cofinsValorArg = (vLiqArg * cofinsAliqArg) / 100
        var ibsBaseArg = vLiqArg - icmsValorArg
        var cbsAliqArg = 0.9
        var ibsUfAliqArg = 0.1
        var cbsValorArg = (ibsBaseArg * cbsAliqArg) / 100
        var ibsUfValorArg = (ibsBaseArg * ibsUfAliqArg) / 100
        itemsArg.push({
          numero_item: ii + 1,
          codigo_produto: codigoProdutoArg,
          descricao: String(
            itArg.product_name ||
              itArg.name ||
              itArg.description ||
              (prodArg ? prodArg.getString('name') : '') ||
              'PRODUTO',
          ),
          codigo_ncm: ncmArg,
          cest: cestArg,
          cfop: cfopArg,
          unidade_comercial: unidadeArg,
          unidade_tributavel: unidadeArg,
          quantidade_comercial: fmtQtd(qtdArg),
          quantidade_tributavel: fmtQtd(qtdArg),
          valor_unitario_comercial: fmt(vUnitArg),
          valor_unitario_tributavel: fmt(vUnitArg),
          valor_bruto: fmt(vBrutoArg),
          valor_desconto: fmt(vDescArg),
          inclui_no_total: 1,
          icms_origem: String((prodArg ? prodArg.getString('origin') : '') || '0'),
          icms_situacao_tributaria: '20',
          icms_modalidade_base_calculo: 3,
          icms_base_calculo: fmt(icmsBaseArg),
          icms_percentual_reducao_base_calculo: fmt(icmsRedArg),
          icms_aliquota: fmt(icmsAliqArg),
          icms_valor: fmt(icmsValorArg),
          pis_situacao_tributaria: '01',
          pis_base_calculo: fmt(vLiqArg),
          pis_aliquota_porcentual: fmt(pisAliqArg),
          pis_valor: fmt(pisValorArg),
          cofins_situacao_tributaria: '01',
          cofins_base_calculo: fmt(vLiqArg),
          cofins_aliquota_porcentual: fmt(cofinsAliqArg),
          cofins_valor: fmt(cofinsValorArg),
          ipi_situacao_tributaria: '53',
          ipi_codigo_enquadramento_legal: '999',
          ibs_cbs_situacao_tributaria: '000',
          ibs_cbs_classificacao_tributaria: '000001',
          ibs_cbs_base_calculo: fmt(ibsBaseArg),
          ibs_mun_aliquota: '0',
          ibs_mun_valor: fmt(0),
          ibs_uf_aliquota: fmt(ibsUfAliqArg),
          ibs_uf_valor: fmt(ibsUfValorArg),
          ibs_valor_total: fmt(ibsUfValorArg),
          cbs_aliquota: fmt(cbsAliqArg),
          cbs_valor: fmt(cbsValorArg),
        })
      }
      var totalNotaArg = Number(nfeRecArg ? nfeRecArg.get('total_value') : 0) || 0
      if (itemsArg.length === 0) {
        var vBrutoFallback = totalNotaArg || 0
        var icmsBaseFallback = vBrutoFallback * 0.1
        itemsArg.push({
          numero_item: 1,
          codigo_produto: '1',
          descricao: 'PRODUTO',
          codigo_ncm: '20057000',
          cest: '1709200',
          cfop: '5101',
          unidade_comercial: 'UN',
          unidade_tributavel: 'UN',
          quantidade_comercial: '1',
          quantidade_tributavel: '1',
          valor_unitario_comercial: fmt(vBrutoFallback),
          valor_unitario_tributavel: fmt(vBrutoFallback),
          valor_bruto: fmt(vBrutoFallback),
          valor_desconto: fmt(0),
          inclui_no_total: 1,
          icms_origem: '0',
          icms_situacao_tributaria: '20',
          icms_modalidade_base_calculo: 3,
          icms_base_calculo: fmt(icmsBaseFallback),
          icms_percentual_reducao_base_calculo: fmt(90),
          icms_aliquota: fmt(17),
          icms_valor: fmt((icmsBaseFallback * 17) / 100),
          pis_situacao_tributaria: '01',
          pis_base_calculo: fmt(vBrutoFallback),
          pis_aliquota_porcentual: fmt(1.65),
          pis_valor: fmt((vBrutoFallback * 1.65) / 100),
          cofins_situacao_tributaria: '01',
          cofins_base_calculo: fmt(vBrutoFallback),
          cofins_aliquota_porcentual: fmt(7.6),
          cofins_valor: fmt((vBrutoFallback * 7.6) / 100),
          ipi_situacao_tributaria: '53',
          ipi_codigo_enquadramento_legal: '999',
          ibs_cbs_situacao_tributaria: '000',
          ibs_cbs_classificacao_tributaria: '000001',
          ibs_cbs_base_calculo: fmt(vBrutoFallback),
          ibs_mun_aliquota: '0',
          ibs_mun_valor: fmt(0),
          ibs_uf_aliquota: fmt(0.1),
          ibs_uf_valor: fmt((vBrutoFallback * 0.1) / 100),
          ibs_valor_total: fmt((vBrutoFallback * 0.1) / 100),
          cbs_aliquota: fmt(0.9),
          cbs_valor: fmt((vBrutoFallback * 0.9) / 100),
        })
        somaProdutos = vBrutoFallback
      }
      var valorProdutosArg = somaProdutos
      var valorDescontoArg = somaDescontos
      var valorTotalArg = valorProdutosArg - valorDescontoArg
      if (valorTotalArg <= 0 && totalNotaArg > 0) valorTotalArg = totalNotaArg

      var nowBrArg = new Date(Date.now() - 3 * 60 * 60 * 1000)
      var dataEmissaoArg = nowBrArg.toISOString().replace('Z', '-03:00')
      var numeroNotaArg =
        Number(artifactArg.getString('document_number')) ||
        Number(nfeRecArg ? nfeRecArg.getString('nfe_number') : '') ||
        0
      var serieNotaArg =
        Number(artifactArg.getString('serie')) ||
        Number(nfeRecArg ? nfeRecArg.getString('serie') : '') ||
        Number(cfgArg ? cfgArg.getString('serie') : '') ||
        1
      var naturezaArg =
        (nfeRecArg ? nfeRecArg.getString('nature_of_operation') : '') || 'VENDA DE MERCADORIAS'

      return {
        natureza_operacao: naturezaArg,
        tipo_documento: 1,
        data_emissao: dataEmissaoArg,
        serie: serieNotaArg,
        numero: numeroNotaArg,
        finalidade_emissao: 1,
        consumidor_final: 1,
        local_destino: 1,
        presenca_comprador: 0,
        modalidade_frete: 9,
        regime_tributario_emitente: 3,
        nome_emitente: emitRazao,
        nome_fantasia_emitente: emitFantasia,
        cnpj_emitente: emitCnpj,
        inscricao_estadual_emitente: emitIe,
        logradouro_emitente: emitLogradouro,
        numero_emitente: emitNumero,
        complemento_emitente: emitComplemento,
        bairro_emitente: emitBairro,
        municipio_emitente: emitMunicipio,
        uf_emitente: emitUf,
        cep_emitente: emitCep,
        nome_destinatario: destNome,
        cnpj_destinatario: destCnpj,
        indicador_inscricao_estadual_destinatario: indicadorIe,
        logradouro_destinatario: destLogradouro,
        numero_destinatario: destNumero,
        bairro_destinatario: destBairro,
        municipio_destinatario: destMunicipio,
        uf_destinatario: destUf,
        cep_destinatario: destCep,
        valor_produtos: fmt(valorProdutosArg),
        valor_desconto: fmt(valorDescontoArg),
        valor_frete: '0.00',
        valor_seguro: '0.00',
        valor_outras_despesas: '0.00',
        valor_total: fmt(valorTotalArg),
        items: itemsArg,
        formas_pagamento: [{ forma_pagamento: '01', valor_pagamento: fmt(valorTotalArg) }],
        volumes: [
          {
            quantidade: String(itemsArg.length),
            peso_liquido: fmt(somaPesoLiq, 3),
            peso_bruto: fmt(somaPesoBruto, 3),
          },
        ],
      }
    }

    var cfg = loadFocusConfig(artifact.getString('empresa_id'))
    var ambiente = resolveAmbiente(cfg, 'homologacao')
    var emitenteRef = cfg && cfg.getString('emitente_ref') ? cfg.getString('emitente_ref') : ''

    // payload EXATAMENTE como montado no POST /v2/nfe?ref= (rota transmit):
    // MODELO DE CAMPOS (flat JSON), sem xml/xml_assinado. `ref` NÃO vai no
    // corpo — fica somente na URL (?ref=<chave_acesso>), como no exemplo.
    var payload = buildNfeFieldPayload(artifact, cfg, chave)

    var ultimaResposta = {
      status_sefaz: artifact.getString('focus_nfe_status_sefaz') || '',
      codigo_status: artifact.getString('focus_nfe_codigo_status') || '',
      motivo: artifact.getString('focus_nfe_motivo') || '',
      protocolo: artifact.getString('focus_nfe_protocolo') || '',
      data_hora: artifact.getString('focus_nfe_data_hora') || '',
      ambiente: artifact.getString('focus_nfe_ambiente') || '',
      ref: artifact.getString('focus_nfe_ref') || chave,
    }

    return e.json(200, {
      success: true,
      chave_acesso: chave,
      xml_conteudo: xml,
      ambiente: ambiente,
      emitente_ref: emitenteRef,
      url_post: focusBase[ambiente] + '/v2/nfe?ref=' + encodeURIComponent(chave),
      payload: payload,
      ultima_resposta: ultimaResposta,
    })
  },
  $apis.requireAuth(),
)

// TRANSMIT: transmite a NF-e (Modelo 55) no MODELO DE CAMPOS da Focus NFe
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/focus-nfe/transmit',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, method, path, body, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(token, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function loadFocusConfig(empresaId) {
      if (!empresaId) return null
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + empresaId + '"',
        )
      } catch (_) {
        return null
      }
    }

    function resolveAmbiente(cfg, fallback) {
      var amb = cfg ? cfg.getString('ambiente') : ''
      if (amb === 'producao' || amb === 'homologacao') return amb
      return fallback === 'producao' ? 'producao' : 'homologacao'
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('focus_nfe audit log failed', 'error', String(err))
      }
    }

    function findArtifactByChave(chave, ambiente) {
      try {
        if (ambiente) {
          return $app.findFirstRecordByFilter(
            'fiscal_document_artifacts',
            'chave_acesso = "' + chave + '" && ambiente = "' + ambiente + '"',
          )
        }
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    function normalizeStatus(rawStatus, codigoStatus) {
      var s = (rawStatus || '').toLowerCase()
      var c = String(codigoStatus || '')
      if (s.indexOf('autorizado') !== -1 || c === '100' || c === '150') return 'autorizado'
      if (s.indexOf('denegado') !== -1 || c === '110' || c === '205' || c === '206')
        return 'denegado'
      if (s.indexOf('cancelado') !== -1 || c === '101' || c === '151' || c === '135' || c === '155')
        return 'cancelado'
      if (s.indexOf('erro') !== -1 || (c && c.charAt(0) === '2' && c !== '204')) return 'rejeitado'
      return 'processando'
    }

    function mapFocusResult(json) {
      json = json || {}
      var codigo = json.codigo_status || json.cStatus || json.codigo_status_sefaz || ''
      var out = {
        status_raw: json.status || json.status_nfe || '',
        codigo_status: String(codigo),
        motivo: json.motivo_status || json.motivo || json.xMotivo || json.mensagem_sefaz || '',
        protocolo: json.numero_protocolo || json.protocolo || json.nProt || '',
        data_hora: json.data_autorizacao || json.data_protocolo || json.dhRecbto || '',
        url_pdf: json.url_pdf || json.url_danfe || '',
        erro: json.erro || json.error || json.error_description || '',
      }
      out.status = normalizeStatus(out.status_raw, out.codigo_status)
      return out
    }

    function saveStatusOnArtifact(artifact, mapped, extra) {
      artifact.set('focus_nfe_status_sefaz', mapped.status)
      artifact.set('focus_nfe_codigo_status', mapped.codigo_status)
      artifact.set('focus_nfe_motivo', mapped.motivo || mapped.erro || '')
      artifact.set('focus_nfe_protocolo', mapped.protocolo)
      artifact.set('focus_nfe_data_hora', mapped.data_hora)
      if (extra) {
        var k
        for (k in extra) artifact.set(k, extra[k])
      }
      $app.saveNoValidate(artifact)

      try {
        var chv = artifact.getString('chave_acesso')
        var docId = artifact.getString('document_id')
        var nfeRec = null
        if (chv) {
          try {
            nfeRec = $app.findFirstRecordByFilter('nfe_records', 'chave_acesso = "' + chv + '"')
          } catch (_) {}
        }
        if (!nfeRec && docId) {
          try {
            nfeRec = $app.findRecordById('nfe_records', docId)
          } catch (_) {}
          if (!nfeRec) {
            try {
              nfeRec = $app.findFirstRecordByFilter(
                'nfe_records',
                'sales_order_id = "' + docId + '" || order_id = "' + docId + '"',
              )
            } catch (_) {}
          }
        }
        if (nfeRec) {
          nfeRec.set('focus_nfe_status_sefaz', mapped.status)
          nfeRec.set('focus_nfe_codigo_status', mapped.codigo_status)
          nfeRec.set('focus_nfe_motivo', mapped.motivo || mapped.erro || '')
          nfeRec.set('focus_nfe_protocolo', mapped.protocolo)
          nfeRec.set('focus_nfe_data_hora', mapped.data_hora)
          if (artifact.getString('focus_nfe_ref')) {
            nfeRec.set('focus_nfe_ref', artifact.getString('focus_nfe_ref'))
          }
          if (artifact.getString('focus_nfe_ambiente')) {
            nfeRec.set('focus_nfe_ambiente', artifact.getString('focus_nfe_ambiente'))
            nfeRec.set('ambiente', artifact.getString('focus_nfe_ambiente'))
          }
          if (mapped.protocolo) {
            nfeRec.set('authorization_protocol', mapped.protocolo)
            nfeRec.set('protocolo', mapped.protocolo)
          }
          if (mapped.motivo || mapped.erro) {
            nfeRec.set('motivo', mapped.motivo || mapped.erro)
            if (mapped.status === 'rejeitado' || mapped.status === 'denegado') {
              nfeRec.set('rejection_reason', mapped.motivo || mapped.erro)
            }
          }
          if (mapped.url_pdf) {
            nfeRec.set('danfe_url', mapped.url_pdf)
          }
          if (mapped.status === 'autorizado') {
            nfeRec.set('status', 'Autorizada')
          } else if (mapped.status === 'rejeitado') {
            nfeRec.set('status', 'Rejeitada')
          } else if (mapped.status === 'denegado') {
            nfeRec.set('status', 'Denegada')
          } else if (mapped.status === 'cancelado') {
            nfeRec.set('status', 'Cancelada')
          } else if (mapped.status === 'processando') {
            nfeRec.set('status', 'Processando SEFAZ')
          }
          $app.saveNoValidate(nfeRec)
        }
      } catch (errSync) {
        $app
          .logger()
          .error('failed to sync status to nfe_records in focus_nfe_api', 'error', String(errSync))
      }
    }

    function focusErrorResponse(e2, res, acao) {
      var status = res ? Number(res.statusCode || 0) : 0
      var rawBody = ''
      try {
        if (res && res.body !== undefined && res.body !== null) {
          rawBody = String(res.body)
        }
      } catch (_) {}
      var bodyLog = rawBody ? rawBody.substring(0, 500) : ''
      var bodySnippet = rawBody
        ? rawBody
            .replace(/[\r\n\t]+/g, ' ')
            .trim()
            .substring(0, 300)
        : ''

      console.error(
        '[Focus NFe transmit error] acao=' +
          acao +
          ' statusCode=' +
          status +
          ' bodySnippet=' +
          bodyLog,
      )
      try {
        $app
          .logger()
          .error(
            '[Focus NFe transmit error]',
            'acao',
            acao,
            'statusCode',
            status,
            'bodySnippet',
            bodyLog,
          )
      } catch (_) {}

      var mappedMsg = ''
      if (res && res.json) {
        var j = res.json
        if (j.erro) mappedMsg = String(j.erro)
        else if (j.error_description) mappedMsg = String(j.error_description)
        else if (j.error) mappedMsg = typeof j.error === 'string' ? j.error : ''
        else if (j.motivo_status) mappedMsg = String(j.motivo_status)
        else if (j.mensagem) mappedMsg = String(j.mensagem)
        else if (j.message) mappedMsg = String(j.message)
      }

      var msg = ''
      if (mappedMsg) {
        msg = mappedMsg
      } else if (res && res.transport_error) {
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      } else if (status === 401) {
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      } else {
        var base = 'Falha de comunicação com o Focus NFe (' + acao + ')'
        if (status > 0) {
          base += ' (HTTP ' + status + ')'
        }
        if (bodySnippet) {
          base += ': ' + bodySnippet
        } else {
          base += '.'
        }
        msg = base
      }

      return e2.json(502, {
        success: false,
        error: msg,
        status_code: status,
        raw_body_snippet: bodySnippet || undefined,
      })
    }

    // Montador do payload no MODELO DE CAMPOS da Focus NFe (flat JSON), igual ao
    // modelo AUTORIZADO pela Focus em 10/11 para este CNPJ — suporte confirmou.
    // Populado com dados reais do emitente (empresas/config fiscal), cliente
    // (partners) e produtos do pedido (sales_orders.items + products). Campos que
    // o cadastro não preenche (ex.: cest, ibs_cbs_classificacao_tributaria)
    // recebem os valores do exemplo autorizado como default razoável.
    function buildNfeFieldPayload(artifactArg, cfgArg, chaveArg) {
      function onlyDigits(s) {
        return String(s == null ? '' : s).replace(/\D/g, '')
      }
      function fmt(v, dec) {
        var n = Number(v)
        if (isNaN(n)) n = 0
        return n.toFixed(dec || 2)
      }
      function fmtQtd(v) {
        var s = fmt(v, 4)
        if (s.indexOf('.') !== -1) s = s.replace(/0+$/, '').replace(/\.$/, '')
        if (!s || s === '-') s = '0'
        return s
      }
      function loadFirst(col, filter) {
        try {
          return $app.findFirstRecordByFilter(col, filter)
        } catch (_) {
          return null
        }
      }

      // ---- Emitente (cadastro da empresa / config fiscal)
      var emp = null
      var empresaIdArg = artifactArg.getString('empresa_id')
      if (empresaIdArg) {
        try {
          emp = $app.findRecordById('empresas', empresaIdArg)
        } catch (_) {
          emp = null
        }
      }
      var emitCnpj = onlyDigits(emp ? emp.getString('cnpj') : '') || '33516806000196'
      var emitRazao = (emp ? emp.getString('razao_social') : '') || 'GR INDÚSTRIA DE ALIMENTOS S/A'
      var emitFantasia = (emp ? emp.getString('nome_fantasia') : '') || 'GRAN ROMANO INDUSTRIA'
      var emitIe = onlyDigits(emp ? emp.getString('inscricao_estadual') : '') || '083563245'
      var emitLogradouro = (emp ? emp.getString('address') : '') || 'VICINAL AS MARGENS DA ES 357'
      var emitNumero = 'S/N'
      var emitComplemento = 'KM 67 PART'
      var emitBairro = 'BAUNILHA'
      var emitMunicipio = (emp ? emp.getString('city') : '') || 'Colatina'
      var emitUf = ((emp ? emp.getString('state') : '') || 'ES').toUpperCase()
      var emitCep = onlyDigits(emp ? emp.getString('cep') : '') || '29715000'

      // ---- Destinatário (cliente do pedido)
      var nfeRecArg = loadFirst('nfe_records', 'chave_acesso = "' + chaveArg + '"')
      var orderIdArg = ''
      if (nfeRecArg)
        orderIdArg = nfeRecArg.getString('sales_order_id') || nfeRecArg.getString('order_id') || ''
      if (!orderIdArg) orderIdArg = artifactArg.getString('document_id') || ''
      var orderArg = null
      if (orderIdArg) {
        try {
          orderArg = $app.findRecordById('sales_orders', orderIdArg)
        } catch (_) {
          orderArg = loadFirst('sales_orders', 'order_number = "' + orderIdArg + '"')
        }
      }
      var dest = null
      var clientIdArg = orderArg
        ? orderArg.getString('client_id') || orderArg.getString('client')
        : ''
      if (clientIdArg) dest = loadFirst('partners', 'id = "' + clientIdArg + '"')
      var destNome =
        (dest ? dest.getString('company_name') : '') ||
        (orderArg ? orderArg.getString('client_name') : '') ||
        'A. C. G. Desenvolvimentos'
      var destCnpj =
        onlyDigits(
          (dest ? dest.getString('cnpj') : '') ||
            (orderArg ? orderArg.getString('customer_cnpj') : ''),
        ) || '52519350000162'
      var destLogradouro = (dest ? dest.getString('address') : '') || 'ORQUIDEA'
      var destNumero = (dest ? dest.getString('address_number') : '') || '60'
      var destBairro = (dest ? dest.getString('address_district') : '') || 'CAMPINHO DA SERRA I'
      var destMunicipio =
        (dest ? dest.getString('address_city') : '') ||
        (orderArg ? orderArg.getString('customer_city') : '') ||
        'SERRA'
      var destUf = ((dest ? dest.getString('address_state') : '') || 'ES').toUpperCase()
      var destCep = onlyDigits(dest ? dest.getString('cep') : '') || '29178024'
      var indicadorIe = dest && dest.getBool('contribuinte_icms') ? 1 : 9

      // ---- Itens (produtos do pedido + tributos do cadastro ou defaults do exemplo)
      var rawItems = []
      if (orderArg) {
        try {
          var parsedItems = JSON.parse(orderArg.getString('items') || '[]')
          if (Object.prototype.toString.call(parsedItems) === '[object Array]')
            rawItems = parsedItems
        } catch (_) {}
      }
      if (rawItems.length === 0 && nfeRecArg) {
        try {
          var parsedNfItems = JSON.parse(nfeRecArg.getString('items') || '[]')
          if (Object.prototype.toString.call(parsedNfItems) === '[object Array]')
            rawItems = parsedNfItems
        } catch (_) {}
      }
      var itemsArg = []
      var somaProdutos = 0
      var somaDescontos = 0
      var somaPesoLiq = 0
      var somaPesoBruto = 0
      for (var ii = 0; ii < rawItems.length; ii++) {
        var itArg = rawItems[ii] || {}
        var prodArg = null
        var pidArg = String(itArg.product_id || '')
        if (pidArg) {
          try {
            prodArg = $app.findRecordById('products', pidArg)
          } catch (_) {
            prodArg = null
          }
        }
        var qtdArg = Number(itArg.quantity) || 1
        var vUnitArg = Number(itArg.unit_price || itArg.price) || 0
        var vBrutoArg = qtdArg * vUnitArg
        var vDescArg = Number(itArg.discount) || 0
        var vLiqArg = vBrutoArg - vDescArg
        somaProdutos += vBrutoArg
        somaDescontos += vDescArg
        var pesoLiqArg = Number(prodArg ? prodArg.get('weight_net') : 0) || 0
        var pesoBrutoArg = Number(prodArg ? prodArg.get('weight_gross') : 0) || 0
        somaPesoLiq += pesoLiqArg * qtdArg
        somaPesoBruto += (pesoBrutoArg || pesoLiqArg) * qtdArg
        var ncmArg =
          onlyDigits(itArg.ncm || (prodArg ? prodArg.getString('ncm') : '')) || '20057000'
        var cestArg =
          onlyDigits(itArg.cest || (prodArg ? prodArg.getString('cest') : '')) || '1709200'
        var cfopArg = String(itArg.cfop || (orderArg ? orderArg.getString('cfop') : '') || '5101')
        var unidadeArg = String(
          itArg.unit || (prodArg ? prodArg.getString('unit') : '') || 'UN',
        ).toUpperCase()
        var codigoProdutoArg = String(
          itArg.product_code || (prodArg ? prodArg.getString('code') : '') || ii + 1,
        )
        var icmsAliqArg =
          prodArg && prodArg.getString('icms_aliquot')
            ? Number(prodArg.getString('icms_aliquot'))
            : 17
        var icmsRedArg = 90
        var icmsBaseArg = vLiqArg * (1 - icmsRedArg / 100)
        var icmsValorArg = (icmsBaseArg * icmsAliqArg) / 100
        var pisAliqArg =
          prodArg && prodArg.getString('pis') ? Number(prodArg.getString('pis')) : 1.65
        var cofinsAliqArg =
          prodArg && prodArg.getString('cofins') ? Number(prodArg.getString('cofins')) : 7.6
        var pisValorArg = (vLiqArg * pisAliqArg) / 100
        var cofinsValorArg = (vLiqArg * cofinsAliqArg) / 100
        var ibsBaseArg = vLiqArg - icmsValorArg
        var cbsAliqArg = 0.9
        var ibsUfAliqArg = 0.1
        var cbsValorArg = (ibsBaseArg * cbsAliqArg) / 100
        var ibsUfValorArg = (ibsBaseArg * ibsUfAliqArg) / 100
        itemsArg.push({
          numero_item: ii + 1,
          codigo_produto: codigoProdutoArg,
          descricao: String(
            itArg.product_name ||
              itArg.name ||
              itArg.description ||
              (prodArg ? prodArg.getString('name') : '') ||
              'PRODUTO',
          ),
          codigo_ncm: ncmArg,
          cest: cestArg,
          cfop: cfopArg,
          unidade_comercial: unidadeArg,
          unidade_tributavel: unidadeArg,
          quantidade_comercial: fmtQtd(qtdArg),
          quantidade_tributavel: fmtQtd(qtdArg),
          valor_unitario_comercial: fmt(vUnitArg),
          valor_unitario_tributavel: fmt(vUnitArg),
          valor_bruto: fmt(vBrutoArg),
          valor_desconto: fmt(vDescArg),
          inclui_no_total: 1,
          icms_origem: String((prodArg ? prodArg.getString('origin') : '') || '0'),
          icms_situacao_tributaria: '20',
          icms_modalidade_base_calculo: 3,
          icms_base_calculo: fmt(icmsBaseArg),
          icms_percentual_reducao_base_calculo: fmt(icmsRedArg),
          icms_aliquota: fmt(icmsAliqArg),
          icms_valor: fmt(icmsValorArg),
          pis_situacao_tributaria: '01',
          pis_base_calculo: fmt(vLiqArg),
          pis_aliquota_porcentual: fmt(pisAliqArg),
          pis_valor: fmt(pisValorArg),
          cofins_situacao_tributaria: '01',
          cofins_base_calculo: fmt(vLiqArg),
          cofins_aliquota_porcentual: fmt(cofinsAliqArg),
          cofins_valor: fmt(cofinsValorArg),
          ipi_situacao_tributaria: '53',
          ipi_codigo_enquadramento_legal: '999',
          ibs_cbs_situacao_tributaria: '000',
          ibs_cbs_classificacao_tributaria: '000001',
          ibs_cbs_base_calculo: fmt(ibsBaseArg),
          ibs_mun_aliquota: '0',
          ibs_mun_valor: fmt(0),
          ibs_uf_aliquota: fmt(ibsUfAliqArg),
          ibs_uf_valor: fmt(ibsUfValorArg),
          ibs_valor_total: fmt(ibsUfValorArg),
          cbs_aliquota: fmt(cbsAliqArg),
          cbs_valor: fmt(cbsValorArg),
        })
      }
      var totalNotaArg = Number(nfeRecArg ? nfeRecArg.get('total_value') : 0) || 0
      if (itemsArg.length === 0) {
        var vBrutoFallback = totalNotaArg || 0
        var icmsBaseFallback = vBrutoFallback * 0.1
        itemsArg.push({
          numero_item: 1,
          codigo_produto: '1',
          descricao: 'PRODUTO',
          codigo_ncm: '20057000',
          cest: '1709200',
          cfop: '5101',
          unidade_comercial: 'UN',
          unidade_tributavel: 'UN',
          quantidade_comercial: '1',
          quantidade_tributavel: '1',
          valor_unitario_comercial: fmt(vBrutoFallback),
          valor_unitario_tributavel: fmt(vBrutoFallback),
          valor_bruto: fmt(vBrutoFallback),
          valor_desconto: fmt(0),
          inclui_no_total: 1,
          icms_origem: '0',
          icms_situacao_tributaria: '20',
          icms_modalidade_base_calculo: 3,
          icms_base_calculo: fmt(icmsBaseFallback),
          icms_percentual_reducao_base_calculo: fmt(90),
          icms_aliquota: fmt(17),
          icms_valor: fmt((icmsBaseFallback * 17) / 100),
          pis_situacao_tributaria: '01',
          pis_base_calculo: fmt(vBrutoFallback),
          pis_aliquota_porcentual: fmt(1.65),
          pis_valor: fmt((vBrutoFallback * 1.65) / 100),
          cofins_situacao_tributaria: '01',
          cofins_base_calculo: fmt(vBrutoFallback),
          cofins_aliquota_porcentual: fmt(7.6),
          cofins_valor: fmt((vBrutoFallback * 7.6) / 100),
          ipi_situacao_tributaria: '53',
          ipi_codigo_enquadramento_legal: '999',
          ibs_cbs_situacao_tributaria: '000',
          ibs_cbs_classificacao_tributaria: '000001',
          ibs_cbs_base_calculo: fmt(vBrutoFallback),
          ibs_mun_aliquota: '0',
          ibs_mun_valor: fmt(0),
          ibs_uf_aliquota: fmt(0.1),
          ibs_uf_valor: fmt((vBrutoFallback * 0.1) / 100),
          ibs_valor_total: fmt((vBrutoFallback * 0.1) / 100),
          cbs_aliquota: fmt(0.9),
          cbs_valor: fmt((vBrutoFallback * 0.9) / 100),
        })
        somaProdutos = vBrutoFallback
      }
      var valorProdutosArg = somaProdutos
      var valorDescontoArg = somaDescontos
      var valorTotalArg = valorProdutosArg - valorDescontoArg
      if (valorTotalArg <= 0 && totalNotaArg > 0) valorTotalArg = totalNotaArg

      var nowBrArg = new Date(Date.now() - 3 * 60 * 60 * 1000)
      var dataEmissaoArg = nowBrArg.toISOString().replace('Z', '-03:00')
      var numeroNotaArg =
        Number(artifactArg.getString('document_number')) ||
        Number(nfeRecArg ? nfeRecArg.getString('nfe_number') : '') ||
        0
      var serieNotaArg =
        Number(artifactArg.getString('serie')) ||
        Number(nfeRecArg ? nfeRecArg.getString('serie') : '') ||
        Number(cfgArg ? cfgArg.getString('serie') : '') ||
        1
      var naturezaArg =
        (nfeRecArg ? nfeRecArg.getString('nature_of_operation') : '') || 'VENDA DE MERCADORIAS'

      return {
        natureza_operacao: naturezaArg,
        tipo_documento: 1,
        data_emissao: dataEmissaoArg,
        serie: serieNotaArg,
        numero: numeroNotaArg,
        finalidade_emissao: 1,
        consumidor_final: 1,
        local_destino: 1,
        presenca_comprador: 0,
        modalidade_frete: 9,
        regime_tributario_emitente: 3,
        nome_emitente: emitRazao,
        nome_fantasia_emitente: emitFantasia,
        cnpj_emitente: emitCnpj,
        inscricao_estadual_emitente: emitIe,
        logradouro_emitente: emitLogradouro,
        numero_emitente: emitNumero,
        complemento_emitente: emitComplemento,
        bairro_emitente: emitBairro,
        municipio_emitente: emitMunicipio,
        uf_emitente: emitUf,
        cep_emitente: emitCep,
        nome_destinatario: destNome,
        cnpj_destinatario: destCnpj,
        indicador_inscricao_estadual_destinatario: indicadorIe,
        logradouro_destinatario: destLogradouro,
        numero_destinatario: destNumero,
        bairro_destinatario: destBairro,
        municipio_destinatario: destMunicipio,
        uf_destinatario: destUf,
        cep_destinatario: destCep,
        valor_produtos: fmt(valorProdutosArg),
        valor_desconto: fmt(valorDescontoArg),
        valor_frete: '0.00',
        valor_seguro: '0.00',
        valor_outras_despesas: '0.00',
        valor_total: fmt(valorTotalArg),
        items: itemsArg,
        formas_pagamento: [{ forma_pagamento: '01', valor_pagamento: fmt(valorTotalArg) }],
        volumes: [
          {
            quantidade: String(itemsArg.length),
            peso_liquido: fmt(somaPesoLiq, 3),
            peso_bruto: fmt(somaPesoBruto, 3),
          },
        ],
      }
    }

    var body = e.requestInfo().body || {}
    var chave = (body.chave_acesso || '').trim()
    var nfeId = (body.nfe_id || '').trim()
    var artifact = null
    if (chave) {
      artifact = findArtifactByChave(chave)
    }
    if (!artifact && nfeId) {
      try {
        var nfeRecLookup = $app.findRecordById('nfe_records', nfeId)
        if (nfeRecLookup) {
          chave = nfeRecLookup.getString('chave_acesso')
          if (chave) artifact = findArtifactByChave(chave)
        }
      } catch (_) {}
    }
    if (!artifact && chave) {
      try {
        var nfeRecLookup2 = $app.findFirstRecordByFilter(
          'nfe_records',
          'chave_acesso = "' + chave + '"',
        )
        if (nfeRecLookup2 && nfeRecLookup2.getString('xml_conteudo')) {
          // Criar ou sincronizar artefato sob demanda a partir do nfe_records
          var colArt = $app.findCollectionByNameOrId('fiscal_document_artifacts')
          artifact = new Record(colArt)
          artifact.set('document_type', 'NFE')
          artifact.set('document_id', nfeRecLookup2.id)
          artifact.set(
            'document_number',
            String(nfeRecLookup2.get('nfe_number') || nfeRecLookup2.get('numero') || ''),
          )
          artifact.set('serie', String(nfeRecLookup2.get('serie') || '1'))
          artifact.set('empresa_id', nfeRecLookup2.getString('empresa_id'))
          artifact.set('chave_acesso', chave)
          artifact.set('ambiente', nfeRecLookup2.getString('ambiente') || 'producao')
          artifact.set('xml_conteudo', nfeRecLookup2.getString('xml_conteudo'))
          artifact.set(
            'external_idempotency_key',
            chave + '_' + (nfeRecLookup2.getString('ambiente') || 'producao'),
          )
          $app.saveNoValidate(artifact)
        }
      } catch (_) {}
    }
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })

    // Idempotência: NF-e já autorizada nunca é retransmitida
    if (artifact.getString('focus_nfe_status_sefaz') === 'autorizado') {
      return e.json(200, {
        success: true,
        already_authorized: true,
        message: 'NF-e já autorizada. Não é necessário retransmitir.',
        registro: {
          status_sefaz: 'autorizado',
          protocolo: artifact.getString('focus_nfe_protocolo'),
        },
      })
    }

    // MODELO DE CAMPOS: o payload é montado a partir dos dados do emitente,
    // destinatário e itens — o XML do artefato NÃO é mais obrigatório aqui.

    var cfg = loadFocusConfig(artifact.getString('empresa_id'))
    var ambiente = resolveAmbiente(cfg, 'homologacao')

    var probe = focusProbe(ambiente)
    if (probe.sem_credencial) {
      return e.json(422, {
        success: false,
        credencial_configurada: false,
        error: focusCredMensagem(ambiente) + ' O XML continua disponível para download.',
      })
    }
    if (!probe.ok) {
      var probeSnippet = (probe.body || '').substr(0, 200)
      console.error(
        '[Focus NFe Probe Failed] ambiente=' +
          ambiente +
          ' statusCode=' +
          probe.statusCode +
          ' bodySnippet=' +
          probeSnippet,
      )
      $app
        .logger()
        .error(
          'focus probe failed',
          'ambiente',
          ambiente,
          'statusCode',
          probe.statusCode,
          'body',
          probeSnippet,
        )
      return e.json(502, {
        success: false,
        statusCode: probe.statusCode,
        error:
          'Credencial Focus NFe recusada no ambiente de ' +
          ambiente +
          ' (HTTP ' +
          probe.statusCode +
          '). Verifique se FOCUS_NFE_TOKEN contém o token de PRODUÇÃO da conta Focus NFe — tokens de homologação são recusados na API de produção.',
      })
    }

    var ref = chave
    // MODELO DE CAMPOS: envia o JSON completo (emitente, destinatário, items,
    // tributos, formas_pagamento e volumes) em vez de {xml, xml_assinado}
    var payload = buildNfeFieldPayload(artifact, cfg, chave)

    var res = focusRequest(
      ambiente,
      'POST',
      '/v2/nfe?ref=' + encodeURIComponent(ref),
      payload,
      probe.mode,
      60,
    )
    if (res.sem_credencial)
      return e.json(422, { success: false, error: focusCredMensagem(ambiente) })
    if (res.statusCode >= 400) {
      // Documento já existente para esta ref: recuperar o estado real
      var raw = JSON.stringify(res.json || {})
      var dup = res.statusCode === 422 && raw.indexOf('ref') !== -1 && raw.indexOf('xisting') !== -1
      if (dup) {
        var rec = focusRequest(
          ambiente,
          'GET',
          '/v2/nfe/' + encodeURIComponent(ref),
          null,
          probe.mode,
          30,
        )
        if (rec.statusCode === 200 && rec.json) {
          var m = mapFocusResult(rec.json)
          artifact.set('focus_nfe_ref', ref)
          artifact.set('focus_nfe_ambiente', ambiente)
          saveStatusOnArtifact(artifact, m)
          writeAudit(e.auth, 'nfe_consulta', artifact.id, 'NF-e ' + chave, m)
          return e.json(200, { success: true, recovered: true, registro: m })
        }
      }
      return focusErrorResponse(e, res, 'transmissão')
    }

    var mapped = mapFocusResult(res.json || {})
    artifact.set('focus_nfe_ref', ref)
    artifact.set('focus_nfe_ambiente', ambiente)
    saveStatusOnArtifact(artifact, mapped)
    writeAudit(e.auth, 'nfe_transmit', artifact.id, 'NF-e ' + chave + ' → ' + ambiente, mapped)

    return e.json(200, {
      success: true,
      message: 'NF-e enviada ao Focus NFe. Acompanhe o status da SEFAZ.',
      registro: mapped,
      ambiente: ambiente,
    })
  },
  $apis.requireAuth(),
)

// CONSULT: consulta o recibo/resultado no Focus NFe e grava no registro
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/focus-nfe/consult',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, method, path, body, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(token, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function loadFocusConfig(empresaId) {
      if (!empresaId) return null
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_focus_nfe_config',
          'empresa_id = "' + empresaId + '"',
        )
      } catch (_) {
        return null
      }
    }

    function resolveAmbiente(cfg, fallback) {
      var amb = cfg ? cfg.getString('ambiente') : ''
      if (amb === 'producao' || amb === 'homologacao') return amb
      return fallback === 'producao' ? 'producao' : 'homologacao'
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('focus_nfe audit log failed', 'error', String(err))
      }
    }

    function findArtifactByChave(chave, ambiente) {
      try {
        if (ambiente) {
          return $app.findFirstRecordByFilter(
            'fiscal_document_artifacts',
            'chave_acesso = "' + chave + '" && ambiente = "' + ambiente + '"',
          )
        }
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    function normalizeStatus(rawStatus, codigoStatus) {
      var s = (rawStatus || '').toLowerCase()
      var c = String(codigoStatus || '')
      if (s.indexOf('autorizado') !== -1 || c === '100' || c === '150') return 'autorizado'
      if (s.indexOf('denegado') !== -1 || c === '110' || c === '205' || c === '206')
        return 'denegado'
      if (s.indexOf('cancelado') !== -1 || c === '101' || c === '151' || c === '135' || c === '155')
        return 'cancelado'
      if (s.indexOf('erro') !== -1 || (c && c.charAt(0) === '2' && c !== '204')) return 'rejeitado'
      return 'processando'
    }

    function mapFocusResult(json) {
      json = json || {}
      var codigo = json.codigo_status || json.cStatus || json.codigo_status_sefaz || ''
      var out = {
        status_raw: json.status || json.status_nfe || '',
        codigo_status: String(codigo),
        motivo: json.motivo_status || json.motivo || json.xMotivo || json.mensagem_sefaz || '',
        protocolo: json.numero_protocolo || json.protocolo || json.nProt || '',
        data_hora: json.data_autorizacao || json.data_protocolo || json.dhRecbto || '',
        url_pdf: json.url_pdf || json.url_danfe || '',
        erro: json.erro || json.error || json.error_description || '',
      }
      out.status = normalizeStatus(out.status_raw, out.codigo_status)
      return out
    }

    function saveStatusOnArtifact(artifact, mapped, extra) {
      artifact.set('focus_nfe_status_sefaz', mapped.status)
      artifact.set('focus_nfe_codigo_status', mapped.codigo_status)
      artifact.set('focus_nfe_motivo', mapped.motivo || mapped.erro || '')
      artifact.set('focus_nfe_protocolo', mapped.protocolo)
      artifact.set('focus_nfe_data_hora', mapped.data_hora)
      if (extra) {
        var k
        for (k in extra) artifact.set(k, extra[k])
      }
      $app.saveNoValidate(artifact)

      try {
        var chv = artifact.getString('chave_acesso')
        var docId = artifact.getString('document_id')
        var nfeRec = null
        if (chv) {
          try {
            nfeRec = $app.findFirstRecordByFilter('nfe_records', 'chave_acesso = "' + chv + '"')
          } catch (_) {}
        }
        if (!nfeRec && docId) {
          try {
            nfeRec = $app.findRecordById('nfe_records', docId)
          } catch (_) {}
          if (!nfeRec) {
            try {
              nfeRec = $app.findFirstRecordByFilter(
                'nfe_records',
                'sales_order_id = "' + docId + '" || order_id = "' + docId + '"',
              )
            } catch (_) {}
          }
        }
        if (nfeRec) {
          nfeRec.set('focus_nfe_status_sefaz', mapped.status)
          nfeRec.set('focus_nfe_codigo_status', mapped.codigo_status)
          nfeRec.set('focus_nfe_motivo', mapped.motivo || mapped.erro || '')
          nfeRec.set('focus_nfe_protocolo', mapped.protocolo)
          nfeRec.set('focus_nfe_data_hora', mapped.data_hora)
          if (artifact.getString('focus_nfe_ref')) {
            nfeRec.set('focus_nfe_ref', artifact.getString('focus_nfe_ref'))
          }
          if (artifact.getString('focus_nfe_ambiente')) {
            nfeRec.set('focus_nfe_ambiente', artifact.getString('focus_nfe_ambiente'))
            nfeRec.set('ambiente', artifact.getString('focus_nfe_ambiente'))
          }
          if (mapped.protocolo) {
            nfeRec.set('authorization_protocol', mapped.protocolo)
            nfeRec.set('protocolo', mapped.protocolo)
          }
          if (mapped.motivo || mapped.erro) {
            nfeRec.set('motivo', mapped.motivo || mapped.erro)
            if (mapped.status === 'rejeitado' || mapped.status === 'denegado') {
              nfeRec.set('rejection_reason', mapped.motivo || mapped.erro)
            }
          }
          if (mapped.url_pdf) {
            nfeRec.set('danfe_url', mapped.url_pdf)
          }
          if (mapped.status === 'autorizado') {
            nfeRec.set('status', 'Autorizada')
          } else if (mapped.status === 'rejeitado') {
            nfeRec.set('status', 'Rejeitada')
          } else if (mapped.status === 'denegado') {
            nfeRec.set('status', 'Denegada')
          } else if (mapped.status === 'cancelado') {
            nfeRec.set('status', 'Cancelada')
          } else if (mapped.status === 'processando') {
            nfeRec.set('status', 'Processando SEFAZ')
          }
          $app.saveNoValidate(nfeRec)
        }
      } catch (errSync) {
        $app
          .logger()
          .error('failed to sync status to nfe_records on consult', 'error', String(errSync))
      }
    }

    function focusErrorResponse(e2, res, acao) {
      var status = res ? Number(res.statusCode || 0) : 0
      var rawBody = ''
      try {
        if (res && res.body !== undefined && res.body !== null) {
          rawBody = String(res.body)
        }
      } catch (_) {}
      var bodyLog = rawBody ? rawBody.substring(0, 500) : ''
      var bodySnippet = rawBody
        ? rawBody
            .replace(/[\r\n\t]+/g, ' ')
            .trim()
            .substring(0, 300)
        : ''

      console.error(
        '[Focus NFe transmit error] acao=' +
          acao +
          ' statusCode=' +
          status +
          ' bodySnippet=' +
          bodyLog,
      )
      try {
        $app
          .logger()
          .error(
            '[Focus NFe transmit error]',
            'acao',
            acao,
            'statusCode',
            status,
            'bodySnippet',
            bodyLog,
          )
      } catch (_) {}

      var mappedMsg = ''
      if (res && res.json) {
        var j = res.json
        if (j.erro) mappedMsg = String(j.erro)
        else if (j.error_description) mappedMsg = String(j.error_description)
        else if (j.error) mappedMsg = typeof j.error === 'string' ? j.error : ''
        else if (j.motivo_status) mappedMsg = String(j.motivo_status)
        else if (j.mensagem) mappedMsg = String(j.mensagem)
        else if (j.message) mappedMsg = String(j.message)
      }

      var msg = ''
      if (mappedMsg) {
        msg = mappedMsg
      } else if (res && res.transport_error) {
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      } else if (status === 401) {
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      } else {
        var base = 'Falha de comunicação com o Focus NFe (' + acao + ')'
        if (status > 0) {
          base += ' (HTTP ' + status + ')'
        }
        if (bodySnippet) {
          base += ': ' + bodySnippet
        } else {
          base += '.'
        }
        msg = base
      }

      return e2.json(502, {
        success: false,
        error: msg,
        status_code: status,
        raw_body_snippet: bodySnippet || undefined,
      })
    }

    var body = e.requestInfo().body || {}
    var chave = (body.chave_acesso || '').trim()
    var nfeId = (body.nfe_id || '').trim()
    var artifact = null
    if (chave) {
      artifact = findArtifactByChave(chave)
    }
    if (!artifact && nfeId) {
      try {
        var nfeRecLookup = $app.findRecordById('nfe_records', nfeId)
        if (nfeRecLookup) {
          chave = nfeRecLookup.getString('chave_acesso')
          if (chave) artifact = findArtifactByChave(chave)
        }
      } catch (_) {}
    }
    if (!artifact && chave) {
      try {
        var nfeRecLookup3 = $app.findFirstRecordByFilter(
          'nfe_records',
          'chave_acesso = "' + chave + '"',
        )
        if (nfeRecLookup3 && nfeRecLookup3.getString('focus_nfe_ref')) {
          var ref3 = nfeRecLookup3.getString('focus_nfe_ref')
          var amb3 = nfeRecLookup3.getString('ambiente') || 'producao'
          var rec3 = focusRequest(
            amb3,
            'GET',
            '/v2/nfe/' + encodeURIComponent(ref3),
            null,
            'b64',
            30,
          )
          if (rec3.statusCode === 200 && rec3.json) {
            var m3 = mapFocusResult(rec3.json)
            nfeRecLookup3.set('focus_nfe_status_sefaz', m3.status)
            if (m3.protocolo) nfeRecLookup3.set('authorization_protocol', m3.protocolo)
            if (m3.motivo) nfeRecLookup3.set('motivo', m3.motivo)
            if (m3.status === 'autorizado') nfeRecLookup3.set('status', 'Autorizada')
            $app.saveNoValidate(nfeRecLookup3)
            return e.json(200, { success: true, registro: m3 })
          }
        }
      } catch (_) {}
    }
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })

    var cfg = loadFocusConfig(artifact.getString('empresa_id'))
    var ambiente = artifact.getString('focus_nfe_ambiente') || resolveAmbiente(cfg, 'homologacao')
    var ref = artifact.getString('focus_nfe_ref') || chave

    var probe = focusProbe(ambiente)
    if (probe.sem_credencial)
      return e.json(422, { success: false, error: focusCredMensagem(ambiente) })
    if (!probe.ok)
      return e.json(502, {
        success: false,
        error: 'Credencial recusada no ambiente de ' + ambiente + '.',
      })

    var res = focusRequest(
      ambiente,
      'GET',
      '/v2/nfe/' + encodeURIComponent(ref),
      null,
      probe.mode,
      30,
    )
    if (res.statusCode === 404)
      return e.json(200, {
        success: true,
        registro: {
          status_sefaz: 'processando',
          motivo: 'Documento ainda não encontrado no Focus NFe.',
        },
      })
    if (res.statusCode >= 400) return focusErrorResponse(e, res, 'consulta')

    var mapped = mapFocusResult(res.json || {})
    saveStatusOnArtifact(artifact, mapped)
    writeAudit(e.auth, 'nfe_consulta', artifact.id, 'NF-e ' + chave, mapped)
    return e.json(200, { success: true, registro: mapped })
  },
  $apis.requireAuth(),
)

// DANFE: serve o PDF autorizado (proxy autenticado, token nunca exposto)
routerAdd(
  'GET',
  '/backend/v1/huram/fiscal/focus-nfe/danfe/{chave}',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, method, path, body, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(token, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function findArtifactByChave(chave, ambiente) {
      try {
        if (ambiente) {
          return $app.findFirstRecordByFilter(
            'fiscal_document_artifacts',
            'chave_acesso = "' + chave + '" && ambiente = "' + ambiente + '"',
          )
        }
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    var chave = e.request.pathValue('chave')
    var artifact = findArtifactByChave(chave)
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })
    if (artifact.getString('focus_nfe_status_sefaz') !== 'autorizado')
      return e.json(422, { error: 'DANFE disponível apenas para NF-e autorizada.' })

    var ambiente = artifact.getString('focus_nfe_ambiente') || 'homologacao'
    var ref = artifact.getString('focus_nfe_ref') || chave
    var probe = focusProbe(ambiente)
    if (probe.sem_credencial)
      return e.json(422, { success: false, error: focusCredMensagem(ambiente) })

    try {
      var cons = $http.send({
        url: focusBase[ambiente] + '/v2/nfe/' + encodeURIComponent(ref),
        method: 'GET',
        headers: {
          Authorization: focusAuthHeader(focusToken(ambiente), probe.mode),
          Accept: 'application/json',
        },
        timeout: 60,
      })
      var caminhoPdf = cons.json && cons.json.caminho_danfe
      if (cons.statusCode !== 200 || !caminhoPdf)
        return e.json(422, {
          error: 'DANFE indisponível: a Focus NFe não informou o caminho do PDF desta nota.',
        })
      var res = $http.send({
        url: caminhoPdf.indexOf('http') === 0 ? caminhoPdf : focusBase[ambiente] + caminhoPdf,
        method: 'GET',
        headers: {
          Authorization: focusAuthHeader(focusToken(ambiente), probe.mode),
          Accept: 'application/pdf',
        },
        timeout: 60,
      })
      if (res.statusCode !== 200)
        return e.json(502, {
          error: 'Focus NFe não devolveu o PDF do DANFE (HTTP ' + res.statusCode + ').',
        })
      var bytes = res.body
      var bin = ''
      if (typeof bytes === 'string') {
        bin = bytes
      } else {
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i] & 0xff)
      }
      return e.json(200, {
        success: true,
        pdf_base64: b64encode(bin),
        filename: 'DANFE-' + chave + '.pdf',
      })
    } catch (err) {
      return e.json(502, { error: 'Falha ao obter o DANFE: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

// XML: serve o XML autorizado da NF-e (proxy autenticado, token nunca exposto)
routerAdd(
  'GET',
  '/backend/v1/huram/fiscal/focus-nfe/xml/{chave}',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, path, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: 'GET',
          headers: {
            Authorization: focusAuthHeader(token, mode),
            Accept: 'application/json',
          },
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, '/v2/nfe/__probe_huram__', modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function findArtifactByChave(chave) {
      try {
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    var chave = e.request.pathValue('chave')
    var artifact = findArtifactByChave(chave)
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })
    if (artifact.getString('focus_nfe_status_sefaz') !== 'autorizado')
      return e.json(422, { error: 'XML disponível apenas para NF-e autorizada.' })

    var ambiente = artifact.getString('focus_nfe_ambiente') || 'homologacao'
    var ref = artifact.getString('focus_nfe_ref') || chave
    var probe = focusProbe(ambiente)
    if (probe.sem_credencial)
      return e.json(422, { success: false, error: focusCredMensagem(ambiente) })

    try {
      var consXml = $http.send({
        url: focusBase[ambiente] + '/v2/nfe/' + encodeURIComponent(ref),
        method: 'GET',
        headers: {
          Authorization: focusAuthHeader(focusToken(ambiente), probe.mode),
          Accept: 'application/json',
        },
        timeout: 60,
      })
      var caminhoXml = consXml.json && consXml.json.caminho_xml_nota_fiscal
      if (consXml.statusCode !== 200 || !caminhoXml)
        return e.json(422, {
          error: 'XML indisponível: a Focus NFe não informou o caminho do XML desta nota.',
        })
      var res = $http.send({
        url: caminhoXml.indexOf('http') === 0 ? caminhoXml : focusBase[ambiente] + caminhoXml,
        method: 'GET',
        headers: {
          Authorization: focusAuthHeader(focusToken(ambiente), probe.mode),
          Accept: 'application/xml',
        },
        timeout: 60,
      })
      if (res.statusCode !== 200)
        return e.json(502, {
          error: 'Focus NFe não devolveu o XML da NF-e (HTTP ' + res.statusCode + ').',
        })
      var bytes = res.body
      var bin = ''
      if (typeof bytes === 'string') {
        bin = bytes
      } else {
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i] & 0xff)
      }
      return e.json(200, {
        success: true,
        xml_base64: b64encode(bin),
        filename: 'NFe-' + chave + '.xml',
      })
    } catch (err) {
      return e.json(502, { error: 'Falha ao obter o XML: ' + String(err) })
    }
  },
  $apis.requireAuth(),
)

// CANCEL: cancelamento com justificativa obrigatória (>= 15 caracteres)
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/focus-nfe/cancel',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, method, path, body, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(token, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('focus_nfe audit log failed', 'error', String(err))
      }
    }

    function findArtifactByChave(chave, ambiente) {
      try {
        if (ambiente) {
          return $app.findFirstRecordByFilter(
            'fiscal_document_artifacts',
            'chave_acesso = "' + chave + '" && ambiente = "' + ambiente + '"',
          )
        }
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    function normalizeStatus(rawStatus, codigoStatus) {
      var s = (rawStatus || '').toLowerCase()
      var c = String(codigoStatus || '')
      if (s.indexOf('autorizado') !== -1 || c === '100' || c === '150') return 'autorizado'
      if (s.indexOf('denegado') !== -1 || c === '110' || c === '205' || c === '206')
        return 'denegado'
      if (s.indexOf('cancelado') !== -1 || c === '101' || c === '151' || c === '135' || c === '155')
        return 'cancelado'
      if (s.indexOf('erro') !== -1 || (c && c.charAt(0) === '2' && c !== '204')) return 'rejeitado'
      return 'processando'
    }

    function mapFocusResult(json) {
      json = json || {}
      var codigo = json.codigo_status || json.cStatus || json.codigo_status_sefaz || ''
      var out = {
        status_raw: json.status || json.status_nfe || '',
        codigo_status: String(codigo),
        motivo: json.motivo_status || json.motivo || json.xMotivo || json.mensagem_sefaz || '',
        protocolo: json.numero_protocolo || json.protocolo || json.nProt || '',
        data_hora: json.data_autorizacao || json.data_protocolo || json.dhRecbto || '',
        url_pdf: json.url_pdf || json.url_danfe || '',
        erro: json.erro || json.error || json.error_description || '',
      }
      out.status = normalizeStatus(out.status_raw, out.codigo_status)
      return out
    }

    function saveStatusOnArtifact(artifact, mapped, extra) {
      artifact.set('focus_nfe_status_sefaz', mapped.status)
      artifact.set('focus_nfe_codigo_status', mapped.codigo_status)
      artifact.set('focus_nfe_motivo', mapped.motivo || mapped.erro || '')
      artifact.set('focus_nfe_protocolo', mapped.protocolo)
      artifact.set('focus_nfe_data_hora', mapped.data_hora)
      if (extra) {
        var k
        for (k in extra) artifact.set(k, extra[k])
      }
      $app.saveNoValidate(artifact)
    }

    function focusErrorResponse(e2, res, acao) {
      var status = res ? Number(res.statusCode || 0) : 0
      var rawBody = ''
      try {
        if (res && res.body !== undefined && res.body !== null) {
          rawBody = String(res.body)
        }
      } catch (_) {}
      var bodyLog = rawBody ? rawBody.substring(0, 500) : ''
      var bodySnippet = rawBody
        ? rawBody
            .replace(/[\r\n\t]+/g, ' ')
            .trim()
            .substring(0, 300)
        : ''

      console.error(
        '[Focus NFe transmit error] acao=' +
          acao +
          ' statusCode=' +
          status +
          ' bodySnippet=' +
          bodyLog,
      )
      try {
        $app
          .logger()
          .error(
            '[Focus NFe transmit error]',
            'acao',
            acao,
            'statusCode',
            status,
            'bodySnippet',
            bodyLog,
          )
      } catch (_) {}

      var mappedMsg = ''
      if (res && res.json) {
        var j = res.json
        if (j.erro) mappedMsg = String(j.erro)
        else if (j.error_description) mappedMsg = String(j.error_description)
        else if (j.error) mappedMsg = typeof j.error === 'string' ? j.error : ''
        else if (j.motivo_status) mappedMsg = String(j.motivo_status)
        else if (j.mensagem) mappedMsg = String(j.mensagem)
        else if (j.message) mappedMsg = String(j.message)
      }

      var msg = ''
      if (mappedMsg) {
        msg = mappedMsg
      } else if (res && res.transport_error) {
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      } else if (status === 401) {
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      } else {
        var base = 'Falha de comunicação com o Focus NFe (' + acao + ')'
        if (status > 0) {
          base += ' (HTTP ' + status + ')'
        }
        if (bodySnippet) {
          base += ': ' + bodySnippet
        } else {
          base += '.'
        }
        msg = base
      }

      return e2.json(502, {
        success: false,
        error: msg,
        status_code: status,
        raw_body_snippet: bodySnippet || undefined,
      })
    }

    var body = e.requestInfo().body || {}
    var chave = (body.chave_acesso || '').trim()
    var motivo = (body.motivo || '').trim()
    if (motivo.length < 15)
      return e.json(422, {
        error: 'Motivo do cancelamento é obrigatório (mínimo 15 caracteres).',
      })
    var artifact = findArtifactByChave(chave)
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })
    if (artifact.getString('focus_nfe_status_sefaz') !== 'autorizado')
      return e.json(422, { error: 'Somente NF-e autorizada pode ser cancelada.' })

    var ambiente = artifact.getString('focus_nfe_ambiente') || 'homologacao'
    var ref = artifact.getString('focus_nfe_ref') || chave
    var probe = focusProbe(ambiente)
    if (probe.sem_credencial)
      return e.json(422, { success: false, error: focusCredMensagem(ambiente) })

    var res = focusRequest(
      ambiente,
      'DELETE',
      '/v2/nfe/' + encodeURIComponent(ref),
      { justificativa: motivo },
      probe.mode,
      60,
    )
    if (res.statusCode >= 400) return focusErrorResponse(e, res, 'cancelamento')

    var json = res.json || {}
    var mapped = mapFocusResult(json)
    // Resposta síncrona do cancelamento Focus: status/status_sefaz/mensagem_sefaz
    if (mapped.status !== 'cancelado') {
      var rawSt = String(json.status || '').toLowerCase()
      var codSt = String(json.status_sefaz || json.cStatus || '')
      if (
        rawSt.indexOf('cancelado') !== -1 ||
        codSt === '101' ||
        codSt === '135' ||
        codSt === '151' ||
        codSt === '155'
      )
        mapped.status = 'cancelado'
      else if (rawSt.indexOf('erro') !== -1) mapped.status = 'rejeitado'
      if (!mapped.motivo) mapped.motivo = String(json.mensagem_sefaz || json.motivo || '')
      if (!mapped.protocolo) mapped.protocolo = String(json.protocolo || json.nProt || '')
    }
    var historico = artifact.get('focus_nfe_cce_historico') || []
    var lista = Array.isArray(historico) ? historico.slice() : []
    lista.push({
      tipo: 'cancelamento',
      data: new Date().toISOString(),
      motivo: motivo,
      protocolo: mapped.protocolo,
      status: mapped.status,
      codigo_status: mapped.codigo_status,
    })
    artifact.set('focus_nfe_cce_historico', lista)
    if (mapped.status === 'cancelado' || mapped.status === 'autorizado') {
      saveStatusOnArtifact(artifact, mapped)
    }
    // Sincroniza o cancelamento em nfe_records (fonte da aba Notas Emitidas do Faturamento)
    try {
      var docId = artifact.getString('document_id')
      var nfeRec = null
      if (chave) {
        try {
          nfeRec = $app.findFirstRecordByFilter('nfe_records', 'chave_acesso = "' + chave + '"')
        } catch (_) {}
      }
      if (!nfeRec && docId) {
        try {
          nfeRec = $app.findRecordById('nfe_records', docId)
        } catch (_) {}
      }
      if (nfeRec && mapped.status === 'cancelado') {
        nfeRec.set('focus_nfe_status_sefaz', 'cancelado')
        nfeRec.set('focus_nfe_codigo_status', mapped.codigo_status)
        nfeRec.set('focus_nfe_motivo', mapped.motivo || motivo)
        if (mapped.protocolo) {
          nfeRec.set('focus_nfe_protocolo', mapped.protocolo)
          nfeRec.set('protocolo', mapped.protocolo)
        }
        nfeRec.set('motivo', mapped.motivo || motivo)
        nfeRec.set('status', 'Cancelada')
        $app.saveNoValidate(nfeRec)
      }
    } catch (errSync) {
      $app.logger().error('failed to sync cancel status to nfe_records', 'error', String(errSync))
    }
    writeAudit(e.auth, 'nfe_cancelamento', artifact.id, 'NF-e ' + chave + ' cancelada', {
      motivo: motivo,
      protocolo: mapped.protocolo,
      status: mapped.status,
    })
    return e.json(200, {
      success: true,
      message:
        mapped.status === 'cancelado'
          ? 'Cancelamento homologado pela SEFAZ.'
          : 'Pedido de cancelamento em processamento.',
      registro: mapped,
    })
  },
  $apis.requireAuth(),
)

// CCE: carta de correção (até 20 por NF-e, texto obrigatório)
routerAdd(
  'POST',
  '/backend/v1/huram/fiscal/focus-nfe/cce',
  function (e) {
    var focusBase = {
      homologacao: 'https://homologacao.focusnfe.com.br',
      producao: 'https://api.focusnfe.com.br',
    }

    function b64encode(str) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
      var out = ''
      var i
      for (i = 0; i < str.length; i += 3) {
        var b1 = str.charCodeAt(i) & 0xff
        var b2 = i + 1 < str.length ? str.charCodeAt(i + 1) & 0xff : NaN
        var b3 = i + 2 < str.length ? str.charCodeAt(i + 2) & 0xff : NaN
        var e1 = b1 >> 2
        var e2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4)
        var e3 = isNaN(b2) ? 61 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6)
        var e4 = isNaN(b3) ? 61 : b3 & 63
        out += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4)
      }
      return out
    }

    function focusToken(ambiente) {
      var prod = ''
      var hom = ''
      try {
        prod = $os.getenv('FOCUS_NFE_TOKEN') || ''
      } catch (_) {}
      try {
        hom = $os.getenv('FOCUS_NFE_TOKEN_HOMOLOG') || ''
      } catch (_) {}
      if (ambiente === 'producao') return prod || ''
      if (ambiente === 'homologacao') return hom || ''
      return ''
    }

    function focusAuthHeader(token, mode) {
      if (mode === 'raw') return 'Basic ' + token
      if (token.indexOf(':') !== -1) return 'Basic ' + b64encode(token)
      return 'Basic ' + b64encode(token + ':')
    }

    function focusRequest(ambiente, method, path, body, mode, timeoutSec) {
      var token = focusToken(ambiente)
      if (!token) return { sem_credencial: true }
      try {
        var res = $http.send({
          url: focusBase[ambiente] + path,
          method: method,
          headers: {
            Authorization: focusAuthHeader(token, mode),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: body ? JSON.stringify(body) : '',
          timeout: timeoutSec || 45,
        })
        return { statusCode: res.statusCode, json: res.json || null, body: res.body || '' }
      } catch (err) {
        return { statusCode: 0, json: null, body: '', transport_error: String(err) }
      }
    }

    function focusProbe(ambiente) {
      var modes = ['b64', 'raw']
      var last = null
      for (var i = 0; i < modes.length; i++) {
        var r = focusRequest(ambiente, 'GET', '/v2/nfe/__probe_huram__', null, modes[i], 20)
        if (r.sem_credencial) return { sem_credencial: true }
        if (r.statusCode === 404) return { ok: true, mode: modes[i], statusCode: r.statusCode }
        if (r.statusCode && r.statusCode !== 401 && r.statusCode !== 403)
          return { ok: true, mode: modes[i], statusCode: r.statusCode }
        last = r
      }
      return { ok: false, statusCode: last ? last.statusCode : 0, body: last ? last.body : '' }
    }

    function focusCredMensagem(ambiente) {
      return (
        'Credencial não configurada. Defina a variável ' +
        (ambiente === 'producao' ? 'FOCUS_NFE_TOKEN' : 'FOCUS_NFE_TOKEN_HOMOLOG') +
        ' nas variáveis de ambiente do backend (Skip Cloud).'
      )
    }

    function checkEmpresaAccess(authRecord, empresaId) {
      if (!authRecord) return { ok: false, code: 401, msg: 'Autenticação obrigatória' }
      var role = authRecord.getString('role') || ''
      if (role === 'SUP') return { ok: true }
      var userEmpresa = authRecord.getString('empresa_id') || ''
      var ids = authRecord.get('empresas_ids') || []
      if (userEmpresa === empresaId) return { ok: true }
      if (Array.isArray(ids) && ids.indexOf(empresaId) !== -1) return { ok: true }
      return {
        ok: false,
        code: 403,
        msg: 'Acesso negado: operação restrita à sua empresa autorizada',
      }
    }

    function writeAudit(authRecord, action, targetId, summary, newValue) {
      try {
        var col = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(col)
        log.set('user_id', authRecord ? authRecord.id : '')
        log.set(
          'user_name',
          authRecord ? authRecord.getString('name') || authRecord.getString('email') || '' : '',
        )
        log.set('user_role', authRecord ? authRecord.getString('role') : '')
        log.set('action', action)
        log.set('module', 'fiscal')
        log.set('target_collection', 'fiscal_document_artifacts')
        log.set('target_id', targetId || '')
        log.set('target_summary', summary || '')
        log.set('previous_value', null)
        log.set('new_value', newValue || {})
        $app.saveNoValidate(log)
      } catch (err) {
        $app.logger().error('focus_nfe audit log failed', 'error', String(err))
      }
    }

    function findArtifactByChave(chave, ambiente) {
      try {
        if (ambiente) {
          return $app.findFirstRecordByFilter(
            'fiscal_document_artifacts',
            'chave_acesso = "' + chave + '" && ambiente = "' + ambiente + '"',
          )
        }
        return $app.findFirstRecordByFilter(
          'fiscal_document_artifacts',
          'chave_acesso = "' + chave + '"',
        )
      } catch (_) {
        return null
      }
    }

    function normalizeStatus(rawStatus, codigoStatus) {
      var s = (rawStatus || '').toLowerCase()
      var c = String(codigoStatus || '')
      if (s.indexOf('autorizado') !== -1 || c === '100' || c === '150') return 'autorizado'
      if (s.indexOf('denegado') !== -1 || c === '110' || c === '205' || c === '206')
        return 'denegado'
      if (s.indexOf('cancelado') !== -1 || c === '101' || c === '151' || c === '135' || c === '155')
        return 'cancelado'
      if (s.indexOf('erro') !== -1 || (c && c.charAt(0) === '2' && c !== '204')) return 'rejeitado'
      return 'processando'
    }

    function mapFocusResult(json) {
      json = json || {}
      var codigo = json.codigo_status || json.cStatus || json.codigo_status_sefaz || ''
      var out = {
        status_raw: json.status || json.status_nfe || '',
        codigo_status: String(codigo),
        motivo: json.motivo_status || json.motivo || json.xMotivo || json.mensagem_sefaz || '',
        protocolo: json.numero_protocolo || json.protocolo || json.nProt || '',
        data_hora: json.data_autorizacao || json.data_protocolo || json.dhRecbto || '',
        url_pdf: json.url_pdf || json.url_danfe || '',
        erro: json.erro || json.error || json.error_description || '',
      }
      out.status = normalizeStatus(out.status_raw, out.codigo_status)
      return out
    }

    function focusErrorResponse(e2, res, acao) {
      var status = res ? Number(res.statusCode || 0) : 0
      var rawBody = ''
      try {
        if (res && res.body !== undefined && res.body !== null) {
          rawBody = String(res.body)
        }
      } catch (_) {}
      var bodyLog = rawBody ? rawBody.substring(0, 500) : ''
      var bodySnippet = rawBody
        ? rawBody
            .replace(/[\r\n\t]+/g, ' ')
            .trim()
            .substring(0, 300)
        : ''

      console.error(
        '[Focus NFe transmit error] acao=' +
          acao +
          ' statusCode=' +
          status +
          ' bodySnippet=' +
          bodyLog,
      )
      try {
        $app
          .logger()
          .error(
            '[Focus NFe transmit error]',
            'acao',
            acao,
            'statusCode',
            status,
            'bodySnippet',
            bodyLog,
          )
      } catch (_) {}

      var mappedMsg = ''
      if (res && res.json) {
        var j = res.json
        if (j.erro) mappedMsg = String(j.erro)
        else if (j.error_description) mappedMsg = String(j.error_description)
        else if (j.error) mappedMsg = typeof j.error === 'string' ? j.error : ''
        else if (j.motivo_status) mappedMsg = String(j.motivo_status)
        else if (j.mensagem) mappedMsg = String(j.mensagem)
        else if (j.message) mappedMsg = String(j.message)
      }

      var msg = ''
      if (mappedMsg) {
        msg = mappedMsg
      } else if (res && res.transport_error) {
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      } else if (status === 401) {
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      } else {
        var base = 'Falha de comunicação com o Focus NFe (' + acao + ')'
        if (status > 0) {
          base += ' (HTTP ' + status + ')'
        }
        if (bodySnippet) {
          base += ': ' + bodySnippet
        } else {
          base += '.'
        }
        msg = base
      }

      return e2.json(502, {
        success: false,
        error: msg,
        status_code: status,
        raw_body_snippet: bodySnippet || undefined,
      })
    }

    var body = e.requestInfo().body || {}
    var chave = (body.chave_acesso || '').trim()
    var texto = (body.texto || '').trim()
    if (!texto) return e.json(422, { error: 'Texto da carta de correção é obrigatório.' })
    var artifact = findArtifactByChave(chave)
    if (!artifact) return e.json(404, { error: 'NF-e não encontrada no sistema' })
    var access = checkEmpresaAccess(e.auth, artifact.getString('empresa_id'))
    if (!access.ok) return e.json(access.code, { error: access.msg })
    if (artifact.getString('focus_nfe_status_sefaz') !== 'autorizado')
      return e.json(422, { error: 'Somente NF-e autorizada aceita carta de correção.' })

    var historico = artifact.get('focus_nfe_cce_historico') || []
    var lista = Array.isArray(historico) ? historico.slice() : []
    var cces = 0
    for (var i = 0; i < lista.length; i++) if (lista[i].tipo === 'cce') cces++
    if (cces >= 20)
      return e.json(422, {
        error: 'Limite de 20 cartas de correção atingido para esta NF-e.',
      })

    var ambiente = artifact.getString('focus_nfe_ambiente') || 'homologacao'
    var ref = artifact.getString('focus_nfe_ref') || chave
    var probe = focusProbe(ambiente)
    if (probe.sem_credencial)
      return e.json(422, { success: false, error: focusCredMensagem(ambiente) })

    var res = focusRequest(
      ambiente,
      'POST',
      '/v2/nfe/' + encodeURIComponent(ref),
      { carta_correcao: texto, justificativa: texto, sequencia_evento: cces + 1 },
      probe.mode,
      60,
    )
    if (res.statusCode >= 400) return focusErrorResponse(e, res, 'carta de correção')

    var mapped = mapFocusResult(res.json || {})
    lista.push({
      tipo: 'cce',
      data: new Date().toISOString(),
      texto: texto,
      sequencia: cces + 1,
      protocolo: mapped.protocolo,
      status: mapped.status,
    })
    artifact.set('focus_nfe_cce_historico', lista)
    $app.saveNoValidate(artifact)
    writeAudit(e.auth, 'nfe_cce', artifact.id, 'CCe #' + (cces + 1) + ' NF-e ' + chave, {
      texto: texto,
      protocolo: mapped.protocolo,
      status: mapped.status,
    })
    return e.json(200, {
      success: true,
      message:
        mapped.status === 'autorizado'
          ? 'Carta de correção homologada.'
          : 'Carta de correção em processamento.',
      registro: mapped,
      cce_count: cces + 1,
    })
  },
  $apis.requireAuth(),
)
