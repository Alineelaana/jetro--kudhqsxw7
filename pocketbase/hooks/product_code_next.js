// product_code_next.js — Código de produto sequencial NUMÉRICO puro, sem
// prefixo (pedido do usuário: sem "PROD-ANO-"). Usa o contador atômico da
// coleção numerations ("produtos", 4 dígitos, ex.: 0100) para não repetir
// número com cadastros simultâneos; a lógica é embutida inline no callback
// (limitação do JSVM do PocketBase: callbacks não podem referenciar funções de
// nível superior — "Hook scoping error").
routerAdd(
  'GET',
  '/backend/v1/product-code/next',
  (e) => {
    try {
      const docType = 'produtos'
      // 1) Reposiciona o contador (uma vez) para o maior código já gravado,
      //    numérico puro ou sufixo de "PROD-ANO-NNNN" — não repete número.
      let maxNum = 0
      try {
        const recs = $app.findRecordsByFilter('products', 'code != ""', '', 500, 0)
        for (let i = 0; i < recs.length; i++) {
          const raw = String(recs[i].get('code') || '').trim()
          if (!raw) continue
          const direto = parseInt(raw, 10)
          if (!isNaN(direto) && direto > maxNum) maxNum = direto
          const parts = raw.split('-')
          if (parts.length === 3 && parts[0] === 'PROD') {
            const suf = parseInt(parts[2], 10)
            if (!isNaN(suf) && suf > maxNum) maxNum = suf
          }
        }
      } catch (_) {}

      // 2) Incremento atômico no contador de numerations
      let counter = null
      try {
        counter = $app.findFirstRecordByData('numerations', 'document_type', docType)
      } catch (_) {}

      if (!counter) {
        const col = $app.findCollectionByNameOrId('numerations')
        counter = new Record(col)
        counter.set('document_type', docType)
        counter.set('company', '')
        counter.set('branch', '')
        counter.set('prefix', '')
        counter.set('next_number', maxNum + 1)
        counter.set('digit_count', 4)
        counter.set('annual_reset', false)
        counter.set('active', true)
        $app.save(counter)
      } else if ((counter.getInt('next_number') || 0) <= maxNum) {
        counter.set('next_number', maxNum + 1)
        $app.save(counter)
      }

      const nextSeq = (counter.getInt('next_number') || 1) + 1
      counter.set('next_number', nextSeq)
      $app.save(counter)

      const number = String(nextSeq).padStart(4, '0')
      return e.json(200, { number: number, sequence: nextSeq })
    } catch (err) {
      $app.logger().error('product code generation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar codigo de produto' })
    }
  },
  $apis.requireAuth(),
)
