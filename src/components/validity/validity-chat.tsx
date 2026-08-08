import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validityChat } from '@/services/validity-alerts'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'O que vence este mês?',
  'Quais documentos estão vencidos?',
  'Quais lotes expiram em 30 dias?',
  'Quais alertas são críticos?',
]

export function ValidityChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setMessages((p) => [...p, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    try {
      const res = await validityChat(msg)
      setMessages((p) => [...p, { role: 'assistant', content: res.content }])
    } catch {
      setMessages((p) => [...p, { role: 'assistant', content: 'Erro ao processar sua pergunta.' }])
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
          <p className="font-bold text-sm">Assistente de Validades</p>
          <p className="text-xs text-white/80 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" /> Online
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-[#C89B3C] mx-auto mb-3" />
              <p className="font-bold text-[#005B2E]">Assistente de Validade e Vencimentos</p>
              <p className="text-sm text-muted-foreground mb-4">
                Pergunte sobre validades, vencimentos e alertas.
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
                  {msg.role === 'assistant' ? 'IA' : 'Você'}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Analisando alertas...
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
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#005B2E]/20 text-[#005B2E] hover:bg-[#005B2E]/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <Input
          placeholder="Pergunte sobre validades e vencimentos..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          className="focus-visible:ring-[#005B2E]"
        />
        <Button
          onClick={() => handleSend()}
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
