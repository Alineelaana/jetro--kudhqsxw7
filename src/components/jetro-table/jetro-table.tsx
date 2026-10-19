import React, { useState, useMemo, useRef, useCallback } from 'react'
import {
  type JetroColumnDef,
  type SortState,
  type SortDirection,
  type TableUserPreferences,
} from './types'
import { useTablePreferences } from './use-table-preferences'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { compareValues } from './table-sort'
import { exportTableToExcel, exportTableToPdf } from './table-export'
import { ColumnCustomizerDialog } from './column-customizer-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Printer,
  GripVertical,
} from 'lucide-react'

export interface JetroTableProps<T> {
  /** Identificador único da tela no ERP (ex: "comercial.pedidos.consulta", "cadastros.produtos") */
  screenId: string
  /** Definições de colunas */
  columns: JetroColumnDef<T>[]
  /** Dados a serem exibidos */
  data: T[]
  /** Chave única por linha (default: 'id') */
  rowKey?: keyof T | ((row: T) => string)
  /** Se os dados estão sendo carregados */
  loading?: boolean
  /** Mensagem ou componente quando não há dados */
  emptyMessage?: React.ReactNode
  /** Se a ordenação deve ser tratada no cliente (default: true). Se false, chama onSortingChange */
  clientSorting?: boolean
  /** Callback para ordenação no backend (para paginação de grandes volumes) */
  onSortingChange?: (sorting: SortState | null) => void
  /** Ordenação externa controlada (opcional) */
  externalSorting?: SortState | null
  /** Se deve exibir barra de utilitários da tabela (personalizar colunas, exportação) */
  showToolbar?: boolean
  /** Botões ou filtros extras na toolbar */
  toolbarExtra?: React.ReactNode
  /** Título para exportação */
  exportTitle?: string
  /** Nome de arquivo padrão para exportação */
  exportFilename?: string
  /** Se deve permitir exportar (default: true) */
  enableExport?: boolean
  /** Classe CSS extra para o container da tabela */
  className?: string
  /** Callback ao clicar na linha */
  onRowClick?: (row: T) => void
  /** Renderizador de detalhes expandidos (opcional) */
  renderSubComponent?: (row: T) => React.ReactNode
}

export function JetroTable<T extends object = Record<string, any>>({
  screenId,
  columns,
  data,
  rowKey = 'id',
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  clientSorting = true,
  onSortingChange,
  externalSorting,
  showToolbar = true,
  toolbarExtra,
  exportTitle = 'Relatório de Dados — Jetro ERP',
  exportFilename,
  enableExport = true,
  className = '',
  onRowClick,
}: JetroTableProps<T>) {
  const { preferences, savePreferences, restoreDefaults } = useTablePreferences(screenId, columns)
  const { preferences: globalPrefs } = useUserPreferences()

  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [draggedColId, setDraggedColId] = useState<string | null>(null)
  const [dropTargetColId, setDropTargetColId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null)

  // Resizing state
  const resizingRef = useRef<{
    colId: string
    startX: number
    startWidth: number
    minWidth: number
    maxWidth?: number
  } | null>(null)

  // Mapeamento rápido de colunas
  const columnsMap = useMemo(() => {
    const map = new Map<string, JetroColumnDef<T>>()
    for (const c of columns) {
      map.set(c.id, c)
    }
    return map
  }, [columns])

  // Colunas ordenadas e visíveis segundo as preferências salvas
  const visibleColumns = useMemo(() => {
    const ordered: JetroColumnDef<T>[] = []
    for (const colId of preferences.columnOrder) {
      const col = columnsMap.get(colId)
      if (col && preferences.columnVisibility[colId] !== false) {
        ordered.push(col)
      }
    }
    return ordered
  }, [preferences.columnOrder, preferences.columnVisibility, columnsMap])

  // Ordenação ativa (externa ou salva nas preferências)
  const activeSorting = externalSorting !== undefined ? externalSorting : preferences.sorting

  // Manipular clique de ordenação (1º clique asc, 2º desc, 3º null/padrão)
  const handleSortClick = (column: JetroColumnDef<T>) => {
    if (column.sortable === false) return

    let nextSort: SortState | null = null
    if (!activeSorting || activeSorting.columnId !== column.id) {
      nextSort = { columnId: column.id, direction: 'asc' }
    } else if (activeSorting.direction === 'asc') {
      nextSort = { columnId: column.id, direction: 'desc' }
    } else {
      nextSort = null
    }

    if (externalSorting === undefined) {
      savePreferences((prev) => ({
        ...prev,
        sorting: nextSort,
      }))
    }
    onSortingChange?.(nextSort)
  }

  // Ordenar dados no cliente se clientSorting for true
  const sortedData = useMemo(() => {
    if (!clientSorting || !activeSorting) return data
    const col = columnsMap.get(activeSorting.columnId)
    if (!col) return data

    const sorted = [...data]
    sorted.sort((rowA, rowB) => {
      let valA: unknown = ''
      let valB: unknown = ''

      if (col.getSortValue) {
        valA = col.getSortValue(rowA)
        valB = col.getSortValue(rowB)
      } else if (col.accessorKey) {
        valA = rowA[col.accessorKey]
        valB = rowB[col.accessorKey]
      }

      return compareValues(valA, valB, col.dataType || 'text', activeSorting.direction)
    })
    return sorted
  }, [data, activeSorting, clientSorting, columnsMap])

  // =====================
  // Drag & Drop de Colunas
  // =====================
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    // Não arrastar se estiver no handle de resize
    setDraggedColId(colId)
    e.dataTransfer.setData('text/plain', colId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    if (!draggedColId || draggedColId === colId) return

    const rect = e.currentTarget.getBoundingClientRect()
    const midX = rect.left + rect.width / 2
    const position = e.clientX < midX ? 'before' : 'after'

    setDropTargetColId(colId)
    setDropPosition(position)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Limpa apenas se sair do cabeçalho
    const related = e.relatedTarget as Node | null
    if (!e.currentTarget.contains(related)) {
      setDropTargetColId(null)
      setDropPosition(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault()
    if (!draggedColId || draggedColId === targetColId) {
      setDraggedColId(null)
      setDropTargetColId(null)
      setDropPosition(null)
      return
    }

    savePreferences((prev) => {
      const nextOrder = [...prev.columnOrder]
      const sourceIdx = nextOrder.indexOf(draggedColId)
      if (sourceIdx < 0) return prev

      nextOrder.splice(sourceIdx, 1)
      const targetIdx = nextOrder.indexOf(targetColId)
      const insertAt = dropPosition === 'after' ? targetIdx + 1 : targetIdx
      nextOrder.splice(insertAt, 0, draggedColId)

      return {
        ...prev,
        columnOrder: nextOrder,
      }
    })

    setDraggedColId(null)
    setDropTargetColId(null)
    setDropPosition(null)
  }

  const handleDragEnd = () => {
    setDraggedColId(null)
    setDropTargetColId(null)
    setDropPosition(null)
  }

  // =====================
  // Redimensionamento de Coluna
  // =====================
  const handleResizeStart = (
    e: React.MouseEvent,
    colId: string,
    minWidth = 70,
    maxWidth?: number,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const currentWidth = preferences.columnWidths[colId] || 150

    resizingRef.current = {
      colId,
      startX: e.clientX,
      startWidth: currentWidth,
      minWidth,
      maxWidth,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return
      const delta = moveEvent.clientX - resizingRef.current.startX
      let newWidth = Math.max(resizingRef.current.minWidth, resizingRef.current.startWidth + delta)
      if (resizingRef.current.maxWidth) {
        newWidth = Math.min(resizingRef.current.maxWidth, newWidth)
      }

      savePreferences((prev) => ({
        ...prev,
        columnWidths: {
          ...prev.columnWidths,
          [resizingRef.current!.colId]: Math.round(newWidth),
        },
      }))
    }

    const handleMouseUp = () => {
      resizingRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Exportações
  const handleExportExcel = () => {
    const filename =
      exportFilename ||
      `${screenId.replace(/\./g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`
    exportTableToExcel(sortedData, columns, preferences, filename, exportTitle)
  }

  const handleExportPdf = () => {
    exportTableToPdf(sortedData, columns, preferences, exportTitle)
  }

  // Determinar chave da linha
  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(row)
      if (row && typeof row === 'object' && rowKey in row) {
        return String((row as any)[rowKey])
      }
      return String(index)
    },
    [rowKey],
  )

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {/* Barra de utilitários da tabela */}
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2">{toolbarExtra}</div>

          <div className="flex items-center gap-2 ml-auto">
            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sortedData.length === 0}
                    className="h-8 text-xs font-semibold border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer text-xs">
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-700" />
                    Exportar Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer text-xs">
                    <Printer className="w-4 h-4 mr-2 text-blue-700" />
                    Imprimir / PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="outline"
              size="sm"
              data-tour-id="pedidos-btn-personalizar-colunas"
              onClick={() => setCustomizerOpen(true)}
              className="h-8 text-xs font-semibold border-border hover:bg-muted"
              title="Personalizar colunas visíveis e ordem"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-[#005B2E]" />
              Personalizar Colunas
            </Button>

            {(Object.values(preferences.columnVisibility).some((v) => !v) ||
              preferences.sorting !== null) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={restoreDefaults}
                className="h-8 text-xs text-amber-700 hover:bg-amber-100"
                title="Restaurar visualização original de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Restaurar Padrão
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Container da tabela */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">
            <thead
              data-tour-id="pedidos-tabela-head"
              className={globalPrefs.tableStickyHeader ? 'sticky top-0 z-10' : ''}
            >
              <tr className="bg-[#005B2E] text-white select-none">
                {visibleColumns.map((col) => {
                  const isSorted = activeSorting?.columnId === col.id
                  const sortDir = isSorted ? activeSorting.direction : null
                  const isDropTarget = dropTargetColId === col.id
                  const isDraggable = col.draggable !== false
                  const isResizable = col.resizable !== false
                  const isSortable = col.sortable !== false
                  const width = preferences.columnWidths[col.id] || col.defaultWidth

                  return (
                    <th
                      key={col.id}
                      draggable={isDraggable}
                      onDragStart={(e) => handleDragStart(e, col.id)}
                      onDragOver={(e) => handleDragOver(e, col.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, col.id)}
                      onDragEnd={handleDragEnd}
                      style={width ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
                      className={`relative px-3 py-3 font-bold text-xs uppercase tracking-wider transition-colors ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                      } ${
                        isSortable ? 'cursor-pointer hover:bg-[#01361D]' : ''
                      } ${col.headerClassName || ''} ${
                        isDropTarget && dropPosition === 'before'
                          ? 'border-l-4 border-[#C9A227]'
                          : ''
                      } ${
                        isDropTarget && dropPosition === 'after'
                          ? 'border-r-4 border-[#C9A227]'
                          : ''
                      }`}
                      onClick={(e) => {
                        // Não ordenar se o clique veio do resize handle ou de drag
                        const target = e.target as HTMLElement
                        if (target.classList.contains('table-resize-handle')) return
                        handleSortClick(col)
                      }}
                      title={
                        isSortable
                          ? `Clique para ordenar por ${col.header || col.title || col.id} (1º asc, 2º desc, 3º padrão)`
                          : undefined
                      }
                    >
                      <div
                        className={`flex items-center gap-1.5 ${
                          col.align === 'center'
                            ? 'justify-center'
                            : col.align === 'right'
                              ? 'justify-end'
                              : 'justify-start'
                        }`}
                      >
                        {isDraggable && (
                          <span
                            className="opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing text-white"
                            title="Arrastar coluna para reordenar"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>
                        )}

                        <span className="truncate">{col.header || col.title || col.id}</span>

                        {isSortable && (
                          <span
                            className={`inline-flex items-center transition-transform ${
                              isSorted
                                ? 'text-[#C9A227] font-black scale-110'
                                : 'opacity-40 hover:opacity-80'
                            }`}
                          >
                            {sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Resize handle */}
                      {isResizable && (
                        <div
                          className="table-resize-handle absolute top-0 right-0 w-2 h-full cursor-col-resize select-none hover:bg-[#C9A227] transition-colors opacity-0 hover:opacity-100"
                          onMouseDown={(e) =>
                            handleResizeStart(e, col.id, col.minWidth || 70, col.maxWidth)
                          }
                          title="Arrastar borda para redimensionar coluna"
                        />
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length || 1}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#005B2E] border-t-transparent rounded-full animate-spin" />
                      <span>Carregando dados...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length || 1}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => {
                  const key = getRowKey(row, index)
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={`border-b border-border/60 transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-[#005B2E]/5' : 'hover:bg-muted/40'
                      } ${
                        globalPrefs.tableStripedRows && index % 2 === 1
                          ? 'bg-muted/20 dark:bg-muted/10'
                          : 'bg-card'
                      }`}
                    >
                      {visibleColumns.map((col) => {
                        let value: unknown = ''
                        if (col.accessorKey) {
                          value = (row as any)[col.accessorKey]
                        }

                        const rendered = col.cell
                          ? col.cell({ row, value, index })
                          : value === null || value === undefined
                            ? '—'
                            : String(value)

                        const width = preferences.columnWidths[col.id] || col.defaultWidth

                        return (
                          <td
                            key={col.id}
                            style={
                              width ? { width: `${width}px`, minWidth: `${width}px` } : undefined
                            }
                            className={`px-3 py-2.5 text-xs text-foreground align-middle ${
                              col.align === 'center'
                                ? 'text-center'
                                : col.align === 'right'
                                  ? 'text-right'
                                  : 'text-left'
                            } ${col.className || ''}`}
                          >
                            {rendered}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de personalização de colunas */}
      <ColumnCustomizerDialog
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        columns={columns}
        preferences={preferences}
        onSavePreferences={savePreferences}
        onRestoreDefaults={restoreDefaults}
      />
    </div>
  )
}
