// governance_numbering.js — Numeração atômica de documentos (padrão sales_numbers_next.js)
// onRecordCreateRequest de governance_documents:
//   • doc_number: número único em todo o Huram (contador atômico na coleção numerations)
//   • doc_code: PROJETO_TIPO_NNN (sequência de 3 dígitos por empresa+projeto+tipo)
//   • version inicial 0.1.0 (primeira minuta), status em_elaboracao
// onRecordUpdateRequest: bloqueia alteração de doc_number/doc_code por qualquer usuário.
// IMPORTANTE (JSVM): toda lógica INLINE nos callbacks (sem referências de nível superior).

onRecordCreateRequest((e) => {
  const record = e.record
  const colName = record.collection().name
  if (colName !== 'governance_documents') {
    e.next()
    return
  }

  const auth = e.requestInfo().auth
  const empresa = String(record.get('empresa') || '')
  const projeto = (
    String(record.get('project_code') || 'GER').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GER'
  ).slice(0, 12)
  const tipo = (
    String(record.get('type_code') || 'NGD').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'NGD'
  ).slice(0, 8)

  // ---------- número único global ----------
  let numero = 0
  try {
    const numerations = $app.findCollectionByNameOrId('numerations')
    let counter = null
    try {
      counter = $app.findFirstRecordByFilter(
        'numerations',
        'document_type = "governance_documents"',
      )
    } catch (_) {
      counter = null
    }
    if (!counter) {
      counter = new Record(numerations)
      counter.set('document_type', 'governance_documents')
      counter.set('next_number', 0)
      $app.save(counter)
    }
    const atual = Number(counter.get('next_number') || 0)
    numero = atual + 1
    counter.set('next_number', numero)
    $app.save(counter)
    record.set('doc_number', numero)
  } catch (err) {
    console.log('governance numbering: falha no contador: ' + err)
    numero = Date.now()
    record.set('doc_number', numero)
  }

  // ---------- código documental PROJETO_TIPO_NNN por empresa+projeto+tipo ----------
  let seq = 0
  try {
    const existentes = $app.findRecordsByFilter(
      'governance_documents',
      'empresa = "' +
        empresa.replace(/"/g, '\\"') +
        '" && project_code = "' +
        projeto +
        '" && type_code = "' +
        tipo +
        '"',
      '-doc_code',
      1000,
      0,
    )
    const padrao = new RegExp('^' + projeto + '_' + tipo + '_(\\d+)$')
    for (const d of existentes) {
      const m = padrao.exec(String(d.get('doc_code') || ''))
      if (m) {
        const n = parseInt(m[1], 10)
        if (n > seq) seq = n
      }
    }
  } catch (_) {}
  seq += 1
  const codigo = projeto + '_' + tipo + '_' + String(seq).padStart(3, '0')
  record.set('doc_code', codigo)

  // ---------- versão inicial e defaults de governança ----------
  if (!record.get('version_major')) record.set('version_major', 0)
  if (!record.get('version_minor')) record.set('version_minor', 1)
  if (!record.get('version_patch')) record.set('version_patch', 0)
  record.set('version', '0.1.0')
  if (!record.get('status')) record.set('status', 'em_elaboracao')
  if (!record.get('classification')) record.set('classification', 'interno')
  if (!record.get('pending_review')) record.set('pending_review', true)
  if (auth) {
    if (!record.get('author')) {
      record.set('author', String(auth.get('name') || auth.get('email') || ''))
    }
  }

  e.next()
}, 'governance_documents')

// Bloqueia qualquer tentativa de alterar número/código de um documento já criado.
// SUP também não altera — número é permanente. Rotação só via migração/banco.
onRecordUpdateRequest((e) => {
  const record = e.record
  const original = record.original()
  if (!original) {
    e.next()
    return
  }
  const numeroNovo = Number(record.get('doc_number') || 0)
  const numeroOriginal = Number(original.get('doc_number') || 0)
  const codigoNovo = String(record.get('doc_code') || '')
  const codigoOriginal = String(original.get('doc_code') || '')

  if (
    (numeroOriginal !== 0 && numeroNovo !== numeroOriginal) ||
    (codigoOriginal !== '' && codigoNovo !== codigoOriginal)
  ) {
    throw new BadRequestError(
      'O número único e o código do documento são permanentes e não podem ser alterados.',
    )
  }
  e.next()
}, 'governance_documents')
