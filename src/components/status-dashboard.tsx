import { Card, CardContent } from '@/components/ui/card'
import { type BudgetRecord } from '@/lib/types'
import { Clock, TrendingUp, Phone, CheckCircle2, XCircle } from 'lucide-react'

interface StatusDashboardProps {
  records: BudgetRecord[]
}

const STATUS_META = [
  {
    status: 'PENDENTE',
    label: 'Pendentes',
    Icon: Clock,
    color: 'text-amber-600',
    bar: 'bg-amber-500',
  },
  {
    status: 'EM ANDAMENTO',
    label: 'Em Andamento',
    Icon: TrendingUp,
    color: 'text-blue-600',
    bar: 'bg-blue-500',
  },
  {
    status: 'EM CONTATO COM O CLIENTE',
    label: 'Em Contato',
    Icon: Phone,
    color: 'text-cyan-600',
    bar: 'bg-cyan-500',
  },
  {
    status: 'CONCLUÍDO',
    label: 'Concluídos',
    Icon: CheckCircle2,
    color: 'text-green-600',
    bar: 'bg-green-500',
  },
  {
    status: 'CANCELADO',
    label: 'Cancelados',
    Icon: XCircle,
    color: 'text-red-600',
    bar: 'bg-red-500',
  },
] as const

export function StatusDashboard({ records }: StatusDashboardProps) {
  const total = records.length || 1

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {STATUS_META.map(({ status, label, Icon, color, bar }) => {
        const count = records.filter((r) => (r.status || 'PENDENTE') === status).length
        const pct = Math.round((count / total) * 100)
        return (
          <Card key={status} className="border-2 border-[#005B2E]/10 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-2xl font-black text-foreground">{count}</span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`${bar} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">{pct}%</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
