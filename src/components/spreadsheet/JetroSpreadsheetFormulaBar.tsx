import React, { useRef, useEffect } from 'react'
import { FunctionSquare } from 'lucide-react'
import { colIndexToLetter } from '@/lib/spreadsheet-formula-engine'

interface JetroSpreadsheetFormulaBarProps {
  selectedCol: number
  selectedRow: number
  formulaValue: string
  onChangeFormula: (val: string) => void
  onCommitFormula: () => void
  disabled?: boolean
}

export const JetroSpreadsheetFormulaBar: React.FC<JetroSpreadsheetFormulaBarProps> = ({
  selectedCol,
  selectedRow,
  formulaValue,
  onChangeFormula,
  onCommitFormula,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const cellRefStr = `${colIndexToLetter(selectedCol)}${selectedRow}`

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onCommitFormula()
    } else if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-200 shrink-0 text-xs select-none">
      {/* IDENTIFICADOR DA CÉLULA (ex: A1, B3) */}
      <div className="min-w-[54px] px-2 py-1 bg-white border border-gray-300 rounded font-mono font-bold text-gray-800 text-center shadow-2xs">
        {cellRefStr}
      </div>

      <div className="flex items-center text-gray-400">
        <FunctionSquare className="w-4 h-4 text-[#005B2E]" />
      </div>

      {/* INPUT DA FÓRMULA / VALOR BRUTO */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={formulaValue}
          onChange={(e) => onChangeFormula(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCommitFormula}
          disabled={disabled}
          placeholder="Digite um valor ou uma fórmula começando com = (ex: =B3*1.2 ou =SOMA(C3:C14))"
          className="w-full h-7 px-2.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900 focus:outline-none focus:border-[#005B2E] focus:ring-1 focus:ring-[#005B2E] disabled:bg-gray-100 disabled:text-gray-500 shadow-2xs"
        />
      </div>
    </div>
  )
}
