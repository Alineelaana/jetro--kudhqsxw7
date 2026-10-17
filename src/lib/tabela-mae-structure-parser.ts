import type { CellData, SheetData } from '@/types/spreadsheet'
import { colIndexToLetter } from '@/lib/spreadsheet-formula-engine'
import type { ExtractedSheetInfo } from '@/lib/spreadsheet-file-utils'

/**
 * Classificação do tipo de linha detectado na aba
 */
export type RowKind = 'title' | 'header' | 'section' | 'data' | 'empty' | 'summary'

export interface AnalyzedRow {
  rowIndex: number // 1-based original
  kind: RowKind
  sectionTitle?: string
  values: string[] // valores das colunas ativas
  rawRow: string[]
  isIncluded: boolean
  ignoredReason?: string
}

export interface AnalyzedColumn {
  colIndex: number // 0-based original
  letter: string // A, B, C...
  originalHeader: string
  normalizedHeader: string
  isConstantTitle: boolean // Coluna de título repetido em todas as linhas
  constantTitleValue?: string
  sampleValues: string[]
  detectedType: 'text' | 'number' | 'currency' | 'percent' | 'code_ean_dun'
  included: boolean
  customTitle?: string
}

export interface SheetStructureAnalysis {
  sheetName: string
  sheetIndex: number
  headerRowIndex: number // 0-based no rawMatrix (ex: linha 1 ou 2)
  headerRowsCount: number // 1, 2 ou 3 linhas que formam o cabeçalho
  columns: AnalyzedColumn[]
  activeColumnsCount: number
  rows: AnalyzedRow[]
  dataRowsCount: number
  sectionRowsCount: number
  emptyRowsCount: number
  titleRowsCount: number
  formulaCount: number
  unsupportedFormulas: string[]
  hasSections: boolean
  detectedSections: string[]
  // SheetData pronta para ser aplicada na grade
  previewSheetData: SheetData
}

/**
 * Normaliza texto para comparações insensíveis a acentos e maiúsculas
 */
export function normalizar(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Analisa a estrutura tolerante de uma aba individual
 */
export function analyzeSheetStructure(sheetInfo: ExtractedSheetInfo): SheetStructureAnalysis {
  const matrix = sheetInfo.rawMatrix
  const maxRow = matrix.length
  const maxCol = matrix[0] ? matrix[0].length : sheetInfo.maxCol + 1

  // 1. Detectar colunas constantes / título repetido (ex: TAB VAREJO primeira coluna com título do estado em todas as linhas)
  const constantColumns = detectConstantTitleColumns(matrix)

  // 2. Detectar linha de cabeçalho principal (pode ocupar linhas 1, 2 ou 3)
  const { headerRowIndex, headerRowsCount, combinedHeaders } = detectHeaderRow(
    matrix,
    constantColumns,
  )

  // 3. Montar colunas analisadas
  const analyzedCols: AnalyzedColumn[] = []
  for (let c = 0; c < maxCol; c++) {
    const letter = colIndexToLetter(c)
    const isConstant = constantColumns.has(c)
    const rawHeader = combinedHeaders[c] || `Coluna ${letter}`
    const normHeader = normalizar(rawHeader)

    // Coleta amostras
    const samples: string[] = []
    for (let r = headerRowIndex + headerRowsCount; r < Math.min(maxRow, 25); r++) {
      const v = matrix[r]?.[c]?.trim()
      if (v) samples.push(v)
    }

    const detectedType = inferColumnDataType(normHeader, samples)

    analyzedCols.push({
      colIndex: c,
      letter,
      originalHeader: rawHeader,
      normalizedHeader: normHeader,
      isConstantTitle: isConstant,
      constantTitleValue: isConstant
        ? matrix[headerRowIndex + 1]?.[c] || matrix[0]?.[c]
        : undefined,
      sampleValues: samples.slice(0, 5),
      detectedType,
      included: !isConstant, // Por padrão, colunas com título repetido ficam desmarcadas/excluídas para não poluir
      customTitle: isConstant ? `[Título] ${rawHeader.slice(0, 20)}...` : rawHeader,
    })
  }

  // 4. Analisar cada linha dos dados
  const analyzedRows: AnalyzedRow[] = []
  const detectedSections: string[] = []

  for (let r = 0; r < maxRow; r++) {
    const rowNumber = r + 1
    const rawRow = matrix[r] || []

    // Verifica se é uma das linhas de cabeçalho
    if (r >= headerRowIndex && r < headerRowIndex + headerRowsCount) {
      analyzedRows.push({
        rowIndex: rowNumber,
        kind: 'header',
        values: rawRow,
        rawRow,
        isIncluded: true,
      })
      continue
    }

    // Linha antes do cabeçalho
    if (r < headerRowIndex) {
      const rowText = rawRow.filter(Boolean).join(' ').trim()
      analyzedRows.push({
        rowIndex: rowNumber,
        kind: 'title',
        values: rawRow,
        rawRow,
        isIncluded: false,
        ignoredReason: 'Título ou grupo superior acima do cabeçalho principal',
        sectionTitle: rowText || undefined,
      })
      continue
    }

    // Linha totalmente vazia
    const nonEmpties = rawRow.map((c) => c?.trim()).filter(Boolean)
    if (nonEmpties.length === 0) {
      analyzedRows.push({
        rowIndex: rowNumber,
        kind: 'empty',
        values: rawRow,
        rawRow,
        isIncluded: false,
        ignoredReason: 'Linha completamente em branco',
      })
      continue
    }

    // 5. Detectar linhas separadoras de SEÇÃO no meio dos dados
    // Exemplos reais do usuário:
    // "VIDRO 200/160G", "VIDRO 500/450/400G", "SACHÊ 80/100G", "SACHÊ 1,010KG", "BALDE 2KG"
    // "LINHA DE PRODUTOS - DOYPACK...", "LINHA DE PRODUTOS - POTES DE VIDRO..."
    // "ACIDO", "FILME", "CAIXAS DE PAPELÃO", "VIDROS", "TAMPAS", "ROTULOS"
    const isSection = isSectionRow(rawRow, analyzedCols)
    if (isSection.isSection) {
      const sectionName = isSection.title || nonEmpties[0]
      if (sectionName && !detectedSections.includes(sectionName)) {
        detectedSections.push(sectionName)
      }

      analyzedRows.push({
        rowIndex: rowNumber,
        kind: 'section',
        sectionTitle: sectionName,
        values: rawRow,
        rawRow,
        isIncluded: true, // Seções SÃO PRESERVADAS como linha estilizada
      })
      continue
    }

    // 6. Detectar totalizadores / resumos
    const firstCellNorm = normalizar(nonEmpties[0] || '')
    if (
      firstCellNorm === 'total' ||
      firstCellNorm === 'totais' ||
      firstCellNorm.startsWith('total ') ||
      firstCellNorm.startsWith('resumo') ||
      firstCellNorm.includes('media final') ||
      firstCellNorm.includes('subtotal')
    ) {
      analyzedRows.push({
        rowIndex: rowNumber,
        kind: 'summary',
        values: rawRow,
        rawRow,
        isIncluded: true,
      })
      continue
    }

    // Linha normal de dados
    analyzedRows.push({
      rowIndex: rowNumber,
      kind: 'data',
      values: rawRow,
      rawRow,
      isIncluded: true,
    })
  }

  // 6. Montar SheetData otimizada
  const previewSheetData = buildProcessedSheetData(sheetInfo, analyzedCols, analyzedRows)

  const dataRowsCount = analyzedRows.filter((r) => r.kind === 'data').length
  const sectionRowsCount = analyzedRows.filter((r) => r.kind === 'section').length
  const emptyRowsCount = analyzedRows.filter((r) => r.kind === 'empty').length
  const titleRowsCount = analyzedRows.filter((r) => r.kind === 'title').length

  return {
    sheetName: sheetInfo.name,
    sheetIndex: sheetInfo.index,
    headerRowIndex,
    headerRowsCount,
    columns: analyzedCols,
    activeColumnsCount: analyzedCols.filter((c) => c.included).length,
    rows: analyzedRows,
    dataRowsCount,
    sectionRowsCount,
    emptyRowsCount,
    titleRowsCount,
    formulaCount: sheetInfo.formulaCount,
    unsupportedFormulas: sheetInfo.unsupportedFormulas,
    hasSections: detectedSections.length > 0,
    detectedSections,
    previewSheetData,
  }
}

/**
 * Detecta colunas com valor de texto longo repetido em todas as linhas (coluna de título constante)
 */
function detectConstantTitleColumns(matrix: string[][]): Set<number> {
  const constantCols = new Set<number>()
  if (matrix.length < 5) return constantCols

  const numCols = matrix[0] ? matrix[0].length : 0

  for (let c = 0; c < numCols; c++) {
    const values: string[] = []
    for (let r = 0; r < Math.min(matrix.length, 30); r++) {
      const v = matrix[r]?.[c]?.trim()
      if (v) values.push(v)
    }

    if (values.length >= 4) {
      // Verifica se mais de 80% das linhas não vazias têm o mesmo texto e esse texto é longo (> 25 chars)
      const first = values[0]
      const sameCount = values.filter((v) => v === first).length
      if (first.length > 25 && sameCount / values.length >= 0.75) {
        constantCols.add(c)
      }
    }
  }

  return constantCols
}

/**
 * Detecta a melhor linha de cabeçalho procurando por termos e estrutura
 */
function detectHeaderRow(
  matrix: string[][],
  constantCols: Set<number>,
): {
  headerRowIndex: number
  headerRowsCount: number
  combinedHeaders: string[]
} {
  const maxSearch = Math.min(matrix.length, 8)
  let bestRow = 0
  let bestScore = -1

  for (let r = 0; r < maxSearch; r++) {
    const row = matrix[r] || []
    let score = 0
    let validCellCount = 0

    for (let c = 0; c < row.length; c++) {
      if (constantCols.has(c)) continue
      const cell = normalizar(row[c] || '')
      if (!cell) continue

      validCellCount++

      // Palavras de alta relevância para cabeçalho
      if (
        cell === 'cod' ||
        cell === 'codigo' ||
        cell === 'cod sankhya' ||
        cell === 'codigo sankhya' ||
        cell.includes('descricao') ||
        cell.includes('produto') ||
        cell.includes('ingrediente') ||
        cell.includes('materia prima') ||
        cell.includes('insumo') ||
        cell.includes('custo') ||
        cell.includes('margem') ||
        cell.includes('preco') ||
        cell.includes('embalagem') ||
        cell.includes('unidade') ||
        cell.includes('und') ||
        cell.includes('varejo') ||
        cell.includes('atacado') ||
        cell.includes('distribuidor') ||
        cell.includes('ean') ||
        cell.includes('dun') ||
        cell.includes('ncm') ||
        cell.includes('palete') ||
        cell.includes('calibre') ||
        cell.includes('tipo') ||
        cell.includes('salmoura')
      ) {
        score += 8
      } else if (cell.length > 2 && cell.length < 30) {
        score += 1
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestRow = r
    }
  }

  // Verifica se há linha acima ou abaixo que seja um agrupador (ex: "UNIDADES", "CAIXA" na Tabela Mãe)
  let headerRowsCount = 1
  const prevRow = bestRow > 0 ? matrix[bestRow - 1] || [] : []
  const hasGroupAbove = prevRow.some((c) => {
    const n = normalizar(c)
    return n === 'unidades' || n === 'caixa' || n === 'grupo' || n.includes('linha de')
  })

  // Se a linha acima tem grupos de cabeçalho, podemos combinar os títulos
  const maxCols = matrix[0] ? matrix[0].length : 15
  const combinedHeaders: string[] = []

  let actualHeaderStart = bestRow
  if (hasGroupAbove && bestRow > 0) {
    actualHeaderStart = bestRow - 1
    headerRowsCount = 2
  }

  for (let c = 0; c < maxCols; c++) {
    const mainHeader = (matrix[bestRow]?.[c] || '').trim()
    const groupHeader = hasGroupAbove ? (matrix[bestRow - 1]?.[c] || '').trim() : ''

    if (groupHeader && mainHeader && groupHeader !== mainHeader) {
      combinedHeaders.push(`${groupHeader} - ${mainHeader}`)
    } else {
      combinedHeaders.push(mainHeader || groupHeader || colIndexToLetter(c))
    }
  }

  return {
    headerRowIndex: actualHeaderStart,
    headerRowsCount,
    combinedHeaders,
  }
}

/**
 * Infere o tipo de dado predominante na coluna
 */
function inferColumnDataType(
  headerNorm: string,
  samples: string[],
): 'text' | 'number' | 'currency' | 'percent' | 'code_ean_dun' {
  if (
    headerNorm.includes('ean') ||
    headerNorm.includes('dun') ||
    headerNorm.includes('codigo de barras')
  ) {
    return 'code_ean_dun'
  }

  if (
    headerNorm.includes('margem') ||
    headerNorm.includes('%') ||
    headerNorm.includes('percentual')
  ) {
    return 'percent'
  }

  if (
    headerNorm.includes('preco') ||
    headerNorm.includes('custo') ||
    headerNorm.includes('cmv') ||
    headerNorm.includes('pv ') ||
    headerNorm.includes('r$')
  ) {
    return 'currency'
  }

  // Amostras numéricas vs texto
  let numCount = 0
  for (const s of samples) {
    const clean = s.replace(/r\$/gi, '').replace(/\s/g, '').replace(',', '.')
    if (!Number.isNaN(parseFloat(clean))) {
      numCount++
    }
  }

  if (samples.length > 0 && numCount / samples.length >= 0.8) {
    return 'number'
  }

  return 'text'
}

/**
 * Identifica se a linha é um separador de seção vertical
 * Ex.: "VIDRO 200/160G", "SACHÊ 80/100G", "BALDE 2KG", "FILME", "CAIXAS DE PAPELÃO"
 */
function isSectionRow(
  rawRow: string[],
  analyzedCols: AnalyzedColumn[],
): { isSection: boolean; title?: string } {
  const nonEmpties = rawRow
    .map((val, idx) => ({ val: val?.trim() || '', idx }))
    .filter((x) => x.val !== '')

  if (nonEmpties.length === 0) return { isSection: false }

  // Caso 1: Apenas 1 célula preenchida em toda a linha e não parece ser dado comum
  if (nonEmpties.length === 1) {
    const val = nonEmpties[0].val
    const norm = normalizar(val)

    // Se tiver nome característico de seção ou palavras-chave conhecidas
    if (
      norm.includes('vidro') ||
      norm.includes('sache') ||
      norm.includes('balde') ||
      norm.includes('queijo ralado') ||
      norm.includes('linha de produtos') ||
      norm.includes('caixas de') ||
      norm.includes('tampas') ||
      norm.includes('rotulos') ||
      norm.includes('filme') ||
      norm.includes('acido') ||
      norm.startsWith('secao') ||
      norm.startsWith('categoria')
    ) {
      return { isSection: true, title: val }
    }

    // Se não for número nem código curto, mas em maiúsculas
    if (val.length > 3 && val === val.toUpperCase() && !/^\d+$/.test(val)) {
      return { isSection: true, title: val }
    }
  }

  // Caso 2: Primeira célula contém o nome da seção e as demais células repetem cabeçalhos de coluna
  // Ex: CMV linha 10: Col 1 = "VIDRO 500/450/400G", Col 3 = "UND MEDIDA", Col 4 = "PESO DRENADO", Col 5 = "VIDRO"...
  const first = nonEmpties[0].val
  const normFirst = normalizar(first)
  const isSectionTitle =
    normFirst.includes('vidro') ||
    normFirst.includes('sache') ||
    normFirst.includes('balde') ||
    normFirst.includes('queijo ralado') ||
    normFirst.includes('linha de')

  if (isSectionTitle) {
    const hasRepeatedSubHeaders = nonEmpties.some((x) => {
      const n = normalizar(x.val)
      return (
        n === 'und medida' ||
        n === 'peso drenado' ||
        n === 'custo' ||
        n === 'custo antigo' ||
        n === 'custo novo' ||
        n === 'diferenca' ||
        n === 'materia prima' ||
        n === 'salmoura' ||
        n === 'tampa' ||
        n === 'rotulo'
      )
    })

    if (hasRepeatedSubHeaders || nonEmpties.length <= 3) {
      return { isSection: true, title: first }
    }
  }

  return { isSection: false }
}

/**
 * Constrói a estrutura SheetData pronta para o JetroSpreadsheet
 * - Preserva valores como estão
 * - Marca linhas de seção com estilo visual destacado
 * - Mantém fórmulas ativas quando presentes
 * - Mantém EAN/DUN tratados como texto
 */
function buildProcessedSheetData(
  sheetInfo: ExtractedSheetInfo,
  columns: AnalyzedColumn[],
  analyzedRows: AnalyzedRow[],
): SheetData {
  const cells: SheetData['cells'] = {}

  // Mapeia apenas as colunas incluídas para a grade final
  const includedCols = columns.filter((c) => c.included)

  // Se todas foram incluídas ou se o usuário desmarcou a constante, reorganiza colunas
  const activeCols = includedCols.length > 0 ? includedCols : columns

  // Linhas processadas
  let gridRowNum = 1

  for (const row of analyzedRows) {
    // Linhas vazias ou títulos ignorados não entram na grade final
    if (!row.isIncluded) continue

    if (row.kind === 'section') {
      // Estiliza a linha da seção em destaque no grid
      const sectionText = row.sectionTitle || row.rawRow[0] || 'SEÇÃO'
      const firstColLetter = colIndexToLetter(0)
      cells[`${firstColLetter}${gridRowNum}`] = {
        raw: sectionText,
        style: {
          bold: true,
          bgColor: '#E2F0D9', // Verde suave institucional de seção
          textColor: '#005B2E',
          align: 'left',
        },
      }
      gridRowNum++
      continue
    }

    // Linha de cabeçalho ou dados
    for (let c = 0; c < activeCols.length; c++) {
      const colMeta = activeCols[c]
      const originalColIdx = colMeta.colIndex
      const gridColLetter = colIndexToLetter(c)
      const cellKey = `${gridColLetter}${gridRowNum}`

      const originalCell = sheetInfo.cells[`${colMeta.letter}${row.rowIndex}`]
      const rawVal = row.rawRow[originalColIdx] ?? originalCell?.raw ?? ''

      const isHeader = row.kind === 'header'

      // Trata EAN/DUN e números com tolerância
      let computedValue: string | number | boolean | null | undefined = originalCell?.computedValue

      if (colMeta.detectedType === 'code_ean_dun' && rawVal) {
        computedValue = String(rawVal).trim()
      }

      cells[cellKey] = {
        raw: String(rawVal),
        formula: isHeader ? undefined : originalCell?.formula,
        computedValue: isHeader ? rawVal : computedValue,
        error: originalCell?.error,
        style: {
          ...originalCell?.style,
          bold: isHeader || originalCell?.style?.bold,
          bgColor: isHeader ? '#F1F5F9' : originalCell?.style?.bgColor,
          textColor: isHeader ? '#0F172A' : originalCell?.style?.textColor,
          align: isHeader
            ? 'center'
            : colMeta.detectedType === 'currency' || colMeta.detectedType === 'percent'
              ? 'right'
              : 'left',
          format:
            colMeta.detectedType === 'currency'
              ? 'currency'
              : colMeta.detectedType === 'percent'
                ? 'percent'
                : undefined,
        },
      }
    }

    gridRowNum++
  }

  const gridColumns = activeCols.map((c, idx) => ({
    id: colIndexToLetter(idx),
    width: idx === 0 ? 240 : idx === 1 ? 260 : 130,
    title: c.customTitle || c.originalHeader,
  }))

  return {
    id: sheetInfo.sheetId,
    name: sheetInfo.name,
    cells,
    columns: gridColumns,
    rowsCount: Math.max(gridRowNum + 15, 60),
    order: sheetInfo.index,
  }
}
