import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Loader2,
  ArrowLeft,
  ClipboardList,
  Activity,
  FileText,
  type LucideIcon,
} from 'lucide-react'

export function DpLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated) return <AdminLogin />
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}

export function DpStatCard({
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

export function DpLoading() {
  return (
    <div className="flex justify-center py-12">
      <Activity className="w-8 h-8 text-[#005B2E] animate-spin" />
    </div>
  )
}
export function DpEmptyState({ message }: { message: string }) {
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
  Ativo: 'bg-emerald-100 text-emerald-700',
  Inativo: 'bg-gray-100 text-gray-600',
  Pendente: 'bg-amber-100 text-amber-700',
  Concluído: 'bg-emerald-100 text-emerald-700',
  Cancelado: 'bg-red-100 text-red-700',
  Cancelada: 'bg-red-100 text-red-700',
  'Em Aberto': 'bg-blue-100 text-blue-700',
  Pago: 'bg-emerald-100 text-emerald-700',
  Vencido: 'bg-red-100 text-red-700',
  Válido: 'bg-emerald-100 text-emerald-700',
  'Próximo do Vencimento': 'bg-amber-100 text-amber-700',
  Entregue: 'bg-emerald-100 text-emerald-700',
  Devolvido: 'bg-gray-100 text-gray-600',
  'Em Andamento': 'bg-amber-100 text-amber-700',
  Concluída: 'bg-emerald-100 text-emerald-700',
  Enviado: 'bg-blue-100 text-blue-700',
  Processado: 'bg-emerald-100 text-emerald-700',
  Rejeitado: 'bg-red-100 text-red-700',
  Planejada: 'bg-blue-100 text-blue-700',
  Suspensos: 'bg-amber-100 text-amber-700',
  Rescindido: 'bg-red-100 text-red-700',
  Aprovado: 'bg-emerald-100 text-emerald-700',
  Fechado: 'bg-gray-100 text-gray-600',
  'Primeira Parcela Paga': 'bg-cyan-100 text-cyan-700',
}

export function DpStatusBadge({ status }: { status: string }) {
  const color = BADGE_COLORS[status] || 'bg-gray-100 text-gray-600'
  return <span className={cn('text-xs font-bold px-2 py-1 rounded', color)}>{status || '—'}</span>
}

export function DpTable({ headers, children }: { headers: string[]; children: ReactNode }) {
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
