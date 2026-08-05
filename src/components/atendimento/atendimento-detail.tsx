import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  getAtendimento,
  updateAtendimento,
  getHistorico,
  getStageStatuses,
  getMotivos,
  classifyWithAI,
  stageAction,
} from '@/services/atendimento'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  ATENDIMENTO_STATUS,
  STATUS_BADGE_COLORS,
  STAGE_STATUS,
  type AtendimentoRecord,
  type HistoricoRecord,
  type StageStatusRecord,
  type MotivoRecord,
} from '@/lib/atendimento-types'
import { Loader2, Send, Sparkles, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function AtendimentoDetail({ id }: { id: string }) {
  const { user } = useAuth()
  const [record, setRecord] = useState<AtendimentoRecord | null>(null)
  const [historico, setHistorico] = useState<HistoricoRecord[]>([])
  const [stages, setStages] = useState<StageStatusRecord[]>([])
  const [motivos, setMotivos] = useState<MotivoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [internalMsg, setInternalMsg] = useState('')
  const [clientMsg, setClientMsg] = useState('')
  const [classifying, setClassifying] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      const [r, h, s, m] = await Promise.all([
        getAtendimento(id),
        getHistorico(id),
        getStageStatuses(id),
        getMotivos(),
      ])
      setRecord(r)
      setHistorico(h)
      setStages(s)
      setMotivos(m)
      setNewStatus(r.status)
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [id])
  useRealtime('service_centers', () => load())
  useRealtime('atendimento_historico', () => load())
  useRealtime('fluxo_etapa_status', () => load())

  const handleStatusChange = async () => {
    if (!record) return
    if (newStatus === 'Cancelado' && !cancelReason.trim()) {
      toast({ title: 'Motivo do cancelamento é obrigatório', variant: 'destructive' })
      return
    }
    try {
      await updateAtendimento(record.id, {
        status: newStatus,
        cancel_reason: newStatus === 'Cancelado' ? cancelReason : '',
      })
      toast({ title: 'Status atualizado' })
      setCancelReason('')
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const addInternalComment = async () => {
    if (!record || !internalMsg.trim()) return
    const comments = Array.isArray(record.internal_comments) ? record.internal_comments : []
    comments.push({
      data_hora: new Date().toISOString(),
      usuario: user?.name || user?.email || '',
      mensagem: internalMsg,
    })
    await updateAtendimento(record.id, { internal_comments: comments })
    setInternalMsg('')
    load()
  }

  const addClientMessage = async () => {
    if (!record || !clientMsg.trim()) return
    const msgs = Array.isArray(record.client_messages) ? record.client_messages : []
    msgs.push({
      data_hora: new Date().toISOString(),
      usuario: user?.name || user?.email || '',
      mensagem: clientMsg,
    })
    await updateAtendimento(record.id, { client_messages: msgs })
    setClientMsg('')
    load()
  }

  const handleClassify = async () => {
    if (!record) return
    setClassifying(true)
    try {
      const result = await classifyWithAI(record.id)
      toast({
        title: 'Classificação IA sugerida',
        description: `Motivo: ${result.suggestion?.motivo || '—'}`,
      })
      load()
    } catch {
      toast({ title: 'Erro na classificação IA', variant: 'destructive' })
    }
    setClassifying(false)
  }

  const handleStageAction = async (stageId: string, action: string) => {
    try {
      await stageAction(stageId, action)
      toast({ title: 'Ação executada' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!record)
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-16 text-center">Atendimento não encontrado.</CardContent>
      </Card>
    )

  const motivo = motivos.find((m) => m.id === record.motivo_id)
  const isOverdue =
    record.data_hora_limite &&
    new Date(record.data_hora_limite).getTime() < Date.now() &&
    !record.sla_cumprido &&
    record.status !== 'Finalizado' &&
    record.status !== 'Cancelado'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{record.protocol}</h3>
          <p className="text-sm text-muted-foreground">
            {record.client_name} • {motivo?.nome || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-bold px-3 py-1 rounded',
              STATUS_BADGE_COLORS[record.status],
            )}
          >
            {record.status}
          </span>
          {isOverdue ? (
            <span className="flex items-center gap-1 text-sm font-bold text-red-600">
              <AlertTriangle className="w-4 h-4" /> SLA Vencido
            </span>
          ) : record.sla_cumprido ? (
            <span className="flex items-center gap-1 text-sm font-bold text-green-600">
              <CheckCircle className="w-4 h-4" /> SLA Cumprido
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" /> SLA:{' '}
              {record.data_hora_limite
                ? new Date(record.data_hora_limite).toLocaleString('pt-BR')
                : '—'}
            </span>
          )}
          <Button
            onClick={handleClassify}
            disabled={classifying}
            variant="outline"
            size="sm"
            className="border-[#005B2E] text-[#005B2E]"
          >
            {classifying ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1" />
            )}{' '}
            IA
          </Button>
        </div>
      </div>
      {record.classificacao_ia_sugerida && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="py-3">
            <p className="text-sm font-bold text-purple-700">💡 Sugestão IA:</p>
            <p className="text-xs">
              Motivo: {(record.classificacao_ia_sugerida as Record<string, unknown>)?.motivo || '—'}{' '}
              • Prioridade:{' '}
              {(record.classificacao_ia_sugerida as Record<string, unknown>)?.prioridade || '—'}
            </p>
          </CardContent>
        </Card>
      )}
      <Tabs defaultValue="info">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="internal">Comunicação Interna</TabsTrigger>
          <TabsTrigger value="client">Comunicação Cliente</TabsTrigger>
          <TabsTrigger value="flow">Fluxo</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="space-y-3">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4 space-y-2">
              <p className="text-sm">
                <strong>Cliente:</strong> {record.client_name}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {record.client_email || '—'}
              </p>
              <p className="text-sm">
                <strong>Telefone:</strong> {record.client_phone || '—'}
              </p>
              <p className="text-sm">
                <strong>Origem:</strong> {record.origem} • <strong>Tipo:</strong> {record.tipo} •{' '}
                <strong>Prioridade:</strong> {record.prioridade}
              </p>
              <p className="text-sm">
                <strong>Descrição:</strong> {record.descricao}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATENDIMENTO_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusChange}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  Alterar Status
                </Button>
              </div>
              {newStatus === 'Cancelado' && (
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Motivo do cancelamento *"
                  rows={2}
                  className="focus-visible:ring-[#005B2E]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="space-y-2">
          {historico.map((h) => (
            <Card key={h.id} className="border border-border">
              <CardContent className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#005B2E] uppercase">{h.tipo}</span>
                  <span className="text-xs text-muted-foreground">
                    {h.data_hora ? new Date(h.data_hora).toLocaleString('pt-BR') : ''}
                  </span>
                </div>
                <p className="text-sm mt-1">{h.conteudo}</p>
                {h.old_value && h.new_value && (
                  <p className="text-xs text-muted-foreground">
                    De: {h.old_value} → Para: {h.new_value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="internal" className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={internalMsg}
              onChange={(e) => setInternalMsg(e.target.value)}
              placeholder="Comentário interno (não visível ao cliente)..."
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
            <Button
              onClick={addInternalComment}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white self-start"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {(Array.isArray(record.internal_comments) ? record.internal_comments : []).map((c, i) => {
            const cm = c as Record<string, string>
            return (
              <Card key={i} className="border border-amber-200 bg-amber-50">
                <CardContent className="py-2 px-3">
                  <p className="text-xs text-muted-foreground">
                    {cm.data_hora ? new Date(cm.data_hora).toLocaleString('pt-BR') : ''} —{' '}
                    {cm.usuario}
                  </p>
                  <p className="text-sm mt-1">{cm.mensagem}</p>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
        <TabsContent value="client" className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={clientMsg}
              onChange={(e) => setClientMsg(e.target.value)}
              placeholder="Mensagem para o cliente..."
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
            <Button
              onClick={addClientMessage}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white self-start"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {(Array.isArray(record.client_messages) ? record.client_messages : []).map((c, i) => {
            const cm = c as Record<string, string>
            return (
              <Card key={i} className="border border-blue-200 bg-blue-50">
                <CardContent className="py-2 px-3">
                  <p className="text-xs text-muted-foreground">
                    {cm.data_hora ? new Date(cm.data_hora).toLocaleString('pt-BR') : ''} —{' '}
                    {cm.usuario}
                  </p>
                  <p className="text-sm mt-1">{cm.mensagem}</p>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
        <TabsContent value="flow" className="space-y-2">
          {stages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum fluxo associado.</p>
          ) : (
            stages.map((s) => (
              <Card
                key={s.id}
                className={cn(
                  'border-2',
                  s.status === 'Concluída'
                    ? 'border-green-200'
                    : s.status === 'Em Andamento'
                      ? 'border-amber-200'
                      : 'border-border',
                )}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">
                        {s.status === 'Concluída'
                          ? '✅'
                          : s.status === 'Em Andamento'
                            ? '⏳'
                            : '⬜'}{' '}
                        Etapa
                      </p>
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded',
                          STAGE_STATUS.includes(s.status as never) ? 'bg-gray-100' : '',
                        )}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {s.status === 'Em Andamento' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStageAction(s.id, 'complete')}
                          className="border-green-600 text-green-600"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Concluir
                        </Button>
                      )}
                      {s.status === 'Aguardando Aprovação' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStageAction(s.id, 'approve')}
                            className="border-green-600 text-green-600"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStageAction(s.id, 'reject')}
                            className="border-red-600 text-red-600"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {s.observacoes && (
                    <p className="text-xs text-muted-foreground mt-1">{s.observacoes}</p>
                  )}
                  {s.tempo_gasto_minutos ? (
                    <p className="text-xs text-muted-foreground">
                      Tempo gasto: {s.tempo_gasto_minutos} min
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
