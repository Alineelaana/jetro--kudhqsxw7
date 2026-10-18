import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  chamadosService,
  type Chamado,
  type ChamadoHistorico,
  type ChamadoComunicacao,
  type ChamadoStatus,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
} from '@/services/chamados'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  Paperclip,
  Send,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  ExternalLink,
  MessageSquare,
  History,
  FileText,
  ShieldCheck,
  Loader2,
  X,
  Youtube,
  BookOpen,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ChamadoDetalhesScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, userRole } = useAuth()
  const { toast } = useToast()

  const [chamado, setChamado] = useState<Chamado | null>(null)
  const [historico, setHistorico] = useState<ChamadoHistorico[]>([])
  const [comunicacoes, setComunicacoes] = useState<ChamadoComunicacao[]>([])
  const [videosUniversidade, setVideosUniversidade] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [submittingMsg, setSubmittingMsg] = useState(false)

  // Mensagem nova
  const [novaMensagem, setNovaMensagem] = useState('')
  const [anexosMsg, setAnexosMsg] = useState<File[]>([])
  const [videoSelecionadoMsg, setVideoSelecionadoMsg] = useState<string>('')

  // Modal de Alteração de Status
  const [modalStatusAberto, setModalStatusAberto] = useState(false)
  const [novoStatusEscolhido, setNovoStatusEscolhido] = useState<ChamadoStatus>('andamento')
  const [descricaoStatusAcao, setDescricaoStatusAcao] = useState('')
  const [justificativaCancelamento, setJustificativaCancelamento] = useState('')
  const [videoSelecionadoStatus, setVideoSelecionadoStatus] = useState<string>('')
  const [anexosStatus, setAnexosStatus] = useState<File[]>([])
  const [salvandoStatus, setSalvandoStatus] = useState(false)

  const carregarChamado = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [ch, hist, coms, vids] = await Promise.all([
        chamadosService.obterChamado(id),
        chamadosService.listarHistorico(id),
        chamadosService.listarComunicacao(id),
        chamadosService.getVideosUniversidadeAtivos(),
      ])
      setChamado(ch)
      setHistorico(hist)
      setComunicacoes(coms)
      setVideosUniversidade(vids)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar chamado',
        description: err.message || 'Chamado não encontrado ou permissão insuficiente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    carregarChamado()
  }, [carregarChamado])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#005B2E] dark:text-[#E4C46A]" />
        <p className="text-xs text-muted-foreground">Carregando detalhes do chamado...</p>
      </div>
    )
  }

  if (!chamado) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Chamado não localizado</h2>
        <p className="text-xs text-muted-foreground">
          O registro solicitado não existe ou você não possui permissão para acessá-lo.
        </p>
        <Button onClick={() => navigate('/admin/chamados')} variant="outline">
          Voltar para Meus Chamados
        </Button>
      </div>
    )
  }

  // Validação de permissões para ações de alteração de status
  const isSolicitante = user?.id === chamado.solicitante
  const isResponsavel = user?.id === chamado.profissional_responsavel
  const isAprovador = user?.id === chamado.aprovador
  const isMaster =
    userRole === 'SUP' ||
    user?.perfil_acesso?.includes('admin') ||
    user?.perfil_acesso?.includes('master')
  const podeAlterarStatus =
    isResponsavel || isAprovador || isMaster || (isSolicitante && chamado.status === 'aprovacao')

  // Envio de nova mensagem de comunicação
  const handleEnviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaMensagem.trim() || submittingMsg) return

    try {
      setSubmittingMsg(true)
      let videoUrl: string | undefined
      let videoTitulo: string | undefined

      if (videoSelecionadoMsg) {
        const vidObj = videosUniversidade.find((v) => v.id === videoSelecionadoMsg)
        if (vidObj) {
          videoUrl = vidObj.youtube_url
          videoTitulo = vidObj.titulo
        }
      }

      await chamadosService.enviarMensagem(
        chamado.id,
        novaMensagem,
        anexosMsg,
        videoUrl,
        videoTitulo,
      )

      setNovaMensagem('')
      setAnexosMsg([])
      setVideoSelecionadoMsg('')

      toast({ title: 'Mensagem enviada com sucesso!' })
      const atualizados = await chamadosService.listarComunicacao(chamado.id)
      setComunicacoes(atualizados)
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: err.message || 'Falha ao registrar mensagem.',
        variant: 'destructive',
      })
    } finally {
      setSubmittingMsg(false)
    }
  }

  // Abrir modal de alteração de status
  const abrirModalStatus = (statusAlvo: ChamadoStatus) => {
    setNovoStatusEscolhido(statusAlvo)
    setDescricaoStatusAcao('')
    setJustificativaCancelamento('')
    setVideoSelecionadoStatus('')
    setAnexosStatus([])
    setModalStatusAberto(true)
  }

  // Salvar alteração de status com descrição OBRIGATÓRIA
  const handleConfirmarAlteracaoStatus = async () => {
    if (!descricaoStatusAcao.trim() || descricaoStatusAcao.trim().length < 3) {
      toast({
        title: 'Descrição obrigatória',
        description: 'É estritamente obrigatório descrever a ação realizada para alterar o status.',
        variant: 'destructive',
      })
      return
    }

    if (novoStatusEscolhido === 'cancelado') {
      if (!justificativaCancelamento.trim() || justificativaCancelamento.trim().length < 5) {
        toast({
          title: 'Justificativa obrigatória',
          description:
            'Para cancelar o chamado, forneça uma justificativa com pelo menos 5 caracteres.',
          variant: 'destructive',
        })
        return
      }
    }

    try {
      setSalvandoStatus(true)
      let videoUrl: string | undefined
      let videoTitulo: string | undefined

      if (videoSelecionadoStatus) {
        const vidObj = videosUniversidade.find((v) => v.id === videoSelecionadoStatus)
        if (vidObj) {
          videoUrl = vidObj.youtube_url
          videoTitulo = vidObj.titulo
        }
      }

      const atualizado = await chamadosService.alterarStatus({
        chamadoId: chamado.id,
        statusAnterior: chamado.status,
        statusNovo: novoStatusEscolhido,
        descricaoAcao: descricaoStatusAcao,
        canceladoJustificativa: justificativaCancelamento || undefined,
        anexosAcao: anexosStatus,
        videoUniversidadeUrl: videoUrl,
        videoUniversidadeTitulo: videoTitulo,
      })

      setChamado(atualizado)
      setModalStatusAberto(false)

      toast({
        title: 'Status atualizado com sucesso!',
        description: `Chamado movido para "${STATUS_LABELS[novoStatusEscolhido]?.label}". Notificações enviadas.`,
      })

      // Recarregar histórico e comunicações
      const novoHist = await chamadosService.listarHistorico(chamado.id)
      setHistorico(novoHist)
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar status',
        description: err.message || 'Falha ao registrar a alteração de status.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoStatus(false)
    }
  }

  const statusCfg = STATUS_LABELS[chamado.status] || {
    label: chamado.status,
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  }
  const prioridadeCfg = PRIORIDADE_LABELS[chamado.prioridade] || {
    label: chamado.prioridade,
    badgeClass: 'bg-slate-100 text-slate-800',
  }

  // Lista de convidados por e-mail parseados
  let convidadosLista: string[] = []
  if (chamado.convidados_email) {
    if (Array.isArray(chamado.convidados_email)) {
      convidadosLista = chamado.convidados_email
    } else if (typeof chamado.convidados_email === 'string') {
      try {
        convidadosLista = JSON.parse(chamado.convidados_email)
      } catch {
        /* intentionally ignored */
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Barra de Navegação e Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/chamados')}
            className="h-8 px-2 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-[#005B2E] dark:text-[#E4C46A]">
                {chamado.numero}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
              >
                {statusCfg.label}
              </span>
              <span
                className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-full border ${prioridadeCfg.badgeClass}`}
              >
                Prioridade {prioridadeCfg.label}
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground mt-0.5">{chamado.assunto}</h1>
          </div>
        </div>

        {/* Botões de Transição de Status para usuários autorizados */}
        {podeAlterarStatus && (
          <div className="flex items-center flex-wrap gap-2">
            {chamado.status === 'novo' && (
              <Button
                size="sm"
                onClick={() => abrirModalStatus('andamento')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Iniciar Atendimento
              </Button>
            )}

            {chamado.status === 'andamento' && (
              <>
                <Button
                  size="sm"
                  onClick={() => abrirModalStatus('aprovacao')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Encaminhar p/ Aprovação
                </Button>
                <Button
                  size="sm"
                  onClick={() => abrirModalStatus('finalizado')}
                  className="bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold text-xs"
                >
                  Finalizar Atendimento
                </Button>
              </>
            )}

            {chamado.status === 'aprovacao' && (
              <>
                <Button
                  size="sm"
                  onClick={() => abrirModalStatus('finalizado')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Aprovar e Finalizar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => abrirModalStatus('andamento')}
                  className="text-amber-700 border-amber-300 text-xs font-semibold"
                >
                  Devolver p/ Ajustes
                </Button>
              </>
            )}

            {chamado.status !== 'cancelado' && chamado.status !== 'finalizado' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => abrirModalStatus('cancelado')}
                className="text-xs"
              >
                Cancelar Chamado
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: Informações Gerais, Anexos e Comunicação (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Informações Gerais */}
          <Card className="border-border shadow-xs">
            <CardHeader className="py-3.5 bg-slate-50 dark:bg-slate-900/40 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                <span>Informações Gerais da Demanda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/20 p-3 rounded-lg border border-border/60">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {chamado.descricao}
                </p>
              </div>

              {chamado.cancelado_justificativa && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Justificativa de Cancelamento:
                  </span>
                  <p className="text-xs text-rose-700 dark:text-rose-200">
                    {chamado.cancelado_justificativa}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Anexos e Evidências */}
          {chamado.anexos && chamado.anexos.length > 0 && (
            <Card className="border-border shadow-xs">
              <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900/40 border-b border-border">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                  <span>Anexos do Chamado ({chamado.anexos.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {chamado.anexos.map((filename, idx) => {
                    const url = chamadosService.getAttachmentUrl(chamado as any, filename)
                    const isImg = /\.(jpg|jpeg|png|webp)$/i.test(filename)

                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg border border-border bg-slate-50 dark:bg-slate-900/30 hover:border-[#005B2E] hover:bg-[#005B2E]/5 transition-all group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isImg ? (
                            <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img
                                src={url}
                                alt={filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <FileText className="w-5 h-5 text-[#005B2E] shrink-0" />
                          )}
                          <span className="text-xs font-semibold truncate group-hover:text-[#005B2E]">
                            {filename}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#005B2E] shrink-0 ml-2" />
                      </a>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card: Comunicação e Mensagens */}
          <Card className="border-border shadow-xs">
            <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900/40 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                <span>Comunicação e Interações ({comunicacoes.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {comunicacoes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  Nenhuma mensagem registrada nesta demanda ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {comunicacoes.map((c) => {
                    const isMe = c.usuario === user?.id
                    return (
                      <div
                        key={c.id}
                        className={`flex flex-col p-3 rounded-xl border text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#005B2E]/5 border-[#005B2E]/30 ml-4'
                            : 'bg-muted/30 border-border mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-border/40">
                          <span className="font-bold text-foreground">
                            {c.expand?.usuario?.name || 'Participante'}
                            {isMe ? ' (Você)' : ''}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.created).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-foreground font-sans">
                          {c.mensagem}
                        </p>

                        {/* Referência de Vídeo da Universidade Jetro */}
                        {c.video_universidade_url && (
                          <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                              <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] font-bold text-red-900 dark:text-red-300 block">
                                  Universidade Jetro (Conteúdo Recomendado)
                                </span>
                                <span className="text-xs font-medium text-foreground truncate block">
                                  {c.video_universidade_titulo || 'Vídeo de Apoio'}
                                </span>
                              </div>
                            </div>
                            <a
                              href={c.video_universidade_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-red-600 hover:underline shrink-0 ml-2 flex items-center gap-1"
                            >
                              <span>Assistir</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Caixa de envio de nova mensagem */}
              <form
                onSubmit={handleEnviarMensagem}
                className="pt-3 border-t border-border space-y-3"
              >
                <Textarea
                  placeholder="Escreva uma mensagem para os participantes deste chamado..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  rows={3}
                  className="text-xs font-sans"
                  disabled={submittingMsg}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Select Universidade Jetro */}
                  <div className="flex items-center gap-2 min-w-0 max-w-sm">
                    <BookOpen className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A] shrink-0" />
                    <Select value={videoSelecionadoMsg} onValueChange={setVideoSelecionadoMsg}>
                      <SelectTrigger className="text-[11px] h-7">
                        <SelectValue placeholder="Vincular vídeo Universidade Jetro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum vídeo</SelectItem>
                        {videosUniversidade.map((v) => (
                          <SelectItem key={v.id} value={v.id} className="text-xs">
                            {v.titulo} (Mód. {v.modulo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={submittingMsg || !novaMensagem.trim()}
                    className="bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold text-xs self-end"
                  >
                    {submittingMsg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Enviar Mensagem
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Metadados, Participantes e Linha do Tempo (1 col) */}
        <div className="space-y-6">
          {/* Card: Participantes e Atribuição */}
          <Card className="border-border shadow-xs">
            <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900/40 border-b border-border">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                <span>Participantes e Atribuição</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Solicitante:
                </span>
                <span className="font-semibold text-foreground">
                  {chamado.expand?.solicitante?.name || chamado.solicitante}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {chamado.expand?.solicitante?.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Setor Responsável:
                </span>
                <span className="font-semibold text-foreground">
                  {chamado.expand?.setor_responsavel?.name || 'Geral'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Profissional Responsável:
                </span>
                <span className="font-semibold text-foreground">
                  {chamado.expand?.profissional_responsavel?.name || 'Não atribuído'}
                </span>
                {chamado.expand?.profissional_responsavel?.email && (
                  <span className="text-[10px] text-muted-foreground block">
                    {chamado.expand?.profissional_responsavel?.email}
                  </span>
                )}
              </div>

              {convidadosLista.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Convidados por E-mail ({convidadosLista.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {convidadosLista.map((cEmail, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {cEmail}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Linha do Tempo / Histórico de Ações */}
          <Card className="border-border shadow-xs">
            <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900/40 border-b border-border">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-[#005B2E] dark:text-[#E4C46A]" />
                <span>Histórico de Ações ({historico.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-5 space-y-4 border-l-2 border-border/80">
                {historico.map((h) => (
                  <div key={h.id} className="relative text-xs">
                    <span className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-[#005B2E] border-2 border-white dark:border-slate-900" />
                    <div className="font-semibold text-foreground">{h.descricao_acao}</div>
                    {h.status_novo && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Status:{' '}
                        <span className="font-bold uppercase text-foreground">
                          {h.status_anterior || 'início'} → {h.status_novo}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                      <span>{h.expand?.usuario?.name || 'Sistema'}</span>
                      <span>{new Date(h.created).toLocaleString('pt-BR')}</span>
                    </div>

                    {h.video_universidade_url && (
                      <div className="mt-1 text-[10px] text-red-600 flex items-center gap-1 font-semibold">
                        <Youtube className="w-3 h-3" />
                        <a
                          href={h.video_universidade_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {h.video_universidade_titulo || 'Vídeo de Apoio'}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE ALTERAÇÃO DE STATUS COM DESCRIÇÃO OBRIGATÓRIA */}
      <Dialog open={modalStatusAberto} onOpenChange={setModalStatusAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#002817] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#005B2E] dark:text-[#E4C46A]" />
              <span>Alteração de Status do Chamado</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Toda transição de status exige descrição detalhada da ação realizada para auditoria
              corporativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Status Anterior vs Novo Status */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Status Atual
                </span>
                <span className="font-bold text-foreground capitalize">{chamado.status}</span>
              </div>
              <span className="text-muted-foreground font-black">→</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Novo Status
                </span>
                <span className="font-bold text-[#005B2E] dark:text-[#E4C46A] capitalize">
                  {STATUS_LABELS[novoStatusEscolhido]?.label}
                </span>
              </div>
            </div>

            {/* Descrição Obrigatória da Ação */}
            <div className="space-y-1.5">
              <Label
                htmlFor="descAcao"
                className="text-xs font-bold text-foreground flex items-center gap-1"
              >
                Descrição da Ação Realizada <span className="text-rose-500">* (Obrigatória)</span>
              </Label>
              <Textarea
                id="descAcao"
                placeholder="Detalhe o que foi feito, orientações prestadas ou testes concluídos..."
                value={descricaoStatusAcao}
                onChange={(e) => setDescricaoStatusAcao(e.target.value)}
                rows={4}
                className="text-xs font-sans"
              />
              <span className="text-[10px] text-muted-foreground block text-right">
                Mínimo de 3 caracteres (atual: {descricaoStatusAcao.trim().length})
              </span>
            </div>

            {/* Justificativa Obrigatória se for Cancelamento */}
            {novoStatusEscolhido === 'cancelado' && (
              <div className="space-y-1.5 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-200">
                <Label
                  htmlFor="justCanc"
                  className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1"
                >
                  Justificativa de Cancelamento{' '}
                  <span className="text-rose-500">* (Obrigatória)</span>
                </Label>
                <Textarea
                  id="justCanc"
                  placeholder="Motivo formal pelo qual esta solicitação está sendo cancelada..."
                  value={justificativaCancelamento}
                  onChange={(e) => setJustificativaCancelamento(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>
            )}

            {/* Referência de Vídeo da Universidade Jetro */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                <span>Referenciar Vídeo da Universidade Jetro (Opcional)</span>
              </Label>
              <Select value={videoSelecionadoStatus} onValueChange={setVideoSelecionadoStatus}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Selecione um treinamento ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum vídeo</SelectItem>
                  {videosUniversidade.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-xs">
                      {v.titulo} (Módulo {v.modulo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalStatusAberto(false)}
              disabled={salvandoStatus}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmarAlteracaoStatus}
              disabled={salvandoStatus || !descricaoStatusAcao.trim()}
              className="bg-[#002817] hover:bg-[#00381C] text-[#E4C46A] border border-[#C9A227]/60 font-bold text-xs"
            >
              {salvandoStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Gravando...
                </>
              ) : (
                'Salvar Alteração de Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
