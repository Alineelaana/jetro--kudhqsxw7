import type { CellData, CellValue, SheetData, WorkbookData } from '@/types/spreadsheet'

/**
 * Utilitários de coordenadas de célula (A1 <-> col 0, row 1)
 */
export function colIndexToLetter(colIndex: number): string {
  let temp = colIndex
  let letter = ''
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter
    temp = Math.floor(temp / 26) - 1
  }
  return letter
}

export function letterToColIndex(letter: string): number {
  const upper = letter.toUpperCase()
  let col = 0
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64)
  }
  return col - 1
}

export function parseCellAddress(
  address: string,
): { sheetName?: string; colIndex: number; rowIndex: number } | null {
  const clean = address.trim()
  let sheetName: string | undefined
  let cellRef = clean

  if (clean.includes('!')) {
    const parts = clean.split('!')
    sheetName = parts[0].replace(/^'|'$/g, '').trim()
    cellRef = parts[1].trim()
  }

  // Remove $ para referências absolutas $A$1
  const refWithoutAbsolute = cellRef.replace(/\$/g, '')
  const match = refWithoutAbsolute.match(/^([A-Za-z]+)([0-9]+)$/)
  if (!match) return null

  const colLetter = match[1]
  const rowNumber = parseInt(match[2], 10)
  return {
    sheetName,
    colIndex: letterToColIndex(colLetter),
    rowIndex: rowNumber,
  }
}

export function formatCellAddress(colIndex: number, rowIndex: number, sheetName?: string): string {
  const colLetter = colIndexToLetter(colIndex)
  if (sheetName) {
    return `'${sheetName}'!${colLetter}${rowIndex}`
  }
  return `${colLetter}${rowIndex}`
}

/**
 * Avaliador de expressões aritméticas e fórmulas do Excel
 */
export class SpreadsheetFormulaEngine {
  private workbook: WorkbookData
  private sheetMap: Map<string, SheetData>
  private sheetNameMap: Map<string, SheetData>

  constructor(workbook: WorkbookData) {
    this.workbook = workbook
    this.sheetMap = new Map()
    this.sheetNameMap = new Map()
    for (const s of workbook.sheets) {
      this.sheetMap.set(s.id, s)
      this.sheetNameMap.set(s.name.toLowerCase().trim(), s)
    }
  }

  /**
   * Recalcula todas as células de todas as abas respeitando dependências
   */
  public recalculateWorkbook(): WorkbookData {
    // 1. Limpa valores antigos calculados
    const newWorkbook: WorkbookData = {
      ...this.workbook,
      sheets: this.workbook.sheets.map((sheet) => {
        const newCells: Record<string, CellData> = {}
        for (const [key, cell] of Object.entries(sheet.cells)) {
          const raw = cell.raw ?? ''
          const isFormula = typeof raw === 'string' && raw.trim().startsWith('=')
          newCells[key] = {
            ...cell,
            raw,
            formula: isFormula ? raw.trim().slice(1) : undefined,
            computedValue: isFormula ? null : parseLiteralValue(raw),
            error: undefined,
          }
        }
        return { ...sheet, cells: newCells }
      }),
    }

    const engine = new SpreadsheetFormulaEngine(newWorkbook)

    // 2. Loop de resolução com proteção contra loop infinito (máx 10 passagens)
    const MAX_PASSES = 10
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      let anyChanged = false

      for (const sheet of newWorkbook.sheets) {
        for (const [cellKey, cell] of Object.entries(sheet.cells)) {
          if (!cell.formula) continue

          const previousVal = cell.computedValue
          const previousErr = cell.error

          try {
            const result = engine.evaluateFormula(cell.formula, sheet)
            cell.computedValue = result
            cell.error = undefined
          } catch (err) {
            cell.computedValue = null
            cell.error = err instanceof Error ? err.message : '#ERRO!'
          }

          if (cell.computedValue !== previousVal || cell.error !== previousErr) {
            anyChanged = true
          }
        }
      }

      if (!anyChanged) break
    }

    return newWorkbook
  }

  /**
   * Avalia uma fórmula isolada dentro do contexto de uma aba
   */
  public evaluateFormula(formula: string, currentSheet: SheetData, depth = 0): CellValue {
    if (depth > 20) {
      throw new Error('#REF! (Ciclo)')
    }

    const cleanFormula = formula.trim()

    // 1. Funções nativas Excel mais comuns
    const fnMatch = cleanFormula.match(/^([A-Za-z_]+)\((.*)\)$/s)
    if (fnMatch) {
      const fnName = fnMatch[1].toUpperCase()
      const argsRaw = splitFormulaArgs(fnMatch[2])

      switch (fnName) {
        case 'SOMA':
        case 'SUM': {
          const values = this.resolveRangeOrList(argsRaw, currentSheet, depth)
          return values.reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0)
        }
        case 'MEDIA':
        case 'AVERAGE': {
          const values = this.resolveRangeOrList(argsRaw, currentSheet, depth).filter(
            (v) => typeof v === 'number',
          ) as number[]
          if (values.length === 0) return 0
          const sum = values.reduce((acc, curr) => acc + curr, 0)
          return sum / values.length
        }
        case 'MAX':
        case 'MÁXIMO': {
          const values = this.resolveRangeOrList(argsRaw, currentSheet, depth).filter(
            (v) => typeof v === 'number',
          ) as number[]
          return values.length > 0 ? Math.max(...values) : 0
        }
        case 'MIN':
        case 'MÍNIMO': {
          const values = this.resolveRangeOrList(argsRaw, currentSheet, depth).filter(
            (v) => typeof v === 'number',
          ) as number[]
          return values.length > 0 ? Math.min(...values) : 0
        }
        case 'CONT.SE':
        case 'COUNTIF': {
          if (argsRaw.length < 2) return 0
          const rangeVals = this.resolveRangeOrList([argsRaw[0]], currentSheet, depth)
          const conditionRaw = argsRaw[1].trim()
          return countIfMatches(rangeVals, conditionRaw)
        }
        case 'SE':
        case 'IF': {
          if (argsRaw.length < 2) return null
          const condResult = this.evaluateSimpleExpression(argsRaw[0], currentSheet, depth)
          const isTrue = Boolean(condResult) && condResult !== 0 && condResult !== '0'
          if (isTrue) {
            return this.evaluateSimpleExpression(argsRaw[1], currentSheet, depth)
          }
          if (argsRaw.length >= 3) {
            return this.evaluateSimpleExpression(argsRaw[2], currentSheet, depth)
          }
          return false
        }
        case 'ARRED':
        case 'ROUND': {
          if (argsRaw.length < 1) return 0
          const val = Number(this.evaluateSimpleExpression(argsRaw[0], currentSheet, depth)) || 0
          const dec = argsRaw.length >= 2 ? parseInt(argsRaw[1].trim(), 10) || 0 : 0
          const factor = Math.pow(10, dec)
          return Math.round(val * factor) / factor
        }
        default:
          break
      }
    }

    // 2. Expressões aritméticas normais (+, -, *, /, parênteses, referências)
    return this.evaluateSimpleExpression(cleanFormula, currentSheet, depth)
  }

  /**
   * Avalia expressões aritméticas simples com operadores +, -, *, /, %, ^ e referências de células
   */
  private evaluateSimpleExpression(
    expr: string,
    currentSheet: SheetData,
    depth: number,
  ): CellValue {
    let clean = expr.trim()

    // Strings entre aspas
    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith("'") && clean.endsWith("'"))
    ) {
      return clean.slice(1, -1)
    }

    // Substitui referências de células por seus valores numéricos ou strings
    // Ex: "B3 * 1.2" ou "'Premissas'!B1" ou "B3 - C3 - D3"
    const refRegex = /('?[A-Za-z0-9_À-ÿ\s]+'?!|\b)([A-Za-z]+[0-9]+)\b/g

    const replaced = clean.replace(refRegex, (fullMatch, sheetPrefix, cellAddr) => {
      let targetSheet = currentSheet
      if (sheetPrefix && sheetPrefix.endsWith('!')) {
        const cleanSheetName = sheetPrefix.slice(0, -1).replace(/^'|'$/g, '').toLowerCase().trim()
        const found = this.sheetNameMap.get(cleanSheetName)
        if (found) {
          targetSheet = found
        } else {
          return '#REF!'
        }
      }

      const cellKey = cellAddr.toUpperCase()
      const targetCell = targetSheet.cells[cellKey]
      if (!targetCell) return '0'

      if (targetCell.error) return targetCell.error

      const val = targetCell.computedValue !== undefined ? targetCell.computedValue : targetCell.raw
      if (typeof val === 'number') {
        return val.toString()
      }
      if (typeof val === 'boolean') {
        return val ? '1' : '0'
      }
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(',', '.'))
        if (!Number.isNaN(num)) return num.toString()
        // Retorna como string segura para concatenação ou comparação
        return JSON.stringify(val)
      }
      return '0'
    })

    if (replaced.includes('#REF!')) {
      throw new Error('#REF!')
    }

    // Avaliação segura da expressão aritmética sanitizada
    return safeEvalArithmetic(replaced)
  }

  /**
   * Resolve lista de argumentos que podem incluir intervalos como "B3:B14" ou referências individuais
   */
  private resolveRangeOrList(args: string[], currentSheet: SheetData, depth: number): CellValue[] {
    const results: CellValue[] = []

    for (const arg of args) {
      const trimmed = arg.trim()
      if (trimmed.includes(':')) {
        // Range ex: "B3:B14" ou "'Sheet1'!B3:B14"
        const [startRef, endRef] = trimmed.split(':')
        const startParsed = parseCellAddress(startRef)
        const endParsed = parseCellAddress(endRef)

        if (startParsed && endParsed) {
          let targetSheet = currentSheet
          const sheetName = startParsed.sheetName || endParsed.sheetName
          if (sheetName) {
            const found = this.sheetNameMap.get(sheetName.toLowerCase().trim())
            if (found) targetSheet = found
          }

          const minCol = Math.min(startParsed.colIndex, endParsed.colIndex)
          const maxCol = Math.max(startParsed.colIndex, endParsed.colIndex)
          const minRow = Math.min(startParsed.rowIndex, endParsed.rowIndex)
          const maxRow = Math.max(startParsed.rowIndex, endParsed.rowIndex)

          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              const key = `${colIndexToLetter(c)}${r}`
              const cell = targetSheet.cells[key]
              const val =
                cell?.computedValue !== undefined
                  ? cell.computedValue
                  : parseLiteralValue(cell?.raw ?? '')
              results.push(val)
            }
          }
        }
      } else {
        const singleVal = this.evaluateSimpleExpression(trimmed, currentSheet, depth)
        results.push(singleVal)
      }
    }

    return results
  }
}

/**
 * Converte string literal em número, boolean ou texto
 */
function parseLiteralValue(raw: string): CellValue {
  if (raw === '' || raw === null || raw === undefined) return null
  const trimmed = raw.trim()
  if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'verdadeiro') return true
  if (trimmed.toLowerCase() === 'false' || trimmed.toLowerCase() === 'falso') return false

  // Trata números formatados em pt-BR (ex: "4,92" ou "1.250,50") ou padrão inglês
  const normalized = trimmed.replace(/\s/g, '')
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    return parseFloat(normalized)
  }
  if (/^-?\d+(,\d+)?$/.test(normalized)) {
    return parseFloat(normalized.replace(',', '.'))
  }
  if (/^-?\d{1,3}(\.\d{3})*,\d+$/.test(normalized)) {
    return parseFloat(normalized.replace(/\./g, '').replace(',', '.'))
  }

  return raw
}

/**
 * Separa argumentos de função respeitando parênteses e aspas
 */
function splitFormulaArgs(argsString: string): string[] {
  const args: string[] = []
  let current = ''
  let parenDepth = 0
  let inQuotes = false

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i]
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes
      current += char
    } else if (!inQuotes && (char === '(' || char === '[')) {
      parenDepth++
      current += char
    } else if (!inQuotes && (char === ')' || char === ']')) {
      parenDepth--
      current += char
    } else if (!inQuotes && parenDepth === 0 && (char === ';' || char === ',')) {
      args.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) {
    args.push(current.trim())
  }
  return args
}

/**
 * Suporte a CONT.SE (ex: "<0" para margens negativas)
 */
function countIfMatches(values: CellValue[], condition: string): number {
  const clean = condition.replace(/^["']|["']$/g, '').trim()
  let count = 0

  if (clean.startsWith('<=')) {
    const num = parseFloat(clean.slice(2).trim())
    return values.filter((v) => typeof v === 'number' && v <= num).length
  }
  if (clean.startsWith('>=')) {
    const num = parseFloat(clean.slice(2).trim())
    return values.filter((v) => typeof v === 'number' && v >= num).length
  }
  if (clean.startsWith('<')) {
    const num = parseFloat(clean.slice(1).trim())
    return values.filter((v) => typeof v === 'number' && v < num).length
  }
  if (clean.startsWith('>')) {
    const num = parseFloat(clean.slice(1).trim())
    return values.filter((v) => typeof v === 'number' && v > num).length
  }
  if (clean.startsWith('=')) {
    const target = clean.slice(1).trim()
    return values.filter((v) => String(v).toLowerCase() === target.toLowerCase()).length
  }

  // Igualdade direta
  for (const v of values) {
    if (String(v).toLowerCase() === clean.toLowerCase()) {
      count++
    }
  }
  return count
}

/**
 * Avaliador aritmético seguro baseado em tokenizador sem `eval` nem `Function`
 */
function safeEvalArithmetic(expr: string): CellValue {
  const sanitized = expr.replace(/\s+/g, '')

  // Se for apenas um número
  const numOnly = Number(sanitized)
  if (!Number.isNaN(numOnly) && sanitized !== '') {
    return numOnly
  }

  // Se contiver caracteres proibidos fora de matemática básica
  if (/[^0-9.+\-*/%^()eE<>=!&|"]/.test(sanitized)) {
    return expr // Retorna o texto se não for expressão estritamente numérica
  }

  try {
    // Parser recursivo simples de operadores (+, -, *, /, %, ^)
    return parseArithmeticExpression(sanitized)
  } catch {
    return '#VALOR!'
  }
}

function parseArithmeticExpression(str: string): number {
  let index = 0

  function peek(): string {
    return str[index] || ''
  }

  function get(): string {
    return str[index++] || ''
  }

  function parseNumber(): number {
    let numStr = ''
    if (peek() === '-') {
      numStr += get()
    }
    while (/[0-9.]/.test(peek())) {
      numStr += get()
    }
    if (!numStr || numStr === '-') {
      throw new Error('Número inválido')
    }
    return parseFloat(numStr)
  }

  function parseFactor(): number {
    if (peek() === '(') {
      get() // consume '('
      const val = parseAddSub()
      if (peek() === ')') {
        get() // consume ')'
      }
      return val
    }
    return parseNumber()
  }

  function parseMulDiv(): number {
    let left = parseFactor()
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = get()
      const right = parseFactor()
      if (op === '*') left = left * right
      else if (op === '/') {
        if (right === 0) throw new Error('#DIV/0!')
        left = left / right
      } else if (op === '%') {
        left = left % right
      }
    }
    return left
  }

  function parseAddSub(): number {
    let left = parseMulDiv()
    while (peek() === '+' || peek() === '-') {
      const op = get()
      const right = parseMulDiv()
      if (op === '+') left = left + right
      else if (op === '-') left = left - right
    }
    return left
  }

  const result = parseAddSub()
  return Number.isFinite(result) ? result : 0
}
