import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Brain, MessageSquare } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'Por que uma OP atrasou?',
  'Onde a fábrica perde mais dinheiro?',
  'Qual máquina gera mais perdas?',
  'Qual operador tem maior produtividade?',
  'Qual centro de trabalho é gargalo?',
  'Como reduzir o lead time?',
  'Qual produto tem o maior custo oculto?',
]

export function IndustrialAdaptaChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/industrial/adapta/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: pb.authStore.token,
          },
          body: JSON.stringify({
            message: msg,
            conversation_id: conversationId,
          }),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro')
      setConversationId(data.conversation_id || conversationId)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content || data.text }])
    } catch (err) {
      toast({ title: 'Erro ao consultar ADAPTA', variant: 'destructive' })
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Não foi possível processar sua pergunta. Tente novamente.',
        },
      ])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-[#005B2E]" />
        <div>
          <h2 className="text-xl font-black text-foreground">ADAPTA Industrial</h2>
          <p className="text-sm text-muted-foreground">
            Assistente de IA com contexto real da operação industrial
          </p>
        </div>
      </div>

      {messages.length === 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <p className="text-sm font-semibold text-[#005B2E] mb-3">Perguntas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10"
                  onClick={() => send(q)}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-0">
          <div ref={scrollRef} className="h-[400px] overflow-y-auto space-y-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-[#005B2E] text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#005B2E]" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Pergunte sobre a operação industrial..."
          className="focus-visible:ring-[#005B2E]"
          disabled={loading}
        />
        <Button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
