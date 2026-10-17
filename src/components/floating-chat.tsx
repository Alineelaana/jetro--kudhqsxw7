import { useState, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import nineAvatar from '@/assets/whatsapp-image-2026-08-09-at-23.43.52-265df.jpeg'

const SESSION_DISMISSED_KEY = 'jetro_floating_chat_dismissed'

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [messages, setMessages] = useState<Array<{ sender: 'nine' | 'user'; text: string }>>([
    {
      sender: 'nine',
      text: 'Olá! Sou a Jeh, sua assistente inteligente da plataforma Jetro. Como posso ajudar sua empresa hoje?',
    },
  ])
  const [input, setInput] = useState('')

  // Sincroniza estado de dispensado na sessão
  useEffect(() => {
    try {
      if (isDismissed) {
        sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true')
      } else {
        sessionStorage.removeItem(SESSION_DISMISSED_KEY)
      }
    } catch {
      /* sessionStorage pode não estar disponível em ambientes restritos */
    }
  }, [isDismissed])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    setInput('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'nine',
          text: 'Obrigado pelo contato! Para conhecer como o Jetro atende suas necessidades operacionais, preencha o formulário de apresentação comercial em nossa página ou solicite um contato de nossos consultores.',
        },
      ])
    }, 800)
  }

  // Fecha o widget e esconde da tela (marca como dispensado na sessão)
  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsOpen(false)
    setIsDismissed(true)
  }

  // Reabre o chat quando a usuária quiser interagir novamente
  const handleReopen = () => {
    setIsDismissed(false)
    setIsOpen(true)
  }

  // Se a usuária dispensou o chat, exibimos um discreto botão flutuante para que ela possa reabrir
  // quando desejar sem poluir nem atrapalhar a visualização da tela
  if (isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          id="floating-chat-trigger"
          onClick={handleReopen}
          className="group flex items-center gap-2 bg-[#005A36]/90 hover:bg-[#005A36] text-white pl-2 pr-3 py-1.5 rounded-full shadow-lg border border-[#C89B3C]/70 backdrop-blur-xs transition-all duration-200 hover:scale-105"
          aria-label="Reabrir chat com a Jeh"
          title="Fale com a Jeh (Assistente Virtual)"
        >
          <div className="relative h-6 w-6 rounded-full overflow-hidden border border-[#C89B3C]">
            <img
              src={nineAvatar}
              alt="Jeh - Inteligência Artificial Jetro"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold text-white/95">Jeh</span>
          <Sparkles className="h-3 w-3 text-[#E5B85C]" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <div className="relative group">
          <button
            id="floating-chat-trigger"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 bg-[#005A36] hover:bg-[#004225] text-white p-3.5 rounded-full shadow-2xl border-2 border-[#C89B3C] transition-all duration-300 hover:scale-105"
            aria-label="Fale com a Jeh, nossa assistente virtual"
            title="Abrir chat com a Jeh"
          >
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#C89B3C]">
              <img
                src={nineAvatar}
                alt="Jeh - Inteligência Artificial Jetro"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="hidden sm:inline-block font-bold text-sm pr-2">Fale com a Jeh</span>
            <MessageSquare className="h-5 w-5 text-[#E5B85C]" />
          </button>

          {/* Botão X para fechar e sumir da tela diretamente pelo gatilho */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fechar assistente Jeh da tela"
            title="Fechar assistente da tela"
            className="absolute -top-1.5 -right-1.5 bg-neutral-900/90 hover:bg-red-600 text-white rounded-full p-1 shadow-md border border-white/30 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border-2 border-[#005A36] overflow-hidden flex flex-col h-[460px] animate-fade-in-up">
          <div className="bg-gradient-to-r from-[#002817] via-[#005A36] to-[#002817] text-white p-4 flex items-center justify-between border-b border-[#C89B3C]">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#C89B3C]">
                <img
                  src={nineAvatar}
                  alt="Jeh - Inteligência Artificial Jetro"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  Jeh - IA Jetro
                  <Bot className="h-3.5 w-3.5 text-[#E5B85C]" />
                </h4>
                <span className="text-[10px] text-emerald-200">Assistente Inteligente Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Fechar assistente"
                title="Fechar assistente"
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'nine' && (
                  <div className="h-7 w-7 rounded-full overflow-hidden border border-[#C89B3C] shrink-0 mt-0.5 shadow-sm">
                    <img
                      src={nineAvatar}
                      alt="Jeh - Inteligência Artificial Jetro"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl p-3 ${
                    m.sender === 'user'
                      ? 'bg-[#005A36] text-white font-medium'
                      : 'bg-white border border-border text-foreground shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex gap-2">
            <Input
              placeholder="Digite sua dúvida sobre o Jetro..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-10 text-xs"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#005A36] hover:bg-[#004225] text-white h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
