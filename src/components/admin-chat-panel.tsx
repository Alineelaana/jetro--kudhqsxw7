import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, MessageSquare, Users, SpellCheck, Lock } from 'lucide-react'
import { EmojiPicker } from '@/components/emoji-picker'
import {
  getConversations,
  getConversationMessages,
  replyToConversation,
  closeConversation,
  spellCheck,
  type ChatConversation,
  type ChatMessage,
} from '@/services/chat'
import { updateAttendantStatus } from '@/services/users'
import { cn } from '@/lib/utils'

const STATUS_OPTS = [
  { value: 'Online', label: 'Online', dot: 'bg-green-500' },
  { value: 'Ocupado', label: 'Ocupado', dot: 'bg-yellow-500' },
  { value: 'Ausente', label: 'Ausente', dot: 'bg-orange-500' },
  { value: 'Offline', label: 'Offline', dot: 'bg-gray-500' },
]

export function AdminChatPanel() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [spellchecking, setSpellchecking] = useState(false)
  const [status, setStatus] = useState<string>((user?.attendant_status as string) || 'Offline')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await getConversations())
    } catch {
      /* intentionally ignored */
    }
  }, [])

  const loadMessages = useCallback(async (id: string) => {
    try {
      setMessages(await getConversationMessages(id))
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
      await replyToConversation(selectedId, input.trim())
      setInput('')
      await loadMessages(selectedId)
      await loadConversations()
    } catch {
      /* intentionally ignored */
    }
    setSending(false)
  }

  const handleClose = async () => {
    if (!selectedId) return
    try {
      await closeConversation(selectedId)
      await loadMessages(selectedId)
      await loadConversations()
    } catch {
      /* intentionally ignored */
    }
  }

  const handleSpellCheck = async () => {
    if (!input.trim() || spellchecking) return
    setSpellchecking(true)
    try {
      setInput(await spellCheck(input))
    } catch {
      /* intentionally ignored */
    }
    setSpellchecking(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    try {
      await updateAttendantStatus(String(user?.id || ''), newStatus)
    } catch {
      /* intentionally ignored */
    }
  }

  const handleEmojiInsert = (emoji: string) => setInput((prev) => prev + emoji)
  const selectedConv = conversations.find((c) => c.id === selectedId)
  const isClosed = selectedConv?.closed === true

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-foreground">Seu status:</span>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <span className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', s.dot)} /> {s.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[65vh]">
        <div className="lg:w-72 flex-shrink-0 overflow-y-auto border border-border rounded-xl bg-white">
          <div className="sticky top-0 bg-[#01361D] text-white px-4 py-3 font-bold text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Conversas
          </div>
          {conversations.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8 px-4">
              Nenhuma conversa ativa.
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
                <p className="font-bold text-sm text-foreground">
                  {conv.client_name || 'Visitante'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {conv.client_phone || conv.client_email || 'Sem contato'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(conv.last_message_at || conv.created).toLocaleString('pt-BR')}
                </p>
                {conv.closed && <span className="text-xs font-bold text-red-500">Encerrada</span>}
              </button>
            ))
          )}
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-2 border-[#005B2E]/20">
          {selectedId ? (
            <>
              <div className="bg-[#005B2E]/5 px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-[#005B2E]" />
                  <span className="font-bold text-sm text-foreground">
                    {selectedConv?.client_name || 'Conversa'}
                  </span>
                </div>
                {!isClosed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClose}
                    className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                  >
                    <Lock className="w-3 h-3 mr-1" /> Encerrar
                  </Button>
                )}
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
                    <p className="text-xs font-bold mb-1 opacity-70">
                      {msg.sender === 'client'
                        ? msg.author_name || 'Cliente'
                        : msg.sender === 'ai'
                          ? 'Srta. Velora (IA)'
                          : 'Srta. Velora'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {new Date(msg.created).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border flex items-center gap-1">
                <EmojiPicker onInsert={handleEmojiInsert} />
                <Button
                  onClick={handleSpellCheck}
                  disabled={spellchecking || !input.trim()}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-9 w-9"
                >
                  <SpellCheck className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Digite sua resposta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  disabled={sending || isClosed}
                  className="focus-visible:ring-[#005B2E]"
                />
                <Button
                  onClick={handleReply}
                  disabled={sending || !input.trim() || isClosed}
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
    </div>
  )
}
