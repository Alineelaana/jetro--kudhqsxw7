// 0364_governance_numeration.js — Contador global do acervo de governança.
// A coleção numerations usa um select obrigatório document_type: o valor
// "governance_documents" é adicionado às opções e o registro do contador é
// garantido (idempotente) para o hook governance_numbering.js.
migrate(
  (app) => {
    let col
    try {
      col = app.findCollectionByNameOrId('numerations')
    } catch (err) {
      console.log('0364: coleção numerations indisponível: ' + err)
      return
    }

    // 1) adiciona o valor de select (idempotente)
    try {
      const field = col.fields.getByName('document_type')
      const values = Array.from(field.values || [])
      if (!values.includes('governance_documents')) {
        values.push('governance_documents')
        field.values = values
        app.save(col)
        console.log('0364: valor governance_documents adicionado a numerations.document_type')
      }
    } catch (err) {
      console.log('0364: falha ao atualizar select document_type: ' + err)
    }

    // 2) garante o registro do contador global (idempotente)
    try {
      const existentes = app.findRecordsByFilter(
        'numerations',
        'document_type = "governance_documents"',
        '',
        1,
        0,
      )
      if (existentes.length === 0) {
        const rec = new Record(col)
        rec.set('document_type', 'governance_documents')
        rec.set('company', '')
        rec.set('branch', '')
        rec.set('prefix', '')
        rec.set('next_number', 0)
        rec.set('digit_count', 6)
        rec.set('annual_reset', false)
        rec.set('active', true)
        app.save(rec)
        console.log('0364: contador global governance_documents criado')
      }
    } catch (err) {
      console.log('0364: falha ao garantir contador: ' + err)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('numerations')
      const field = col.fields.getByName('document_type')
      const values = Array.from(field.values || []).filter(
        (v) => v !== 'governance_documents',
      )
      field.values = values
      app.save(col)
    } catch (_) {}
    try {
      const counters = app.findRecordsByFilter(
        'numerations',
        'document_type = "governance_documents"',
        '',
        10,
        0,
      )
      for (const c of counters) {
        try {
          if (Number(c.get('next_number') || 0) === 0) app.delete(c)
        } catch (_) {}
      }
    } catch (_) {}
  },
)
