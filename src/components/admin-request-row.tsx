import { AdminRequestDetails } from '@/components/admin-request-details'
import { ChevronDown, ChevronUp, History, Receipt, Settings2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { STATUS_OPTIONS, STATUS_COLORS, type BudgetRecord } from '@/lib/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface AdminRequestRowProps {
  record: BudgetRecord
  labelMap: Record<string, string>
  isExpanded: boolean
  onToggle: () => void
  onStatusSelect: (record: BudgetRecord, status: string) => void
  onHistoryClick: (record: BudgetRecord) => void
  onBudgetClick: (record: BudgetRecord) => void
}

export function AdminRequestRow({
  record,
  labelMap,
  isExpanded,
  onToggle,
  onStatusSelect,
  onHistoryClick,
  onBudgetClick,
}: AdminRequestRowProps) {
  const status = record.status || 'PENDENTE'

  return (
    <>
      <tr
        className={`border-b border-border hover:bg-[#005B2E]/5 transition-colors cursor-pointer ${
          isExpanded ? 'bg-[#005B2E]/5' : ''
        }`}
        onClick={onToggle}
      >
        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
          {record.client_name || '—'}
        </td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap hidden md:table-cell">
          {record.client_email || '—'}
        </td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap hidden lg:table-cell">
          {record.client_phone || '—'}
        </td>
        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell max-w-[220px] truncate">
          {record.service || '—'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
          <span
            className={`text-xs font-bold px-2 py-1 rounded border ${
              STATUS_COLORS[status] || STATUS_COLORS['PENDENTE']
            }`}
          >
            {status}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
          {formatDate(record.created)}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onHistoryClick(record)}
              title="Histórico"
            >
              <History className="w-4 h-4 text-[#005B2E]" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 text-xs font-bold whitespace-nowrap"
              onClick={() => onBudgetClick(record)}
              title="Criar Orçamento"
            >
              <Receipt className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Orçamento</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 text-xs font-bold whitespace-nowrap"
                >
                  <Settings2 className="w-3 h-3 mr-1" />
                  Alterar Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {STATUS_OPTIONS.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => onStatusSelect(record, s)}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onToggle}
              title="Detalhes"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#005B2E]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#005B2E]" />
              )}
            </Button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={7} className="px-4 py-4">
            <AdminRequestDetails data={record.data} labelMap={labelMap} />
          </td>
        </tr>
      )}
    </>
  )
}
