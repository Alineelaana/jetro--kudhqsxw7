import { Receipt, Printer, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BudgetRecord } from '@/lib/types'

interface BudgetRequestActionsProps {
  record: BudgetRecord
  onRespond: (record: BudgetRecord) => void
  onReprint: (record: BudgetRecord) => void
  onSave: (record: BudgetRecord) => void
  savingId: string | null
}

export function BudgetRequestActions({
  record,
  onRespond,
  onReprint,
  onSave,
  savingId,
}: BudgetRequestActionsProps) {
  const isSaving = savingId === record.id

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10 whitespace-nowrap"
        onClick={() => onRespond(record)}
      >
        <Receipt className="w-3.5 h-3.5 mr-1 shrink-0" />
        Responder Orçamento
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-[#C89B3C]/40 text-[#C89B3C] hover:bg-[#C89B3C]/10 whitespace-nowrap"
        onClick={() => onReprint(record)}
      >
        <Printer className="w-3.5 h-3.5 mr-1 shrink-0" />
        Reimprimir
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10 whitespace-nowrap"
        disabled={isSaving}
        onClick={() => onSave(record)}
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 mr-1 shrink-0 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5 mr-1 shrink-0" />
        )}
        Salvar Orçamento
      </Button>
    </div>
  )
}
