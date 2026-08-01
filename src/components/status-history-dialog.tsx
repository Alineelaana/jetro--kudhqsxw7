import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { STATUS_COLORS, type StatusHistoryEntry } from '@/lib/types'

interface StatusHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: StatusHistoryEntry[]
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

export function StatusHistoryDialog({ open, onOpenChange, history }: StatusHistoryDialogProps) {
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
        <div className="max-h-[60vh] overflow-y-auto space-y-3">
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
      </DialogContent>
    </Dialog>
  )
}
