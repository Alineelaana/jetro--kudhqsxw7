import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { getAtendimentos } from '@/services/atendimento'
import { useRealtime } from '@/hooks/use-realtime'
import { STATUS_BADGE_COLORS, type AtendimentoRecord } from '@/lib/atendimento-types'
import { Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AtendimentoSla() {
  const [records, setRecords] = useState<AtendimentoRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const all = await getAtendimentos(
        'status != "Finalizado" && status != "Cancelado" && status != "Resolvido"',
      )
      setRecords(all)
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('service_centers', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const now = Date.now()
  const overdue = records.filter(
    (r) => r.data_hora_limite && new Date(r.data_hora_limite).getTime() < now,
  )
  const nearExpiry = records.filter((r) => {
    if (!r.data_hora_limite) return false
    const limite = new Date(r.data_hora_limite).getTime()
    const created = new Date(r.created).getTime()
    const total = limite - created
    const remaining = limite - now
    return remaining > 0 && remaining <= total * 0.2
  })
  const onTrack = records.filter((r) => !overdue.includes(r) && !nearExpiry.includes(r))

  const Section = ({
    title,
    items,
    icon: Icon,
    color,
  }: {
    title: string
    items: AtendimentoRecord[]
    icon: typeof Clock
    color: string
  }) => (
    <Card className={cn('border-2')} style={{ borderColor: `${color}33` }}>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-5 h-5" style={{ color }} />
          <h3 className="font-bold text-sm" style={{ color }}>
            {title} ({items.length})
          </h3>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum atendimento.</p>
        ) : (
          <div className="space-y-1">
            {items.map((r) => (
              <Link
                key={r.id}
                to={`/admin/atendimento/detalhe/${r.id}`}
                className="block p-2 rounded hover:bg-[#005B2E]/5 border-b border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#005B2E]">{r.protocol}</span>
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded',
                      STATUS_BADGE_COLORS[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm">{r.client_name}</p>
                {r.data_hora_limite && (
                  <p className="text-xs text-muted-foreground">
                    Limite: {new Date(r.data_hora_limite).toLocaleString('pt-BR')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Section title="SLA Vencido" items={overdue} icon={AlertTriangle} color="#ef4444" />
        <Section title="Próximo do Vencimento" items={nearExpiry} icon={Clock} color="#f59e0b" />
        <Section title="Dentro do Prazo" items={onTrack} icon={CheckCircle} color="#22c55e" />
      </div>
    </div>
  )
}
