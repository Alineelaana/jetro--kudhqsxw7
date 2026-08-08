import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { displayableMessages } from '@/lib/skipAi'

const SUGGESTED = [
  'Quais equipes tem maior turnover?',
  'Quem esta pronto para promocao?',
  'Quais posicoes criticas nao tem sucessor?',
  'Quais competencias estao faltando?',
  'Onde a performance caiu?',
  'Onde esta o maior risco de perda de talentos?',
]

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

export function RhAdapta() {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/rh-adapta/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token,
        },
        body: JSON.stringify({ message: msg, conversation_id: conversationId }),
      })
      const data = await res.json()
      if (data.conversation_id) setConversationId(data.conversation_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content || 'Sem resposta' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Erro ao conectar com ADAPTA RH. Tente novamente.',
        },
      ])
    }
    setLoading(false)
  }

  return (
    <Card className="flex flex-col border-2 border-[#005B2E]/20 overflow-hidden h-[70vh]">
      <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#C89B3C] flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm">ADAPTA RH — Gestao de Pessoas</p>
          <p className="text-xs text-white/80 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" /> Online · Respeita LGPD e RBAC
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-[#C89B3C] mx-auto mb-3" />
              <p className="font-bold text-[#005B2E]">Ola, {user?.name || 'usuario'}!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Sou o ADAPTA RH. Pergunte sobre turnover, promocoes, sucessao, competencias e mais.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'max-w-[80%] rounded-2xl p-3 text-sm',
                msg.role === 'user'
                  ? 'ml-auto bg-[#005B2E] text-white rounded-tr-sm'
                  : 'bg-white border border-border rounded-tl-sm',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'assistant' ? (
                  <Bot className="w-3.5 h-3.5 text-[#C89B3C]" />
                ) : (
                  <User className="w-3.5 h-3.5 opacity-70" />
                )}
                <span className="text-xs font-bold opacity-70">
                  {msg.role === 'assistant' ? 'ADAPTA RH' : 'Voce'}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> ADAPTA RH esta analisando...
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#005B2E]/20 text-[#005B2E] hover:bg-[#005B2E]/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <Input
          placeholder="Pergunte sobre gestao de pessoas..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
          className="focus-visible:ring-[#005B2E]"
        />
        <Button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-[#005B2E] hover:bg-[#01361D]"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
