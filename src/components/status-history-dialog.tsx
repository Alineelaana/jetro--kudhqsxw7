import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { STATUS_COLORS, type StatusHistoryEntry, type SendingHistoryEntry } from '@/lib/types'
import { Mail, MessageCircle } from 'lucide-react'

interface StatusHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: StatusHistoryEntry[]
  sendingHistory?: SendingHistoryEntry[]
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

export function StatusHistoryDialog({
  open,
  onOpenChange,
  history,
  sendingHistory = [],
}: StatusHistoryDialogProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de Status</DialogTitle>
          <DialogDescription>
            Todas as atualizações registradas para esta solicitação.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto space-y-3">
          {sorted.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum histórico disponível.</p>
          ) : (
            sorted.map((entry, i) => (
              <div key={i} className="border-l-2 border-[#005B2E]/30 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      STATUS_COLORS[entry.status] || ''
                    }`}
                  >
                    {entry.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                </div>
                <p className="text-sm text-foreground/90 break-words">{entry.note || 'Sem nota'}</p>
                <p className="text-xs text-muted-foreground mt-1">Por: {entry.author}</p>
              </div>
            ))
          )}
        </div>

        {sendingHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-bold text-[#005B2E] mb-3">Histórico de Envios</h4>
            <div className="space-y-2">
              {sendingHistory.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  {entry.channel === 'email' ? (
                    <Mail className="w-4 h-4 text-[#005B2E] shrink-0" />
                  ) : (
                    <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {entry.channel === 'email' ? 'E-mail' : 'WhatsApp'} → {entry.recipient || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enviado por: {entry.sender || '—'} • {formatDate(entry.sent_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
