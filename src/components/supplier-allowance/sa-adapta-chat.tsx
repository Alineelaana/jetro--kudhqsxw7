import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdaptaVerbas } from '@/hooks/use-adapta-verbas'
import { Send, Bot, User, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SaAdaptaChat() {
  const { messages, send, loading, conversations, loadHistory, newConversation, endRef } =
    useAdaptaVerbas()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || loading) return
    send(input)
    setInput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#005B2E]">ADAPTA — Verbas de Fornecedores</h3>
          <p className="text-xs text-muted-foreground">
            Assistente AI com acesso exclusivo ao Corporate Ledger de Verbas
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={newConversation}>
          <Plus className="w-4 h-4 mr-1" /> Nova Conversa
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 p-3 max-h-[500px] overflow-y-auto">
          <h4 className="text-xs font-bold text-muted-foreground mb-2">Historico</h4>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma conversa anterior.</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadHistory(c.id)}
                  className="block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors"
                >
                  {c.title || c.id.substring(0, 8)}
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card className="lg:col-span-3 flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Pergunte sobre verbas de fornecedores</p>
                  <p className="text-xs mt-1">Ex: "Quanto temos de verba da Nestle?"</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-2',
                      m.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {m.role === 'assistant' && (
                      <Bot className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
                    )}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 max-w-[80%] text-sm',
                        m.role === 'user' ? 'bg-[#005B2E] text-white' : 'bg-muted',
                      )}
                    >
                      {m.content}
                    </div>
                    {m.role === 'user' && (
                      <User className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <Bot className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#005B2E]" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>
          <div className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre saldos, consumos, rankings, ROI..."
              className="focus-visible:ring-[#005B2E]"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
