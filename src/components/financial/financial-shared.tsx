import { type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon, Activity, FileText } from 'lucide-react'

export function FinancialStatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
}) {
  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-black text-foreground truncate">{value}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function FinancialLoading() {
  return (
    <div className="flex justify-center py-12">
      <Activity className="w-8 h-8 text-[#005B2E] animate-spin" />
    </div>
  )
}

export function FinancialEmptyState({ message }: { message: string }) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="py-16 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-bold">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">Clique em "Novo" para começar.</p>
      </CardContent>
    </Card>
  )
}

const BADGE_COLORS: Record<string, string> = {
  'Em Aberto': 'bg-blue-100 text-blue-700',
  Pago: 'bg-emerald-100 text-emerald-700',
  Recebido: 'bg-emerald-100 text-emerald-700',
  Vencido: 'bg-red-100 text-red-700',
  Cancelado: 'bg-red-100 text-red-700',
  Cancelada: 'bg-red-100 text-red-700',
  Aprovado: 'bg-emerald-100 text-emerald-700',
  Aprovada: 'bg-emerald-100 text-emerald-700',
  Pendente: 'bg-amber-100 text-amber-700',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  Realizada: 'bg-cyan-100 text-cyan-700',
  Conciliada: 'bg-emerald-100 text-emerald-700',
  Compensado: 'bg-emerald-100 text-emerald-700',
  Aberto: 'bg-blue-100 text-blue-700',
  Fechado: 'bg-gray-100 text-gray-600',
}

export function StatusBadge({ status }: { status: string }) {
  const color = BADGE_COLORS[status] || 'bg-gray-100 text-gray-600'
  return <span className={cn('text-xs font-bold px-2 py-1 rounded', color)}>{status || '—'}</span>
}

export function FinancialTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#01361D] text-white">
              {headers.map((h, i) => (
                <th key={i} className="text-left px-3 py-3 font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  )
}
