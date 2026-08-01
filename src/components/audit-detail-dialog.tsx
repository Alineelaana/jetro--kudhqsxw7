import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/services/audit-logs'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

export function AuditDetailDialog({ open, onOpenChange, log }: Props) {
  if (!log) return null
  const prevStr = formatValue(log.previous_value)
  const newStr = formatValue(log.new_value)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Detalhes do Registro de Auditoria</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-bold text-[#005B2E]">Data/Hora:</span>{' '}
                {new Date(log.created).toLocaleString('pt-BR')}
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">Usuário:</span> {log.user_name || '—'}
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">Perfil:</span>{' '}
                <Badge variant="outline">{log.user_role || '—'}</Badge>
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">Ação:</span>{' '}
                <Badge variant="outline">{log.action}</Badge>
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">Módulo:</span> {log.module}
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">Coleção:</span> {log.target_collection}
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">ID do Registro:</span>{' '}
                <code className="text-xs">{log.target_id}</code>
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">Resumo:</span>{' '}
                {log.target_summary || '—'}
              </div>
              <div>
                <span className="font-bold text-[#005B2E]">IP:</span> {log.ip_address || '—'}
              </div>
              <div className="sm:col-span-2">
                <span className="font-bold text-[#005B2E]">User Agent:</span>{' '}
                <span className="text-xs break-all">{log.user_agent || '—'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                  Valor Anterior
                </h4>
                <pre className="bg-gray-50 border border-border rounded-lg p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                  {prevStr}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                  Valor Novo
                </h4>
                <pre className="bg-gray-50 border border-border rounded-lg p-3 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                  {newStr}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
