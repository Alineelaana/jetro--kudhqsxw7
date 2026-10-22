import type { ReactNode } from 'react'

export type TableDataType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'boolean'
  | 'badge'

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  columnId: string
  direction: 'asc' | 'desc'
}

export interface JetroColumnDef<T = any> {
  id: string
  header?: ReactNode
  title?: string
  accessorKey?: keyof T | string
  /**
   * Tipo semântico de dados para ordenação precisa:
   * - number: 1, 2, 10
   * - currency: parseia R$ 1.200,50 ou valores numéricos
   * - percent: parseia 15%, 2,5%
   * - date: parseia ISO strings ou DD/MM/AAAA
   * - boolean: true antes de false ou vice-versa
   * - text: ordem alfabética com localeCompare pt-BR
   */
  dataType?: TableDataType
  /** Função de valor customizada para ordenação/exportação */
  getSortValue?: (row: T) => unknown
  /** Renderizador alternativo ou simplificado */
  render?: (row: T, index?: number) => ReactNode
  /** Renderizador customizado da célula */
  cell?: (info: { row: T; value: unknown; index: number }) => ReactNode
  /** Largura padrão inicial em pixels (ex: 150) */
  defaultWidth?: number
  /** Largura mínima ao redimensionar (padrão 80) */
  minWidth?: number
  /** Largura máxima ao redimensionar (opcional) */
  maxWidth?: number
  /** Se a coluna pode ser ordenada (padrão: true) */
  sortable?: boolean
  /** Se a coluna pode ser ocultada nas preferências (padrão: true) */
  hideable?: boolean
  /** Se a coluna é visível por padrão (padrão: true) */
  defaultVisible?: boolean
  /** Se a coluna pode ser redimensionada (padrão: true) */
  resizable?: boolean
  /** Se a coluna pode ser arrastada (padrão: true) */
  draggable?: boolean
  /** Alinhamento do texto */
  align?: 'left' | 'center' | 'right'
  /** Classe CSS extra para o cabeçalho */
  headerClassName?: string
  /** Classe CSS extra para a célula */
  className?: string
}

export interface TableUserPreferences {
  version: number
  /** Ordem dos ids de colunas */
  columnOrder: string[]
  /** Larguras customizadas { [columnId]: widthInPx } */
  columnWidths: Record<string, number>
  /** Visibilidade das colunas { [columnId]: boolean } */
  columnVisibility: Record<string, boolean>
  /** Ordenação ativa salva */
  sorting: SortState | null
}

export interface TableExportOptions {
  filename?: string
  title?: string
  sheetName?: string
}

export interface JetroTableProps<T = any> {
  /** Identificador único da tela no ERP (ex: "comercial.pedidos.consulta", "cadastros.produtos") */
  screenId?: string
  /** Alias para screenId utilizado em preferências locais */
  preferenceKey?: string
  /** Definições de colunas */
  columns: JetroColumnDef<T>[]
  /** Dados a serem exibidos */
  data: T[]
  /** Chave única por linha (default: 'id') */
  rowKey?: (keyof T & string) | string | ((row: T) => string)
  /** Se os dados estão sendo carregados */
  loading?: boolean
  /** Mensagem ou componente quando não há dados */
  emptyMessage?: ReactNode
  /** Se a ordenação deve ser tratada no cliente (default: true). Se false, chama onSortingChange */
  clientSorting?: boolean
  /** Callback para ordenação no backend (para paginação de grandes volumes) */
  onSortingChange?: (sorting: SortState | null) => void
  /** Ordenação externa controlada (opcional) */
  externalSorting?: SortState | null
  /** Se deve exibir barra de utilitários da tabela (personalizar colunas, exportação) */
  showToolbar?: boolean
  /** Botões ou filtros extras na toolbar */
  toolbarExtra?: ReactNode
  /** Título para exportação */
  exportTitle?: string
  /** Nome de arquivo padrão para exportação */
  exportFilename?: string
  /** Se deve permitir exportar (default: true) */
  enableExport?: boolean
  /** Quantidade de itens por página quando paginado no cliente */
  pageSize?: number
  /** Classe CSS extra para o container da tabela */
  className?: string
  /** Callback ao clicar na linha */
  onRowClick?: (row: T) => void
  /** Renderizador de detalhes expandidos (opcional) */
  renderSubComponent?: (row: T) => ReactNode
}
