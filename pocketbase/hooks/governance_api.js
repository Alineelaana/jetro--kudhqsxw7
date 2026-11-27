// governance_api.js — API de governança documental "AvatarSi"
// Endpoints:
//   POST /backend/v1/governance/next-version  — calcula próxima versão (PATCH/MINOR/MAJOR)
//   POST /backend/v1/governance/transition    — revisão / aprovação / devolução / rejeição / liberação
//   POST /backend/v1/governance/checklist     — confirmação item a item do checklist de liberação
//   POST /backend/v1/governance/norm-ack      — ciência da norma de governança
//
// IMPORTANTE (JSVM): toda lógica INLINE nos callbacks (sem referências de nível superior).

routerAdd(
  'POST',
  '/backend/v1/governance/next-version',
  (e) => {
    const info = e.requestInfo()
    const auth = info.auth
    if (!auth) {
      e.json(401, { error: 'Não autenticado' })
      return
    }
    const role = String(auth.get('role') || '')
    const body = info.body || {}
    const docId = String(body.document_id || '')
    const changeType = String(body.change_type || '')
    if (!docId || !['patch', 'minor', 'major'].includes(changeType)) {
      e.json(400, { error: 'Parâmetros inválidos: document_id e change_type (patch|minor|major)' })
      return
    }
    let doc = null
    try {
      doc = $app.findRecordById('governance_documents', docId)
    } catch (_) {
      e.json(404, { error: 'Documento não encontrado' })
      return
    }
    // multitenancy: SUP vê tudo; demais só a própria empresa
    if (role !== 'SUP' && String(doc.get('empresa')) !== String(auth.get('empresa_id'))) {
      e.json(403, { error: 'Documento de outra empresa' })
      return
    }
    const maj = Number(doc.get('version_major') || 0)
    const min = Number(doc.get('version_minor') || 0)
    const pat = Number(doc.get('version_patch') || 0)
    let next = [0, 0, 0]
    if (changeType === 'patch') next = [maj, min, pat + 1]
    if (changeType === 'minor') next = [maj, min + 1, 0]
    if (changeType === 'major') next = [maj + 1, 0, 0]
    e.json(200, {
      document_id: docId,
      current_version: maj + '.' + min + '.' + pat,
      change_type: changeType,
      next_version: next[0] + '.' + next[1] + '.' + next[2],
    })
  },
  null,
)

routerAdd(
  'POST',
  '/backend/v1/governance/transition',
  (e) => {
    const info = e.requestInfo()
    const auth = info.auth
    if (!auth) {
      e.json(401, { error: 'Não autenticado' })
      return
    }
    const role = String(auth.get('role') || '')
    const body = info.body || {}
    const docId = String(body.document_id || '')
    const action = String(body.action || '')
    const version = String(body.version || '')
    const motivo = String(body.motivo || '')
    const userNome = String(auth.get('name') || auth.get('email') || 'usuário')
    const userRole = role || '—'

    if (!docId || !action) {
      e.json(400, { error: 'Parâmetros inválidos: document_id e action' })
      return
    }
    if (
      ![
        'enviar_revisao',
        'aprovar',
        'devolver',
        'rejeitar',
        'liberar',
        'revogar',
        'retomar',
      ].includes(action)
    ) {
      e.json(400, { error: 'Ação inválida' })
      return
    }
    if (['aprovar', 'devolver', 'rejeitar', 'liberar', 'revogar'].includes(action) && !motivo) {
      e.json(400, { error: 'Informe o motivo/observação da decisão' })
      return
    }

    let doc = null
    try {
      doc = $app.findRecordById('governance_documents', docId)
    } catch (_) {
      e.json(404, { error: 'Documento não encontrado' })
      return
    }
    if (role !== 'SUP' && String(doc.get('empresa')) !== String(auth.get('empresa_id'))) {
      e.json(403, { error: 'Documento de outra empresa' })
      return
    }

    const statusAtual = String(doc.get('status') || '')
    const versaoAtual =
      String(doc.get('version_major') || 0) +
      '.' +
      String(doc.get('version_minor') || 0) +
      '.' +
      String(doc.get('version_patch') || 0)

    const agora = new Date().toISOString()

    // --- valida a transição conforme o fluxo AvatarSi ---
    const transicoes = {
      enviar_revisao: ['em_elaboracao'],
      aprovar: ['em_revisao', 'em_aprovacao'],
      devolver: ['em_revisao', 'em_aprovacao', 'aprovado'],
      rejeitar: ['em_revisao', 'em_aprovacao'],
      liberar: ['aprovado'],
      revogar: ['publicado', 'obsoleto'],
      retomar: ['obsoleto', 'revogado'],
    }
    if (!(transicoes[action] || []).includes(statusAtual)) {
      e.json(400, {
        error:
          'Transição inválida: "' + action + '" não é permitida no status "' + statusAtual + '"',
      })
      return
    }

    // --- liberação: exige checklist integralmente confirmado ---
    if (action === 'liberar') {
      let pendentes = []
      try {
        pendentes = $app.findRecordsByFilter(
          'governance_release_checklist',
          'document_id = "' + docId + '" && version = "' + versaoAtual + '" && confirmed != true',
          '',
          1,
          0,
        )
      } catch (_) {}
      if (pendentes.length > 0) {
        e.json(400, {
          error:
            'Checklist de liberação incompleto: confirme todos os itens antes de liberar a versão ' +
            versaoAtual,
        })
        return
      }
    }

    // --- aplica a transição ---
    let novoStatus = statusAtual
    if (action === 'enviar_revisao') novoStatus = 'em_revisao'
    if (action === 'aprovar') novoStatus = 'aprovado'
    if (action === 'devolver') novoStatus = 'em_elaboracao'
    if (action === 'rejeitar') novoStatus = 'em_elaboracao'
    if (action === 'liberar') novoStatus = 'publicado'
    if (action === 'revogar') novoStatus = 'revogado'
    if (action === 'retomar') novoStatus = 'em_elaboracao'

    doc.set('status', novoStatus)
    if (action === 'aprovar') {
      doc.set('approved_at', agora)
      doc.set('approver', userNome)
      doc.set('approver_role', userRole)
      doc.set(
        'approval_evidence',
        'Aprovado em ' + agora + ' por ' + userNome + ' (' + userRole + '). ' + motivo,
      )
    }
    if (action === 'liberar') {
      doc.set('current_version', versaoAtual)
      doc.set('released_at', agora)
      doc.set('released_by', userNome)
      doc.set(
        'released_file_name',
        'AVSI_' +
          String(doc.get('doc_code') || '') +
          '_V' +
          versaoAtual +
          '_' +
          agora.slice(0, 10) +
          '.pdf',
      )
      doc.set('pending_review', false)
      // snapshot da versão liberada no histórico
      try {
        const colVer = $app.findCollectionByNameOrId('governance_document_versions')
        const ver = new Record(colVer)
        ver.set('empresa', doc.get('empresa'))
        ver.set('document_id', doc.id)
        ver.set('doc_code', doc.get('doc_code'))
        ver.set('doc_number', doc.get('doc_number'))
        ver.set('version', versaoAtual)
        ver.set('status', 'publicado')
        ver.set('classification', doc.get('classification'))
        ver.set('change_summary', doc.get('change_summary'))
        ver.set('author', doc.get('author'))
        ver.set('approver', doc.get('approver'))
        ver.set('approver_role', doc.get('approver_role'))
        ver.set('approved_at', doc.get('approved_at'))
        ver.set('released_at', agora)
        ver.set('released_by', userNome)
        ver.set('file_name', doc.get('released_file_name'))
        ver.set('created_by', userNome)
        $app.save(ver)
      } catch (err) {
        console.log('governance transition: falha ao salvar versão: ' + err)
      }
    }
    if (action === 'revogar' || action === 'retomar') {
      doc.set('pending_review', true)
      doc.set(
        'change_summary',
        (doc.get('change_summary') || '') +
          '\n[' +
          agora +
          '] ' +
          action.toUpperCase() +
          ': ' +
          motivo,
      )
    }
    if (action === 'devolver' || action === 'rejeitar') {
      doc.set('pending_review', true)
      doc.set(
        'change_summary',
        '[DECISÃO ' + agora + '] ' + userNome + ' (' + userRole + '): ' + motivo,
      )
    }

    try {
      $app.save(doc)
    } catch (err) {
      e.json(500, { error: 'Falha ao salvar transição: ' + err })
      return
    }

    // --- trilha de auditoria ---
    try {
      const colAudit = $app.findCollectionByNameOrId('governance_audit_trail')
      const audit = new Record(colAudit)
      audit.set('empresa', doc.get('empresa'))
      audit.set('document_id', doc.id)
      audit.set('doc_code', doc.get('doc_code'))
      audit.set('doc_number', doc.get('doc_number'))
      audit.set('version', versaoAtual)
      audit.set('event', action)
      audit.set('user_name', userNome)
      audit.set('user_role', userRole)
      audit.set('details', motivo || '—')
      $app.save(audit)
    } catch (err) {
      console.log('governance transition: falha ao salvar auditoria: ' + err)
    }

    e.json(200, {
      ok: true,
      document_id: doc.id,
      status: novoStatus,
      version: versaoAtual,
    })
  },
  null,
)

routerAdd(
  'POST',
  '/backend/v1/governance/checklist',
  (e) => {
    const info = e.requestInfo()
    const auth = info.auth
    if (!auth) {
      e.json(401, { error: 'Não autenticado' })
      return
    }
    const role = String(auth.get('role') || '')
    const body = info.body || {}
    const docId = String(body.document_id || '')
    const version = String(body.version || '')
    const itemKey = String(body.item_key || '')
    const itemLabel = String(body.item_label || '')
    const confirmed = !!body.confirmed
    const userNome = String(auth.get('name') || auth.get('email') || 'usuário')

    if (!docId || !itemKey) {
      e.json(400, { error: 'Parâmetros inválidos: document_id e item_key' })
      return
    }

    let doc = null
    try {
      doc = $app.findRecordById('governance_documents', docId)
    } catch (_) {
      e.json(404, { error: 'Documento não encontrado' })
      return
    }
    if (role !== 'SUP' && String(doc.get('empresa')) !== String(auth.get('empresa_id'))) {
      e.json(403, { error: 'Documento de outra empresa' })
      return
    }

    let existente = []
    try {
      existente = $app.findRecordsByFilter(
        'governance_release_checklist',
        'document_id = "' +
          docId +
          '" && version = "' +
          version +
          '" && item_key = "' +
          itemKey +
          '"',
        '',
        1,
        0,
      )
    } catch (_) {}

    if (existente.length > 0) {
      const item = existente[0]
      item.set('confirmed', confirmed)
      item.set('confirmed_by', userNome)
      item.set('confirmed_at', new Date().toISOString())
      $app.save(item)
      e.json(200, { ok: true, item: item.id, confirmed: confirmed })
      return
    }

    const col = $app.findCollectionByNameOrId('governance_release_checklist')
    const item = new Record(col)
    item.set('empresa', doc.get('empresa'))
    item.set('document_id', docId)
    item.set('version', version)
    item.set('item_key', itemKey)
    item.set('item_label', itemLabel)
    item.set('confirmed', confirmed)
    item.set('confirmed_by', userNome)
    item.set('confirmed_at', new Date().toISOString())
    $app.save(item)
    e.json(200, { ok: true, item: item.id, confirmed: confirmed })
  },
  null,
)

routerAdd(
  'POST',
  '/backend/v1/governance/norm-ack',
  (e) => {
    const info = e.requestInfo()
    const auth = info.auth
    if (!auth) {
      e.json(401, { error: 'Não autenticado' })
      return
    }
    const role = String(auth.get('role') || '')
    const body = info.body || {}
    const normaId = String(body.norma_id || '')
    const nome = String(body.user_name || '')
    const funcao = String(body.user_function || '')

    if (!normaId || !nome) {
      e.json(400, { error: 'Parâmetros inválidos: norma_id e user_name' })
      return
    }

    let norma = null
    try {
      norma = $app.findRecordById('governance_norms', normaId)
    } catch (_) {
      e.json(404, { error: 'Norma não encontrada' })
      return
    }
    if (role !== 'SUP' && String(norma.get('empresa')) !== String(auth.get('empresa_id'))) {
      e.json(403, { error: 'Norma de outra empresa' })
      return
    }

    const col = $app.findCollectionByNameOrId('governance_norm_acknowledgments')
    const ack = new Record(col)
    ack.set('empresa', norma.get('empresa'))
    ack.set('norma_id', normaId)
    ack.set('norma_version', String(norma.get('version') || ''))
    ack.set('user_name', nome)
    ack.set('user_function', funcao)
    ack.set('acknowledged_at', new Date().toISOString())
    $app.save(ack)
    e.json(200, { ok: true, ack: ack.id })
  },
  null,
)
