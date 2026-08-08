import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Loader2, Sparkles, Plus, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useSstAdapta } from '@/hooks/use-sst-adapta'

const SUGGESTED = [
  'Quais riscos críticos não têm plano de ação?',
  'Quais NRs têm pendências?',
  'Quais treinamentos estão vencendo?',
  'Onde os incidentes aumentaram?',
  'Quais fatores psicossociais aparecem com mais frequência?',
  'Quais ações do PGR estão atrasadas?',
]

export function SstAdapta() {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const { messages, conversations, loading, send, newConversation, loadHistory, endRef } =
    useSstAdapta()

  const handleSend = (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    send(msg)
    setInput('')
  }

  return (
    <div className="flex gap-4 h-[70vh]">
      <Card className="hidden lg:flex w-56 shrink-0 border-2 border-[#005B2E]/20 flex-col">
        <div className="p-3 border-b border-border">
          <Button
            size="sm"
            className="w-full bg-[#005B2E] hover:bg-[#01361D]"
            onClick={newConversation}
          >
            <Plus className="w-4 h-4 mr-1" /> Nova Conversa
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadHistory(c.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-xs flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#005B2E] shrink-0" />
                <span className="truncate">{c.title || 'Conversa'}</span>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Sem conversas</p>
            )}
          </div>
        </ScrollArea>
      </Card>
      <Card className="flex-1 flex flex-col border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C89B3C] flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">ADAPTA SST — Saúde e Segurança</p>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" /> Online · Nunca expõe dados
              clínicos
            </p>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-10 h-10 text-[#C89B3C] mx-auto mb-3" />
                <p className="font-bold text-[#005B2E]">Olá, {user?.name || 'usuário'}!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Sou o ADAPTA SST. Pergunte sobre riscos, PGR, NRs, treinamentos, incidentes e
                  mais.
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
                    {msg.role === 'assistant' ? 'ADAPTA SST' : 'Você'}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> ADAPTA SST está analisando...
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
            placeholder="Pergunte sobre SST..."
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
    </div>
  )
}
