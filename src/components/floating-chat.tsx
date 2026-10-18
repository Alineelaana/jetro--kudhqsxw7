import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  Maximize2,
  Minimize2,
  ExternalLink,
  Plus,
  Loader2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { JetroOnlineChartRenderer } from '@/components/jetro-online/jetro-online-chart-renderer'

const SESSION_DISMISSED_KEY = 'jetro_online_floating_dismissed'

// Parse básico para blocos de gráfico no chat compacto
function parseAssistantContent(content: string) {
  const pieces: Array<{ type: 'text' | 'chart'; content?: string; chartSpec?: any }> = []
  const chartRegex = /```jetro-chart([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = chartRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textPiece = content.slice(lastIndex, match.index).trim()
      if (textPiece) {
        pieces.push({ type: 'text', content: textPiece })
      }
    }
    const rawJson = match[1].trim()
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

export function FloatingChat() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Conectado DIRETAMENTE à inteligência unificada do Jetro On-line
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
  const [showHistoryList, setShowHistoryList] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      /* intentionally ignored */
    }
  }, [isDismissed])

  // Se o usuário NÃO estiver autenticado, o chat flutuante NÃO deve ser renderizado
  if (!isAuthenticated) {
    return null
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    const clean = input.trim()
    if (!clean || loading) return
    send(clean)
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

  // Quando dispensado pelo botão X, preservamos o comportamento com a alça lateral discreta
  if (isDismissed) {
    return (
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-40 select-none">
        <button
          id="floating-chat-trigger"
          onClick={handleReopen}
          className="group flex items-center gap-1.5 bg-[#005B2E]/90 hover:bg-[#005B2E] text-white py-3 px-1.5 rounded-l-md shadow-md border-y border-l border-[#C9A227]/50 backdrop-blur-sm transition-all duration-200 hover:pl-2.5 hover:pr-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227] cursor-pointer"
          aria-label="Abrir Jetro On-line"
          title="Jetro On-line — Assistente ERP Inteligente"
        >
          <div className="relative h-5 w-5 rounded-md bg-[#00381C] text-white flex items-center justify-center border border-[#C9A227]/80 shrink-0">
            <Bot className="h-3.5 w-3.5 text-[#C9A227]" />
          </div>
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold tracking-wider text-emerald-100 group-hover:text-white uppercase">
            Jetro On-line
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {!isFloatingOpen && (
        <div className="relative group">
          <button
            id="floating-chat-trigger"
            onClick={() => setIsFloatingOpen(true)}
            className="flex items-center gap-2.5 bg-[#005B2E] hover:bg-[#004724] text-white p-3 rounded-full shadow-xl border-2 border-[#C9A227] transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Jetro On-line — Assistente ERP"
            title="Abrir Jetro On-line"
          >
            <div className="relative h-7 w-7 rounded-lg bg-[#00381C] flex items-center justify-center text-white border border-[#C9A227]/60">
              <Bot className="h-4 w-4 text-[#C9A227]" />
            </div>
            <span className="hidden sm:inline-block font-bold text-xs pr-1">Jetro On-line</span>
            <Sparkles className="h-4 w-4 text-[#C9A227]" />
          </button>

          {/* Botão X para fechar e esconder da tela deixando a alça lateral */}
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

      {isFloatingOpen && (
        <div
          className={cn(
            'bg-white rounded-2xl shadow-2xl border-2 border-[#005B2E] overflow-hidden flex flex-col transition-all duration-200 select-text',
            isExpanded
              ? 'w-[90vw] max-w-[720px] h-[85vh] max-h-[720px]'
              : 'w-[360px] sm:w-[410px] h-[520px]',
          )}
        >
          {/* Cabeçalho do Chat Flutuante */}
          <div className="bg-gradient-to-r from-[#00381C] via-[#005B2E] to-[#00381C] text-white px-4 py-3 flex items-center justify-between border-b border-[#C9A227]/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#002613] flex items-center justify-center border border-[#C9A227]/70 shrink-0">
                <Bot className="h-4.5 w-4.5 text-[#C9A227]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold truncate">Jetro On-line</h4>
                  <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-[#C9A227]/20 text-[#FFD868] font-semibold border border-[#C9A227]/30">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    ERP Auditado
                  </span>
                </div>
                <span className="text-[10px] text-emerald-200/90 truncate block">
                  Inteligência Corporativa & Operacional
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Botão de Histórico */}
              {conversations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistoryList(!showHistoryList)}
                  title="Histórico de consultas"
                  className={cn(
                    'p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/90',
                    showHistoryList && 'bg-white/20 text-[#FFD868]',
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}

              {/* Botão Nova Consulta */}
              <button
                type="button"
                onClick={newConversation}
                title="Nova Consulta"
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/90"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* Botão Abrir na Tela Inicial (/admin) */}
              <button
                type="button"
                onClick={handleOpenInAdmin}
                title="Abrir na Tela Inicial Inteligente (/admin)"
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/90"
              >
                <ExternalLink className="h-4 w-4" />
              </button>

              {/* Botão Expandir / Reduzir */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Reduzir janela' : 'Ampliar janela'}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/90"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Botão Fechar */}
              <button
                type="button"
                onClick={handleDismiss}
                title="Fechar assistente da tela"
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/90 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Submenu de histórico rápido se acionado */}
          {showHistoryList && (
            <div className="bg-slate-50 border-b border-gray-200 px-3 py-2 max-h-36 overflow-y-auto text-xs shrink-0">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-200/80">
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Conversas Anteriores ({conversations.length})
                </span>
                <button
                  onClick={() => setShowHistoryList(false)}
                  className="text-gray-400 hover:text-gray-600 text-[10px]"
                >
                  Fechar
                </button>
              </div>
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      loadHistory(c.id)
                      setShowHistoryList(false)
                    }}
                    className={cn(
                      'w-full text-left p-1.5 rounded text-[11px] truncate flex items-center gap-1.5 transition-colors',
                      c.id === conversationId
                        ? 'bg-[#005B2E]/10 text-[#005B2E] font-semibold'
                        : 'hover:bg-gray-200/60 text-gray-700',
                    )}
                  >
                    <MessageSquare className="w-3 h-3 text-[#C9A227] shrink-0" />
                    <span className="truncate flex-1">{c.title || 'Consulta de dados'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Área Central de Mensagens */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#005B2E]/10 text-[#005B2E] flex items-center justify-center border border-[#005B2E]/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-800">Jetro On-line Conectado</h5>
                  <p className="text-[11px] text-gray-500 max-w-xs mt-0.5 leading-relaxed">
                    Mesma inteligência da Tela Inicial. Pergunte sobre vendas, faturamento, estoque,
                    fiscal ou financeiro.
                  </p>
                </div>

                <div className="w-full space-y-1.5 pt-2 text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Sugestões rápidas:
                  </p>
                  {[
                    'Faturamento total do mês atual',
                    'Quais são os 5 produtos mais vendidos?',
                    'Existem títulos vencidos a receber?',
                    'Quais produtos têm estoque baixo?',
                  ].map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => send(sug)}
                      disabled={loading}
                      className="w-full p-2 rounded-lg bg-white border border-gray-200 hover:border-[#005B2E] text-gray-700 hover:text-[#005B2E] text-[11px] flex items-center justify-between transition-colors shadow-2xs group cursor-pointer disabled:opacity-50"
                    >
                      <span className="truncate">{sug}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#005B2E] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user'
                const parsedPieces = !isUser ? parseAssistantContent(msg.content) : []

                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-start gap-2',
                      isUser ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-md bg-[#005B2E] text-white flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A227]/40 shadow-2xs">
                        <Bot className="w-3.5 h-3.5 text-[#C9A227]" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[85%] rounded-xl p-3 text-xs shadow-2xs leading-relaxed',
                        isUser
                          ? 'bg-[#005B2E] text-white rounded-tr-none font-medium'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none',
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="space-y-2">
                          {parsedPieces.map((piece, pIdx) => {
                            if (piece.type === 'chart' && piece.chartSpec) {
                              return (
                                <div
                                  key={pIdx}
                                  className="my-2 bg-slate-50 p-2 rounded border border-gray-200"
                                >
                                  <JetroOnlineChartRenderer spec={piece.chartSpec} />
                                </div>
                              )
                            }
                            return (
                              <div key={pIdx} className="whitespace-pre-wrap">
                                {piece.content}
                              </div>
                            )
                          })}

                          {/* Fontes consultadas */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-gray-100 text-[10px] text-gray-500">
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
              })
            )}

            {/* Indicador de carregamento */}
            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-white border border-gray-200 rounded-lg p-2.5 shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 text-[#005B2E] animate-spin shrink-0" />
                <span>Consultando dados reais do ERP e aplicando regras auditadas...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rodapé com Input */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Pergunte ao Jetro On-line..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 h-9 px-3 text-xs bg-slate-50 rounded-lg border border-gray-200 focus:outline-none focus:border-[#005B2E] focus:ring-1 focus:ring-[#005B2E] transition-all"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 px-3 bg-[#005B2E] hover:bg-[#004724] text-white rounded-lg transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
