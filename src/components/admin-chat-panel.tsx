import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, MessageSquare, Users } from 'lucide-react'
import {
  getConversations,
  getConversationMessages,
  replyToConversation,
  type ChatConversation,
  type ChatMessage,
} from '@/services/chat'
import { cn } from '@/lib/utils'

export function AdminChatPanel() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const authorName = (user?.name as string) || (user?.email as string) || 'Atendente'

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch {
      /* intentionally ignored */
    }
  }, [])

  const loadMessages = useCallback(async (id: string) => {
    try {
      const data = await getConversationMessages(id)
      setMessages(data)
    } catch {
      /* intentionally ignored */
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
  }, [selectedId, loadMessages])

  useRealtime('chat_conversations', () => loadConversations())
  useRealtime('chat_messages', () => {
    if (selectedId) loadMessages(selectedId)
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleReply = async () => {
    if (!input.trim() || !selectedId || sending) return
    setSending(true)
    try {
      await replyToConversation(selectedId, input.trim(), authorName)
      setInput('')
      await loadMessages(selectedId)
      await loadConversations()
    } catch {
      /* intentionally ignored */
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[70vh]">
      <div className="lg:w-80 flex-shrink-0 overflow-y-auto border border-border rounded-xl bg-white">
        <div className="sticky top-0 bg-[#01361D] text-white px-4 py-3 font-bold text-sm flex items-center gap-2">
          <Users className="w-4 h-4" /> Conversas
        </div>
        {conversations.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8 px-4">
            Nenhuma conversa ativa no momento.
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors',
                selectedId === conv.id && 'bg-[#005B2E]/10',
              )}
            >
              <p className="font-bold text-sm text-foreground">{conv.client_name || 'Visitante'}</p>
              <p className="text-xs text-muted-foreground">
                {conv.client_phone || conv.client_email || 'Sem contato'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(conv.last_message_at || conv.created).toLocaleString('pt-BR')}
              </p>
            </button>
          ))
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 border-[#005B2E]/20">
        {selectedId ? (
          <>
            <div className="bg-[#005B2E]/5 px-4 py-3 border-b border-border flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#005B2E]" />
              <span className="font-bold text-sm text-foreground">
                {conversations.find((c) => c.id === selectedId)?.client_name || 'Conversa'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'max-w-[75%] rounded-2xl p-3 text-sm',
                    msg.sender === 'client'
                      ? 'bg-white border border-border rounded-tl-sm'
                      : msg.sender === 'ai'
                        ? 'bg-[#C89B3C]/15 border border-[#C89B3C]/30 rounded-tr-sm ml-auto'
                        : 'bg-[#005B2E] text-white rounded-tr-sm ml-auto',
                  )}
                >
                  {msg.sender !== 'attendant' && (
                    <p className="text-xs font-bold mb-1 opacity-70">
                      {msg.sender === 'client' ? msg.author_name || 'Cliente' : 'Srta. Velora (IA)'}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(msg.created).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-border flex items-center gap-2">
              <Input
                placeholder="Digite sua resposta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                disabled={sending}
                className="focus-visible:ring-[#005B2E]"
              />
              <Button
                onClick={handleReply}
                disabled={sending || !input.trim()}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white flex-shrink-0"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Selecione uma conversa para responder</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
