/**
 * Tipos fundamentais para a Engine de Planilhas Editáveis do ERP Jetro
 */

export type CellValue = string | number | boolean | null

export type CellFormatType = 'text' | 'number' | 'currency' | 'percent' | 'date'

export interface CellStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: 'left' | 'center' | 'right'
  textColor?: string
  bgColor?: string
  fontSize?: number
  format?: CellFormatType
  formatDecimals?: number
}

export interface CellData {
  raw: string // Texto digitado pelo usuário ou fórmula (ex: "=B3+C3" ou "123.45" ou "Azeitona")
  formula?: string // Presente se raw começar com '='
  computedValue?: CellValue // Resultado calculado pelo motor de fórmulas
  style?: CellStyle
  readonly?: boolean // Célula protegida
  error?: string // Erro de cálculo (#REF!, #DIV/0!, #VALOR!, #NOME?)
}

export interface ColumnDefinition {
  id: string // "A", "B", "C", ...
  width: number // Largura em pixels (padrão ~120)
  title?: string // Título opcional exibido no cabeçalho customizado
  hidden?: boolean
}

export interface RowDefinition {
  index: number // 1, 2, 3, ...
  height?: number // Altura em pixels (padrão ~28)
  hidden?: boolean
}

export interface SheetData {
  id: string
  name: string // Nome da aba (ex: "Comparativo", "Premissas", "Sheet1")
  cells: Record<string, CellData> // Chave: "A1", "B2", "C15"...
  columns: ColumnDefinition[]
  rowsCount: number
  frozenRows?: number
  frozenCols?: number
  order: number
}

export interface WorkbookData {
  sheets: SheetData[]
  activeSheetIndex: number
}

export interface CellPosition {
  sheetId: string
  col: number // 0-based: 0 -> A, 1 -> B
  row: number // 1-based: 1 -> 1, 2 -> 2
}

export interface CellRange {
  startCol: number
  startRow: number
  endCol: number
  endRow: number
}

export interface WorkbookRecord {
  id: string
  slug: string
  titulo: string
  workbook_data: WorkbookData
  version: number
  updated_by_id?: string
  updated_by_name?: string
  updated_by_email?: string
  change_summary?: string
  created?: string
  updated?: string
}

export interface WorkbookVersionRecord {
  id: string
  slug: string
  version_number: number
  workbook_data: WorkbookData
  author_id?: string
  author_name?: string
  description?: string
  origin?: 'manual' | 'autosave' | 'import' | 'rollback'
  created?: string
  updated?: string
}
