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
  const cellPad = compact ? 'px-3 py-1.5' : 'px-3 py-3'
  const iconSm = compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
  const iconMd = compact ? 'w-3 h-3' : 'w-4 h-4'
  const btnH = compact ? 'h-6 px-2 text-[10px]' : 'h-8 text-xs'
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
        <td className={cn(cellPad, 'hidden sm:table-cell')}>
          <span
            className={cn(
              'font-bold px-2 py-0.5 rounded border whitespace-nowrap',
              compact ? 'text-[10px]' : 'text-xs',
              STATUS_COLORS[status] || STATUS_COLORS['PENDENTE'],
            )}
            title={status}
          >
            {status}
          </span>
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
        <td className={cellPad} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              size="icon"
              variant="ghost"
              className={iconBtn}
              onClick={() => onHistoryClick(record)}
              title="Ver Histórico de Alterações"
            >
              <History className={cn(iconMd, 'text-[#005B2E]')} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn(
                'border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 font-bold whitespace-nowrap',
                btnH,
              )}
              onClick={() => onBudgetClick(record)}
              title="Gerar Proposta e PDF"
            >
              <Receipt className={cn(iconSm, 'mr-1')} />
              <span className="hidden xl:inline">Orçamento</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn(
                'border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold whitespace-nowrap',
                btnH,
              )}
              onClick={() => onSendEmailClick(record)}
              title="Enviar orçamento por e-mail"
            >
              <Mail className={cn(iconSm, 'mr-1 text-[#005B2E]')} />
              <span className="hidden 2xl:inline">E-mail</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn(
                'border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10 font-bold whitespace-nowrap',
                btnH,
              )}
              onClick={() => onSendWhatsAppClick(record)}
              title="Enviar orçamento pelo WhatsApp"
            >
              <MessageCircle className={cn(iconSm, 'mr-1 text-[#25D366]')} />
              <span className="hidden 2xl:inline">WhatsApp</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    'border-border text-foreground hover:bg-muted font-semibold whitespace-nowrap',
                    btnH,
                  )}
                >
                  <Settings2 className={cn(iconSm, 'mr-1')} /> Status
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
              className={iconBtn}
              onClick={onToggle}
              title="Detalhes"
            >
              {isExpanded ? (
                <ChevronUp className={cn(iconMd, 'text-[#005B2E]')} />
              ) : (
                <ChevronDown className={cn(iconMd, 'text-[#005B2E]')} />
              )}
            </Button>
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
