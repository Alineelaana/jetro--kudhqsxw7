import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  TrendingUp,
  Search,
  DollarSign,
  Users,
  RefreshCw,
  Plus,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { cn } from '@/lib/utils'

interface JetroOnlineChatProps {
  className?: string
}

function getGreeting(date = new Date()): string {
  const hours = date.getHours()
  if (hours >= 5 && hours < 12) return 'Bom dia'
  if (hours >= 12 && hours < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getFirstName(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return 'Usuário'
  const clean = fullName.trim().split(' ')[0]
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
}

/**
 * Renderizador seguro de Markdown executivo para o Jetro On-line
 * Suporta tabelas em Markdown (| col | col |), títulos, listas, negrito e blocos de código
 */
function MarkdownRenderer({ content }: { content: string }) {
  // Dividir blocos por tabelas vs texto corrido
  const lines = content.split('\n')
  const blocks: Array<{ type: 'table' | 'text'; lines: string[] }> = []

  let currentBlock: { type: 'table' | 'text'; lines: string[] } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|')

    if (isTableLine) {
      if (!currentBlock || currentBlock.type !== 'table') {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = { type: 'table', lines: [line] }
      } else {
        currentBlock.lines.push(line)
      }
    } else {
      if (!currentBlock || currentBlock.type !== 'text') {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = { type: 'text', lines: [line] }
      } else {
        currentBlock.lines.push(line)
      }
    }
  }
  if (currentBlock) blocks.push(currentBlock)

  return (
    <div className="space-y-3 text-sm leading-relaxed text-gray-800">
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          // Renderizar tabela HTML estilizada com identidade Jetro (#005B2E)
          const validRows = block.lines
            .map((l) =>
              l
                .trim()
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map((c) => c.trim()),
            )
            .filter((cells) => !cells.every((c) => /^-+$/.test(c)))

          if (validRows.length === 0) return null
          const header = validRows[0]
          const rows = validRows.slice(1)

          return (
            <div
              key={bIdx}
              className="my-3 overflow-x-auto rounded-lg border border-gray-200 shadow-xs"
            >
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#005B2E] text-white">
                    {header.map((col, cIdx) => (
                      <th
                        key={cIdx}
                        className="px-3.5 py-2.5 font-semibold tracking-wide uppercase text-[11px]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={cn(
                        'transition-colors hover:bg-[#005B2E]/5',
                        rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60',
                      )}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-gray-700 whitespace-nowrap">
                          <InlineFormat text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        // Bloco de texto com títulos, bullet points e parágrafos
        const blockText = block.lines.join('\n')
        return (
          <div key={bIdx} className="space-y-1.5">
            {block.lines.map((rawLine, lIdx) => {
              const line = rawLine.trim()
              if (!line) return <div key={lIdx} className="h-1" />

              if (line.startsWith('### ')) {
                return (
                  <h4
                    key={lIdx}
                    className="pt-2 font-bold text-gray-900 text-sm tracking-tight text-[#005B2E]"
                  >
                    <InlineFormat text={line.slice(4)} />
                  </h4>
                )
              }
              if (line.startsWith('## ')) {
                return (
                  <h3
                    key={lIdx}
                    className="pt-2 font-bold text-gray-900 text-base text-[#005B2E] border-b pb-1"
                  >
                    <InlineFormat text={line.slice(3)} />
                  </h3>
                )
              }
              if (line.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="pt-2 font-black text-gray-900 text-lg text-[#005B2E]">
                    <InlineFormat text={line.slice(2)} />
                  </h2>
                )
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#C9A227] shrink-0" />
                    <span className="text-gray-700">
                      <InlineFormat text={line.slice(2)} />
                    </span>
                  </div>
                )
              }
              if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+\.)\s(.*)$/)
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-bold text-[#005B2E] text-xs shrink-0">{match?.[1]}</span>
                    <span className="text-gray-700">
                      <InlineFormat text={match?.[2] || ''} />
                    </span>
                  </div>
                )
              }

              return (
                <p key={lIdx} className="text-gray-700 leading-relaxed">
                  <InlineFormat text={line} />
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function InlineFormat({ text }: { text: string }) {
  // Regex simples para negrito **texto** e código `codigo`
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono text-[#005B2E]"
        >
          {token.slice(1, -1)}
        </code>,
      )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return <>{parts.length > 0 ? parts : text}</>
}

export function JetroOnlineChat({ className }: JetroOnlineChatProps) {
  const { user } = useAuth()
  const {
    messages,
    conversations,
    conversationId,
    loading,
    loadingHistory,
    send,
    newConversation,
    loadHistory,
    endRef,
  } = useJetroOnline()

  const [input, setInput] = useState('')
  const [isTypingInput, setIsTypingInput] = useState(false)
  const [showHistorySidebar, setShowHistorySidebar] = useState(false)

  // 1. Saudação personalizada com primeiro nome
  const firstName = getFirstName(user?.name)
  const greeting = getGreeting()
  const userGreetingPhrase = `${greeting}, ${firstName}!`

  // 2. Frases animadas em ciclo (3 segundos por frase)
  const animatedPhrases = [
    userGreetingPhrase,
    'Como posso ajudar?',
    'O que você quer descobrir hoje?',
    'Pronto(a) para explorar seus dados?',
    'Em que posso ajudar agora?',
  ]

  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Efeito visual de digitação contínuo a cada frase
  useEffect(() => {
    // Se o usuário estiver ativamente digitando no input, não forçar re-render disruptivo
    const currentPhrase = animatedPhrases[phraseIndex] || animatedPhrases[0]
    let timeout: NodeJS.Timeout

    if (!isDeleting) {
      if (displayedText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1))
        }, 40)
      } else {
        // Pausa de 3 segundos com a frase completa antes de apagar/trocar
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, 3000)
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, 20)
      } else {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % animatedPhrases.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, phraseIndex, animatedPhrases])

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || loading) return
    send(query)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  // 4. Botões de sugestões inteligentes
  const smartSuggestions = [
    {
      title: 'Produto mais vendido no mês',
      icon: TrendingUp,
      prompt:
        'Qual foi o produto mais vendido neste mês? Por favor, informe quantidade vendida, faturamento gerado e período considerado.',
    },
    {
      title: 'Última compra de um cliente',
      icon: Search,
      prompt:
        'Qual foi a última compra autorizada para os clientes? Por favor, apresente data, número do pedido, valor total e situação.',
    },
    {
      title: 'Qual é meu ticket médio?',
      icon: DollarSign,
      prompt: 'Qual é o meu ticket médio neste mês com base nos pedidos autorizados e faturados?',
    },
    {
      title: 'Clientes sem compra há 60 dias',
      icon: Users,
      prompt: 'Quais clientes autorizados estão sem realizar compras há mais de 60 dias?',
    },
  ]

  const hasMessages = messages.length > 0

  return (
    <div
      className={cn(
        'relative flex flex-col w-full bg-linear-to-b from-white via-white to-gray-50/50 rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden',
        className,
      )}
    >
      {/* Top Banner / Cabeçalho da IA Jetro On-line */}
      <div className="relative px-6 py-5 bg-linear-to-r from-[#005B2E] via-[#014724] to-[#005B2E] text-white border-b-4 border-[#C9A227] flex flex-wrap items-center justify-between gap-4">
        {/* Glow decorativo de fundo */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C9A227]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/3 w-40 h-40 bg-[#005B2E]/40 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#C9A227] to-[#8F7014] text-white flex items-center justify-center shadow-md ring-2 ring-white/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Jetro On-line
              </span>
              <Badge className="bg-[#C9A227] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-xs hover:bg-[#b59020]">
                IA Nativa ERP
              </Badge>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
              Consultas e análises em tempo real integradas às coleções reais do sistema
            </p>
          </div>
        </div>

        {/* Ações superiores: Nova conversa e Histórico */}
        <div className="relative z-10 flex items-center gap-2">
          {conversations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-8 px-3"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-[#C9A227]" />
              Histórico ({conversations.length})
            </Button>
          )}
          {hasMessages && (
            <Button
              size="sm"
              onClick={newConversation}
              className="bg-[#C9A227] hover:bg-[#b59020] text-[#00381C] font-semibold text-xs h-8 px-3 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nova Consulta
            </Button>
          )}
        </div>
      </div>

      {/* Corpo principal do assistente */}
      <div className="flex flex-1 min-h-[460px] max-h-[720px] overflow-hidden">
        {/* Painel lateral opcional de histórico de conversas */}
        {showHistorySidebar && (
          <aside className="w-64 border-r border-gray-200 bg-gray-50/80 p-3 flex flex-col shrink-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Consultas Anteriores
              </span>
              <button
                onClick={() => setShowHistorySidebar(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      loadHistory(conv.id)
                      setShowHistorySidebar(false)
                    }}
                    className={cn(
                      'w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center gap-2 group',
                      conv.id === conversationId
                        ? 'bg-[#005B2E]/10 text-[#005B2E] font-semibold'
                        : 'hover:bg-gray-200/60 text-gray-700',
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                    <span className="truncate flex-1">{conv.title || 'Consulta de dados'}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400" />
                  </button>
                ))}
                {conversations.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Nenhuma conversa anterior
                  </p>
                )}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Área central com histórico de mensagens ou tela de boas-vindas */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <ScrollArea className="flex-1 p-5 sm:p-6">
            {!hasMessages ? (
              <div className="max-w-3xl mx-auto py-4 space-y-6">
                {/* 1. Título e Saudação com Efeito de Digitação */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005B2E]/10 text-[#005B2E] text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    Jetro On-line, pronto pra responder
                  </div>

                  {/* Frases com efeito typewriter */}
                  <div className="min-h-[44px] flex items-center">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                      <span>{displayedText}</span>
                      <span className="inline-block w-0.5 h-7 ml-1 bg-[#005B2E] animate-pulse" />
                    </h1>
                  </div>

                  {/* 3. Texto de orientação permanente */}
                  <p className="text-sm text-gray-500 font-normal">
                    Faça uma pergunta, faça uma análise ou explore as informações disponíveis.
                  </p>
                </div>

                {/* Badge de Governança de Acesso do Usuário */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200/70 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#005B2E] shrink-0" />
                  <span>
                    Conectado como <strong>{user?.name || user?.email}</strong> (
                    <span className="text-[#005B2E] font-semibold">
                      {user?.role || 'Acesso Padrão'}
                    </span>
                    ) — Filtros e permissões de dados são validados no servidor em cada consulta.
                  </span>
                </div>

                {/* 4. Botões de sugestões inteligentes */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    Sugestões inteligentes para começar:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {smartSuggestions.map((sug, i) => {
                      const Icon = sug.icon
                      return (
                        <button
                          key={i}
                          onClick={() => handleSend(sug.prompt)}
                          disabled={loading}
                          className="flex items-start gap-3 p-3.5 text-left rounded-xl border border-gray-200 hover:border-[#005B2E] bg-white hover:bg-[#005B2E]/5 transition-all duration-200 group shadow-2xs hover:shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#005B2E]/10 group-hover:bg-[#005B2E] text-[#005B2E] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-[#005B2E] transition-colors truncate">
                              {sug.title}
                            </p>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              Clique para consultar dados reais do ERP
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#005B2E] group-hover:translate-x-0.5 transition-all self-center" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Histórico de Mensagens */
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div
                      key={idx}
                      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-lg bg-[#005B2E] text-white flex items-center justify-center shrink-0 shadow-2xs ring-1 ring-[#C9A227]/40">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-2xs',
                          isUser
                            ? 'bg-[#005B2E] text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none',
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-white/10 dark:border-gray-200/50">
                          <span
                            className={cn(
                              'text-[11px] font-bold uppercase tracking-wider',
                              isUser ? 'text-emerald-100' : 'text-[#005B2E]',
                            )}
                          >
                            {isUser ? 'Você' : 'Jetro On-line'}
                          </span>
                          {msg.created && (
                            <span
                              className={cn(
                                'text-[10px]',
                                isUser ? 'text-emerald-200/70' : 'text-gray-400',
                              )}
                            >
                              {new Date(msg.created).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}

                        {/* Citações / Fontes dos dados */}
                        {!isUser && msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500">
                            <span className="font-semibold text-gray-700 flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3 h-3 text-[#005B2E]" />
                              Fontes e coleções consultadas:
                            </span>
                            <div className="space-y-1">
                              {msg.citations.map((c, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="text-gray-600 bg-gray-50 rounded px-2 py-1 border border-gray-100"
                                >
                                  [{c.n}] {c.excerpt?.slice(0, 100)}...
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-lg bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Indicador de carregamento */}
                {loading && (
                  <div className="flex gap-3 items-center justify-start">
                    <div className="w-8 h-8 rounded-lg bg-[#005B2E] text-white flex items-center justify-center shrink-0 animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-600 flex items-center gap-2 shadow-2xs">
                      <Loader2 className="w-4 h-4 text-[#005B2E] animate-spin" />
                      <span>Jetro On-line está consultando os dados reais do ERP...</span>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            )}
          </ScrollArea>

          {/* 5. Caixa de mensagens com botão de envio */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Atalhos rápidos quando o histórico está visível */}
            {hasMessages && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                  Perguntas rápidas:
                </span>
                {smartSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug.prompt)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-[#005B2E]/5 hover:border-[#005B2E] text-gray-700 hover:text-[#005B2E] whitespace-nowrap transition-colors"
                  >
                    {sug.title}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setIsTypingInput(e.target.value.length > 0)
                }}
                onFocus={() => setIsTypingInput(true)}
                onBlur={() => setIsTypingInput(false)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem… (ex: Qual foi o produto mais vendido neste mês?)"
                disabled={loading}
                className="pr-12 py-5.5 text-sm rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-[#005B2E] focus-visible:border-transparent bg-gray-50/50 hover:bg-white transition-all shadow-2xs"
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-1.5 h-8.5 w-8.5 p-0 rounded-lg bg-[#005B2E] hover:bg-[#01361D] text-white shadow-xs transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-400">
              <span>
                Pressione <strong>Enter</strong> para enviar
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#005B2E]" />
                Segurança com perfil auditado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
