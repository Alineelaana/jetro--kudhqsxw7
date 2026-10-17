import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type {
  CellData,
  CellFormatType,
  CellPosition,
  CellRange,
  SheetData,
  WorkbookData,
} from '@/types/spreadsheet'
import {
  SpreadsheetFormulaEngine,
  colIndexToLetter,
  formatCellAddress,
} from '@/lib/spreadsheet-formula-engine'
import { JetroSpreadsheetToolbar } from './JetroSpreadsheetToolbar'
import { JetroSpreadsheetFormulaBar } from './JetroSpreadsheetFormulaBar'
import { JetroSpreadsheetTabBar } from './JetroSpreadsheetTabBar'
import { JetroSpreadsheetHistoryDialog } from './JetroSpreadsheetHistoryDialog'
import { exportWorkbookToExcel, parseFileToWorkbook } from '@/lib/spreadsheet-file-utils'
import { useToast } from '@/hooks/use-toast'

interface JetroSpreadsheetProps {
  slug: string
  title: string
  initialWorkbook: WorkbookData
  canEdit?: boolean
  canRestore?: boolean
  onSave?: (workbook: WorkbookData) => Promise<void>
  onAutoSave?: (workbook: WorkbookData) => Promise<void>
  hasUnsavedChanges?: boolean
  saving?: boolean
  customHeader?: React.ReactNode
  onCustomImportClick?: () => void
}

export const JetroSpreadsheet: React.FC<JetroSpreadsheetProps> = ({
  slug,
  title,
  initialWorkbook,
  canEdit = true,
  canRestore = true,
  onSave,
  onAutoSave,
  hasUnsavedChanges = false,
  saving = false,
  customHeader,
  onCustomImportClick,
}) => {
  const { toast } = useToast()

  // 1. Estado principal do Workbook
  const [workbook, setWorkbook] = useState<WorkbookData>(() => {
    const engine = new SpreadsheetFormulaEngine(initialWorkbook)
    return engine.recalculateWorkbook()
  })

  // Histórico de Undo / Redo
  const [history, setHistory] = useState<WorkbookData[]>([workbook])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Seleção de célula e edição
  const [selectedCol, setSelectedCol] = useState(0)
  const [selectedRow, setSelectedRow] = useState(1)
  const [selectionRange, setSelectionRange] = useState<CellRange | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  // Edição inline da célula
  const [isEditingCell, setIsEditingCell] = useState(false)
  const [editingValue, setEditingValue] = useState('')

  // Barra de fórmulas
  const [formulaBarValue, setFormulaBarValue] = useState('')

  // Proteção da planilha
  const [isProtected, setIsProtected] = useState(false)

  // Modal de Histórico
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Referência do input de upload de Excel
  const fileInputRef = useRef<HTMLInputElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)

  // Aba ativa atual
  const activeSheet = workbook.sheets[workbook.activeSheetIndex] || workbook.sheets[0]

  // Atualiza quando o initialWorkbook mudar externamente
  useEffect(() => {
    if (initialWorkbook) {
      const engine = new SpreadsheetFormulaEngine(initialWorkbook)
      const calculated = engine.recalculateWorkbook()
      setWorkbook(calculated)
      setHistory([calculated])
      setHistoryIndex(0)
    }
  }, [initialWorkbook])

  // Atualiza barra de fórmulas e input inline conforme seleção
  useEffect(() => {
    if (!activeSheet) return
    const cellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
    const cell = activeSheet.cells[cellKey]
    const rawVal = cell?.raw ?? ''
    setFormulaBarValue(rawVal)
    if (!isEditingCell) {
      setEditingValue(rawVal)
    }
  }, [selectedCol, selectedRow, activeSheet, isEditingCell])

  // Foco automático no input inline ao entrar em modo de edição
  useEffect(() => {
    if (isEditingCell) {
      inlineInputRef.current?.focus()
    }
  }, [isEditingCell])

  // Aplica novo estado de workbook recalculando fórmulas e gravando histórico
  const applyWorkbookChange = useCallback(
    (newWb: WorkbookData, recordHistory = true) => {
      const engine = new SpreadsheetFormulaEngine(newWb)
      const recalculated = engine.recalculateWorkbook()
      setWorkbook(recalculated)

      if (recordHistory) {
        setHistory((prev) => {
          const next = prev.slice(0, historyIndex + 1)
          next.push(recalculated)
          return next
        })
        setHistoryIndex((prev) => prev + 1)
      }
    },
    [historyIndex],
  )

  // -------------------------------------------------------------
  // DESFAZER / REFAZER
  // -------------------------------------------------------------
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1
      setWorkbook(history[nextIdx])
      setHistoryIndex(nextIdx)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1
      setWorkbook(history[nextIdx])
      setHistoryIndex(nextIdx)
    }
  }

  // -------------------------------------------------------------
  // EDIÇÃO DE CÉLULAS E FÓRMULAS
  // -------------------------------------------------------------
  const commitCellValue = (value: string, col = selectedCol, row = selectedRow) => {
    if (!canEdit || !activeSheet) return

    const cellKey = `${colIndexToLetter(col)}${row}`
    const currentCell = activeSheet.cells[cellKey]

    if (currentCell?.readonly && isProtected) {
      toast({
        title: 'Célula protegida',
        description: 'Esta célula está bloqueada contra alterações.',
        variant: 'destructive',
      })
      setIsEditingCell(false)
      return
    }

    const clean = value.trim()
    const isFormula = clean.startsWith('=')

    const updatedCells: Record<string, CellData> = {
      ...activeSheet.cells,
      [cellKey]: {
        ...currentCell,
        raw: value,
        formula: isFormula ? clean.slice(1) : undefined,
      },
    }

    const updatedSheet: SheetData = {
      ...activeSheet,
      cells: updatedCells,
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = updatedSheet

    applyWorkbookChange({
      ...workbook,
      sheets: updatedSheets,
    })

    setIsEditingCell(false)
  }

  // Teclado e navegação pelo grid
  const handleKeyDownGrid = (e: React.KeyboardEvent) => {
    if (isEditingCell) return

    const maxCols = activeSheet?.columns.length || 20
    const maxRows = activeSheet?.rowsCount || 50

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (selectedRow > 1) setSelectedRow((r) => r - 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (selectedRow < maxRows) setSelectedRow((r) => r + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (selectedCol > 0) setSelectedCol((c) => c - 1)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (selectedCol < maxCols - 1) setSelectedCol((c) => c + 1)
        break
      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          if (selectedCol > 0) setSelectedCol((c) => c - 1)
        } else {
          if (selectedCol < maxCols - 1) setSelectedCol((c) => c + 1)
        }
        break
      case 'Enter':
        e.preventDefault()
        setIsEditingCell(true)
        break
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        if (canEdit) {
          commitCellValue('', selectedCol, selectedRow)
        }
        break
      case 'c':
      case 'C':
        if (e.ctrlKey || e.metaKey) {
          // Copiar valor da célula
          const cellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
          const cell = activeSheet?.cells[cellKey]
          const toCopy = cell?.raw ?? ''
          navigator.clipboard?.writeText(toCopy)
          toast({ title: 'Copiado', description: `Conteúdo da célula ${cellKey} copiado.` })
        }
        break
      case 'v':
      case 'V':
        if ((e.ctrlKey || e.metaKey) && canEdit) {
          e.preventDefault()
          navigator.clipboard?.readText().then((clipText) => {
            if (clipText !== undefined) {
              commitCellValue(clipText, selectedCol, selectedRow)
              toast({ title: 'Colado', description: 'Conteúdo inserido na célula.' })
            }
          })
        }
        break
      case 'z':
      case 'Z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          if (e.shiftKey) handleRedo()
          else handleUndo()
        }
        break
      case 'y':
      case 'Y':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          handleRedo()
        }
        break
      case 's':
      case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          if (onSave) onSave(workbook)
        }
        break
      default:
        // Se for caractere digitável, inicia a edição imediatamente
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && canEdit) {
          setEditingValue(e.key)
          setIsEditingCell(true)
        }
        break
    }
  }

  // -------------------------------------------------------------
  // FORMATAÇÃO E ESTILIZAÇÃO
  // -------------------------------------------------------------
  const handleFormat = (formatType: CellFormatType) => {
    if (!canEdit || !activeSheet) return
    const cellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
    const cell = activeSheet.cells[cellKey] || { raw: '' }

    const updatedCells = {
      ...activeSheet.cells,
      [cellKey]: {
        ...cell,
        style: {
          ...cell.style,
          format: formatType,
        },
      },
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = { ...activeSheet, cells: updatedCells }
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  const handleToggleBold = () => {
    if (!canEdit || !activeSheet) return
    const cellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
    const cell = activeSheet.cells[cellKey] || { raw: '' }
    const currentBold = cell.style?.bold ?? false

    const updatedCells = {
      ...activeSheet.cells,
      [cellKey]: {
        ...cell,
        style: { ...cell.style, bold: !currentBold },
      },
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = { ...activeSheet, cells: updatedCells }
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  const handleToggleItalic = () => {
    if (!canEdit || !activeSheet) return
    const cellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
    const cell = activeSheet.cells[cellKey] || { raw: '' }
    const currentItalic = cell.style?.italic ?? false

    const updatedCells = {
      ...activeSheet.cells,
      [cellKey]: {
        ...cell,
        style: { ...cell.style, italic: !currentItalic },
      },
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = { ...activeSheet, cells: updatedCells }
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  const handleAlign = (align: 'left' | 'center' | 'right') => {
    if (!canEdit || !activeSheet) return
    const cellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
    const cell = activeSheet.cells[cellKey] || { raw: '' }

    const updatedCells = {
      ...activeSheet.cells,
      [cellKey]: {
        ...cell,
        style: { ...cell.style, align },
      },
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = { ...activeSheet, cells: updatedCells }
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  // -------------------------------------------------------------
  // OPERAÇÕES DE LINHAS E COLUNAS
  // -------------------------------------------------------------
  const handleInsertRow = () => {
    if (!canEdit || !activeSheet) return
    const targetRow = selectedRow
    const newCells: Record<string, CellData> = {}

    for (const [key, cell] of Object.entries(activeSheet.cells)) {
      const match = key.match(/^([A-Z]+)([0-9]+)$/)
      if (!match) continue
      const col = match[1]
      const r = parseInt(match[2], 10)

      if (r >= targetRow) {
        newCells[`${col}${r + 1}`] = cell
      } else {
        newCells[key] = cell
      }
    }

    const updatedSheet: SheetData = {
      ...activeSheet,
      rowsCount: activeSheet.rowsCount + 1,
      cells: newCells,
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = updatedSheet
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  const handleDeleteRow = () => {
    if (!canEdit || !activeSheet || activeSheet.rowsCount <= 1) return
    const targetRow = selectedRow
    const newCells: Record<string, CellData> = {}

    for (const [key, cell] of Object.entries(activeSheet.cells)) {
      const match = key.match(/^([A-Z]+)([0-9]+)$/)
      if (!match) continue
      const col = match[1]
      const r = parseInt(match[2], 10)

      if (r === targetRow) {
        // Remove
        continue
      } else if (r > targetRow) {
        newCells[`${col}${r - 1}`] = cell
      } else {
        newCells[key] = cell
      }
    }

    const updatedSheet: SheetData = {
      ...activeSheet,
      rowsCount: Math.max(activeSheet.rowsCount - 1, 10),
      cells: newCells,
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = updatedSheet
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  const handleInsertCol = () => {
    if (!canEdit || !activeSheet) return
    const targetCol = selectedCol
    const newCols = [...activeSheet.columns]
    newCols.splice(targetCol + 1, 0, {
      id: colIndexToLetter(newCols.length),
      width: 120,
    })

    const updatedSheet: SheetData = {
      ...activeSheet,
      columns: newCols,
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = updatedSheet
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  const handleDeleteCol = () => {
    if (!canEdit || !activeSheet || activeSheet.columns.length <= 1) return
    const targetCol = selectedCol
    const newCols = [...activeSheet.columns]
    newCols.splice(targetCol, 1)

    const updatedSheet: SheetData = {
      ...activeSheet,
      columns: newCols,
    }

    const updatedSheets = [...workbook.sheets]
    updatedSheets[workbook.activeSheetIndex] = updatedSheet
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  // -------------------------------------------------------------
  // ABAS (MÚLTIPLAS ABAS)
  // -------------------------------------------------------------
  const handleAddSheet = () => {
    if (!canEdit) return
    const nextNum = workbook.sheets.length + 1
    const newSheet: SheetData = {
      id: `sheet-${Date.now()}`,
      name: `Aba ${nextNum}`,
      cells: {},
      columns: Array.from({ length: 15 }, (_, i) => ({ id: colIndexToLetter(i), width: 120 })),
      rowsCount: 50,
      order: workbook.sheets.length,
    }

    const updatedWb = {
      ...workbook,
      sheets: [...workbook.sheets, newSheet],
      activeSheetIndex: workbook.sheets.length,
    }
    applyWorkbookChange(updatedWb)
  }

  const handleRemoveSheet = (idx: number) => {
    if (!canEdit || workbook.sheets.length <= 1) return
    const newSheets = workbook.sheets.filter((_, i) => i !== idx)
    const newActive = Math.min(workbook.activeSheetIndex, newSheets.length - 1)
    applyWorkbookChange({
      ...workbook,
      sheets: newSheets,
      activeSheetIndex: newActive,
    })
  }

  const handleRenameSheet = (idx: number, newName: string) => {
    if (!canEdit) return
    const updatedSheets = [...workbook.sheets]
    updatedSheets[idx] = { ...updatedSheets[idx], name: newName }
    applyWorkbookChange({ ...workbook, sheets: updatedSheets })
  }

  // -------------------------------------------------------------
  // IMPORTAÇÃO / EXPORTAÇÃO
  // -------------------------------------------------------------
  const handleExportExcel = () => {
    exportWorkbookToExcel(workbook, `${slug}.xlsx`)
    toast({ title: 'Exportação concluída', description: 'Planilha Excel gerada com sucesso.' })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      toast({ title: 'Processando arquivo', description: 'Lendo estrutura e abas do Excel...' })
      const parsedWb = await parseFileToWorkbook(file)
      applyWorkbookChange(parsedWb)
      toast({
        title: 'Planilha importada com sucesso',
        description: `${parsedWb.sheets.length} abas carregadas na grade interativa.`,
      })
    } catch (err) {
      console.error('Erro na importação de arquivo:', err)
      toast({
        title: 'Erro ao importar arquivo',
        description: err instanceof Error ? err.message : 'Falha ao processar arquivo Excel.',
        variant: 'destructive',
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Resgata o estilo da célula ativa para refletir nos botões da toolbar
  const activeCellKey = `${colIndexToLetter(selectedCol)}${selectedRow}`
  const activeCell = activeSheet?.cells[activeCellKey]

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* CABEÇALHO CUSTOMIZADO SE FORNECIDO */}
      {customHeader}

      {/* TOOLBAR */}
      <JetroSpreadsheetToolbar
        canEdit={canEdit}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        onSave={() => onSave && onSave(workbook)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onFormat={handleFormat}
        onToggleBold={handleToggleBold}
        isBoldActive={Boolean(activeCell?.style?.bold)}
        onToggleItalic={handleToggleItalic}
        isItalicActive={Boolean(activeCell?.style?.italic)}
        onAlign={handleAlign}
        currentAlign={activeCell?.style?.align}
        onInsertRow={handleInsertRow}
        onDeleteRow={handleDeleteRow}
        onInsertCol={handleInsertCol}
        onDeleteCol={handleDeleteCol}
        onExportExcel={handleExportExcel}
        onImportClick={onCustomImportClick || (() => fileInputRef.current?.click())}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isProtected={isProtected}
        onToggleProtect={() => setIsProtected((p) => !p)}
      />

      {/* INPUT OCULTO DE UPLOAD */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* BARRA DE FÓRMULAS */}
      <JetroSpreadsheetFormulaBar
        selectedCol={selectedCol}
        selectedRow={selectedRow}
        formulaValue={formulaBarValue}
        onChangeFormula={setFormulaBarValue}
        onCommitFormula={() => commitCellValue(formulaBarValue)}
        disabled={!canEdit}
      />

      {/* GRADE DA PLANILHA (SPREADSHEET GRID) */}
      <div
        ref={gridContainerRef}
        tabIndex={0}
        onKeyDown={handleKeyDownGrid}
        className="flex-1 overflow-auto bg-gray-50 focus:outline-none relative"
      >
        <table className="border-collapse table-fixed text-xs font-sans">
          {/* CABEÇALHO DE COLUNAS (A, B, C...) */}
          <thead className="sticky top-0 z-20 bg-gray-100 text-gray-700 select-none shadow-2xs">
            <tr>
              {/* Canto superior esquerdo */}
              <th className="w-12 min-w-[48px] max-w-[48px] h-7 bg-gray-200 border-r border-b border-gray-300 text-center font-mono text-[10px] text-gray-500 sticky left-0 z-30">
                #
              </th>
              {activeSheet?.columns.map((col, colIdx) => {
                const colLetter = colIndexToLetter(colIdx)
                const isColSelected = selectedCol === colIdx
                return (
                  <th
                    key={col.id || colIdx}
                    onClick={() => {
                      setSelectedCol(colIdx)
                      setIsEditingCell(false)
                    }}
                    style={{ width: col.width, minWidth: col.width }}
                    className={`h-7 px-2 border-r border-b border-gray-300 text-center font-mono font-semibold text-[11px] cursor-pointer transition-colors ${
                      isColSelected ? 'bg-emerald-100 text-[#005B2E]' : 'hover:bg-gray-200'
                    }`}
                  >
                    {col.title ? (
                      <div className="flex flex-col">
                        <span>{colLetter}</span>
                        <span className="text-[9px] font-normal text-gray-500 truncate">
                          {col.title}
                        </span>
                      </div>
                    ) : (
                      colLetter
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* CORPO DA GRADE (LINHAS E CÉLULAS) */}
          <tbody className="divide-y divide-gray-200 bg-white font-mono text-[11px]">
            {Array.from({ length: activeSheet?.rowsCount || 50 }, (_, rowIdx) => {
              const rowNum = rowIdx + 1
              const isRowSelected = selectedRow === rowNum

              return (
                <tr key={rowNum} className="h-7 hover:bg-gray-50/50">
                  {/* CABEÇALHO DA LINHA (1, 2, 3...) */}
                  <th
                    onClick={() => {
                      setSelectedRow(rowNum)
                      setIsEditingCell(false)
                    }}
                    className={`w-12 min-w-[48px] max-w-[48px] h-7 px-1 bg-gray-100 border-r border-b border-gray-300 text-center font-mono font-normal text-[10px] text-gray-600 select-none sticky left-0 z-10 cursor-pointer ${
                      isRowSelected
                        ? 'bg-emerald-100 text-[#005B2E] font-bold'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {rowNum}
                  </th>

                  {/* CÉLULAS DA LINHA */}
                  {activeSheet?.columns.map((_, colIdx) => {
                    const colLetter = colIndexToLetter(colIdx)
                    const cellKey = `${colLetter}${rowNum}`
                    const cell = activeSheet.cells[cellKey]
                    const isSelected = selectedCol === colIdx && selectedRow === rowNum
                    const isCurrentlyEditing = isSelected && isEditingCell

                    // Renderização de valor formatado
                    const displayVal = formatDisplayValue(cell)

                    // Estilos da célula
                    const isBold = Boolean(cell?.style?.bold)
                    const isItalic = Boolean(cell?.style?.italic)
                    const align =
                      cell?.style?.align ||
                      (typeof cell?.computedValue === 'number' ? 'right' : 'left')
                    const bgColor = cell?.style?.bgColor || (cell?.error ? '#fef2f2' : undefined)
                    const textColor =
                      cell?.style?.textColor || (cell?.error ? '#b91c1c' : undefined)

                    return (
                      <td
                        key={cellKey}
                        onClick={() => {
                          setSelectedCol(colIdx)
                          setSelectedRow(rowNum)
                          setIsEditingCell(false)
                        }}
                        onDoubleClick={() => {
                          if (canEdit) {
                            setSelectedCol(colIdx)
                            setSelectedRow(rowNum)
                            setIsEditingCell(true)
                          }
                        }}
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                          textAlign: align,
                        }}
                        className={`px-2 py-1 border-r border-b border-gray-200 truncate cursor-cell transition-shadow relative ${
                          isBold ? 'font-bold' : ''
                        } ${isItalic ? 'italic' : ''} ${
                          isSelected ? 'ring-2 ring-[#005B2E] ring-inset z-10 bg-emerald-50/20' : ''
                        }`}
                      >
                        {isCurrentlyEditing ? (
                          <input
                            ref={inlineInputRef}
                            type="text"
                            value={editingValue}
                            onChange={(e) => {
                              setEditingValue(e.target.value)
                              setFormulaBarValue(e.target.value)
                            }}
                            onBlur={() => commitCellValue(editingValue, colIdx, rowNum)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                commitCellValue(editingValue, colIdx, rowNum)
                                setSelectedRow((r) => r + 1)
                              } else if (e.key === 'Tab') {
                                e.preventDefault()
                                commitCellValue(editingValue, colIdx, rowNum)
                                setSelectedCol((c) => c + 1)
                              } else if (e.key === 'Escape') {
                                setIsEditingCell(false)
                              }
                            }}
                            className="absolute inset-0 w-full h-full px-2 text-xs font-mono bg-white text-gray-900 border-2 border-[#005B2E] focus:outline-none z-20 shadow-xs"
                          />
                        ) : (
                          <span>{displayVal}</span>
                        )}

                        {/* Indicador de fórmula */}
                        {cell?.formula && !isCurrentlyEditing && (
                          <div
                            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#005B2E]"
                            title={`Fórmula: =${cell.formula}`}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* BARRA INFERIOR DE ABAS (SHEET TABS) */}
      <JetroSpreadsheetTabBar
        sheets={workbook.sheets}
        activeSheetIndex={workbook.activeSheetIndex}
        onSelectSheet={(idx) => {
          setWorkbook((prev) => ({ ...prev, activeSheetIndex: idx }))
          setSelectedCol(0)
          setSelectedRow(1)
        }}
        onAddSheet={canEdit ? handleAddSheet : undefined}
        onRemoveSheet={canEdit ? handleRemoveSheet : undefined}
        onRenameSheet={canEdit ? handleRenameSheet : undefined}
        canEdit={canEdit}
      />

      {/* DIÁLOGO DE HISTÓRICO DE VERSÕES */}
      <JetroSpreadsheetHistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        slug={slug}
        canRestore={canRestore && canEdit}
        onRestored={(record) => {
          setWorkbook(record.workbook_data)
          toast({
            title: 'Versão restaurada',
            description: `A planilha retornou à versão #${record.version}.`,
          })
        }}
      />
    </div>
  )
}

/**
 * Utilitário para formatar a exibição da célula de acordo com seu estilo ou tipo
 */
function formatDisplayValue(cell?: CellData): string {
  if (!cell) return ''
  if (cell.error) return cell.error

  const val = cell.computedValue !== undefined ? cell.computedValue : cell.raw
  if (val === null || val === undefined || val === '') return ''

  const format = cell.style?.format
  const dec = cell.style?.formatDecimals ?? 2

  if (typeof val === 'number') {
    if (format === 'currency') {
      return val.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: dec,
      })
    }
    if (format === 'percent') {
      return (
        (val * 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: dec,
        }) + '%'
      )
    }
    return val.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
  }

  return String(val)
}
