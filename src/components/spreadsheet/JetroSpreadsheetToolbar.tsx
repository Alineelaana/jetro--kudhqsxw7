import React from 'react'
import {
  Save,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Download,
  Upload,
  Percent,
  DollarSign,
  History,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { CellFormatType } from '@/types/spreadsheet'

interface JetroSpreadsheetToolbarProps {
  canEdit: boolean
  hasUnsavedChanges: boolean
  saving: boolean
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onFormat: (format: CellFormatType) => void
  onToggleBold: () => void
  isBoldActive: boolean
  onToggleItalic: () => void
  isItalicActive: boolean
  onAlign: (align: 'left' | 'center' | 'right') => void
  currentAlign?: 'left' | 'center' | 'right'
  onInsertRow: () => void
  onDeleteRow: () => void
  onInsertCol: () => void
  onDeleteCol: () => void
  onExportExcel: () => void
  onImportClick: () => void
  onOpenHistory?: () => void
  isProtected?: boolean
  onToggleProtect?: () => void
}

export const JetroSpreadsheetToolbar: React.FC<JetroSpreadsheetToolbarProps> = ({
  canEdit,
  hasUnsavedChanges,
  saving,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onFormat,
  onToggleBold,
  isBoldActive,
  onToggleItalic,
  isItalicActive,
  onAlign,
  currentAlign = 'left',
  onInsertRow,
  onDeleteRow,
  onInsertCol,
  onDeleteCol,
  onExportExcel,
  onImportClick,
  onOpenHistory,
  isProtected,
  onToggleProtect,
}) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-b border-gray-200 shrink-0 flex-wrap text-xs select-none">
      {/* SALVAR */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!canEdit || saving || !hasUnsavedChanges}
            className={`h-7 px-2.5 text-xs font-semibold gap-1.5 ${
              hasUnsavedChanges
                ? 'bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          Salvar alterações no banco de dados (Ctrl+S)
        </TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* DESFAZER / REFAZER */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-7 w-7 text-gray-700 hover:text-black"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Desfazer (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-7 w-7 text-gray-700 hover:text-black"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Refazer (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* FORMATAÇÃO DE TEXTO */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isBoldActive ? 'secondary' : 'ghost'}
            size="icon"
            onClick={onToggleBold}
            disabled={!canEdit}
            className={`h-7 w-7 ${isBoldActive ? 'bg-emerald-100 text-[#005B2E] font-bold' : 'text-gray-700'}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Negrito (Ctrl+B)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isItalicActive ? 'secondary' : 'ghost'}
            size="icon"
            onClick={onToggleItalic}
            disabled={!canEdit}
            className={`h-7 w-7 ${isItalicActive ? 'bg-emerald-100 text-[#005B2E]' : 'text-gray-700'}`}
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Itálico (Ctrl+I)</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* FORMATAÇÃO NUMÉRICA */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFormat('currency')}
            disabled={!canEdit}
            className="h-7 w-7 text-gray-700 hover:text-[#005B2E]"
          >
            <DollarSign className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Formatar como Moeda (R$)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFormat('percent')}
            disabled={!canEdit}
            className="h-7 w-7 text-gray-700 hover:text-[#005B2E]"
          >
            <Percent className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Formatar como Porcentagem (%)</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* ALINHAMENTO */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentAlign === 'left' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onAlign('left')}
            disabled={!canEdit}
            className="h-7 w-7 text-gray-700"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Alinhar à Esquerda</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentAlign === 'center' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onAlign('center')}
            disabled={!canEdit}
            className="h-7 w-7 text-gray-700"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Centralizar</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentAlign === 'right' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onAlign('right')}
            disabled={!canEdit}
            className="h-7 w-7 text-gray-700"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Alinhar à Direita</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* INSERIR / REMOVER LINHAS E COLUNAS */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onInsertRow}
            disabled={!canEdit}
            className="h-7 px-2 text-[11px] gap-1 text-gray-700"
          >
            <Plus className="w-3 h-3 text-[#005B2E]" />
            Linha
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Inserir Linha abaixo da seleção</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteRow}
            disabled={!canEdit}
            className="h-7 px-2 text-[11px] gap-1 text-gray-700 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
            Linha
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Excluir Linha selecionada</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onInsertCol}
            disabled={!canEdit}
            className="h-7 px-2 text-[11px] gap-1 text-gray-700"
          >
            <Plus className="w-3 h-3 text-[#005B2E]" />
            Coluna
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Inserir Coluna à direita da seleção</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteCol}
            disabled={!canEdit}
            className="h-7 px-2 text-[11px] gap-1 text-gray-700 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
            Coluna
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Excluir Coluna selecionada</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* IMPORT / EXPORT */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onImportClick}
            disabled={!canEdit}
            className="h-7 px-2 text-[11px] gap-1 text-[#005B2E] font-medium"
          >
            <Upload className="w-3 h-3" />
            Importar Excel
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Carregar arquivo Excel (.xlsx)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportExcel}
            className="h-7 px-2 text-[11px] gap-1 text-[#005B2E] font-medium"
          >
            <Download className="w-3 h-3" />
            Exportar Excel
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          Baixar arquivo .xlsx com fórmulas originais
        </TooltipContent>
      </Tooltip>

      {/* VERSÕES E HISTÓRICO */}
      {onOpenHistory && (
        <>
          <div className="h-4 w-px bg-gray-300 mx-0.5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenHistory}
                className="h-7 px-2 text-[11px] gap-1 text-gray-700"
              >
                <History className="w-3 h-3 text-[#C9A227]" />
                Versões
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Histórico de versões e restauração</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* PROTEÇÃO DE CÉLULAS */}
      {onToggleProtect && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleProtect}
              disabled={!canEdit}
              className="h-7 w-7 text-gray-600 ml-auto"
            >
              {isProtected ? (
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-gray-400" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            {isProtected ? 'Planilha Protegida (Células travadas)' : 'Planilha Desbloqueada'}
          </TooltipContent>
        </Tooltip>
      )}

      {!canEdit && (
        <div className="ml-auto flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Modo Somente Leitura</span>
        </div>
      )}
    </div>
  )
}
