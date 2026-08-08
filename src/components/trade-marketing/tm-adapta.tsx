import { useState } from 'react'
import { useAdaptaMarketing } from '@/hooks/use-adapta-marketing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Bot, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TmAdapta() {
  const { messages, send, loading, conversations, newConversation, loadHistory, endRef } =
    useAdaptaMarketing()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  return (
    <div className="flex gap-3 h-[600px]">
      {conversations.length > 0 && (
        <div className="w-48 shrink-0 space-y-1 overflow-y-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={newConversation}
          >
            <Plus className="w-3 h-3 mr-1" /> Nova Conversa
          </Button>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadHistory(c.id)}
              className="block w-full text-left px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] truncate"
            >
              {c.title || 'Conversa'}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold text-sm">ADAPTA Marketing</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-[#005B2E]/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Faça uma pergunta sobre campanhas, ROI, fornecedores, verbas...
                </p>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <p>• Qual campanha teve maior ROI?</p>
                  <p>• Qual fornecedor investiu mais?</p>
                  <p>• Quais ações precisam de prestação de contas?</p>
                  <p>• Qual verba está ociosa?</p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user' ? 'bg-[#005B2E] text-white' : 'bg-muted text-foreground',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-center text-xs text-muted-foreground animate-pulse">
                ADAPTA está pensando...
              </div>
            )}
            <div ref={endRef} />
          </div>
        </Card>
        <div className="flex gap-2 mt-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua pergunta sobre marketing e trade..."
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
      </div>
    </div>
  )
}
