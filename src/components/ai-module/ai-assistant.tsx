import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { SUGGESTED_QUESTIONS } from '@/lib/ai-types'
import nineAvatar from '@/assets/whatsapp-image-2026-08-09-at-23.43.52-265df.jpeg'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  pendingAction?: boolean
}

export function AiAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: `Olá, ${user?.name || 'usuário'}! Sou a Jeh, sua assistente de IA da HURAM. Como posso ajudar você hoje?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase()
    if (q.includes('venc') && q.includes('conta'))
      return 'Encontrei 3 contas a pagar que vencem hoje, totalizando R$ 12.450,00. Deseja que eu prepare os pagamentos para aprovação?'
    if (q.includes('pedido') && q.includes('atras'))
      return 'Há 2 pedidos de venda com entrega atrasada: PED-001 (2 dias) e PED-003 (5 dias). Deseja criar uma tarefa para contato com o cliente?'
    if (q.includes('estoque') && q.includes('baixo'))
      return '5 produtos estão com estoque abaixo do mínimo: Produto A (2 un.), Produto B (0 un.), Produto C (5 un.), Produto D (1 un.) e Produto E (3 un.). Deseja gerar uma solicitação de compra?'
    if (q.includes('inadimpl'))
      return 'Identifiquei 4 clientes inadimplentes com títulos vencidos há mais de 30 dias, totalizando R$ 28.900,00. Deseja que eu prepare cobranças?'
    if (q.includes('nota') && q.includes('rejeit'))
      return '1 nota fiscal foi rejeitada nas últimas 24h: NF-e nº 1234 (erro: CFOP inválido). Deseja abrir uma correção?'
    if (q.includes('entrega') && q.includes('atras'))
      return '3 entregas estão atrasadas: ENT-01 (1 dia), ENT-02 (2 dias), ENT-03 (3 dias). Deseja registrar ocorrências?'
    if (q.includes('compra') && q.includes('aprov'))
      return '2 solicitações de compra aguardam aprovação: SC-001 (R$ 5.000,00) e SC-002 (R$ 8.200,00). Deseja revisá-las?'
    if (q.includes('faturamento'))
      return 'O faturamento do mês atual é de R$ 145.300,00, um aumento de 12% em relação ao mês anterior. Deseja ver o detalhamento por cliente?'
    if (q.includes('margem') && q.includes('negativ'))
      return '2 produtos estão com margem negativa: Produto X (-5%) e Produto Y (-2%). Deseja sugerir reajuste de preço?'
    return 'Entendi sua pergunta. Vou consultar os dados do ERP e preparar uma resposta detalhada para você. Posso também sugerir ações relacionadas se desejar.'
  }

  const handleSend = (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setMessages((p) => [...p, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const response = generateResponse(msg)
      setMessages((p) => [...p, { role: 'assistant', content: response }])
      setLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20 flex flex-col h-[70vh]">
        <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center gap-3 rounded-t-xl">
          <div className="w-10 h-10 rounded-full border-2 border-[#C89B3C] overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={nineAvatar}
              alt="Jeh - Inteligência Artificial HURAM"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-sm">Jeh - Assistente IA HURAM</p>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" /> Online
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex items-start gap-2.5 max-w-[80%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full border border-[#C89B3C] overflow-hidden shrink-0 shadow-sm mt-0.5">
                  <img
                    src={nineAvatar}
                    alt="Jeh - Inteligência Artificial HURAM"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className={cn(
                  'rounded-2xl p-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-[#005B2E] text-white rounded-tr-sm'
                    : 'bg-white border border-border rounded-tl-sm',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'assistant' ? (
                    <span className="text-xs font-bold text-[#005B2E]">Jeh</span>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 opacity-70" />
                      <span className="text-xs font-bold opacity-70">Você</span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full border border-[#C89B3C] overflow-hidden shrink-0">
                <img
                  src={nineAvatar}
                  alt="Jeh - Inteligência Artificial HURAM"
                  className="w-full h-full object-cover"
                />
              </div>
              <Loader2 className="w-4 h-4 animate-spin text-[#005B2E]" />
              <span>Jeh está pensando...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="p-3 border-t border-border flex items-center gap-2">
          <Input
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="focus-visible:ring-[#005B2E]"
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#C89B3C]" /> Perguntas sugeridas
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#005B2E]/20 text-[#005B2E] hover:bg-[#005B2E]/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
