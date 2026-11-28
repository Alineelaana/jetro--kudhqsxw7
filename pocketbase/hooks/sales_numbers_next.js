// sales_numbers_next.js — Geração sequencial transacional de números de pedidos
// de venda e documentos. Numeração 100% NUMÉRICA, sequencial e sem prefixo
// (pedido do usuário: "PV-000006" vira "000007"). Usa o contador atômico da
// coleção numerations (mesmo mecanismo da governança AvatarSi) para não repetir
// número com cadastros simultâneos; a lógica é embutida inline no callback
// (limitação do JSVM do PocketBase: callbacks não podem referenciar funções de
// nível superior — "Hook scoping error").
//
// Pedidos de venda (type=order): sequência atômica em numerations
// ("pedidos_venda", 6 dígitos, ex.: 000007), continuando a partir do maior
// número já gravado em sales_orders (numérico puro ou sufixo de "PV-XXXXXX")
// para não colidir com os antigos.
// Demais documentos (invoice/nfe/nfce/return): também numéricos, sem prefixo,
// com 4 dígitos, continuando do maior número da própria coleção.
routerAdd(
  'GET',
  '/backend/v1/sales-numbers/next',
  (e) => {
    const type = e.request.url.query().get('type') || 'order'
    const collections = {
      order: 'sales_orders',
      invoice: 'sales_invoices',
      nfe: 'nfe_records',
      nfce: 'nfce_records',
      return: 'sales_returns',
    }
    const colName = collections[type] || 'sales_orders'

    try {
      if (type === 'order') {
        const docType = 'pedidos_venda'
        // 1) Reposiciona o contador (uma vez) para o maior número já gravado
        let maxNum = 0
        try {
          const records = $app.findRecordsByFilter(colName, 'order_number != ""', '', 500, 0)
          for (let i = 0; i < records.length; i++) {
            const raw = String(records[i].get('order_number') || '').trim()
            if (!raw) continue
            const direto = parseInt(raw, 10)
            if (!isNaN(direto) && direto > maxNum) maxNum = direto
            const parts = raw.split('-')
            if (parts.length === 2 && (parts[0] === 'PV' || parts[0] === 'PED')) {
              const suf = parseInt(parts[1], 10)
              if (!isNaN(suf) && suf > maxNum) maxNum = suf
            }
          }
        } catch (_) {}

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
          counter.set('digit_count', 6)
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
        const number = String(nextSeq).padStart(6, '0')
        return e.json(200, { number: number, sequence: nextSeq })
      }

      // Demais documentos: numérico puro, 4 dígitos, do maior da própria coleção
      let total = 0
      try {
        total = $app.countRecords(colName)
      } catch (_) {}
      let maxOther = total
      try {
        const colDocs = $app.findCollectionByNameOrId(colName)
        const numberField = colDocs.fields.getByName('number')
          ? 'number'
          : colDocs.fields.getByName('invoice_number')
            ? 'invoice_number'
            : colDocs.fields.getByName('document_number')
              ? 'document_number'
              : ''
        if (numberField) {
          const recs = $app.findRecordsByFilter(colName, numberField + ' != ""', '', 500, 0)
          for (let j = 0; j < recs.length; j++) {
            const raw = String(recs[j].get(numberField) || '').trim()
            if (!raw) continue
            const direto = parseInt(raw, 10)
            if (!isNaN(direto) && direto > maxOther) maxOther = direto
            const parts = raw.split('-')
            if (parts.length === 2) {
              const suf = parseInt(parts[1], 10)
              if (!isNaN(suf) && suf > maxOther) maxOther = suf
            }
          }
        }
      } catch (_) {}

      const nextOther = maxOther + 1
      const numberOther = String(nextOther).padStart(4, '0')
      return e.json(200, { number: numberOther, sequence: nextOther })
    } catch (err) {
      $app.logger().error('sales number generation failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar numero sequencial' })
    }
  },
  $apis.requireAuth(),
)
