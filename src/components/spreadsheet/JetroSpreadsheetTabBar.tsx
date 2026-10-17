import React from 'react'
import { Plus, X, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SheetData } from '@/types/spreadsheet'

interface JetroSpreadsheetTabBarProps {
  sheets: SheetData[]
  activeSheetIndex: number
  onSelectSheet: (index: number) => void
  onAddSheet?: () => void
  onRemoveSheet?: (index: number) => void
  onRenameSheet?: (index: number, newName: string) => void
  canEdit?: boolean
}

export const JetroSpreadsheetTabBar: React.FC<JetroSpreadsheetTabBarProps> = ({
  sheets,
  activeSheetIndex,
  onSelectSheet,
  onAddSheet,
  onRemoveSheet,
  onRenameSheet,
  canEdit = true,
}) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [editingName, setEditingName] = React.useState('')

  const handleStartRename = (index: number, currentName: string) => {
    if (!canEdit || !onRenameSheet) return
    setEditingIndex(index)
    setEditingName(currentName)
  }

  const handleCommitRename = (index: number) => {
    if (editingName.trim() && onRenameSheet) {
      onRenameSheet(index, editingName.trim())
    }
    setEditingIndex(null)
  }

  return (
    <div className="flex items-center justify-between px-2 bg-gray-100 border-t border-gray-300 shrink-0 h-9 select-none text-xs">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {sheets.map((sheet, idx) => {
          const isActive = idx === activeSheetIndex
          const isEditing = editingIndex === idx

          return (
            <div
              key={sheet.id || idx}
              onClick={() => onSelectSheet(idx)}
              onDoubleClick={() => handleStartRename(idx, sheet.name)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-t-md border-t border-x cursor-pointer transition-colors text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-white text-[#005B2E] border-gray-300 font-semibold shadow-xs -mb-[1px] pb-1.5'
                  : 'bg-gray-200/80 text-gray-700 hover:bg-gray-200 border-transparent'
              }`}
            >
              <FileSpreadsheet
                className={`w-3.5 h-3.5 ${isActive ? 'text-[#005B2E]' : 'text-gray-400'}`}
              />

              {isEditing ? (
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleCommitRename(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitRename(idx)
                    if (e.key === 'Escape') setEditingIndex(null)
                  }}
                  className="w-24 px-1 py-0.5 bg-white border border-[#005B2E] rounded text-xs font-medium focus:outline-none"
                />
              ) : (
                <span>{sheet.name}</span>
              )}

              {canEdit && onRemoveSheet && sheets.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveSheet(idx)
                  }}
                  className="text-gray-400 hover:text-red-600 rounded p-0.5 ml-0.5"
                  title="Excluir aba"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}

        {canEdit && onAddSheet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddSheet}
            className="h-7 w-7 text-gray-600 hover:text-[#005B2E] hover:bg-gray-200 rounded"
            title="Adicionar nova aba"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="text-[11px] text-gray-500 font-mono hidden md:block px-2">
        Aba ativa: {sheets[activeSheetIndex]?.name || '—'}
      </div>
    </div>
  )
}
