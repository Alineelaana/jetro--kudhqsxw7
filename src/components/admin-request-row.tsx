import { AdminRequestDetails } from '@/components/admin-request-details'
import { getResponseTime } from '@/lib/response-time'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  History,
  Receipt,
  Settings2,
  Mail,
  MessageCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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
  onSendEmailClick: (record: BudgetRecord) => void
  onSendWhatsAppClick: (record: BudgetRecord) => void
  compact?: boolean
}

export function AdminRequestRow({
  record,
  labelMap,
  isExpanded,
  onToggle,
  onStatusSelect,
  onHistoryClick,
  onBudgetClick,
  onSendEmailClick,
  onSendWhatsAppClick,
  compact = false,
}: AdminRequestRowProps) {
  const status = record.status || 'PENDENTE'
  const responseTime = getResponseTime(record.created, record.quote_created_at)
  const cellPad = compact ? 'px-3 py-1.5' : 'px-3 py-2.5'
  const iconMd = compact ? 'w-3 h-3' : 'w-4 h-4'
  const iconBtn = compact ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <>
      <tr
        className={cn(
          'border-b border-border hover:bg-[#005B2E]/5 transition-colors cursor-pointer',
          isExpanded && 'bg-[#005B2E]/5',
        )}
        onClick={onToggle}
      >
        <td
          className={cn(cellPad, 'font-semibold text-foreground truncate')}
          title={record.client_name || ''}
        >
          {record.client_name || '—'}
        </td>
        <td
          className={cn(cellPad, 'text-muted-foreground truncate hidden md:table-cell')}
          title={record.client_email || ''}
        >
          {record.client_email || '—'}
        </td>
        <td
          className={cn(cellPad, 'text-muted-foreground truncate hidden lg:table-cell')}
          title={record.client_phone || ''}
        >
          {record.client_phone || '—'}
        </td>
        <td
          className={cn(cellPad, 'text-muted-foreground truncate hidden sm:table-cell')}
          title={record.service || ''}
        >
          {record.service || '—'}
        </td>
        <td
          className={cn(
            cellPad,
            'text-muted-foreground hidden md:table-cell',
            compact ? 'text-[10px]' : 'text-xs sm:text-sm',
          )}
        >
          <span className={responseTime.hasQuote ? 'text-foreground' : 'text-amber-600'}>
            {responseTime.text}
          </span>
          {!responseTime.hasQuote && (
            <span className="text-amber-500 ml-1" title="Aguardando orçamento">
              ●
            </span>
          )}
        </td>
        <td
          className={cn(
            cellPad,
            'text-muted-foreground truncate',
            compact ? 'text-[10px]' : 'text-xs sm:text-sm',
          )}
          title={formatDate(record.created)}
        >
          {formatDate(record.created)}
        </td>
        <td className={cellPad}>
          <span
            className={cn(
              'font-bold px-1.5 py-0.5 rounded border whitespace-nowrap',
              compact ? 'text-[9px]' : 'text-[10px]',
              STATUS_COLORS[status] || STATUS_COLORS['PENDENTE'],
            )}
            title={status}
          >
            {status}
          </span>
        </td>
        <td className={cn(cellPad, 'text-center')} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1 flex-nowrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    iconBtn,
                    'text-[#C89B3C] hover:bg-[#C89B3C]/10 hover:text-[#C89B3C] shrink-0',
                  )}
                  onClick={() => onBudgetClick(record)}
                  aria-label="Orçamento"
                >
                  <Receipt className={iconMd} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Orçamento</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    iconBtn,
                    'text-[#005B2E] hover:bg-[#005B2E]/10 hover:text-[#005B2E] shrink-0',
                  )}
                  onClick={() => onSendEmailClick(record)}
                  aria-label="E-mail"
                >
                  <Mail className={iconMd} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>E-mail</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    iconBtn,
                    'text-[#1da851] hover:bg-[#25D366]/10 hover:text-[#1da851] shrink-0',
                  )}
                  onClick={() => onSendWhatsAppClick(record)}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className={iconMd} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>WhatsApp</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(iconBtn, 'text-[#005B2E] hover:bg-[#005B2E]/10 shrink-0')}
                  onClick={() => onHistoryClick(record)}
                  aria-label="Histórico de alterações"
                >
                  <History className={iconMd} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Histórico de alterações</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(iconBtn, 'text-foreground hover:bg-muted shrink-0')}
                        aria-label="Alterar status"
                      >
                        <Settings2 className={iconMd} />
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
                </span>
              </TooltipTrigger>
              <TooltipContent>Alterar status</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(iconBtn, 'shrink-0')}
                  onClick={onToggle}
                  aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                >
                  {isExpanded ? (
                    <ChevronUp className={cn(iconMd, 'text-[#005B2E]')} />
                  ) : (
                    <ChevronDown className={cn(iconMd, 'text-[#005B2E]')} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={8} className="px-4 py-4">
            <AdminRequestDetails data={record.data} labelMap={labelMap} record={record} />
          </td>
        </tr>
      )}
    </>
  )
}
