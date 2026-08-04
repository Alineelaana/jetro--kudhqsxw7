export interface BankStatementRow {
  data: string
  descricao_bancaria: string
  documento: string
  valor: string
  tipo: string
  conta_bancaria?: string
}

export interface ImportSummary {
  total: number
  valid: number
  errors: number
  duplicates: number
  created: number
  errorLines: { line: number; error: string }[]
}

export interface ReconciliationSuggestion {
  type: 'receivable' | 'payable'
  id: string
  description: string
  value: string
  matchScore: number
}

export function parseOFX(text: string): BankStatementRow[] {
  const rows: BankStatementRow[] = []
  const transactions = text.split('<STMTTRN>').slice(1)

  for (const txn of transactions) {
    try {
      const dateMatch = txn.match(/<DTPOSTED>(\d{8})/)
      const amountMatch = txn.match(/<TRNAMT>([-\d.]+)/)
      const nameMatch = txn.match(/<NAME>([^<]+)/)
      const memoMatch = txn.match(/<MEMO>([^<]+)/)
      const checkNumMatch = txn.match(/<CHECKNUM>([^<]+)/)

      if (!dateMatch || !amountMatch) continue

      const rawDate = dateMatch[1]
      const date = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`
      const amount = parseFloat(amountMatch[1])
      const description = (nameMatch?.[1] || memoMatch?.[1] || 'Transação').trim()
      const doc = (checkNumMatch?.[1] || '').trim()

      rows.push({
        data: date,
        descricao_bancaria: description,
        documento: doc,
        valor: Math.abs(amount).toFixed(2),
        tipo: amount >= 0 ? 'Entrada' : 'Saída',
        conta_bancaria: '',
      })
    } catch {
      continue
    }
  }
  return rows
}

export function parseCSV(text: string): BankStatementRow[] {
  const rows: BankStatementRow[] = []
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return rows

  const delimiter = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase())

  for (const line of lines.slice(1)) {
    const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''))
    if (cols.length < 3) continue

    const dateIdx = headers.findIndex((h) => h.includes('data') || h.includes('date'))
    const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('histor'))
    const docIdx = headers.findIndex((h) => h.includes('doc') || h.includes('numero'))
    const valorIdx = headers.findIndex((h) => h.includes('valor') || h.includes('amount'))

    const rowData: BankStatementRow = {
      data: normalizeDate(dateIdx >= 0 ? cols[dateIdx] : cols[0]),
      descricao_bancaria: descIdx >= 0 ? cols[descIdx] : cols[1],
      documento: docIdx >= 0 ? cols[docIdx] : '',
      valor: '0',
      tipo: 'Saída',
      conta_bancaria: '',
    }

    const rawValor = valorIdx >= 0 ? cols[valorIdx] : cols[cols.length - 1]
    const numValor = parseFloat(
      rawValor
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, ''),
    )
    if (!isNaN(numValor)) {
      rowData.valor = Math.abs(numValor).toFixed(2)
      rowData.tipo = numValor >= 0 ? 'Entrada' : 'Saída'
    }
    if (rowData.data && rowData.descricao_bancaria) rows.push(rowData)
  }
  return rows
}

function normalizeDate(val: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10)
  const brMatch = val.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`
  return val
}

export function detectDuplicates(
  newRows: BankStatementRow[],
  existing: Array<Record<string, unknown>>,
): { unique: BankStatementRow[]; duplicates: BankStatementRow[] } {
  const unique: BankStatementRow[] = []
  const duplicates: BankStatementRow[] = []
  const seen = new Set(existing.map((e) => `${e.data}|${e.valor}|${e.documento || ''}`))
  const newSeen = new Set<string>()

  for (const row of newRows) {
    const key = `${row.data}|${row.valor}|${row.documento}`
    if (seen.has(key) || newSeen.has(key)) {
      duplicates.push(row)
    } else {
      unique.push(row)
      newSeen.add(key)
    }
  }
  return { unique, duplicates }
}

export function suggestCorrespondences(
  statement: BankStatementRow,
  receivables: Array<Record<string, unknown>>,
  payables: Array<Record<string, unknown>>,
): ReconciliationSuggestion[] {
  const suggestions: ReconciliationSuggestion[] = []
  const stmtValue = parseFloat(statement.valor) || 0

  for (const r of receivables) {
    const rValue = parseFloat(String(r.valor_original || '0')) || 0
    const score =
      rValue === stmtValue
        ? 100
        : Math.max(0, 100 - (Math.abs(rValue - stmtValue) / Math.max(stmtValue, 1)) * 100)
    if (score > 50) {
      suggestions.push({
        type: 'receivable',
        id: r.id as string,
        description: `Receber: ${r.cliente || ''} - ${r.numero_titulo || ''}`,
        value: String(r.valor_original || ''),
        matchScore: Math.round(score),
      })
    }
  }

  for (const p of payables) {
    const pValue = parseFloat(String(p.valor_original || '0')) || 0
    const score =
      pValue === stmtValue
        ? 100
        : Math.max(0, 100 - (Math.abs(pValue - stmtValue) / Math.max(stmtValue, 1)) * 100)
    if (score > 50) {
      suggestions.push({
        type: 'payable',
        id: p.id as string,
        description: `Pagar: ${p.fornecedor || ''} - ${p.numero_titulo || ''}`,
        value: String(p.valor_original || ''),
        matchScore: Math.round(score),
      })
    }
  }
  return suggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}
