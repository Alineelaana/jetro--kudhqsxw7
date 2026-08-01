import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { sendChatMessage, getChatMessages, type ChatMessage } from '@/services/chat'
import { cn } from '@/lib/utils'

const VELORA_AVATAR = 'https://img.usecurling.com/ppl/medium?gender=female&seed=velora'

export function FloatingChat() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      } catch (_) {
        localStorage.removeItem('velora_chat_conv_id')
        setConversationId(null)
        setStep('info')
      }
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [isOpen, conversationId])

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
      const msgs = await getChatMessages(result.conversation_id)
      setMessages(msgs)
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

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#005B2E] hover:bg-[#01361D] text-white pl-2 pr-4 py-2 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          aria-label="Abrir chat"
        >
          <img
            src={VELORA_AVATAR}
            alt="Srta. Velora"
            className="w-10 h-10 rounded-full border-2 border-[#C89B3C]"
          />
          <span className="text-sm font-bold hidden sm:inline">Fale com a Srta. Velora</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 h-full sm:h-[32rem] bg-white rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-2 border-[#005B2E]/20 overflow-hidden animate-fade-in-up">
          <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <img
              src={VELORA_AVATAR}
              alt="Srta. Velora"
              className="w-10 h-10 rounded-full border-2 border-[#C89B3C]"
            />
            <div className="flex-1">
              <p className="font-bold text-sm">Srta. Velora</p>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full" /> Atendente Online
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
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
                        : msg.sender === 'ai'
                          ? 'bg-[#C89B3C]/15 text-foreground rounded-tl-sm border border-[#C89B3C]/30'
                          : 'bg-blue-50 text-foreground rounded-tl-sm border border-blue-200',
                    )}
                  >
                    {msg.sender !== 'client' && (
                      <p className="text-xs font-bold mb-1 opacity-70">
                        {msg.sender === 'ai' ? 'Srta. Velora (IA)' : msg.author_name || 'Atendente'}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          {step === 'chat' && (
            <div className="p-3 border-t border-border flex items-center gap-2 bg-white flex-shrink-0">
              <input
                type="text"
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={sending}
                className="flex-1 px-3 py-2 rounded-full border border-border text-sm focus-visible:ring-[#005B2E]"
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
