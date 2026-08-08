import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FinancialLoading } from '@/components/financial/financial-shared'
import { getClientTimeline } from '@/services/collection-center-extended'
import { Phone, MessageCircle, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTION_ICONS: Record<string, any> = {
  contact: Phone,
  send: MessageCircle,
  promise: CheckCircle,
  negotiation: FileText,
  dispute: AlertCircle,
  next_action: Clock,
  payment: CheckCircle,
  created: FileText,
  next_action: Clock,
}

export function CollectionTimeline({ cliente }: { cliente: string | null }) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cliente) {
      setTimeline([])
      return
    }
    setLoading(true)
    getClientTimeline(cliente).then((t) => {
      setTimeline(t)
      setLoading(false)
    })
  }, [cliente])

  if (!cliente) return null
  if (loading) return <FinancialLoading />
  if (timeline.length === 0)
    return <p className="text-xs text-muted-foreground text-center py-4">Sem histórico</p>

  const sorted = [...timeline].sort(
    (a, b) =>
      new Date(b.date || b.datetime || '').getTime() -
      new Date(a.date || a.datetime || '').getTime(),
  )

  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-md">
      <div className="bg-[#01361D] text-white px-3 py-2 text-xs font-bold">Linha do Tempo</div>
      <ScrollArea className="max-h-[30vh]">
        <div className="p-2 space-y-2">
          {sorted.map((entry, i) => {
            const Icon = ACTION_ICONS[entry.action] || Clock
            const dateStr = entry.date || entry.datetime || ''
            const date = dateStr ? new Date(dateStr) : null
            return (
              <div key={i} className="flex gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                      entry.action === 'promise'
                        ? 'bg-blue-100'
                        : entry.action === 'dispute'
                          ? 'bg-purple-100'
                          : 'bg-[#005B2E]/10',
                    )}
                  >
                    <Icon className="w-3 h-3 text-[#005B2E]" />
                  </div>
                  {i < sorted.length - 1 && (
                    <div className="w-px h-full bg-border flex-1 min-h-[8px]" />
                  )}
                </div>
                <div className="pb-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold truncate">{entry.user || 'Sistema'}</span>
                    {date && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {date.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground break-words">
                    {entry.action}
                    {entry.result
                      ? `: ${entry.result}`
                      : entry.observation
                        ? `: ${entry.observation}`
                        : entry.message
                          ? `: ${entry.message}`
                          : ''}
                  </p>
                  {entry.value && <p className="font-bold text-[#005B2E]">{entry.value}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}
