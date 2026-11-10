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

// TRANSMIT: envia o XML completo da NF-e ao Focus NFe (NF-e Modelo 55)
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
      var msg = 'Falha de comunicação com o Focus NFe (' + acao + ').'
      if (res && res.json) {
        var j = res.json
        if (j.erro) msg = String(j.erro)
        else if (j.error_description) msg = String(j.error_description)
        else if (j.error) msg = typeof j.error === 'string' ? j.error : msg
        else if (j.motivo_status) msg = String(j.motivo_status)
      }
      if (res && res.transport_error)
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      if (res && res.statusCode === 401)
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      return e2.json(502, { success: false, error: msg, status_code: res ? res.statusCode : 0 })
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

    var xml = artifact.getString('xml_conteudo') || ''
    if (!xml) return e.json(422, { error: 'XML da NF-e não encontrado no artefato fiscal' })

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
    var payload = { xml: xml, xml_assinado: xml }
    if (cfg && cfg.getString('emitente_ref')) payload.ref = cfg.getString('emitente_ref')

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
      var msg = 'Falha de comunicação com o Focus NFe (' + acao + ').'
      if (res && res.json) {
        var j = res.json
        if (j.erro) msg = String(j.erro)
        else if (j.error_description) msg = String(j.error_description)
        else if (j.error) msg = typeof j.error === 'string' ? j.error : msg
        else if (j.motivo_status) msg = String(j.motivo_status)
      }
      if (res && res.transport_error)
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      if (res && res.statusCode === 401)
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      return e2.json(502, { success: false, error: msg, status_code: res ? res.statusCode : 0 })
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
      var res = $http.send({
        url: focusBase[ambiente] + '/v2/nfe/' + encodeURIComponent(ref) + '.pdf',
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
      var msg = 'Falha de comunicação com o Focus NFe (' + acao + ').'
      if (res && res.json) {
        var j = res.json
        if (j.erro) msg = String(j.erro)
        else if (j.error_description) msg = String(j.error_description)
        else if (j.error) msg = typeof j.error === 'string' ? j.error : msg
        else if (j.motivo_status) msg = String(j.motivo_status)
      }
      if (res && res.transport_error)
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      if (res && res.statusCode === 401)
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      return e2.json(502, { success: false, error: msg, status_code: res ? res.statusCode : 0 })
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
      'POST',
      '/v2/nfe/' + encodeURIComponent(ref),
      { cancelar: true, justificativa: motivo, xJust: motivo, sequencia_evento: 1 },
      probe.mode,
      60,
    )
    if (res.statusCode >= 400) return focusErrorResponse(e, res, 'cancelamento')

    var mapped = mapFocusResult(res.json || {})
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
      var msg = 'Falha de comunicação com o Focus NFe (' + acao + ').'
      if (res && res.json) {
        var j = res.json
        if (j.erro) msg = String(j.erro)
        else if (j.error_description) msg = String(j.error_description)
        else if (j.error) msg = typeof j.error === 'string' ? j.error : msg
        else if (j.motivo_status) msg = String(j.motivo_status)
      }
      if (res && res.transport_error)
        msg = 'Falha de rede ao contatar o Focus NFe: ' + res.transport_error
      if (res && res.statusCode === 401)
        msg = 'Credencial Focus NFe recusada (401). Verifique o token configurado no ambiente.'
      return e2.json(502, { success: false, error: msg, status_code: res ? res.statusCode : 0 })
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
