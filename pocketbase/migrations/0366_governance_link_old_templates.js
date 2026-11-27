// 0366_governance_link_old_templates.js — Vinculação em massa dos modelos
// antigos à governança documental AvatarSi.
//
// Percorre TODOS os document_templates de TODAS as empresas e, para cada um
// sem registro em governance_documents vinculado por template_id, cria esse
// registro com a MESMA semântica da criação automática da tela
// (garantirGovernanca + hook governance_numbering.js):
//   • doc_number: número único global (contador atômico na coleção numerations,
//     document_type = "governance_documents" — o MESMO contador do hook);
//   • doc_code: PROJETO_TIPO_NNN (sequência de 3 dígitos por empresa+projeto+tipo);
//   • version 0.1.0, status em_elaboracao, classification interno,
//     pending_review = true (NUNCA presumir aprovação de documento antigo).
//
// IDEMPOTENTE: verifica vínculo por template_id antes de criar — rodar de novo
// não duplica registros nem reatribui números. Não altera modelos existentes e
// não toca em documentos de governança que já existem. Migração aditiva.
//
// Nota JSVM: hooks onRecordCreateRequest NÃO disparam em app.save() feitos por
// migração — por isso o número é obtido aqui do MESMO contador atômico, sem
// risco de dupla numeração.
migrate(
  (app) => {
    // Guardas: coleções precisam existir (0365 cria as governance_*).
    let colDocs = null
    try {
      colDocs = app.findCollectionByNameOrId('governance_documents')
    } catch (err) {
      console.log('0366: coleção governance_documents indisponível: ' + err)
      return
    }
    let colNumerations = null
    try {
      colNumerations = app.findCollectionByNameOrId('numerations')
    } catch (err) {
      console.log('0366: coleção numerations indisponível: ' + err)
      return
    }

    // 1) Contador global atômico (mesmo mecanismo do hook governance_numbering.js)
    let counter = null
    try {
      counter = app.findFirstRecordByFilter('numerations', 'document_type = "governance_documents"')
    } catch (_) {
      counter = null
    }
    if (!counter) {
      counter = new Record(colNumerations)
      counter.set('document_type', 'governance_documents')
      counter.set('next_number', 0)
      app.save(counter)
    }
    let numeroAtual = Number(counter.get('next_number') || 0)

    // 2) Sequência de doc_code por empresa+projeto+tipo (partida = maior existente)
    const seqPorChave = {}
    try {
      const existentes = app.findRecordsByFilter(
        'governance_documents',
        "doc_code != ''",
        '',
        5000,
        0,
      )
      for (const d of existentes) {
        const partes = String(d.get('doc_code') || '').split('_')
        if (partes.length >= 3) {
          const chave = d.get('empresa') + '|' + partes.slice(0, partes.length - 1).join('_')
          const n = parseInt(partes[partes.length - 1], 10)
          if (!isNaN(n) && n > (seqPorChave[chave] || 0)) seqPorChave[chave] = n
        }
      }
    } catch (_) {}

    // 3) Percorre TODOS os templates; cria vínculo só para os sem documento
    let templates = []
    try {
      templates = app.findRecordsByFilter('document_templates', '', '-created', 5000, 0)
    } catch (err) {
      console.log('0366: document_templates indisponível: ' + err)
      return
    }

    let criados = 0
    for (const tpl of templates) {
      let jaTem = []
      try {
        jaTem = app.findRecordsByFilter(
          'governance_documents',
          'template_id = "' + tpl.id + '"',
          '',
          1,
          0,
        )
      } catch (_) {}
      if (jaTem.length > 0) continue // IDEMPOTÊNCIA: já vinculado, não toca

      // Resolve empresa: id direto, nome, ou empresa padrão
      let empId = String(tpl.get('company') || '')
      if (empId) {
        try {
          app.findRecordById('empresas', empId)
        } catch (_) {
          try {
            const porNome = app.findRecordsByFilter(
              'empresas',
              'name = "' + empId.replace(/"/g, '\\"') + '"',
              '',
              1,
              0,
            )
            empId = porNome.length > 0 ? porNome[0].id : ''
          } catch (_) {
            empId = ''
          }
        }
      }
      if (!empId) {
        try {
          const padrao = app.findRecordsByFilter('empresas', 'padrao = true', '', 1, 0)
          empId = padrao.length > 0 ? padrao[0].id : ''
        } catch (_) {}
      }
      if (!empId) continue // sem empresa resolvível: fica de fora do acervo

      const projeto = (
        String(tpl.get('category') || 'GER')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '') || 'GER'
      ).slice(0, 12)
      const tipo = 'MOP'
      numeroAtual += 1

      const chave = empId + '|' + projeto + '|' + tipo
      seqPorChave[chave] = (seqPorChave[chave] || 0) + 1

      const doc = new Record(colDocs)
      doc.set('empresa', empId)
      doc.set('title', String(tpl.get('name') || 'Documento sem título'))
      doc.set('template_id', tpl.id)
      doc.set('project_code', projeto)
      doc.set('type_code', tipo)
      doc.set('doc_code', projeto + '_' + tipo + '_' + String(seqPorChave[chave]).padStart(3, '0'))
      doc.set('doc_number', numeroAtual)
      doc.set('version_major', 0)
      doc.set('version_minor', 1)
      doc.set('version_patch', 0)
      doc.set('version', '0.1.0')
      doc.set('current_version', '')
      doc.set('status', 'em_elaboracao')
      doc.set('classification', 'interno')
      doc.set('pending_review', true)
      doc.set(
        'change_summary',
        'Vinculado em massa ao acervo de governança (migração 0366). Pendente de revisão e aprovação conforme governança.',
      )
      app.save(doc)
      criados += 1
    }

    // 4) Persiste o contador global uma única vez ao final (idempotente:
    //    segunda execução não cria nada e o contador permanece coerente)
    try {
      counter.set('next_number', numeroAtual)
      app.save(counter)
    } catch (err) {
      console.log('0366: falha ao persistir contador: ' + err)
    }
    console.log('0366: vinculação em massa concluída — ' + criados + ' documento(s) criado(s)')
  },
  (app) => {
    // Down: remove APENAS os documentos criados por esta migração (marcados
    // pelo change_summary), devolvendo o contador ao estado anterior.
    let removidos = []
    try {
      removidos = app.findRecordsByFilter(
        'governance_documents',
        'change_summary ~ "migração 0366"',
        '',
        5000,
        0,
      )
    } catch (_) {
      removidos = []
    }
    let maior = 0
    try {
      const restantes = app.findRecordsByFilter(
        'governance_documents',
        'doc_number > 0',
        '-doc_number',
        1,
        0,
      )
      if (restantes.length > 0) maior = restantes[0].get('doc_number') || 0
    } catch (_) {}
    for (const d of removidos) {
      try {
        app.delete(d)
      } catch (_) {}
    }
    try {
      const counter = app.findFirstRecordByFilter(
        'numerations',
        'document_type = "governance_documents"',
      )
      if (counter && Number(counter.get('next_number') || 0) > maior) {
        counter.set('next_number', maior)
        app.save(counter)
      }
    } catch (_) {}
  },
)
