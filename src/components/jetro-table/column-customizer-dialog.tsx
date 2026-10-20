import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { type JetroColumnDef, type TableUserPreferences } from './types'
import {
  RotateCcw,
  Check,
  Columns,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from 'lucide-react'

interface ColumnCustomizerDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: JetroColumnDef<T>[]
  preferences: TableUserPreferences
  onSavePreferences: (updater: (prev: TableUserPreferences) => TableUserPreferences) => void
  onRestoreDefaults: () => void
}

export function ColumnCustomizerDialog<T>({
  open,
  onOpenChange,
  columns,
  preferences,
  onSavePreferences,
  onRestoreDefaults,
}: ColumnCustomizerDialogProps<T>) {
  // Estado local para permitir edição e confirmação
  const [localOrder, setLocalOrder] = useState<string[]>(preferences.columnOrder)
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>(
    preferences.columnVisibility,
  )
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  // Sincroniza sempre que abrir
  React.useEffect(() => {
    if (open) {
      setLocalOrder(preferences.columnOrder)
      setLocalVisibility(preferences.columnVisibility)
    }
  }, [open, preferences])

  const columnsMap = React.useMemo(() => {
    const map = new Map<string, JetroColumnDef<T>>()
    for (const c of columns) {
      map.set(c.id, c)
    }
    return map
  }, [columns])

  const handleToggleVisibility = (columnId: string, checked: boolean) => {
    setLocalVisibility((prev) => ({
      ...prev,
      [columnId]: checked,
    }))
  }

  const handleShowAll = () => {
    const next: Record<string, boolean> = {}
    for (const c of columns) {
      next[c.id] = true
    }
    setLocalVisibility(next)
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= localOrder.length) return
    const next = [...localOrder]
    const temp = next[index]
    next[index] = next[targetIdx]
    next[targetIdx] = temp
    setLocalOrder(next)
  }

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === targetIdx) return
    const next = [...localOrder]
    const item = next.splice(draggedIdx, 1)[0]
    next.splice(targetIdx, 0, item)
    setDraggedIdx(targetIdx)
    setLocalOrder(next)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
  }

  const handleApply = () => {
    onSavePreferences((prev) => ({
      ...prev,
      columnOrder: localOrder,
      columnVisibility: localVisibility,
    }))
    onOpenChange(false)
  }

  const handleRestore = () => {
    onRestoreDefaults()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#063D30]/10 text-[#063D30]">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Personalizar Colunas
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Organize a ordem, mostre ou oculte colunas da tabela conforme sua preferência de
                trabalho.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-2 flex items-center justify-between bg-muted/40 text-xs border-b">
          <span className="text-muted-foreground">
            {Object.values(localVisibility).filter(Boolean).length} de {columns.length} colunas
            visíveis
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleShowAll}
              className="h-7 text-xs text-[#063D30] hover:bg-[#063D30]/10"
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> Mostrar Todas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRestore}
              className="h-7 text-xs text-amber-700 hover:bg-amber-100"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restaurar Padrão
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
          {localOrder.map((columnId, idx) => {
            const col = columnsMap.get(columnId)
            if (!col) return null
            const isVisible = localVisibility[columnId] !== false
            const isHideable = col.hideable !== false

            return (
              <div
                key={columnId}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all select-none ${
                  draggedIdx === idx
                    ? 'border-[#063D30] bg-[#063D30]/10 shadow-md opacity-70'
                    : isVisible
                      ? 'border-border bg-card hover:border-[#063D30]/40'
                      : 'border-dashed border-border/60 bg-muted/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5"
                    title="Arrastar para reordenar"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <Checkbox
                    id={`col-${columnId}`}
                    checked={isVisible}
                    disabled={!isHideable}
                    onCheckedChange={(checked) =>
                      handleToggleVisibility(columnId, Boolean(checked))
                    }
                    className="data-[state=checked]:bg-[#063D30] data-[state=checked]:border-[#063D30]"
                  />
                  <Label
                    htmlFor={`col-${columnId}`}
                    className={`text-sm font-medium cursor-pointer ${
                      isVisible ? 'text-foreground' : 'text-muted-foreground line-through'
                    }`}
                  >
                    {typeof col.header === 'string' ? col.header : col.title || col.id}
                  </Label>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === localOrder.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20 flex sm:justify-between items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="bg-[#063D30] hover:bg-[#042820] text-white font-semibold"
          >
            <Check className="w-4 h-4 mr-1.5" /> Aplicar e Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
