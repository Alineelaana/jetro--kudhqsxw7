import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { X, Send, Star, EyeOff } from 'lucide-react'
import {
  sendChatMessage,
  getChatMessages,
  getConversationStatus,
  type ChatMessage,
} from '@/services/chat'
import { submitRating } from '@/services/chat-ratings'
import { getChatVisibility } from '@/services/chat-visibility'
import { cn } from '@/lib/utils'
import veloraAvatar from '@/assets/chatgpt-image-1-de-ago.de-2026-150848-e934f.png'

export function FloatingChat() {
  const { pathname } = useLocation()
  const [chatEnabled, setChatEnabled] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(() =>
    localStorage.getItem('velora_chat_conv_id'),
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [step, setStep] = useState<'info' | 'chat'>(conversationId ? 'chat' : 'info')
  const [sending, setSending] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [ratingValue, setRatingValue] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/cliente')) {
      setChatEnabled(false)
      return
    }
    getChatVisibility()
      .then(setChatEnabled)
      .catch(() => setChatEnabled(true))
  }, [pathname])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isOpen || !conversationId) return
    const poll = async () => {
      try {
        const msgs = await getChatMessages(conversationId)
        if (msgs.length > 0) {
          setMessages(msgs)
          setStep('chat')
        }
        if (!hasRated) {
          const st = await getConversationStatus(conversationId)
          if (st.closed) setShowRating(true)
        }
      } catch (_) {
        localStorage.removeItem('velora_chat_conv_id')
        setConversationId(null)
        setStep('info')
      }
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [isOpen, conversationId, hasRated])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const result = await sendChatMessage({
        conversation_id: conversationId || undefined,
        client_name: name || 'Visitante',
        client_email: '',
        client_phone: contact,
        message: input.trim(),
      })
      if (!conversationId) {
        setConversationId(result.conversation_id)
        localStorage.setItem('velora_chat_conv_id', result.conversation_id)
      }
      setInput('')
      setMessages(await getChatMessages(result.conversation_id))
      setStep('chat')
    } catch {
      /* intentionally ignored */
    }
    setSending(false)
  }

  const handleStart = () => {
    if (!name.trim()) return
    setStep('chat')
  }

  const handleSubmitRating = async () => {
    if (ratingValue < 1 || submittingRating || !conversationId) return
    setSubmittingRating(true)
    try {
      await submitRating(conversationId, ratingValue, ratingComment)
      setHasRated(true)
      setShowRating(false)
      setMessages(await getChatMessages(conversationId))
    } catch {
      /* intentionally ignored */
    }
    setSubmittingRating(false)
  }

  if (!chatEnabled) return null

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#005B2E] hover:bg-[#01361D] text-white pl-2 pr-4 py-2 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          aria-label="Abrir chat"
        >
          <img
            src={veloraAvatar}
            alt="Srta. Velora"
            className="w-10 h-10 rounded-full border-2 border-[#C89B3C] object-cover"
          />
          <span className="text-sm font-bold hidden sm:inline">Fale com a Srta. Velora</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 h-[100dvh] sm:h-[32rem] bg-white rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-2 border-[#005B2E]/20 overflow-hidden animate-fade-in-up">
          <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <img
              src={veloraAvatar}
              alt="Srta. Velora"
              className="w-10 h-10 rounded-full border-2 border-[#C89B3C] object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">Srta. Velora</p>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" /> Atendente
                Online
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="Fechar chat"
            >
              <EyeOff className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
              aria-label="Minimizar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {step === 'info' ? (
              <div className="space-y-4">
                <div className="bg-[#005B2E]/10 rounded-2xl rounded-tl-sm p-3 text-sm text-foreground">
                  Olá! Seja bem-vindo à VeloraLog. 😊<br />
                  Como podemos te ajudar hoje?
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus-visible:ring-[#005B2E]"
                  />
                  <input
                    type="text"
                    placeholder="Telefone ou e-mail (opcional)"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus-visible:ring-[#005B2E]"
                  />
                  <button
                    onClick={handleStart}
                    disabled={!name.trim()}
                    className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    Iniciar Conversa
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'max-w-[80%] rounded-2xl p-3 text-sm',
                      msg.sender === 'client'
                        ? 'ml-auto bg-[#005B2E] text-white rounded-tr-sm'
                        : 'bg-[#C89B3C]/15 text-foreground rounded-tl-sm border border-[#C89B3C]/30',
                    )}
                  >
                    {msg.sender !== 'client' && (
                      <p className="text-xs font-bold mb-1 opacity-70">
                        {msg.sender === 'ai' ? 'Srta. Velora (IA)' : 'Srta. Velora'}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                ))}
                {showRating && !hasRated && (
                  <div className="bg-white border-2 border-[#C89B3C]/40 rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground text-center">
                      Avalie o atendimento
                    </p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRatingValue(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            className={cn(
                              'w-8 h-8 transition-colors',
                              n <= (hoverRating || ratingValue)
                                ? 'fill-[#C89B3C] text-[#C89B3C]'
                                : 'text-muted-foreground',
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Observação ou sugestão (opcional)"
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus-visible:ring-[#005B2E] resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleSubmitRating}
                      disabled={ratingValue < 1 || submittingRating}
                      className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      {submittingRating ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          {step === 'chat' && !showRating && !hasRated && (
            <div className="p-3 border-t border-border flex items-center gap-2 bg-white flex-shrink-0">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={sending}
                className="flex-1 min-w-0 px-3 py-2 rounded-full border border-border text-sm focus-visible:ring-[#005B2E]"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="w-10 h-10 rounded-full bg-[#005B2E] hover:bg-[#01361D] text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
