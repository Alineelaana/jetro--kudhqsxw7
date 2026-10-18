import type { ReactNode } from 'react'

export type TableDataType = 'text' | 'number' | 'currency' | 'percent' | 'date' | 'boolean'

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  columnId: string
  direction: 'asc' | 'desc'
}

export interface JetroColumnDef<T = any> {
  id: string
  header: string
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
