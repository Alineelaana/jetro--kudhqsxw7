import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2,
  Clock,
  User,
  Building2,
  FileText,
  Search,
  Filter,
} from 'lucide-react'
import {
  getAuditAlertOccurrences,
  updateAuditOccurrenceStatus,
  type AuditAlertOccurrence,
} from '@/services/audit-rules'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

interface Props {
  onViewLog?: (logId: string) => void
  currentEmpresa?: string
}

export function AuditAlertOccurrencesPanel({ onViewLog, currentEmpresa }: Props) {
  const { user } = useAuth()
  const [occurrences, setOccurrences] = useState<AuditAlertOccurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOccurrence, setSelectedOccurrence] = useState<AuditAlertOccurrence | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const userIdentifier = String(user?.name || user?.login || user?.email || 'admin')
  const filterEmpresa = String(currentEmpresa || (user?.empresa as string) || '')

  const loadOccurrences = async () => {
    setLoading(true)
    try {
      const list = await getAuditAlertOccurrences({
        empresa: String(filterEmpresa || ''),
        status: String(statusFilter || 'all'),
        limit: 100,
      })
      setOccurrences(list)
    } catch {
      toast({ title: 'Erro ao carregar histórico de alertas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOccurrences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, filterEmpresa])

  const handleUpdateStatus = async (
    occ: AuditAlertOccurrence,
    newStatus: 'resolved' | 'dismissed' | 'investigating',
  ) => {
    setUpdating(true)
    try {
      await updateAuditOccurrenceStatus(occ.id, newStatus, userIdentifier, actionNotes)
      toast({
        title:
          newStatus === 'resolved'
            ? 'Alerta resolvido!'
            : newStatus === 'dismissed'
              ? 'Alerta dispensado'
              : 'Marcado como em investigação',
      })
      setDetailOpen(false)
      setSelectedOccurrence(null)
      setActionNotes('')
      await loadOccurrences()
    } catch {
      toast({ title: 'Erro ao atualizar status do alerta', variant: 'destructive' })
    } finally {
      setUpdating(false)
    }
  }

  const openDetails = (occ: AuditAlertOccurrence) => {
    setSelectedOccurrence(occ)
    setActionNotes(occ.resolution_notes || '')
    setDetailOpen(true)
  }

  return (
    <Card className="border-2 border-border/80 shadow-md">
      <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Histórico de Ocorrências e Alertas Identificados
          <Badge variant="outline" className="text-xs ml-1">
            {occurrences.length}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="investigating">Em análise</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
              <SelectItem value="dismissed">Dispensados</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={loadOccurrences}
            disabled={loading}
            className="h-8 text-xs font-semibold border-[#005B2E] text-[#005B2E]"
          >
            <Search className="w-3.5 h-3.5 mr-1" /> Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
          </div>
        ) : occurrences.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Nenhuma ocorrência de alerta registrada para os critérios informados.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {occurrences.map((occ) => {
              const isOpen = occ.status === 'open' || !occ.resolved
              return (
                <div
                  key={occ.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {occ.title || 'Alerta de Auditoria'}
                      </span>
                      <Badge
                        variant={
                          occ.severity === 'critical'
                            ? 'destructive'
                            : occ.severity === 'warning'
                              ? 'outline'
                              : 'secondary'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {occ.severity === 'critical'
                          ? 'Crítico'
                          : occ.severity === 'warning'
                            ? 'Atenção'
                            : 'Info'}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase bg-muted text-muted-foreground"
                      >
                        {occ.module || 'Auditoria'}
                      </Badge>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOpen
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {occ.status === 'resolved' || occ.resolved
                          ? 'Resolvido'
                          : occ.status === 'investigating'
                            ? 'Em Investigação'
                            : 'Pendente'}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{occ.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(occ.created).toLocaleDateString('pt-BR')}{' '}
                          {new Date(occ.created).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>
                          Responsável: <strong>{occ.responsible_user || 'Sistema'}</strong>
                        </span>
                      </div>
                      {occ.action && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            Ação: <strong>{occ.action}</strong>
                          </span>
                        </div>
                      )}
                      {occ.empresa && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{occ.empresa}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetails(occ)}
                      className="h-8 border-[#005B2E] text-[#005B2E]"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Detalhes & Rastreio
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Modal de Detalhes da Ocorrência e Rastreabilidade */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Detalhes da Ocorrência de Alerta
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registro completo de rastreabilidade para auditoria e governança.
            </DialogDescription>
          </DialogHeader>

          {selectedOccurrence && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-muted/40 p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">
                    {selectedOccurrence.title}
                  </span>
                  <Badge variant="outline" className="uppercase font-bold text-[10px]">
                    {selectedOccurrence.severity}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedOccurrence.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 bg-card">
                <div>
                  <span className="text-muted-foreground block">Data e Horário:</span>
                  <strong className="text-foreground">
                    {new Date(selectedOccurrence.created).toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Módulo Auditado:</span>
                  <strong className="text-foreground uppercase">
                    {selectedOccurrence.module || '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Usuário Responsável:</span>
                  <strong className="text-foreground">
                    {selectedOccurrence.responsible_user || 'Sistema'}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block">Ação Realizada:</span>
                  <strong className="text-foreground">
                    {selectedOccurrence.action || 'Operação auditada'}
                  </strong>
                </div>
                {selectedOccurrence.empresa && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Empresa / Filial:</span>
                    <strong className="text-foreground">
                      {selectedOccurrence.empresa}{' '}
                      {selectedOccurrence.filial ? `(${selectedOccurrence.filial})` : ''}
                    </strong>
                  </div>
                )}
                {selectedOccurrence.reason && (
                  <div className="col-span-2 border-t pt-2 mt-1">
                    <span className="text-muted-foreground block">
                      Motivo pelo qual o alerta foi gerado:
                    </span>
                    <p className="font-semibold text-amber-700 dark:text-amber-300 mt-0.5">
                      {selectedOccurrence.reason}
                    </p>
                  </div>
                )}
              </div>

              {selectedOccurrence.metadata &&
                Object.keys(selectedOccurrence.metadata).length > 0 && (
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <span className="text-muted-foreground block font-semibold mb-1">
                      Metadados da Operação:
                    </span>
                    <pre className="text-[11px] font-mono overflow-x-auto p-2 bg-muted rounded border">
                      {JSON.stringify(selectedOccurrence.metadata, null, 2)}
                    </pre>
                  </div>
                )}

              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-foreground block">
                  Parecer / Notas de Resolução:
                </span>
                <Textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Justificativa da tratativa ou observação para a auditoria..."
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedOccurrence && selectedOccurrence.metadata?.audit_log_id && onViewLog && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailOpen(false)
                  onViewLog(String(selectedOccurrence.metadata?.audit_log_id))
                }}
                className="mr-auto text-xs"
              >
                Ver Registro no Log
              </Button>
            )}
            {selectedOccurrence && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedOccurrence, 'investigating')}
                  className="text-xs"
                >
                  Em Análise
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedOccurrence, 'dismissed')}
                  className="text-xs"
                >
                  Dispensar
                </Button>
                <Button
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedOccurrence, 'resolved')}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolver Alerta
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
