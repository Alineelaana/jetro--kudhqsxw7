import { useState } from 'react'
import { MessageSquare, X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import nineAvatar from '@/assets/whatsapp-image-2026-08-09-at-23.43.52-265df.jpeg'

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ sender: 'nine' | 'user'; text: string }>>([
    {
      sender: 'nine',
      text: 'Olá! Sou a Jeh, sua assistente inteligente da plataforma Jetro. Como posso ajudar sua empresa hoje?',
    },
  ])
  const [input, setInput] = useState('')

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          id="floating-chat-trigger"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-[#005A36] hover:bg-[#004225] text-white p-3.5 rounded-full shadow-2xl border-2 border-[#C89B3C] transition-all duration-300 hover:scale-105"
          aria-label="Fale com a Jeh, nossa assistente virtual"
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
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
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
