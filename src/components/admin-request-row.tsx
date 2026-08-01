import { AdminRequestDetails } from '@/components/admin-request-details'
import { getResponseTime } from '@/lib/response-time'
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
}: AdminRequestRowProps) {
  const status = record.status || 'PENDENTE'
  const responseTime = getResponseTime(record.created, record.quote_created_at)

  return (
    <>
      <tr
        className={`border-b border-border hover:bg-[#005B2E]/5 transition-colors cursor-pointer ${
          isExpanded ? 'bg-[#005B2E]/5' : ''
        }`}
        onClick={onToggle}
      >
        <td className="px-3 py-3 font-semibold text-foreground truncate">
          {record.client_name || '—'}
        </td>
        <td className="px-3 py-3 text-muted-foreground truncate hidden md:table-cell">
          {record.client_email || '—'}
        </td>
        <td className="px-3 py-3 text-muted-foreground truncate hidden lg:table-cell">
          {record.client_phone || '—'}
        </td>
        <td className="px-3 py-3 text-muted-foreground truncate hidden sm:table-cell">
          {record.service || '—'}
        </td>
        <td className="px-3 py-3 hidden sm:table-cell">
          <span
            className={`text-xs font-bold px-2 py-1 rounded border whitespace-nowrap ${
              STATUS_COLORS[status] || STATUS_COLORS['PENDENTE']
            }`}
          >
            {status}
          </span>
        </td>
        <td className="px-3 py-3 text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
          <span className={responseTime.hasQuote ? 'text-foreground' : 'text-amber-600'}>
            {responseTime.text}
          </span>
          {!responseTime.hasQuote && (
            <span className="text-amber-500 ml-1" title="Aguardando orçamento">
              ●
            </span>
          )}
        </td>
        <td className="px-3 py-3 text-muted-foreground text-xs sm:text-sm truncate">
          {formatDate(record.created)}
        </td>
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onHistoryClick(record)}
              title="Ver Histórico de Alterações"
            >
              <History className="w-4 h-4 text-[#005B2E]" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 text-xs font-bold whitespace-nowrap"
              onClick={() => onBudgetClick(record)}
              title="Gerar Proposta e PDF"
            >
              <Receipt className="w-3.5 h-3.5 mr-1" />
              <span className="hidden xl:inline">Gerar Orçamento</span>
              <span className="xl:hidden">Orçamento</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 text-xs font-bold whitespace-nowrap"
              onClick={() => onSendEmailClick(record)}
              title="Enviar orçamento por e-mail"
            >
              <Mail className="w-3.5 h-3.5 mr-1 text-[#005B2E]" />
              <span className="hidden 2xl:inline">Enviar por e-mail</span>
              <span className="2xl:hidden">E-mail</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 border-[#25D366] text-[#1da851] hover:bg-[#25D366]/10 text-xs font-bold whitespace-nowrap"
              onClick={() => onSendWhatsAppClick(record)}
              title="Enviar orçamento pelo WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1 text-[#25D366]" />
              <span className="hidden 2xl:inline">Enviar pelo WhatsApp</span>
              <span className="2xl:hidden">WhatsApp</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-border text-foreground hover:bg-muted text-xs font-semibold whitespace-nowrap"
                >
                  <Settings2 className="w-3.5 h-3.5 mr-1" />
                  Status
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
          <td colSpan={8} className="px-4 py-4">
            <AdminRequestDetails data={record.data} labelMap={labelMap} record={record} />
          </td>
        </tr>
      )}
    </>
  )
}
