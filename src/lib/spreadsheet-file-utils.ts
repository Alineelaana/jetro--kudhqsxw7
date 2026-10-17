import type { CellData, SheetData, WorkbookData } from '@/types/spreadsheet'
import { colIndexToLetter } from '@/lib/spreadsheet-formula-engine'

/**
 * Informações e metadados de uma aba extraída do arquivo Excel
 */
export interface ExtractedSheetInfo {
  index: number
  sheetId: string
  name: string
  sheetPath: string
  cells: Record<string, CellData>
  maxCol: number
  maxRow: number
  totalNonEmptyCells: number
  totalNonEmptyRows: number
  // Matriz 2D de strings para análise estrutural (linha 1-based, col 0-based)
  rawMatrix: string[][]
  // Fórmulas detectadas nas células
  formulaCount: number
  unsupportedFormulas: string[]
}

export interface ExtractedWorkbook {
  sheetNames: string[]
  sheets: ExtractedSheetInfo[]
}

/**
 * Converte um arquivo .xlsx ou .csv em WorkbookData estruturado
 */
export async function parseFileToWorkbook(file: File): Promise<WorkbookData> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    const text = await file.text()
    const firstLine = text.split('\n')[0] || ''
    const sep =
      (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ','

    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
    const matrix = lines.map((l) => {
      const cells: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < l.length; i++) {
        const char = l[i]
        if (char === '"') inQuotes = !inQuotes
        else if (char === sep && !inQuotes) {
          cells.push(current.trim().replace(/^"|"$/g, ''))
          current = ''
        } else {
          current += char
        }
      }
      cells.push(current.trim().replace(/^"|"$/g, ''))
      return cells
    })

    return matrixToSingleSheetWorkbook(matrix, file.name.replace(/\.[^/.]+$/, ''))
  }

  // Arquivo .xlsx: descompacta o contêiner ZIP no browser
  const buffer = await file.arrayBuffer()
  const extracted = await extractFullWorkbookFromXlsxBuffer(buffer)

  if (extracted.sheets.length === 0) {
    throw new Error('Não foi possível extrair nenhuma aba válida do arquivo Excel.')
  }

  const sheets: SheetData[] = extracted.sheets.map((s, idx) => ({
    id: `sheet-${idx + 1}`,
    name: s.name,
    cells: s.cells,
    columns: Array.from({ length: Math.max(s.maxCol + 3, 15) }, (_, i) => ({
      id: colIndexToLetter(i),
      width: i === 0 ? 240 : 130,
    })),
    rowsCount: Math.max(s.maxRow + 10, 50),
    order: idx,
  }))

  return {
    sheets,
    activeSheetIndex: 0,
  }
}

/**
 * Converte matriz de strings em uma aba
 */
function matrixToSingleSheetWorkbook(matrix: string[][], sheetName = 'Planilha1'): WorkbookData {
  const cells: SheetData['cells'] = {}
  const maxCols = Math.max(...matrix.map((row) => row.length), 10)
  const rowsCount = Math.max(matrix.length + 10, 50)

  matrix.forEach((row, rowIdx) => {
    const r = rowIdx + 1
    row.forEach((val, colIdx) => {
      if (val !== undefined && val !== '') {
        const colLetter = colIndexToLetter(colIdx)
        const isFormula = val.startsWith('=')
        cells[`${colLetter}${r}`] = {
          raw: val,
          formula: isFormula ? val.slice(1) : undefined,
          style: rowIdx === 0 ? { bold: true, align: 'center', bgColor: '#f1f5f9' } : undefined,
        }
      }
    })
  })

  const columns = Array.from({ length: Math.max(maxCols, 15) }, (_, i) => ({
    id: colIndexToLetter(i),
    width: i === 0 ? 220 : 130,
  }))

  const sheet: SheetData = {
    id: 'sheet-1',
    name: sheetName,
    cells,
    columns,
    rowsCount,
    order: 0,
  }

  return {
    sheets: [sheet],
    activeSheetIndex: 0,
  }
}

/**
 * Extrai todas as abas e dados detalhados de um buffer XLSX
 */
export async function extractFullWorkbookFromXlsxBuffer(
  buffer: ArrayBuffer,
): Promise<ExtractedWorkbook> {
  const bytes = new Uint8Array(buffer)
  const files = await readZipEntries(bytes)

  // 1. Lê workbook.xml e rels do workbook para mapear sheetId -> caminho do arquivo .xml
  const workbookXml = files.get('xl/workbook.xml') || ''
  const workbookRelsXml = files.get('xl/_rels/workbook.xml.rels') || ''

  const sheetDefinitions = parseWorkbookXmlSheetDefinitions(workbookXml, workbookRelsXml)

  // 2. Lê sharedStrings.xml
  const sharedStringsXml = files.get('xl/sharedstrings.xml') || ''
  const sharedStrings = parseSharedStrings(sharedStringsXml)

  // 3. Lê cada worksheet mapeada ou busca por fallback
  const sheets: ExtractedSheetInfo[] = []

  let idx = 0
  for (const def of sheetDefinitions) {
    const cleanPath = def.targetPath.toLowerCase().replace(/\\/g, '/')
    let sheetXml = files.get(cleanPath)

    if (!sheetXml) {
      // Tenta caminhos alternativos
      const alt1 = `xl/worksheets/sheet${idx + 1}.xml`
      const alt2 = `worksheets/sheet${idx + 1}.xml`
      sheetXml = files.get(alt1) || files.get(alt2)
    }

    if (sheetXml) {
      const parsed = parseWorksheetXml(sheetXml, sharedStrings)
      sheets.push({
        index: idx,
        sheetId: def.sheetId || `sheet-${idx + 1}`,
        name: def.name,
        sheetPath: def.targetPath,
        ...parsed,
      })
      idx++
    }
  }

  // Fallback caso workbook.xml não liste sheets ou caminhos sejam diferentes
  if (sheets.length === 0) {
    let sheetIndex = 1
    while (true) {
      const sheetPath = `xl/worksheets/sheet${sheetIndex}.xml`
      const sheetXml = files.get(sheetPath)
      if (!sheetXml) break

      const name = `Aba ${sheetIndex}`
      const parsed = parseWorksheetXml(sheetXml, sharedStrings)

      sheets.push({
        index: sheetIndex - 1,
        sheetId: `sheet-${sheetIndex}`,
        name,
        sheetPath,
        ...parsed,
      })

      sheetIndex++
    }
  }

  return {
    sheetNames: sheets.map((s) => s.name),
    sheets,
  }
}

/**
 * Lê definições de abas do workbook.xml correlacionando com xl/_rels/workbook.xml.rels
 */
interface SheetDef {
  name: string
  sheetId: string
  rId: string
  targetPath: string
}

function parseWorkbookXmlSheetDefinitions(
  workbookXml: string,
  workbookRelsXml: string,
): SheetDef[] {
  const relsMap = new Map<string, string>() // rId -> targetPath
  if (workbookRelsXml) {
    const relMatches = workbookRelsXml.matchAll(
      /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g,
    )
    for (const m of relMatches) {
      const rId = m[1]
      let target = m[2]
      if (!target.startsWith('xl/') && !target.startsWith('/')) {
        target = `xl/${target}`
      }
      relsMap.set(rId, target.replace(/^\//, ''))
    }
  }

  const defs: SheetDef[] = []
  const sheetMatches = workbookXml.matchAll(
    /<sheet[^>]+name="([^"]+)"[^>]+sheetId="([^"]+)"[^>]+r:id="([^"]+)"/g,
  )

  for (const m of sheetMatches) {
    const name = unescapeXml(m[1])
    const sheetId = m[2]
    const rId = m[3]
    const target = relsMap.get(rId) || `xl/worksheets/sheet${defs.length + 1}.xml`
    defs.push({ name, sheetId, rId, targetPath: target })
  }

  if (defs.length === 0) {
    // Tenta formato com atributos em ordem diferente
    const looseMatches = workbookXml.matchAll(/<sheet\s+([^>]+)\/?>/g)
    let counter = 1
    for (const lm of looseMatches) {
      const attrs = lm[1]
      const nameMatch = attrs.match(/name="([^"]+)"/)
      const sheetIdMatch = attrs.match(/sheetId="([^"]+)"/)
      const rIdMatch = attrs.match(/r:id="([^"]+)"/)

      if (nameMatch) {
        const name = unescapeXml(nameMatch[1])
        const sheetId = sheetIdMatch ? sheetIdMatch[1] : String(counter)
        const rId = rIdMatch ? rIdMatch[1] : `rId${counter}`
        const target = relsMap.get(rId) || `xl/worksheets/sheet${counter}.xml`
        defs.push({ name, sheetId, rId, targetPath: target })
        counter++
      }
    }
  }

  return defs
}

function parseSharedStrings(xml: string): string[] {
  if (!xml) return []
  const strings: string[] = []
  const siMatches = xml.matchAll(/<si>(.*?)<\/si>/gs)
  for (const si of siMatches) {
    const inner = si[1]
    const textMatches = inner.matchAll(/<t[^>]*>(.*?)<\/t>/gs)
    let fullText = ''
    for (const t of textMatches) {
      fullText += t[1]
    }
    strings.push(unescapeXml(fullText))
  }
  return strings
}

/**
 * Funções suportadas pela SpreadsheetFormulaEngine
 */
const SUPPORTED_FORMULA_FUNCTIONS = new Set([
  'SOMA',
  'SUM',
  'MEDIA',
  'AVERAGE',
  'MAX',
  'MÁXIMO',
  'MIN',
  'MÍNIMO',
  'CONT.SE',
  'COUNTIF',
  'SE',
  'IF',
  'ARRED',
  'ROUND',
])

function checkFormulaSupport(formula: string): { isSupported: boolean; fnName?: string } {
  const clean = formula.trim()
  const fnMatch = clean.match(/^([A-Za-z_À-ÿ]+)\(/)
  if (!fnMatch) {
    // É expressão puramente aritmética (+, -, *, /, etc.)
    return { isSupported: true }
  }

  const fnName = fnMatch[1].toUpperCase()
  if (SUPPORTED_FORMULA_FUNCTIONS.has(fnName)) {
    return { isSupported: true, fnName }
  }
  return { isSupported: false, fnName }
}

function parseWorksheetXml(
  xml: string,
  sharedStrings: string[],
): {
  cells: SheetData['cells']
  maxCol: number
  maxRow: number
  totalNonEmptyCells: number
  totalNonEmptyRows: number
  rawMatrix: string[][]
  formulaCount: number
  unsupportedFormulas: string[]
} {
  const cells: SheetData['cells'] = {}
  let maxCol = 5
  let maxRow = 20
  let totalNonEmptyCells = 0
  let formulaCount = 0
  const unsupportedFormulasSet = new Set<string>()

  // Matriz de linhas 1-based (índice 0 não usado ou deixado vazio)
  const rowMap = new Map<number, Map<number, string>>()

  // Localiza todas as linhas e células
  const cellMatches = xml.matchAll(/<c\s+r="([A-Z0-9]+)"([^>]*)>(.*?)<\/c>/gs)

  for (const m of cellMatches) {
    const cellRef = m[1].toUpperCase()
    const attrs = m[2]
    const content = m[3]

    const typeMatch = attrs.match(/t="([^"]+)"/)
    const cellType = typeMatch ? typeMatch[1] : ''

    // Fórmula: <f>...</f>
    const fMatch = content.match(/<f[^>]*>(.*?)<\/f>/s)
    let formula = fMatch ? unescapeXml(fMatch[1]) : undefined

    // Valor pré-calculado pelo Excel: <v>...</v>
    const vMatch = content.match(/<v[^>]*>(.*?)<\/v>/s)
    let valStr = vMatch ? unescapeXml(vMatch[1]) : ''

    // Inline string: <is><t>...</t></is>
    const isMatch = content.match(/<is>.*?<t[^>]*>(.*?)<\/t>.*?<\/is>/s)
    if (isMatch && !valStr) {
      valStr = unescapeXml(isMatch[1])
    }

    if (cellType === 's') {
      const idx = parseInt(valStr, 10)
      if (!Number.isNaN(idx) && sharedStrings[idx] !== undefined) {
        valStr = sharedStrings[idx]
      }
    } else if (cellType === 'b') {
      valStr = valStr === '1' ? 'VERDADEIRO' : 'FALSO'
    }

    // Coordenadas
    const colLetters = cellRef.replace(/[0-9]/g, '')
    const rowNum = parseInt(cellRef.replace(/[A-Z]/g, ''), 10)
    let colIdx = 0
    for (let i = 0; i < colLetters.length; i++) {
      colIdx = colIdx * 26 + (colLetters.charCodeAt(i) - 64)
    }
    colIdx -= 1

    if (colIdx > maxCol) maxCol = colIdx
    if (rowNum > maxRow) maxRow = rowNum

    // Salva na matriz para processamento de cabeçalhos/seções
    if (!rowMap.has(rowNum)) {
      rowMap.set(rowNum, new Map<number, string>())
    }
    const cellValueForMatrix = valStr !== '' ? valStr : formula ? `=${formula}` : ''
    if (cellValueForMatrix !== '') {
      rowMap.get(rowNum)!.set(colIdx, cellValueForMatrix)
    }

    // Validação de suporte a fórmulas da engine
    let cellError: string | undefined
    if (formula) {
      formulaCount++
      const { isSupported, fnName } = checkFormulaSupport(formula)
      if (!isSupported && fnName) {
        unsupportedFormulasSet.add(fnName)
        cellError = '#VALOR!' // Sinaliza função do Excel não suportada
      }
    }

    // Detecta se é código longo (EAN/DUN) ou texto puro
    // Se a célula não tem fórmula e é um código EAN/DUN (13 ou 14 dígitos), trata como string pura
    const isEanOrDun = /^\d{13,14}$/.test(valStr.trim())

    const raw = formula ? `=${formula}` : valStr

    if (raw !== '') {
      totalNonEmptyCells++
    }

    cells[cellRef] = {
      raw,
      formula: cellError ? undefined : formula,
      computedValue: isEanOrDun ? valStr.trim() : undefined,
      error: cellError,
      style: rowNum <= 2 ? { bold: true } : undefined,
    }
  }

  // Constrói rawMatrix normalizada
  const rawMatrix: string[][] = []
  for (let r = 1; r <= maxRow; r++) {
    const rowValues: string[] = []
    const cols = rowMap.get(r)
    for (let c = 0; c <= maxCol; c++) {
      rowValues.push(cols?.get(c) || '')
    }
    rawMatrix.push(rowValues)
  }

  const nonEmptyRowsCount = rawMatrix.filter((row) => row.some((c) => c.trim() !== '')).length

  return {
    cells,
    maxCol,
    maxRow,
    totalNonEmptyCells,
    totalNonEmptyRows: nonEmptyRowsCount,
    rawMatrix,
    formulaCount,
    unsupportedFormulas: Array.from(unsupportedFormulasSet),
  }
}

function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

/**
 * Descompactador ZIP puro usando DecompressionStream ('deflate-raw')
 */
async function readZipEntries(bytes: Uint8Array): Promise<Map<string, string>> {
  const files = new Map<string, string>()
  const textDecoder = new TextDecoder('utf-8')
  let offset = 0

  while (offset < bytes.length - 30) {
    // Assinatura do Local File Header: 0x04034b50
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x03 &&
      bytes[offset + 3] === 0x04
    ) {
      const method = bytes[offset + 8] | (bytes[offset + 9] << 8)
      const compressedSize =
        bytes[offset + 18] |
        (bytes[offset + 19] << 8) |
        (bytes[offset + 20] << 16) |
        (bytes[offset + 21] << 24)
      const fileNameLen = bytes[offset + 26] | (bytes[offset + 27] << 8)
      const extraLen = bytes[offset + 28] | (bytes[offset + 29] << 8)

      const nameBytes = bytes.slice(offset + 30, offset + 30 + fileNameLen)
      const fileName = textDecoder.decode(nameBytes).toLowerCase()

      const dataStart = offset + 30 + fileNameLen + extraLen
      const compressedData = bytes.slice(dataStart, dataStart + compressedSize)

      if (method === 0) {
        // Sem compressão
        files.set(fileName, textDecoder.decode(compressedData))
      } else if (method === 8) {
        // Deflate
        try {
          const ds = new DecompressionStream('deflate-raw')
          const writer = ds.writable.getWriter()
          writer.write(compressedData)
          writer.close()
          const ab = await new Response(ds.readable).arrayBuffer()
          files.set(fileName, textDecoder.decode(ab))
        } catch {
          /* intentionally ignored */
        }
      }

      offset = dataStart + compressedSize
    } else {
      offset++
    }
  }

  return files
}

/**
 * Exportador de WorkbookData completo para Excel (.xlsx) com múltiplas abas e fórmulas
 */
export async function exportWorkbookToExcel(
  workbook: WorkbookData,
  filename = 'planilha_jetro.xlsx',
) {
  const encoder = new TextEncoder()
  const zipParts: Array<{ name: string; data: Uint8Array }> = []

  // 1. [Content_Types].xml
  let sheetTypesXml = ''
  workbook.sheets.forEach((_, idx) => {
    sheetTypesXml += `<Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  })

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetTypesXml}
</Types>`
  zipParts.push({ name: '[Content_Types].xml', data: encoder.encode(contentTypesXml) })

  // 2. _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  zipParts.push({ name: '_rels/.rels', data: encoder.encode(rootRelsXml) })

  // 3. xl/_rels/workbook.xml.rels
  let wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`
  workbook.sheets.forEach((_, idx) => {
    wbRelsXml += `<Relationship Id="rIdSheet${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`
  })
  wbRelsXml += `</Relationships>`
  zipParts.push({ name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(wbRelsXml) })

  // 4. xl/workbook.xml
  let sheetsTag = ''
  workbook.sheets.forEach((s, idx) => {
    sheetsTag += `<sheet name="${escapeXml(s.name)}" sheetId="${idx + 1}" r:id="rIdSheet${idx + 1}"/>`
  })
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheetsTag}
  </sheets>
</workbook>`
  zipParts.push({ name: 'xl/workbook.xml', data: encoder.encode(workbookXml) })

  // 5. xl/styles.xml
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/></border>
  </borders>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`
  zipParts.push({ name: 'xl/styles.xml', data: encoder.encode(stylesXml) })

  // 6. xl/worksheets/sheetN.xml para cada aba (preservando fórmulas e valores calculados)
  workbook.sheets.forEach((sheet, idx) => {
    let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>`

    // Agrupa células por linha
    const cellsByRow: Record<number, Array<{ col: string; cell: SheetData['cells'][string] }>> = {}
    for (const [key, cell] of Object.entries(sheet.cells)) {
      const match = key.match(/^([A-Z]+)([0-9]+)$/)
      if (!match) continue
      const col = match[1]
      const r = parseInt(match[2], 10)
      if (!cellsByRow[r]) cellsByRow[r] = []
      cellsByRow[r].push({ col, cell })
    }

    const sortedRows = Object.keys(cellsByRow)
      .map(Number)
      .sort((a, b) => a - b)

    for (const r of sortedRows) {
      sheetXml += `<row r="${r}">`
      const items = cellsByRow[r].sort((a, b) => a.col.localeCompare(b.col))
      for (const { col, cell } of items) {
        const addr = `${col}${r}`
        const isBold = cell.style?.bold ? ' s="1"' : ''

        if (cell.formula) {
          // Salva com fórmula real do Excel e resultado pré-calculado
          const compVal =
            cell.computedValue !== null && cell.computedValue !== undefined
              ? cell.computedValue
              : ''
          sheetXml += `<c r="${addr}"${isBold}><f>${escapeXml(cell.formula)}</f><v>${escapeXml(String(compVal))}</v></c>`
        } else {
          const num =
            typeof cell.computedValue === 'number'
              ? cell.computedValue
              : parseFloat(String(cell.raw).replace(',', '.'))
          if (!Number.isNaN(num) && typeof cell.computedValue === 'number') {
            sheetXml += `<c r="${addr}"${isBold}><v>${num}</v></c>`
          } else {
            sheetXml += `<c r="${addr}" t="inlineStr"${isBold}><is><t>${escapeXml(String(cell.raw ?? ''))}</t></is></c>`
          }
        }
      }
      sheetXml += `</row>`
    }

    sheetXml += `</sheetData></worksheet>`
    zipParts.push({ name: `xl/worksheets/sheet${idx + 1}.xml`, data: encoder.encode(sheetXml) })
  })

  // Constrói o ZIP usando utilitário nativo
  const zipBlob = createSimpleZip(zipParts)
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Construtor ZIP simples sem dependências (Store / No Compression)
 */
function createSimpleZip(entries: Array<{ name: string; data: Uint8Array }>): Blob {
  const localHeaders: Uint8Array[] = []
  const centralHeaders: Uint8Array[] = []
  let offset = 0

  const encoder = new TextEncoder()

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const crc = computeCrc32(entry.data)
    const size = entry.data.length

    // Local file header (30 bytes + nameLen)
    const lh = new Uint8Array(30 + nameBytes.length)
    const lhView = new DataView(lh.buffer)
    lhView.setUint32(0, 0x04034b50, true) // signature
    lhView.setUint16(4, 20, true) // version needed
    lhView.setUint16(6, 0, true) // flags
    lhView.setUint16(8, 0, true) // compression: 0 (store)
    lhView.setUint16(10, 0, true) // time
    lhView.setUint16(12, 0, true) // date
    lhView.setUint32(14, crc, true)
    lhView.setUint32(18, size, true) // compressed size
    lhView.setUint32(22, size, true) // uncompressed size
    lhView.setUint16(26, nameBytes.length, true)
    lhView.setUint16(28, 0, true) // extra len
    lh.set(nameBytes, 30)

    localHeaders.push(lh)
    localHeaders.push(entry.data)

    // Central directory header (46 bytes + nameLen)
    const cd = new Uint8Array(46 + nameBytes.length)
    const cdView = new DataView(cd.buffer)
    cdView.setUint32(0, 0x02014b50, true) // signature
    cdView.setUint16(4, 20, true) // version made by
    cdView.setUint16(6, 20, true) // version needed
    cdView.setUint16(8, 0, true) // flags
    cdView.setUint16(10, 0, true) // compression: 0
    cdView.setUint16(12, 0, true) // time
    cdView.setUint16(14, 0, true) // date
    cdView.setUint32(16, crc, true)
    cdView.setUint32(20, size, true)
    cdView.setUint32(24, size, true)
    cdView.setUint16(28, nameBytes.length, true)
    cdView.setUint16(30, 0, true) // extra len
    cdView.setUint16(32, 0, true) // comment len
    cdView.setUint16(34, 0, true) // disk
    cdView.setUint16(36, 0, true) // internal attr
    cdView.setUint32(38, 0, true) // external attr
    cdView.setUint32(42, offset, true) // relative offset of local header
    cd.set(nameBytes, 46)

    centralHeaders.push(cd)
    offset += lh.length + size
  }

  const centralOffset = offset
  let centralSize = 0
  for (const cd of centralHeaders) {
    centralSize += cd.length
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22)
  const eocdView = new DataView(eocd.buffer)
  eocdView.setUint32(0, 0x06054b50, true) // signature
  eocdView.setUint16(4, 0, true) // disk number
  eocdView.setUint16(6, 0, true) // disk with central dir
  eocdView.setUint16(8, entries.length, true) // total entries this disk
  eocdView.setUint16(10, entries.length, true) // total entries
  eocdView.setUint32(12, centralSize, true) // size of central directory
  eocdView.setUint32(16, centralOffset, true) // offset of start of central directory
  eocdView.setUint16(20, 0, true) // comment length

  const parts: BlobPart[] = [
    ...localHeaders.map((h) => h as Uint8Array<ArrayBuffer>),
    ...centralHeaders.map((h) => h as Uint8Array<ArrayBuffer>),
    eocd as Uint8Array<ArrayBuffer>,
  ]
  return new Blob(parts, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * Cálculo de CRC32 padrão para arquivos ZIP
 */
function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

const CRC32_TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC32_TABLE[i] = c
}
