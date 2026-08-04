import { useState, useEffect } from 'react'
import { Loader2, Clock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSessionLogs, type AuditLog } from '@/services/audit-logs'

interface Props {
  sessionId: string
  onViewLog?: (log: AuditLog) => void
}

export function AuditSessionTimeline({ sessionId, onViewLog }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getSessionLogs(sessionId)
      .then((result) => setLogs(result))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-4 h-4 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">Nenhum evento nesta sessão.</p>
  }

  return (
    <ScrollArea className="max-h-64">
      <div className="space-y-1 pr-2">
        {logs.map((log, i) => (
          <div
            key={log.id}
            className="flex items-start gap-2 text-sm py-1.5 border-l-2 border-[#005B2E]/30 pl-3 relative"
          >
            <span className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-[#005B2E]" />
            <Clock className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
              {new Date(log.created).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-foreground">{log.action}</span>
              <span className="text-muted-foreground text-xs"> · {log.module}</span>
              {log.target_summary && (
                <span className="text-muted-foreground text-xs"> · {log.target_summary}</span>
              )}
            </div>
            {onViewLog && (
              <button
                onClick={() => onViewLog(log)}
                className="text-xs text-[#005B2E] hover:underline shrink-0"
              >
                Ver
              </button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
