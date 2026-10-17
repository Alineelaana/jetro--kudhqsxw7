import { useState } from 'react'
import {
  Send,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  FileText,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { askSegundoCerebro, saveChatMessage } from '@/services/segundo-cerebro'
import type { SegundoCerebroDoc } from '@/types/segundo-cerebro'

interface AssistantProps {
  currentChatId?: string
  onSelectDocument?: (doc: Partial<SegundoCerebroDoc>) => void
}

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{
    id?: string
    title?: string
    path?: string
    area?: string
    excerpt?: string
  }>
  isFavorite?: boolean
  timestamp: string
}

const SUGGESTED_QUESTIONS = [
  'Qual é o procedimento operacional padrão para homologação e cadastro de cliente?',
  'Quais decisões foram aprovadas recentemente para a expansão logística e WMS?',
  'Quais são as alçadas de desconto permitidas pela política comercial vigente?',
  'Existe alguma divergência entre as diretrizes comerciais e propostas em análise?',
]

export function SegundoCerebroAssistant({ currentChatId, onSelectDocument }: AssistantProps) {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Eu sou o assistente do **Segundo Cérebro da Empresa**. Todo o conhecimento documentado da organização (reuniões, diretrizes, projetos, POPs e notas Obsidian) está conectado aqui.\n\n' +
        'Todas as minhas respostas baseiam-se **estritamente em documentos autorizados**, citando sempre as fontes e rotulando [DADO OPERACIONAL DO ERP], [INFORMAÇÃO DOCUMENTADA] e [INTERPRETAÇÃO DA IA].\n\n' +
        'O que você gostaria de saber sobre a empresa hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsgId = 'user-' + Date.now()
    const userMsg: MessageItem = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await askSegundoCerebro({
        message: text,
        conversation_id: conversationId,
        mode: 'geral',
      })

      if (response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      const botMsgId = 'ai-' + Date.now()
      const botMsg: MessageItem = {
        id: botMsgId,
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, botMsg])

      // Se houver chat_id persistido, salvar
      if (currentChatId) {
        await saveChatMessage({
          chat_id: currentChatId,
          role: 'user',
          content: text,
        }).catch(() => {})
        await saveChatMessage({
          chat_id: currentChatId,
          role: 'assistant',
          content: response.content,
          citations: response.citations,
        }).catch(() => {})
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na consulta'
      toast({
        title: 'Não foi possível obter resposta',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({ title: 'Copiado para a área de transferência' })
  }

  const toggleFavorite = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)))
  }

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Cabeçalho da Área Central conforme requisito 2 */}
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-linear-to-b from-[#005B2E]/5 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#C9A227]" />
          <h2 className="text-base sm:text-lg font-bold text-[#005B2E]">
            O que você gostaria de saber sobre a empresa?
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
          Todo o conhecimento da organização conectado para transformar informações em decisões.
        </p>

        {/* Perguntas Sugeridas */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-[11px] bg-white hover:bg-[#005B2E]/10 hover:border-[#005B2E]/40 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 transition-colors text-left disabled:opacity-50"
            >
              💡 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
            >
              <div
                className={`w-full rounded-xl p-4 sm:p-5 transition-shadow ${
                  isUser
                    ? 'bg-[#005B2E] text-white shadow-xs ml-auto max-w-[85%]'
                    : 'bg-stone-50 border border-stone-200/90 text-gray-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isUser ? 'text-[#E4C46A]' : 'text-[#005B2E]'
                      }`}
                    >
                      {isUser ? 'Você' : 'Segundo Cérebro Jetro'}
                    </span>
                    {!isUser && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-[#005B2E]/10 border-[#005B2E]/30 text-[#005B2E] py-0"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 mr-1 text-[#005B2E]" />
                        Fontes Verificadas
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
                      {m.timestamp}
                    </span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="p-1 rounded-sm hover:bg-black/5 transition-colors"
                      title="Copiar texto"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy
                          className={`w-3.5 h-3.5 ${isUser ? 'text-white/70' : 'text-gray-400'}`}
                        />
                      )}
                    </button>
                    {!isUser && (
                      <button
                        onClick={() => toggleFavorite(m.id)}
                        className="p-1 rounded-sm hover:bg-black/5 transition-colors"
                        title={m.isFavorite ? 'Remover dos favoritos' : 'Favoritar resposta'}
                      >
                        {m.isFavorite ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Conteúdo com suporte a quebras de linha e destaques */}
                <div
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {m.content}
                </div>

                {/* Bloco de Fontes / Citações Obrigatórias com Link */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-200">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mb-2">
                      <FileText className="w-3.5 h-3.5 text-[#005B2E]" />
                      Fontes Documentais Citadas ({m.citations.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.citations.map((cite, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() =>
                            onSelectDocument?.({
                              id: cite.id,
                              title: cite.title || 'Documento',
                              path: cite.path || '',
                              content: cite.excerpt || '',
                            })
                          }
                          className="flex items-start justify-between text-left p-2.5 rounded-lg bg-white border border-stone-200 hover:border-[#005B2E] transition-colors group shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-[#005B2E] truncate">
                              {cite.title || 'Documento corporativo'}
                            </p>
                            {cite.path && (
                              <p className="text-[10px] text-gray-500 truncate">{cite.path}</p>
                            )}
                            {cite.excerpt && (
                              <p className="text-[10px] text-gray-600 line-clamp-2 mt-0.5 italic">
                                "{cite.excerpt}"
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#005B2E] shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-2 p-4 bg-stone-50 rounded-xl border border-stone-200 max-w-md">
            <div className="w-4 h-4 border-2 border-[#005B2E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-600 font-medium">
              Consultando base de conhecimento autorizada e compilando fontes...
            </span>
          </div>
        )}
      </div>

      {/* Caixa de Entrada conforme requisito 2 */}
      <div className="p-4 border-t border-gray-200 bg-stone-50/70">
        <div className="relative flex items-center">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Pergunte qualquer coisa sobre a empresa…"
            rows={2}
            className="w-full pr-24 resize-none bg-white border-gray-300 focus-visible:ring-[#005B2E] text-sm"
          />
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="bg-[#005B2E] hover:bg-[#004724] text-white h-8 px-3.5 text-xs font-semibold shadow-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Enviar
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5 px-1">
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#005B2E]" />
            Somente leitura · Nenhuma alteração nos dados do ERP
          </span>
        </div>
      </div>
    </div>
  )
}
