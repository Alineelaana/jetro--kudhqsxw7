import React, { useState, useEffect, useMemo } from 'react'
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
  Plus,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Layers,
  FileText,
  FileCheck2,
  AlertCircle,
  UserCheck,
  UserX,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { cn } from '@/lib/utils'
import { JetroOnlineChartRenderer, type JetroChartSpec } from './jetro-online-chart-renderer'

interface JetroOnlineChatProps {
  className?: string
}

export interface SmartSuggestionItem {
  id: string
  title: string
  icon: LucideIcon
  prompt: string
  category: string
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
 * Extrai blocos ```chart ... ``` ou ```json ... ``` do texto do assistente
 */
interface ParsedContentPiece {
  type: 'markdown' | 'chart'
  content: string
  chartSpec?: JetroChartSpec
}

function parseAssistantContent(rawText: string): ParsedContentPiece[] {
  const pieces: ParsedContentPiece[] = []
  // Regex para capturar blocos ```chart ... ``` ou ```json com type="bar"|"line"
  const chartBlockRegex = /```(?:chart|json:chart)\s*([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = chartBlockRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = rawText.substring(lastIndex, match.index)
      if (textBefore.trim()) {
        pieces.push({ type: 'markdown', content: textBefore })
      }
    }

    const rawJson = match[1].trim()
    try {
      const parsed = JSON.parse(rawJson)
      if (
        parsed &&
        (parsed.type === 'bar' || parsed.type === 'line') &&
        Array.isArray(parsed.data)
      ) {
        pieces.push({
          type: 'chart',
          content: rawJson,
          chartSpec: parsed as JetroChartSpec,
        })
      } else {
        // Fallback: se não for especificação válida de gráfico, renderiza como markdown
        pieces.push({ type: 'markdown', content: match[0] })
      }
    } catch {
      // JSON inválido: preserva como texto
      pieces.push({ type: 'markdown', content: match[0] })
    }

    lastIndex = chartBlockRegex.lastIndex
  }

  if (lastIndex < rawText.length) {
    const trailingText = rawText.substring(lastIndex)
    if (trailingText.trim()) {
      pieces.push({ type: 'markdown', content: trailingText })
    }
  }

  if (pieces.length === 0) {
    pieces.push({ type: 'markdown', content: rawText })
  }

  return pieces
}

/**
 * Renderizador de Markdown executivo para o Jetro On-line
 * Suporta tabelas em Markdown (| col | col |), títulos, listas, negrito e blocos de código
 */
function MarkdownRenderer({ content }: { content: string }) {
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

/**
 * Sugestões inteligentes segmentadas por perfil/departamento
 */
const ALL_SUGGESTIONS: Record<string, SmartSuggestionItem[]> = {
  comercial: [
    {
      id: 'com-1',
      title: 'Produto mais vendido no mês',
      icon: TrendingUp,
      prompt:
        'Qual foi o produto mais vendido neste mês? Por favor, informe quantidade vendida, faturamento comercial faturado e evolução comparativa em gráfico.',
      category: 'Comercial',
    },
    {
      id: 'com-2',
      title: 'Última compra de cliente',
      icon: Search,
      prompt:
        'Qual foi a última compra autorizada para os clientes? Apresente data, número do pedido, valor total faturado e status.',
      category: 'Comercial',
    },
    {
      id: 'com-3',
      title: 'Qual é o ticket médio?',
      icon: DollarSign,
      prompt:
        'Qual é o meu ticket médio no mês considerando pedidos faturados de venda comercial, excluindo bonificações e cancelados?',
      category: 'Comercial',
    },
    {
      id: 'com-4',
      title: 'Clientes sem compra há 60 dias',
      icon: Users,
      prompt:
        'Quais clientes autorizados estão sem realizar compras faturadas há mais de 60 dias? Apresente ranking e data da última compra.',
      category: 'Comercial',
    },
  ],
  estoque: [
    {
      id: 'est-1',
      title: 'Produtos com saldo mais baixo',
      icon: Package,
      prompt:
        'Quais são os produtos com saldo de estoque mais baixo ou abaixo do estoque mínimo? Apresente ranking em gráfico de barras.',
      category: 'Estoque / Operação',
    },
    {
      id: 'est-2',
      title: 'Movimentações de estoque da semana',
      icon: Layers,
      prompt:
        'Quais foram as principais movimentações e expedições de estoque realizadas na última semana?',
      category: 'Estoque / Operação',
    },
    {
      id: 'est-3',
      title: 'Recebimentos WMS pendentes',
      icon: Clock,
      prompt:
        'Quais são os recebimentos de notas fiscais e tarefas de armazenagem (putaway) pendentes no WMS hoje?',
      category: 'Estoque / Operação',
    },
  ],
  fiscal: [
    {
      id: 'fisc-1',
      title: 'Notas emitidas no mês',
      icon: FileText,
      prompt:
        'Quantas notas fiscais (NF-e) foram emitidas no mês atual e qual o valor total faturado? Exiba a evolução em gráfico.',
      category: 'Fiscal',
    },
    {
      id: 'fisc-2',
      title: 'CT-e do período',
      icon: FileCheck2,
      prompt:
        'Qual é o resumo e quantidade de Conhecimentos de Transporte Eletrônico (CT-e) autorizados no período recente?',
      category: 'Fiscal',
    },
    {
      id: 'fisc-3',
      title: 'Notas com pendência',
      icon: AlertCircle,
      prompt:
        'Existem notas fiscais rejeitadas, pendentes de autorização ou com cartas de correção no período?',
      category: 'Fiscal',
    },
  ],
  rh: [
    {
      id: 'rh-1',
      title: 'Colaboradores ativos',
      icon: UserCheck,
      prompt:
        'Qual é o total de colaboradores ativos na empresa por departamento? Apresente o comparativo em gráfico de barras.',
      category: 'RH / DP',
    },
    {
      id: 'rh-2',
      title: 'Afastamentos em curso',
      icon: UserX,
      prompt:
        'Quais colaboradores possuem afastamentos ou atestados médicos em andamento no departamento pessoal?',
      category: 'RH / DP',
    },
    {
      id: 'rh-3',
      title: 'Faltas do mês',
      icon: Clock,
      prompt:
        'Qual é o registro de faltas, atrasos e ocorrências de ponto apuradas na competência atual do DP?',
      category: 'RH / DP',
    },
  ],
  financeiro: [
    {
      id: 'fin-1',
      title: 'Contas a receber vencendo',
      icon: ArrowDownCircle,
      prompt:
        'Quais títulos de contas a receber estão vencendo nesta semana ou em atraso? Apresente valores por vencimento.',
      category: 'Financeiro',
    },
    {
      id: 'fin-2',
      title: 'Contas a pagar da semana',
      icon: ArrowUpCircle,
      prompt:
        'Quais são os compromissos de contas a pagar agendados para os próximos dias da semana corrente?',
      category: 'Financeiro',
    },
    {
      id: 'fin-3',
      title: 'Recebimentos do dia',
      icon: Receipt,
      prompt:
        'Qual foi o total de recebimentos e baixas financeiras registradas hoje nas contas bancárias da empresa?',
      category: 'Financeiro',
    },
  ],
}

export function JetroOnlineChat({ className }: JetroOnlineChatProps) {
  const { user } = useAuth()
  const {
    messages,
    conversations,
    conversationId,
    serverUserContext,
    loading,
    send,
    newConversation,
    loadHistory,
    endRef,
  } = useJetroOnline()

  const [input, setInput] = useState('')
  const [, setIsTypingInput] = useState(false)
  const [showHistorySidebar, setShowHistorySidebar] = useState(false)
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('todas')

  // Identificação do perfil do usuário para sugestões personalizadas
  const effectiveRole = useMemo(() => {
    const rawRole = (serverUserContext?.role || (user?.role as string) || '').toUpperCase()
    const rawDept = (
      serverUserContext?.departamento ||
      (user?.departamento as string) ||
      ''
    ).toUpperCase()
    const rawPerfil = (
      serverUserContext?.perfil_acesso ||
      (user?.perfil_acesso as string) ||
      ''
    ).toUpperCase()

    // Admin / Gestor amplo
    if (
      rawRole === 'SUP' ||
      rawRole === 'ADMIN' ||
      rawPerfil.includes('ADMIN') ||
      rawPerfil.includes('DIRETORIA') ||
      rawPerfil.includes('GESTOR')
    ) {
      return 'admin'
    }
    // Comercial / RCA / Vendedor
    if (
      rawRole === 'RCA' ||
      rawRole === 'VENDEDOR' ||
      rawRole === 'COMERCIAL' ||
      rawRole === 'SDR' ||
      rawDept.includes('COMERCIAL') ||
      rawDept.includes('VENDAS')
    ) {
      return 'comercial'
    }
    // Financeiro
    if (
      rawRole === 'FINANCEIRO' ||
      rawDept.includes('FINANCEIRO') ||
      rawDept.includes('CONTROLADORIA')
    ) {
      return 'financeiro'
    }
    // Fiscal
    if (rawDept.includes('FISCAL') || rawPerfil.includes('FISCAL')) {
      return 'fiscal'
    }
    // Estoque / WMS / Operação
    if (
      rawDept.includes('ESTOQUE') ||
      rawDept.includes('WMS') ||
      rawDept.includes('LOGISTICA') ||
      rawDept.includes('OPERAC')
    ) {
      return 'estoque'
    }
    // RH / DP
    if (rawDept.includes('RH') || rawDept.includes('DP') || rawDept.includes('PESSOAS')) {
      return 'rh'
    }

    return 'admin' // fallback com todas as opções
  }, [user, serverUserContext])

  // Sugestões inteligentes filtradas de acordo com as regras solicitadas
  const profileSuggestions = useMemo(() => {
    if (effectiveRole === 'admin') {
      // Admin/gestor vê todas as sugestões
      return [
        ...ALL_SUGGESTIONS.comercial,
        ...ALL_SUGGESTIONS.estoque,
        ...ALL_SUGGESTIONS.fiscal,
        ...ALL_SUGGESTIONS.financeiro,
        ...ALL_SUGGESTIONS.rh,
      ]
    }
    if (effectiveRole === 'comercial') {
      return ALL_SUGGESTIONS.comercial
    }
    if (effectiveRole === 'estoque') {
      return ALL_SUGGESTIONS.estoque
    }
    if (effectiveRole === 'fiscal') {
      return ALL_SUGGESTIONS.fiscal
    }
    if (effectiveRole === 'rh') {
      return ALL_SUGGESTIONS.rh
    }
    if (effectiveRole === 'financeiro') {
      return ALL_SUGGESTIONS.financeiro
    }
    return ALL_SUGGESTIONS.comercial
  }, [effectiveRole])

  // Categorias disponíveis para filtro quando admin
  const availableCategories = useMemo(() => {
    if (effectiveRole !== 'admin') return []
    return ['todas', 'Comercial', 'Estoque / Operação', 'Fiscal', 'Financeiro', 'RH / DP']
  }, [effectiveRole])

  const displayedSuggestions = useMemo(() => {
    if (effectiveRole !== 'admin' || selectedFilterCategory === 'todas') {
      return profileSuggestions
    }
    return profileSuggestions.filter((s) => s.category === selectedFilterCategory)
  }, [effectiveRole, profileSuggestions, selectedFilterCategory])

  // 1. Saudação personalizada com primeiro nome
  const firstName = getFirstName(user?.name as string)
  const greeting = getGreeting()
  const userGreetingPhrase = `${greeting}, ${firstName}!`

  // 2. Frases animadas em ciclo (3 segundos por frase)
  const animatedPhrases = useMemo(
    () => [
      userGreetingPhrase,
      'Como posso ajudar?',
      'O que você quer descobrir hoje?',
      'Pronto(a) para explorar seus dados?',
      'Em que posso ajudar agora?',
    ],
    [userGreetingPhrase],
  )

  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = animatedPhrases[phraseIndex] || animatedPhrases[0]
    let timeout: NodeJS.Timeout

    if (!isDeleting) {
      if (displayedText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1))
        }, 40)
      } else {
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
              Consultas com regras comerciais reais, gráficos integrados e filtros por perfil
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
                className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
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
                      'w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center gap-2 group cursor-pointer',
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
                    Jetro On-line com critérios comerciais reais e gráficos
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
                    Faça uma pergunta, solicite rankings, análises de faturamento com gráficos ou
                    explore informações do seu departamento.
                  </p>
                </div>

                {/* Badge de Governança de Acesso do Usuário */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200/70 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#005B2E] shrink-0" />
                    <span>
                      Conectado como{' '}
                      <strong>{(user?.name as string) || (user?.email as string)}</strong> (
                      <span className="text-[#005B2E] font-semibold">
                        {(user?.role as string) || 'Acesso Padrão'}
                      </span>
                      ) — Perfil ativo:{' '}
                      <strong className="text-gray-900 uppercase">
                        {effectiveRole === 'admin'
                          ? 'Gestor / Admin (Acesso Geral)'
                          : effectiveRole}
                      </strong>
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-[#005B2E]/30 text-[#005B2E] text-[10px]"
                  >
                    Critérios Fiscais & Comerciais Reais
                  </Badge>
                </div>

                {/* Filtro por categoria (quando admin/gestor) */}
                {availableCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
                      Filtrar por área:
                    </span>
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedFilterCategory(cat)}
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer',
                          selectedFilterCategory === cat
                            ? 'bg-[#005B2E] text-white font-semibold shadow-2xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
                        )}
                      >
                        {cat === 'todas' ? 'Todas as Áreas' : cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. Botões de sugestões inteligentes por perfil */}
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    Sugestões inteligentes para o seu perfil:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {displayedSuggestions.map((sug) => {
                      const Icon = sug.icon
                      return (
                        <button
                          key={sug.id}
                          onClick={() => handleSend(sug.prompt)}
                          disabled={loading}
                          className="flex items-start gap-3 p-3.5 text-left rounded-xl border border-gray-200 hover:border-[#005B2E] bg-white hover:bg-[#005B2E]/5 transition-all duration-200 group shadow-2xs hover:shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#005B2E]/10 group-hover:bg-[#005B2E] text-[#005B2E] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-gray-900 group-hover:text-[#005B2E] transition-colors truncate">
                                {sug.title}
                              </p>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                                {sug.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              {sug.prompt}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#005B2E] group-hover:translate-x-0.5 transition-all self-center shrink-0" />
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
                  const parsedPieces = !isUser ? parseAssistantContent(msg.content) : []

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
                          <div className="space-y-3">
                            {parsedPieces.map((piece, pIdx) => {
                              if (piece.type === 'chart' && piece.chartSpec) {
                                return (
                                  <JetroOnlineChartRenderer key={pIdx} spec={piece.chartSpec} />
                                )
                              }
                              return <MarkdownRenderer key={pIdx} content={piece.content} />
                            })}
                          </div>
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
                      <span>
                        Jetro On-line está consultando os dados reais e aplicando regras
                        comerciais...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            )}
          </ScrollArea>

          {/* Caixa de mensagens com botão de envio */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Atalhos rápidos quando o histórico está visível */}
            {hasMessages && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                  Perguntas rápidas:
                </span>
                {profileSuggestions.slice(0, 6).map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSend(sug.prompt)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-[#005B2E]/5 hover:border-[#005B2E] text-gray-700 hover:text-[#005B2E] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
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
                placeholder="Digite sua mensagem… (ex: Compare o faturamento dos últimos 3 meses em gráfico)"
                disabled={loading}
                className="pr-12 py-5.5 text-sm rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-[#005B2E] focus-visible:border-transparent bg-gray-50/50 hover:bg-white transition-all shadow-2xs"
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-1.5 h-8.5 w-8.5 p-0 rounded-lg bg-[#005B2E] hover:bg-[#01361D] text-white shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
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
                Segurança com perfil auditado e regras de faturamento Jetro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
