import { AdminRequestDetails } from '@/components/admin-request-details'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface BudgetRecord {
  id: string
  data: Record<string, unknown>
  client_name: string
  client_email: string
  client_phone: string
  service: string
  created: string
  updated: string
}

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
}

export function AdminRequestRow({ record, labelMap, isExpanded, onToggle }: AdminRequestRowProps) {
  return (
    <>
      <tr
        className={`border-b border-border cursor-pointer hover:bg-[#005B2E]/5 transition-colors ${
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
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
          {formatDate(record.created)}
        </td>
        <td className="px-4 py-3 text-center">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#005B2E] mx-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#005B2E] mx-auto" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={6} className="px-4 py-4">
            <AdminRequestDetails data={record.data} labelMap={labelMap} />
          </td>
        </tr>
      )}
    </>
  )
}
