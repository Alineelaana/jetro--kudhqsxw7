import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDpAdapta } from '@/hooks/use-dp-adapta'
import { Bot, Send, Plus, MessageSquare } from 'lucide-react'

export function DpAdapta() {
  const {
    messages,
    conversations,
    conversationId,
    loading,
    send,
    newConversation,
    loadHistory,
    endRef,
  } = useDpAdapta()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#005B2E]" />
          <h3 className="text-lg font-bold">ADAPTA DP</h3>
        </div>
        <Button
          variant="outline"
          onClick={newConversation}
          className="text-[#005B2E] border-[#005B2E]/30"
        >
          <Plus className="w-4 h-4 mr-1" /> Nova Conversa
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 border-2 border-[#005B2E]/20 max-h-[500px] overflow-y-auto">
          <CardContent className="p-3 space-y-1">
            <p className="text-xs font-bold text-muted-foreground mb-2">Histórico</p>
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma conversa anterior</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadHistory(c.id)}
                  className={`w-full text-left p-2 rounded text-xs hover:bg-[#005B2E]/5 ${conversationId === c.id ? 'bg-[#005B2E]/10 font-bold' : ''}`}
                >
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {c.title || 'Conversa'}
                </button>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-2 border-[#005B2E]/20">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-[#005B2E] mx-auto mb-3" />
                    <p className="font-bold text-[#005B2E]">ADAPTA DP</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pergunte sobre custo de folha, horas extras, férias vencendo, eSocial, FGTS e
                      mais.
                    </p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-[#005B2E] text-white' : 'bg-muted'}`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <Bot className="w-4 h-4 inline mr-1 animate-pulse" /> Processando...
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte ao ADAPTA DP..."
                className="focus-visible:ring-[#005B2E]"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
