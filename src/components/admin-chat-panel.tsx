import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import nineAvatar from '@/assets/whatsapp-image-2026-08-09-at-23.43.52-265df.jpeg'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Send,
  MessageSquare,
  Users,
  SpellCheck,
  Lock,
  Bot,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { EmojiPicker } from '@/components/emoji-picker'
import { getAiFulltimeActive, setAiFulltimeActive } from '@/services/ai-settings'
import { getChatVisibility, setChatVisibility } from '@/services/chat-visibility'
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
  const { user, isAdmin } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [spellchecking, setSpellchecking] = useState(false)
  const [status, setStatus] = useState<string>((user?.attendant_status as string) || 'Offline')
  const [aiFulltimeActive, setAiFulltimeActiveState] = useState(false)
  const [aiToggling, setAiToggling] = useState(false)
  const [chatVisible, setChatVisibleState] = useState(true)
  const [chatVisibilityToggling, setChatVisibilityToggling] = useState(false)
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
    getAiFulltimeActive()
      .then(setAiFulltimeActiveState)
      .catch(() => {})
    getChatVisibility()
      .then(setChatVisibleState)
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
  }, [selectedId, loadMessages])

  useRealtime('chat_conversations', () => loadConversations())
  useRealtime('chat_messages', () => {
    if (selectedId) loadMessages(selectedId)
  })
  useRealtime('settings', () => {
    getAiFulltimeActive()
      .then(setAiFulltimeActiveState)
      .catch(() => {})
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

  const handleToggleChatVisibility = async () => {
    if (chatVisibilityToggling) return
    setChatVisibilityToggling(true)
    const newValue = !chatVisible
    try {
      await setChatVisibility(newValue)
      setChatVisibleState(newValue)
    } catch {
      /* intentionally ignored */
    }
    setChatVisibilityToggling(false)
  }

  const handleToggleAi = async () => {
    if (aiToggling) return
    setAiToggling(true)
    const newValue = !aiFulltimeActive
    try {
      await setAiFulltimeActive(newValue)
      setAiFulltimeActiveState(newValue)
    } catch {
      /* intentionally ignored */
    }
    setAiToggling(false)
  }

  const handleEmojiInsert = (emoji: string) => setInput((prev) => prev + emoji)
  const selectedConv = conversations.find((c) => c.id === selectedId)
  const isClosed = selectedConv?.closed === true

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border-2 border-[#005B2E]/30 bg-gradient-to-r from-[#005B2E]/5 to-[#C89B3C]/5">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#005B2E] flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">Exibir chat no site público</p>
            <p className="text-xs text-muted-foreground">
              Controla se o chat da Jeh aparece para os visitantes
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleChatVisibility}
          disabled={chatVisibilityToggling}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex-shrink-0',
            chatVisible
              ? 'bg-[#005B2E] text-white hover:bg-[#01361D]'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {chatVisible ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {chatVisible ? 'Visível' : 'Oculto'}
        </button>
      </div>
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border-2 border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/5 to-[#005B2E]/5">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-[#C89B3C] flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Ativar Jeh em tempo integral</p>
              <p className="text-xs text-muted-foreground">
                A IA responderá automaticamente todas as mensagens do chat
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleAi}
            disabled={aiToggling}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex-shrink-0',
              aiFulltimeActive
                ? 'bg-[#005B2E] text-white hover:bg-[#01361D]'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {aiFulltimeActive ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            {aiFulltimeActive ? 'Ativada' : 'Desativada'}
          </button>
        </div>
      )}
      {aiFulltimeActive && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#005B2E]/10 border border-[#005B2E]/20">
          <div className="w-5 h-5 rounded-full border border-[#C89B3C] overflow-hidden flex-shrink-0">
            <img
              src={nineAvatar}
              alt="Jeh - Inteligência Artificial HURAM"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-[#005B2E]">
            Jeh está atendendo em tempo integral no chat online.
          </span>
        </div>
      )}
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
                      'flex items-start gap-2 max-w-[80%]',
                      msg.sender === 'client' ? 'mr-auto' : 'ml-auto flex-row-reverse',
                    )}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full border border-[#C89B3C] overflow-hidden shrink-0 shadow-sm mt-0.5">
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
                        msg.sender === 'client'
                          ? 'bg-white border border-border rounded-tl-sm'
                          : msg.sender === 'ai'
                            ? 'bg-[#C89B3C]/15 border border-[#C89B3C]/30 rounded-tr-sm'
                            : 'bg-[#005B2E] text-white rounded-tr-sm',
                      )}
                    >
                      <p className="text-xs font-bold mb-1 opacity-70">
                        {msg.sender === 'client'
                          ? msg.author_name || 'Cliente'
                          : msg.sender === 'ai'
                            ? 'Jeh (IA)'
                            : msg.author_name || 'Atendente'}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(msg.created).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
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
