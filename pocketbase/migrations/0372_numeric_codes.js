// 0372_numeric_codes.js — Numeração de cadastros 100% numérica, sequencial e
// sem prefixo (pedido do usuário: "CLI-2026-000001" vira "0001").
// Idempotente e aditiva: ajusta os contadores da coleção numerations
// (mecanismo atômico de numeração já existente) para prefixo vazio,
// annual_reset falso e dígitos 4 (cadastros) / 6 (pedidos), e recalcula o
// contador de clientes a partir dos códigos já gravados para não repetir
// numeração. Códigos antigos NÃO são reescritos.
migrate(
  (app) => {
    let col
    try {
      col = app.findCollectionByNameOrId('numerations')
    } catch (err) {
      console.log('0372: coleção numerations indisponível: ' + err)
      return
    }

    const alvos = [
      { document_type: 'clientes', digit_count: 4 },
      { document_type: 'fornecedores', digit_count: 4 },
      { document_type: 'produtos', digit_count: 4 },
      { document_type: 'pedidos_venda', digit_count: 6 },
      { document_type: 'pedidos_compra', digit_count: 6 },
    ]

    for (let i = 0; i < alvos.length; i++) {
      const alvo = alvos[i]
      try {
        let counter = null
        try {
          counter = app.findFirstRecordByData('numerations', 'document_type', alvo.document_type)
        } catch (_) {}
        if (!counter) {
          counter = new Record(col)
          counter.set('document_type', alvo.document_type)
          counter.set('company', '')
          counter.set('branch', '')
          counter.set('prefix', '')
          counter.set('next_number', 1)
          counter.set('digit_count', alvo.digit_count)
          counter.set('annual_reset', false)
          counter.set('active', true)
          app.save(counter)
          console.log('0372: contador criado para ' + alvo.document_type)
          continue
        }
        if (counter.getString('prefix') !== '') {
          counter.set('prefix', '')
        }
        counter.set('annual_reset', false)
        const dc = counter.getInt('digit_count') || 0
        if (dc !== alvo.digit_count) counter.set('digit_count', alvo.digit_count)
        app.save(counter)
      } catch (err) {
        console.log('0372: falha ao ajustar contador ' + alvo.document_type + ': ' + err)
      }
    }

    // Contador de clientes: continua a partir do maior código já gravado
    // (numérico puro ou sufixo de "CLI-ANO-NNNNNN") para não repetir número.
    try {
      const counter = app.findFirstRecordByData('numerations', 'document_type', 'clientes')
      const todos = app.findRecordsByFilter('partners', 'codigo_oficial != ""', '', 500, 0)
      let maxN = 0
      for (let j = 0; j < todos.length; j++) {
        const cod = (todos[j].getString('codigo_oficial') || '').trim()
        if (!cod) continue
        const direto = parseInt(cod, 10)
        if (!isNaN(direto) && direto > maxN) maxN = direto
        const partes = cod.split('-')
        if (partes.length === 3) {
          const suf = parseInt(partes[2], 10)
          if (!isNaN(suf) && suf > maxN) maxN = suf
        }
      }
      if (maxN >= 1) {
        const atual = counter.getInt('next_number') || 1
        if (atual <= maxN) {
          counter.set('next_number', maxN + 1)
          app.save(counter)
          console.log('0372: contador de clientes reposicionado para ' + (maxN + 1))
        }
      }
    } catch (err) {
      console.log('0372: falha ao reposicionar contador de clientes: ' + err)
    }
  },
  (app) => {
    // No-op: correção aditiva, nada a reverter.
  },
)
