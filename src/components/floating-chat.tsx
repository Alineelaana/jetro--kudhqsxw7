import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  Sparkles,
  ExternalLink,
  Loader2,
  Menu,
  Play,
  MousePointer2,
  Paperclip,
  Mic,
  Maximize2,
  Minimize2,
  Youtube,
  Search,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { JetroOnlineChartRenderer } from '@/components/jetro-online/jetro-online-chart-renderer'
import {
  getJetroOnlineConfig,
  getJetroOnlineSugestoes,
  getJetroUniversidadeVideos,
  getJetroTourForRoute,
  incrementSugestaoClicks,
  incrementVideoViews,
  type JetroOnlineConfig,
  type JetroOnlineSugestao,
  type JetroUniversidadeVideo,
  type JetroTour,
} from '@/services/jetro-online'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTour } from '@/lib/tours/tour-context'
import { Button } from '@/components/ui/button'
import logoJetro from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-7232a.jpeg'

const SESSION_DISMISSED_KEY = 'jetro_online_floating_dismissed'

function parseAssistantContent(content: string) {
  const pieces: Array<{ type: 'text' | 'chart'; content?: string; chartSpec?: any }> = []
  const chartRegex = /```(jetro-chart|chart)([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = chartRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textPiece = content.slice(lastIndex, match.index).trim()
      if (textPiece) {
        pieces.push({ type: 'text', content: textPiece })
      }
    }
    const rawJson = match[2].trim()
    try {
      const parsedSpec = JSON.parse(rawJson)
      pieces.push({ type: 'chart', chartSpec: parsedSpec })
    } catch {
      pieces.push({ type: 'text', content: match[0] })
    }
    lastIndex = chartRegex.lastIndex
  }

  if (lastIndex < content.length) {
    const trailingText = content.slice(lastIndex).trim()
    if (trailingText) {
      pieces.push({ type: 'text', content: trailingText })
    }
  }

  if (pieces.length === 0) {
    pieces.push({ type: 'text', content })
  }
  return pieces
}

// Extrair link do YouTube embutido em markdown [Título](https://...)
function renderFormattedAssistantText(text: string) {
  // Regex para links do YouTube ou gerais
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index))
    }
    const linkText = match[1]
    const linkUrl = match[2]
    const isYoutube = linkUrl.includes('youtube.com') || linkUrl.includes('youtu.be')

    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1 font-semibold underline underline-offset-2 mx-0.5',
          isYoutube ? 'text-red-600 hover:text-red-700' : 'text-[#005B2E] hover:text-[#004724]',
        )}
      >
        {isYoutube && <Youtube className="w-3.5 h-3.5 shrink-0" />}
        {linkText}
        <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
      </a>,
    )
    lastIdx = linkRegex.lastIndex
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }

  return parts.length > 0 ? parts : text
}

export function FloatingChat() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { startTour, availableTourForCurrentRoute } = useTour()

  const {
    messages,
    conversations,
    conversationId,
    loading,
    send,
    newConversation,
    loadHistory,
    isFloatingOpen,
    setIsFloatingOpen,
  } = useJetroOnline()

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDrawerMenu, setShowDrawerMenu] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Configurações e Sugestões dinâmicas do banco
  const [config, setConfig] = useState<JetroOnlineConfig | null>(null)
  const [sugestoes, setSugestoes] = useState<JetroOnlineSugestao[]>([])
  const [activeTour, setActiveTour] = useState<JetroTour | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<JetroUniversidadeVideo | null>(null)
  const [availableVideos, setAvailableVideos] = useState<JetroUniversidadeVideo[]>([])
  const [videoSearchQuery, setVideoSearchQuery] = useState('')
  const [tourModalOpen, setTourModalOpen] = useState(false)
  const [currentTourStepIndex, setCurrentTourStepIndex] = useState(0)

  // Efeito máquina de escrever na saudação
  const [typedGreeting, setTypedGreeting] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  const greetingTarget = config?.saudacao_principal || 'Como posso ajudar?'

  // Buscar config, sugestões e tour da tela atual
  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const [cfg, sugs, tour] = await Promise.all([
          getJetroOnlineConfig(),
          getJetroOnlineSugestoes(),
          getJetroTourForRoute(pathname),
        ])
        if (!isMounted) return
        if (cfg) setConfig(cfg)
        if (sugs && sugs.length > 0) setSugestoes(sugs)
        setActiveTour(tour)
      } catch {
        /* fallback silencioso */
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [pathname])

  // Digitação animada suave da saudação com cursor pulsante (igual à referência visual)
  useEffect(() => {
    let charIdx = 0
    setTypedGreeting('')
    const interval = setInterval(() => {
      if (charIdx <= greetingTarget.length) {
        setTypedGreeting(greetingTarget.slice(0, charIdx))
        charIdx++
      } else {
        clearInterval(interval)
      }
    }, 45)

    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)

    return () => {
      clearInterval(interval)
      clearInterval(cursorInterval)
    }
  }, [greetingTarget])

  // Rolar para a última mensagem automaticamente
  useEffect(() => {
    if (isFloatingOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isFloatingOpen])

  useEffect(() => {
    try {
      if (isDismissed) {
        sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true')
      } else {
        sessionStorage.removeItem(SESSION_DISMISSED_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [isDismissed])

  if (!isAuthenticated) {
    return null
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    const clean = input.trim()
    if (!clean || loading) return
    send(clean, { rota_origem: pathname })
    setInput('')
  }

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsFloatingOpen(false)
    setIsDismissed(true)
  }

  const handleReopen = () => {
    setIsDismissed(false)
    setIsFloatingOpen(true)
  }

  const handleOpenInAdmin = () => {
    setIsFloatingOpen(false)
    if (pathname !== '/admin') {
      navigate('/admin')
    }
  }

  const handleOpenVideosModal = async () => {
    try {
      const vids = await getJetroUniversidadeVideos('ativo = true')
      setAvailableVideos(vids)
      // Se tiver vídeo relacionado à rota atual, pré-seleciona
      const routeVideo = vids.find(
        (v) => v.rota_relacionada && pathname.startsWith(v.rota_relacionada),
      )
      if (routeVideo) {
        setSelectedVideo(routeVideo)
      } else if (vids.length > 0) {
        setSelectedVideo(vids[0])
      }
    } catch {
      setAvailableVideos([])
    }
    setVideoModalOpen(true)
  }

  const handleStartTour = () => {
    const tourToRun = activeTour || availableTourForCurrentRoute
    if (!tourToRun || !tourToRun.etapas || tourToRun.etapas.length === 0) return
    // Minimiza o chat flutuante para liberar a tela inteira para o tour visual interativo
    setIsFloatingOpen(false)
    startTour(tourToRun)
  }

  const handleSelectSugestao = (sug: JetroOnlineSugestao) => {
    incrementSugestaoClicks(sug.id)
    send(sug.texto, { modulo: sug.modulo, rota_origem: pathname })
  }

  // Fallback de sugestões padrão quando o banco estiver carregando
  const displaySugestoes =
    sugestoes.length > 0
      ? sugestoes.slice(0, 4)
      : [
          { id: '1', texto: 'Giro do Distribuidor', ativo: true },
          { id: '2', texto: 'Quais clientes não compram há mais de 30 dias?', ativo: true },
          { id: '3', texto: 'Quanto vendi para cada cliente?', ativo: true },
        ]

  // Se dispensado, exibe alça lateral discreta
  if (isDismissed) {
    return (
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-40 select-none">
        <button
          id="floating-chat-trigger"
          onClick={handleReopen}
          className="group flex items-center gap-1.5 bg-[#005B2E]/95 hover:bg-[#005B2E] text-white py-3 px-1.5 rounded-l-lg shadow-xl border-y border-l border-[#C9A227]/60 backdrop-blur-sm transition-all duration-200 hover:pl-2.5 hover:pr-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227] cursor-pointer"
          aria-label="Abrir Jetro On-line"
          title="Jetro On-line — Assistente ERP Inteligente"
        >
          <div className="relative h-6 w-6 rounded-md bg-[#00381C] text-white flex items-center justify-center border border-[#C9A227]/80 shrink-0 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A227]" />
          </div>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold tracking-wider text-emerald-100 group-hover:text-white uppercase">
            Jetro On-line
          </span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Botão de acionamento circular no canto inferior direito quando o painel lateral estiver fechado */}
      {!isFloatingOpen && (
        <div className="fixed bottom-5 right-5 z-40 select-none group">
          <button
            id="floating-chat-trigger"
            onClick={() => setIsFloatingOpen(true)}
            className="flex items-center gap-2.5 bg-[#005B2E] hover:bg-[#004724] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#C9A227] transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Abrir Jetro On-line"
            title="Jetro On-line — Assistente ERP Inteligente"
          >
            <div className="relative h-7 w-7 rounded-lg bg-[#00381C] flex items-center justify-center text-white border border-[#C9A227]/60">
              <Sparkles className="h-4 w-4 text-[#C9A227]" />
            </div>
            <span className="font-bold text-xs tracking-tight">Jetro On-line</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </button>

          {/* Botão X para dispensar e deixar apenas alça */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Ocultar Jetro On-line da tela"
            title="Ocultar assistente"
            className="absolute -top-1.5 -right-1.5 bg-neutral-900/90 hover:bg-red-600 text-white rounded-full p-1 shadow-md border border-white/30 transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* PAINEL LATERAL FLUTUANTE — REPRODUÇÃO FIEL DA REFERÊNCIA VISUAL */}
      {isFloatingOpen && (
        <aside
          aria-label="Jetro On-line"
          className={cn(
            'fixed top-0 right-0 bottom-0 z-50 bg-white shadow-2xl border-l border-gray-200/90 flex flex-col transition-all duration-300 select-text',
            // Dimensões: painel lateral de largura média, ocupando a altura total da tela
            isExpanded ? 'w-full md:w-[680px]' : 'w-full sm:w-[410px] md:w-[425px]',
          )}
        >
          {/* ============================================================== */}
          {/* 1. TOPO — "Ajudas Disponíveis" COM OS BOTÕES "VÍDEO" E "TOUR"  */}
          {/* ============================================================== */}
          <div className="border-b border-gray-200 bg-white/95 backdrop-blur-xs pt-2.5 pb-2 px-4 shrink-0">
            <div className="relative flex items-center justify-center">
              <span className="text-[12px] font-medium text-gray-500 tracking-tight">
                Ajudas Disponíveis
              </span>

              {/* Controles do canto superior direito (expandir e fechar) */}
              <div className="absolute right-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleOpenInAdmin}
                  title="Abrir na tela principal"
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restaurar largura' : 'Expandir largura'}
                  className="hidden md:inline-flex text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFloatingOpen(false)}
                  title="Fechar assistente"
                  className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Linha com os dois botões característicos: "Vídeo" (coral/vermelho) e "Tour" (cinza-escuro) */}
            <div className="flex items-center justify-center gap-2.5 mt-2">
              {/* Botão Vídeo */}
              <button
                type="button"
                onClick={handleOpenVideosModal}
                className="flex-1 max-w-[130px] h-8 rounded-md bg-[#E85D4E] hover:bg-[#d94d3e] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Vídeos da Universidade Jetro relacionados a esta tela ou gerais"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Vídeo</span>
              </button>

              {/* Botão Tour (apenas ativo se tour configurado) */}
              {activeTour || availableTourForCurrentRoute ? (
                <button
                  type="button"
                  onClick={handleStartTour}
                  className="flex-1 max-w-[130px] h-8 rounded-md bg-[#2D3748] hover:bg-[#1A202C] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer border border-[#C9A227]/40"
                  title={`Iniciar tour guiado interativo: ${(activeTour || availableTourForCurrentRoute)?.titulo}`}
                >
                  <MousePointer2 className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Tour</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 max-w-[130px] h-8 rounded-md bg-gray-200 text-gray-400 text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
                  title="Nenhum tour guiado configurado para esta tela"
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                  <span>Tour</span>
                </button>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. CABEÇALHO DA CONVERSA: HAMBÚRGUER + LOGO JETRO + STATUS     */}
          {/* ============================================================== */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              {/* Botão menu hambúrguer para histórico e opções */}
              <button
                type="button"
                onClick={() => setShowDrawerMenu(!showDrawerMenu)}
                className="text-gray-600 hover:text-gray-900 p-1.5 -ml-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                title="Histórico de conversas e opções"
                aria-label="Abrir menu do Jetro On-line"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>

              {/* Logotipo e Nome "Jetro On-line" (substituindo IAglets) */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <img
                    src={logoJetro}
                    alt="Jetro"
                    className="h-5 w-5 object-cover rounded shadow-2xs border border-[#C9A227]/40"
                  />
                  <h3 className="text-base font-black tracking-tight text-gray-900 leading-none">
                    Jetro <span className="text-[#005B2E]">On-line</span>
                  </h3>
                </div>
                {/* Indicador de status: bolinha verde + "Online · Pronto para responder" */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Online · Pronto para responder
                  </span>
                </div>
              </div>
            </div>

            {/* Ação de nova conversa rápida */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={newConversation}
              className="text-[11px] h-7 px-2 text-[#005B2E] hover:bg-[#005B2E]/10 font-semibold"
              title="Iniciar nova conversa limpa"
            >
              Nova conversa
            </Button>
          </div>

          {/* Menu Drawer lateral/superior para histórico se acionado */}
          {showDrawerMenu && (
            <div className="bg-slate-50 border-b border-gray-200 p-3 max-h-48 overflow-y-auto text-xs shrink-0 transition-all">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-200">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  Histórico de Consultas ({conversations.length})
                </span>
                <button
                  onClick={() => setShowDrawerMenu(false)}
                  className="text-gray-400 hover:text-gray-600 text-[11px]"
                >
                  Fechar
                </button>
              </div>
              {conversations.length === 0 ? (
                <p className="text-gray-400 text-[11px] italic text-center py-2">
                  Nenhuma consulta anterior registrada.
                </p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        loadHistory(c.id)
                        setShowDrawerMenu(false)
                      }}
                      className={cn(
                        'w-full text-left p-1.5 rounded text-[11px] truncate flex items-center gap-2 transition-colors',
                        c.id === conversationId
                          ? 'bg-[#005B2E]/10 text-[#005B2E] font-bold'
                          : 'hover:bg-gray-200/70 text-gray-700',
                      )}
                    >
                      <Sparkles className="w-3 h-3 text-[#C9A227] shrink-0" />
                      <span className="truncate flex-1">{c.title || 'Consulta ERP'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. ÁREA CENTRAL (CORAÇÃO DO PAINEL)                             */}
          {/* ============================================================== */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-between py-2">
                {/* Bloco superior com a saudação grande em negrito + cursor de digitação */}
                <div className="pt-8 sm:pt-12 text-center max-w-sm mx-auto">
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 tracking-tight leading-snug">
                    {typedGreeting}
                    <span
                      className={cn(
                        'inline-block font-normal text-gray-700 ml-0.5',
                        cursorVisible ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      |
                    </span>
                  </h2>

                  <p className="text-[13px] text-gray-500 mt-3 leading-relaxed max-w-xs mx-auto">
                    {config?.texto_auxiliar ||
                      'Faça uma pergunta, peça uma análise ou explore as informações disponíveis.'}
                  </p>
                </div>

                {/* Bloco de sugestões inteligentes alinhadas à esquerda em pills arredondadas */}
                <div className="space-y-2 pb-2">
                  {displaySugestoes.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handleSelectSugestao(sug)}
                      disabled={loading}
                      className="w-full text-left px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:border-[#005B2E] hover:bg-emerald-50/40 text-gray-800 text-[12px] font-medium transition-all shadow-2xs group cursor-pointer disabled:opacity-50 block truncate"
                      title={sug.descricao || sug.texto}
                    >
                      <span className="truncate group-hover:text-[#005B2E]">{sug.texto}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* FLUXO DE MENSAGENS COM ROLAGEM */
              <div className="space-y-3 pt-1">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user'
                  const parsedPieces = !isUser ? parseAssistantContent(msg.content) : []

                  return (
                    <div
                      key={idx}
                      className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[88%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed',
                          isUser
                            ? 'bg-[#005B2E] text-white rounded-br-xs font-medium'
                            : 'bg-slate-50 border border-gray-200 text-gray-800 rounded-bl-xs',
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="space-y-2.5">
                            {parsedPieces.map((piece, pIdx) => {
                              if (piece.type === 'chart' && piece.chartSpec) {
                                return (
                                  <div
                                    key={pIdx}
                                    className="my-2 bg-white p-2 rounded-lg border border-gray-200"
                                  >
                                    <JetroOnlineChartRenderer spec={piece.chartSpec} />
                                  </div>
                                )
                              }
                              return (
                                <div key={pIdx} className="whitespace-pre-wrap">
                                  {renderFormattedAssistantText(piece.content || '')}
                                </div>
                              )
                            })}

                            {/* Recomendações explícitas de vídeos da Universidade Jetro */}
                            {msg.recommended_videos && msg.recommended_videos.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-gray-200/80 space-y-1.5">
                                <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3 text-[#005B2E]" />
                                  Universidade Jetro (Conteúdo Recomendado):
                                </span>
                                {msg.recommended_videos.map((vid) => (
                                  <a
                                    key={vid.id}
                                    href={vid.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => incrementVideoViews(vid.id)}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-900 transition-colors group cursor-pointer"
                                  >
                                    <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center shrink-0">
                                      <Youtube className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-semibold truncate group-hover:underline">
                                        {vid.titulo}
                                      </p>
                                      <p className="text-[10px] text-red-700 truncate">
                                        Módulo {vid.modulo} · Assistir no YouTube
                                      </p>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-red-500 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Botão de Ação: Iniciar Tour Guiado (quando sugerido na resposta) */}
                            {(activeTour || availableTourForCurrentRoute) &&
                              /tour|tutorial|passo a passo|como funciona|ensinar|guia/i.test(
                                msg.content,
                              ) && (
                                <div className="mt-2.5 pt-2 border-t border-emerald-200/60">
                                  <Button
                                    size="sm"
                                    onClick={handleStartTour}
                                    className="h-8 text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-semibold shadow-xs flex items-center gap-1.5"
                                  >
                                    <MousePointer2 className="w-3.5 h-3.5 fill-white" />
                                    <span>Iniciar Tour Guiado desta Tela</span>
                                  </Button>
                                </div>
                              )}

                            {/* Citações e Fontes Consultadas */}
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-2 pt-1.5 border-t border-gray-200 text-[10px] text-gray-500">
                                <span className="font-semibold text-gray-600 flex items-center gap-1 mb-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-[#005B2E]" />
                                  Fontes consultadas:
                                </span>
                                {msg.citations.slice(0, 2).map((c, cIdx) => (
                                  <div key={cIdx} className="text-gray-500 truncate">
                                    [{c.n}] {c.excerpt?.slice(0, 70)}...
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Indicador de carregamento */}
                {loading && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-slate-50 border border-gray-200 rounded-xl p-3 shadow-2xs max-w-[85%]">
                    <Loader2 className="w-3.5 h-3.5 text-[#005B2E] animate-spin shrink-0" />
                    <span>Consultando dados reais do ERP e aplicando regras de governança...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 4. PARTE INFERIOR FIXA: CAIXA DE MENSAGENS AMPLA E ARREDONDADA */}
          {/* ============================================================== */}
          <div className="p-3.5 bg-white border-t border-gray-200/90 shrink-0">
            <form
              onSubmit={handleSend}
              className="bg-slate-50 border border-gray-200/90 focus-within:border-[#005B2E] focus-within:ring-1 focus-within:ring-[#005B2E] rounded-2xl p-2.5 transition-all shadow-xs"
            >
              {/* Campo de texto amplo com placeholder */}
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={loading}
                placeholder={config?.placeholder_input || 'Digite sua mensagem...'}
                className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none leading-relaxed"
              />

              {/* Linha de botões inferiores: anexo (clipe), IA (sparkles em azul), microfone e envio */}
              <div className="flex items-center justify-between pt-1 mt-1 border-t border-gray-200/60">
                <div className="flex items-center gap-1.5">
                  {/* Botão de anexo (clipe) */}
                  <button
                    type="button"
                    disabled={!config?.permitir_anexos}
                    title={
                      config?.permitir_anexos
                        ? 'Anexar documento'
                        : 'Upload de anexos restrito por política de segurança'
                    }
                    className={cn(
                      'p-1.5 rounded-lg text-gray-400 transition-colors',
                      config?.permitir_anexos
                        ? 'hover:text-gray-700 hover:bg-gray-200 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Botão de recurso de IA (ícone de brilhos/sparkles com fundo azul destacado, idêntico à imagem) */}
                  <div
                    title="Inteligência Operacional Jetro On-line"
                    className="h-7 w-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Botão de microfone/voz (só ativo se implementado) */}
                  <button
                    type="button"
                    disabled={!config?.permitir_voz}
                    title={
                      config?.permitir_voz
                        ? 'Entrada por voz'
                        : 'Comando por voz não habilitado nesta versão'
                    }
                    className={cn(
                      'p-1.5 rounded-lg text-gray-400 transition-colors',
                      config?.permitir_voz
                        ? 'hover:text-gray-700 hover:bg-gray-200 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Botão de envio: avião de papel com botão azul arredondado (idêntico à referência visual) */}
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    title="Enviar mensagem (Enter)"
                    className="h-8 w-8 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-gray-300 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 fill-white text-white translate-x-[-1px] translate-y-[1px]" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </aside>
      )}

      {/* ============================================================== */}
      {/* MODAL DE VÍDEOS DA UNIVERSIDADE JETRO                          */}
      {/* ============================================================== */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2 text-[#005B2E]">
              <div className="w-7 h-7 rounded-lg bg-[#005B2E] text-white flex items-center justify-center">
                <Youtube className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Universidade Jetro — Biblioteca de Treinamento em Vídeo
              </DialogTitle>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Vídeos oficiais com orientações práticas de cada módulo do ERP Jetro.
            </p>
          </DialogHeader>

          <div className="py-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por módulo, assunto ou procedimento..."
                value={videoSearchQuery}
                onChange={(e) => setVideoSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 h-8 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#005B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden pt-2 min-h-0">
            {/* Lista de vídeos */}
            <div className="md:col-span-1 border rounded-lg overflow-y-auto space-y-1 p-2 bg-slate-50/50">
              {availableVideos
                .filter((v) => {
                  if (!videoSearchQuery.trim()) return true
                  const q = videoSearchQuery.toLowerCase()
                  return (
                    v.titulo.toLowerCase().includes(q) ||
                    v.modulo.toLowerCase().includes(q) ||
                    (v.palavras_chave || '').toLowerCase().includes(q)
                  )
                })
                .map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVideo(v)
                      incrementVideoViews(v.id)
                    }}
                    className={cn(
                      'w-full text-left p-2.5 rounded-lg text-xs transition-colors border',
                      selectedVideo?.id === v.id
                        ? 'bg-white border-[#005B2E] text-[#005B2E] font-semibold shadow-2xs'
                        : 'border-transparent hover:bg-gray-100 text-gray-700',
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-bold">
                        {v.modulo}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold line-clamp-2">{v.titulo}</p>
                  </button>
                ))}
            </div>

            {/* Player Embed & Detalhes */}
            <div className="md:col-span-2 border rounded-lg p-4 flex flex-col justify-between overflow-y-auto bg-white">
              {selectedVideo ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.youtube_id || 'dQw4w9WgXcQ'}`}
                      title={selectedVideo.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{selectedVideo.titulo}</h4>
                    <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                      Módulo: {selectedVideo.modulo}{' '}
                      {selectedVideo.assunto ? `· ${selectedVideo.assunto}` : ''}
                    </span>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {selectedVideo.descricao}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Selecione um vídeo para assistir.
                </div>
              )}

              {selectedVideo && (
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Visualizações: {selectedVideo.visualizacoes || 0}
                  </span>
                  <a
                    href={selectedVideo.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    Abrir no YouTube
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* MODAL DE TOUR GUIADO DA TELA ATUAL                             */}
      {/* ============================================================== */}
      <Dialog open={tourModalOpen} onOpenChange={setTourModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="border-b pb-2">
            <div className="flex items-center gap-2 text-gray-900">
              <MousePointer2 className="w-4 h-4 text-[#005B2E]" />
              <DialogTitle className="text-sm font-bold">
                {activeTour?.titulo || 'Tour Guiado da Tela'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {activeTour && activeTour.etapas && activeTour.etapas.length > 0 && (
            <div className="py-3 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Etapa {currentTourStepIndex + 1} de {activeTour.etapas.length}
                </span>
                <span className="font-semibold text-[#005B2E]">{activeTour.modulo || 'Geral'}</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-1.5">
                <h5 className="text-xs font-bold text-gray-900">
                  {activeTour.etapas[currentTourStepIndex].titulo}
                </h5>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {activeTour.etapas[currentTourStepIndex].texto}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentTourStepIndex === 0}
                  onClick={() => setCurrentTourStepIndex((prev) => Math.max(0, prev - 1))}
                  className="text-xs h-8"
                >
                  Anterior
                </Button>

                {currentTourStepIndex < activeTour.etapas.length - 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setCurrentTourStepIndex((prev) => prev + 1)}
                    className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs h-8"
                  >
                    Próxima
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setTourModalOpen(false)}
                    className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs h-8"
                  >
                    Concluir Tour
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
