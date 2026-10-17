import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { pb } from '@/lib/pocketbase/client'
import { History, CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react'

interface ExecutionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId?: string
  scheduleName?: string
}

export function ExecutionHistoryDialog({
  open,
  onOpenChange,
  scheduleId,
  scheduleName,
}: ExecutionHistoryDialogProps) {
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadHistory = async () => {
    if (!scheduleId) return
    setLoading(true)
    try {
      const res = await pb.collection('report_schedule_executions').getList(1, 50, {
        filter: `schedule_id = "${scheduleId}"`,
        sort: '-executed_at',
      })
      setExecutions(res.items)
    } catch (_) {
      setExecutions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && scheduleId) {
      loadHistory()
    }
  }, [open, scheduleId])

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '—'
    return new Date(isoStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sucesso
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Falha no Envio
          </Badge>
        )
      case 'skipped_empty':
        return (
          <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Sem Registros (Pulado)
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#005B2E]" />
              <DialogTitle className="text-base font-bold text-[#005B2E]">
                Histórico de Execuções — {scheduleName || 'Agendamento'}
              </DialogTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={loadHistory}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Registro de auditoria com data, horário, destinatários, status e mensagens de erro.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Carregando histórico de execuções...
            </div>
          ) : executions.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg space-y-2">
              <Clock className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Nenhuma execução registrada para este agendamento até o momento.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-bold">Data / Horário</TableHead>
                    <TableHead className="text-xs font-bold">Disparo</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">Registros</TableHead>
                    <TableHead className="text-xs font-bold">Destinatários</TableHead>
                    <TableHead className="text-xs font-bold">Duração</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((exec) => (
                    <TableRow key={exec.id}>
                      <TableCell className="text-xs font-medium">
                        {formatDate(exec.executed_at)}
                      </TableCell>
                      <TableCell className="text-xs capitalize">
                        {exec.triggered_by === 'cron'
                          ? 'Automático (Cron)'
                          : exec.triggered_by === 'manual'
                            ? 'Manual (Agora)'
                            : 'Teste'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {renderStatus(exec.status)}
                        {exec.error_message && (
                          <div
                            className="text-[11px] text-red-600 mt-1 max-w-[200px] truncate"
                            title={exec.error_message}
                          >
                            {exec.error_message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {exec.record_count ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[220px] truncate" title={exec.recipients}>
                        {exec.recipients || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {exec.execution_duration_ms
                          ? `${(exec.execution_duration_ms / 1000).toFixed(1)}s`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
