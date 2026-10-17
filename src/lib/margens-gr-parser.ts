/**
 * Parser de planilhas XLSX no navegador (zero dependências externas).
 *
 * Utiliza a Compression Streams API padrão dos navegadores modernos (DecompressionStream('deflate-raw'))
 * para descompactar o arquivo .xlsx (que é um contêiner ZIP) e extrai os XMLs:
 * - xl/sharedStrings.xml (strings compartilhadas)
 * - xl/worksheets/sheet1.xml (primeira aba com células)
 *
 * Suporta também fallback para endpoint server-side ($documents.toMarkdown do Skip Cloud)
 * caso o navegador não possua suporte a deflate-raw ou o arquivo tenha compactação diferente.
 */

import pb from '@/lib/pocketbase/client'

export interface RawParsedSheet {
  headers: string[]
  rows: string[][]
}

export interface DetectedColumns {
  colProduto: number
  colCmv: number
  colPrecoRivoli: number
  colOrdem: number
}

export interface ParsedItemCandidate {
  linhaOriginal: number
  produto: string
  cmv: number
  preco_rivoli: number
  ordem?: number
  valido: boolean
  motivoIgnorado?: string
}

export interface ParseResult {
  headers: string[]
  detectedColumns: DetectedColumns
  itensValidos: ParsedItemCandidate[]
  itensIgnorados: ParsedItemCandidate[]
  todasLinhas: ParsedItemCandidate[]
  totalLinhasLidas: number
}

// ---------------------------------------------------------------------------
// 1. Extração ZIP no navegador (DecompressionStream)
// ---------------------------------------------------------------------------

interface ZipLocalFile {
  name: string
  compressionMethod: number
  compressedSize: number
  uncompressedSize: number
  dataOffset: number
}

/**
 * Lê os arquivos locais do ZIP procurando por arquivos específicos.
 */
async function extractZipFiles(
  buffer: ArrayBuffer,
  fileNamesToExtract: string[],
): Promise<Map<string, string>> {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const results = new Map<string, string>()
  const targets = new Set(fileNamesToExtract.map((f) => f.toLowerCase().replace(/\\/g, '/')))

  let offset = 0
  const max = buffer.byteLength - 4

  while (offset < max) {
    const sig = view.getUint32(offset, true)
    if (sig === 0x04034b50) {
      // Local file header
      const compressionMethod = view.getUint16(offset + 8, true)
      const compressedSize = view.getUint32(offset + 18, true)
      const fileNameLen = view.getUint16(offset + 26, true)
      const extraFieldLen = view.getUint16(offset + 28, true)

      const nameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen)
      const name = new TextDecoder('utf-8').decode(nameBytes).replace(/\\/g, '/')
      const normalizedName = name.toLowerCase()

      const dataOffset = offset + 30 + fileNameLen + extraFieldLen

      // Verifica se é um dos arquivos que queremos
      let matchesTarget = false
      let targetKey = ''
      for (const t of targets) {
        if (normalizedName === t || normalizedName.endsWith('/' + t)) {
          matchesTarget = true
          targetKey = t
          break
        }
      }

      if (matchesTarget && compressedSize > 0) {
        const compressedData = bytes.subarray(dataOffset, dataOffset + compressedSize)
        try {
          let decompressedText = ''
          if (compressionMethod === 0) {
            // Uncompressed
            decompressedText = new TextDecoder('utf-8').decode(compressedData)
          } else if (compressionMethod === 8) {
            // Deflate
            if (typeof DecompressionStream !== 'undefined') {
              const ds = new DecompressionStream('deflate-raw')
              const stream = new Response(compressedData).body?.pipeThrough(ds)
              if (stream) {
                const response = new Response(stream)
                decompressedText = await response.text()
              }
            }
          }
          if (decompressedText) {
            results.set(targetKey, decompressedText)
          }
        } catch (err) {
          console.warn('Erro ao descompactar entrada ZIP ' + name, err)
        }
      }

      offset = dataOffset + compressedSize
    } else if (sig === 0x02014b50) {
      // Central directory header — fim dos arquivos locais
      break
    } else {
      offset++
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// 2. Parser de XML do OpenXML (worksheets/sheet1.xml e sharedStrings.xml)
// ---------------------------------------------------------------------------

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = []
  if (!xml) return strings

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
    const siElements = doc.getElementsByTagName('si')
    for (let i = 0; i < siElements.length; i++) {
      const si = siElements[i]
      // Concatena todos os <t> filhos (podem estar divididos em <r><t>)
      const tElements = si.getElementsByTagName('t')
      let text = ''
      for (let j = 0; j < tElements.length; j++) {
        text += tElements[j].textContent || ''
      }
      strings.push(text)
    }
  } catch (err) {
    console.warn('Erro ao fazer parse de sharedStrings.xml:', err)
  }

  return strings
}

function colRefToIdx(colStr: string): number {
  let col = 0
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64)
  }
  return col - 1
}

function parseSheetXml(sheetXml: string, sharedStrings: string[]): string[][] {
  const rowsMatrix: string[][] = []
  if (!sheetXml) return rowsMatrix

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(sheetXml, 'application/xml')
    const rowElements = doc.getElementsByTagName('row')

    for (let r = 0; r < rowElements.length; r++) {
      const rowEl = rowElements[r]
      const cellElements = rowEl.getElementsByTagName('c')
      const rowValues: string[] = []

      for (let c = 0; c < cellElements.length; c++) {
        const cell = cellElements[c]
        const ref = cell.getAttribute('r') || ''
        const colMatch = ref.match(/^([A-Z]+)/)
        const colIdx = colMatch ? colRefToIdx(colMatch[1]) : rowValues.length

        const type = cell.getAttribute('t')
        const vEl = cell.getElementsByTagName('v')[0]
        const isEl = cell.getElementsByTagName('is')[0]

        let cellValue = ''
        if (type === 's' && vEl) {
          // Shared string
          const idx = parseInt(vEl.textContent || '0', 10)
          cellValue = sharedStrings[idx] || ''
        } else if (type === 'inlineStr' && isEl) {
          cellValue = isEl.textContent || ''
        } else if (vEl) {
          cellValue = vEl.textContent || ''
        }

        // Garante preenchimento de colunas vazias intermediárias
        while (rowValues.length < colIdx) {
          rowValues.push('')
        }
        rowValues[colIdx] = cellValue.trim()
      }

      if (rowValues.some((v) => v !== '')) {
        rowsMatrix.push(rowValues)
      }
    }
  } catch (err) {
    console.warn('Erro ao fazer parse de sheet.xml:', err)
  }

  return rowsMatrix
}

// ---------------------------------------------------------------------------
// 3. Fallback: Parse via Endpoint Server-side ($documents.toMarkdown)
// ---------------------------------------------------------------------------

function parseMarkdownTable(markdown: string): string[][] {
  const lines = markdown.split(/\r?\n/)
  const tableRows: string[][] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue
    // Ignora linhas divisórias: |---|---|
    if (/^\|(\s*[-:]+\s*\|)+$/.test(trimmed)) continue

    const cells = trimmed
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim())
    if (cells.length > 0 && cells.some((c) => c !== '')) {
      tableRows.push(cells)
    }
  }

  return tableRows
}

async function parseViaBackendEndpoint(file: File): Promise<string[][]> {
  const formData = new FormData()
  formData.append('arquivo', file)

  const token = pb.authStore.token
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''
  const response = await fetch(`${baseUrl}/backend/v1/planilhas/convertidas/parse-xlsx`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Falha no processamento pelo backend (${response.status}): ${text}`)
  }

  const data = (await response.json()) as { ok: boolean; markdown?: string; error?: string }
  if (!data.ok || !data.markdown) {
    throw new Error(data.error || 'Nenhum dado extraído da planilha.')
  }

  return parseMarkdownTable(data.markdown)
}

// ---------------------------------------------------------------------------
// 4. Detecção tolerante de colunas e parsing dos valores numéricos
// ---------------------------------------------------------------------------

export function normalizarTexto(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Converte strings brasileiras ou americanas ("R$ 1.250,50", "12,50", "12.50") para number
 */
export function parseNumberBRL(raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw !== 'string') return 0

  let cleaned = raw.replace(/r\$/gi, '').replace(/\s+/g, '').trim()

  if (!cleaned) return 0

  // Se tiver vírgula e ponto (ex: 1.250,50)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Se o ponto vier antes da vírgula (formato brasileiro: 1.250,50)
    if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // Formato americano com vírgula de milhar: 1,250.50
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    // Apenas vírgula: 12,50 -> 12.50
    cleaned = cleaned.replace(',', '.')
  }

  const num = parseFloat(cleaned)
  return Number.isNaN(num) || !Number.isFinite(num) ? 0 : num
}

/**
 * Detecta qual linha é o cabeçalho procurando por palavras-chave
 */
export function detectarCabecalho(matrix: string[][]): {
  headerRowIndex: number
  headers: string[]
  detected: DetectedColumns
} {
  let bestScore = -1
  let bestRowIndex = 0
  let bestDetected: DetectedColumns = {
    colProduto: -1,
    colCmv: -1,
    colPrecoRivoli: -1,
    colOrdem: -1,
  }

  // Analisa as primeiras 15 linhas procurando cabeçalhos
  const maxSearch = Math.min(matrix.length, 15)

  for (let r = 0; r < maxSearch; r++) {
    const row = matrix[r]
    let score = 0
    let colProd = -1
    let colCmv = -1
    let colRivoli = -1
    let colOrdem = -1

    for (let c = 0; c < row.length; c++) {
      const cellNorm = normalizarTexto(row[c])
      if (!cellNorm) continue

      // Produto / Descrição
      if (
        (cellNorm.includes('produto') ||
          cellNorm.includes('descricao') ||
          cellNorm.includes('item') ||
          cellNorm.includes('nome')) &&
        !cellNorm.includes('cmv') &&
        !cellNorm.includes('preco') &&
        !cellNorm.includes('ordem')
      ) {
        if (colProd === -1 || cellNorm.includes('produto')) {
          colProd = c
          score += 5
        }
      }

      // CMV / Custo
      if (
        cellNorm.includes('cmv') ||
        cellNorm.includes('custo') ||
        cellNorm.includes('custo mercadoria')
      ) {
        colCmv = c
        score += 5
      }

      // Preço Rivoli / Rivoli / Preço Venda
      if (
        cellNorm.includes('rivoli') ||
        cellNorm.includes('preco rivoli') ||
        cellNorm.includes('pr. rivoli') ||
        cellNorm.includes('p. rivoli') ||
        (cellNorm.includes('preco') && cellNorm.includes('venda'))
      ) {
        colRivoli = c
        score += 5
      }

      // Ordem / Seq
      if (
        cellNorm === 'ordem' ||
        cellNorm === 'ord' ||
        cellNorm === 'posicao' ||
        cellNorm === '#' ||
        cellNorm === 'seq' ||
        cellNorm === 'sequencia'
      ) {
        colOrdem = c
        score += 2
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestRowIndex = r
      bestDetected = {
        colProduto: colProd,
        colCmv: colCmv,
        colPrecoRivoli: colRivoli,
        colOrdem: colOrdem,
      }
    }
  }

  // Se não detectou nada convincente, assume primeira linha
  const headers = matrix[bestRowIndex] || []

  // Se não achou colunas específicas, tenta palpites padrão se existirem
  if (bestDetected.colProduto === -1 && headers.length > 0) {
    bestDetected.colProduto = 0
  }
  if (bestDetected.colCmv === -1 && headers.length > 1) {
    bestDetected.colCmv = 1
  }
  if (bestDetected.colPrecoRivoli === -1 && headers.length > 2) {
    bestDetected.colPrecoRivoli = 2
  }

  return {
    headerRowIndex: bestRowIndex,
    headers,
    detected: bestDetected,
  }
}

/**
 * Valida e converte linhas da matriz com base nas colunas mapeadas
 */
export function processarLinhas(
  matrix: string[][],
  headerRowIndex: number,
  mapping: DetectedColumns,
): {
  itensValidos: ParsedItemCandidate[]
  itensIgnorados: ParsedItemCandidate[]
  todasLinhas: ParsedItemCandidate[]
} {
  const itensValidos: ParsedItemCandidate[] = []
  const itensIgnorados: ParsedItemCandidate[] = []
  const todasLinhas: ParsedItemCandidate[] = []

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const row = matrix[r]
    const linhaNum = r + 1

    // Ignora linha 100% vazia
    if (!row || row.every((c) => !c || c.trim() === '')) {
      const item: ParsedItemCandidate = {
        linhaOriginal: linhaNum,
        produto: '',
        cmv: 0,
        preco_rivoli: 0,
        valido: false,
        motivoIgnorado: 'Linha completamente vazia',
      }
      itensIgnorados.push(item)
      todasLinhas.push(item)
      continue
    }

    const rawProduto = mapping.colProduto >= 0 ? row[mapping.colProduto] || '' : ''
    const rawCmv = mapping.colCmv >= 0 ? row[mapping.colCmv] || '' : ''
    const rawPrecoRivoli = mapping.colPrecoRivoli >= 0 ? row[mapping.colPrecoRivoli] || '' : ''
    const rawOrdem = mapping.colOrdem >= 0 ? row[mapping.colOrdem] || '' : ''

    const prodNorm = normalizarTexto(rawProduto)

    // Detecção de totalizadores e linhas de resumo
    if (
      prodNorm === 'total' ||
      prodNorm === 'totais' ||
      prodNorm.startsWith('total ') ||
      prodNorm.startsWith('resumo') ||
      prodNorm.includes('media final') ||
      prodNorm.includes('subtotal')
    ) {
      const item: ParsedItemCandidate = {
        linhaOriginal: linhaNum,
        produto: rawProduto,
        cmv: parseNumberBRL(rawCmv),
        preco_rivoli: parseNumberBRL(rawPrecoRivoli),
        valido: false,
        motivoIgnorado: 'Linha de totalizador / resumo ignorada',
      }
      itensIgnorados.push(item)
      todasLinhas.push(item)
      continue
    }

    // Se produto estiver em branco
    if (!rawProduto.trim()) {
      const item: ParsedItemCandidate = {
        linhaOriginal: linhaNum,
        produto: '',
        cmv: parseNumberBRL(rawCmv),
        preco_rivoli: parseNumberBRL(rawPrecoRivoli),
        valido: false,
        motivoIgnorado: 'Descrição do produto ausente',
      }
      itensIgnorados.push(item)
      todasLinhas.push(item)
      continue
    }

    const cmv = parseNumberBRL(rawCmv)
    const precoRivoli = parseNumberBRL(rawPrecoRivoli)
    const ordem = rawOrdem ? parseInt(rawOrdem, 10) || undefined : itensValidos.length + 1

    const item: ParsedItemCandidate = {
      linhaOriginal: linhaNum,
      produto: rawProduto.trim(),
      cmv,
      preco_rivoli: precoRivoli,
      ordem,
      valido: true,
    }

    itensValidos.push(item)
    todasLinhas.push(item)
  }

  return { itensValidos, itensIgnorados, todasLinhas }
}

/**
 * Função principal de parsing de arquivo .xlsx ou .csv
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()
  let matrix: string[][] = []

  if (fileName.endsWith('.csv')) {
    const text = await file.text()
    // Identifica separador (; ou ,)
    const firstLine = text.split('\n')[0] || ''
    const sep =
      (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ','

    const lines = text.split(/\r?\n/)
    matrix = lines
      .filter((l) => l.trim() !== '')
      .map((l) => {
        // Separação simples com suporte a aspas
        const cells: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < l.length; i++) {
          const char = l[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === sep && !inQuotes) {
            cells.push(current.trim().replace(/^"|"$/g, ''))
            current = ''
          } else {
            current += char
          }
        }
        cells.push(current.trim().replace(/^"|"$/g, ''))
        return cells
      })
  } else {
    // Arquivo .xlsx
    try {
      const buffer = await file.arrayBuffer()
      const zipFiles = await extractZipFiles(buffer, [
        'xl/sharedstrings.xml',
        'xl/worksheets/sheet1.xml',
      ])

      const sharedStringsXml = zipFiles.get('xl/sharedstrings.xml') || ''
      const sheetXml = zipFiles.get('xl/worksheets/sheet1.xml') || ''

      if (sheetXml) {
        const sharedStrings = parseSharedStrings(sharedStringsXml)
        matrix = parseSheetXml(sheetXml, sharedStrings)
      }
    } catch (err) {
      console.warn(
        'Falha na extração direta de XLSX no browser. Tentando fallback server-side...',
        err,
      )
    }

    // Se o browser não conseguiu extrair (ex: falta de DecompressionStream ou zip complexo), usa backend
    if (!matrix || matrix.length === 0) {
      try {
        matrix = await parseViaBackendEndpoint(file)
      } catch (err) {
        console.error('Falha no fallback server-side de leitura de XLSX:', err)
        throw new Error(
          'Não foi possível ler o arquivo Excel. Verifique se o arquivo não está corrompido ou protegido por senha.',
        )
      }
    }
  }

  if (matrix.length === 0) {
    throw new Error('A planilha está vazia ou não contém dados legíveis.')
  }

  const { headerRowIndex, headers, detected } = detectarCabecalho(matrix)
  const { itensValidos, itensIgnorados, todasLinhas } = processarLinhas(
    matrix,
    headerRowIndex,
    detected,
  )

  return {
    headers,
    detectedColumns: detected,
    itensValidos,
    itensIgnorados,
    todasLinhas,
    totalLinhasLidas: matrix.length - (headerRowIndex + 1),
  }
}
