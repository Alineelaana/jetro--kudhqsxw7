import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2, ChevronDown, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { sendChatMessage } from '@/services/chat'
import { JehAssistantService } from '@/services/jeh-assistant'

interface ChatMessageItem {
  id: string
  sender: 'client' | 'ai'
  content: string
  created?: string
}

const STORAGE_KEY_CONV_ID = 'jeh_public_chat_conversation_id'
const STORAGE_KEY_CLIENT_NAME = 'jeh_public_client_name'
const STORAGE_KEY_CLIENT_EMAIL = 'jeh_public_client_email'
const STORAGE_KEY_CLIENT_PHONE = 'jeh_public_client_phone'

export function PublicJehChat() {
  const { isAuthenticated } = useAuth()
  const [assistantStatus, setAssistantStatus] = useState<'ativa' | 'inativa' | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessageItem[]>([])

  // Dados do visitante identificados
  const [clientName, setClientName] = useState(
    () => localStorage.getItem(STORAGE_KEY_CLIENT_NAME) || '',
  )
  const [clientEmail, setClientEmail] = useState(
    () => localStorage.getItem(STORAGE_KEY_CLIENT_EMAIL) || '',
  )
  const [clientPhone, setClientPhone] = useState(
    () => localStorage.getItem(STORAGE_KEY_CLIENT_PHONE) || '',
  )
  const [conversationId, setConversationId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY_CONV_ID) || null,
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Checar status da assistente no banco
  useEffect(() => {
    let mounted = true
    const checkStatus = async () => {
      try {
        const st = await JehAssistantService.getAssistantStatus()
        if (mounted) setAssistantStatus(st)
      } catch {
        if (mounted) setAssistantStatus('inativa')
      }
    }

    checkStatus()
    const timer = setInterval(checkStatus, 30000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  // Rolar para a última mensagem ao atualizar
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Se o usuário logado está no ERP interno, ou se a assistente NÃO estiver 'ativa', não renderiza o widget público
  if (assistantStatus !== 'ativa' || isAuthenticated) {
    return null
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (messages.length === 0) {
      // Mensagem de abertura obrigatória oficial
      const officialGreeting =
        'Olá! Sou a Jeh, assistente virtual do Jetro. 😊 Antes de começarmos, me informe seu nome, telefone com DDD e melhor e-mail. Vamos usar esses dados para registrar seu atendimento e retornar seu contato sobre a plataforma.'
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          content: officialGreeting,
          created: new Date().toISOString(),
        },
      ])
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = inputMessage.trim()
    if (!text || loading) return

    // Tentar extrair contatos do texto caso o visitante tenha escrito inline
    let detectedName = clientName
    let detectedEmail = clientEmail
    let detectedPhone = clientPhone

    if (!detectedEmail) {
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        detectedEmail = emailMatch[0].toLowerCase().trim()
        setClientEmail(detectedEmail)
        localStorage.setItem(STORAGE_KEY_CLIENT_EMAIL, detectedEmail)
      }
    }

    if (!detectedPhone) {
      const phoneMatch = text.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}[-\s]?\d{4}/)
      if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
        detectedPhone = phoneMatch[0].trim()
        setClientPhone(detectedPhone)
        localStorage.setItem(STORAGE_KEY_CLIENT_PHONE, detectedPhone)
      }
    }

    if (!detectedName || detectedName === 'Visitante') {
      const nameMatch = text.match(
        /(?:meu\s+nome\s+(?:é|e)|sou\s+(?:o|a)|me\s+chamo)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{2,40})/i,
      )
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim().split(/\s+/).slice(0, 4).join(' ')
        if (!/^(apenas|aqui|um|uma|cliente|interessado)$/i.test(candidate)) {
          detectedName = candidate
          setClientName(detectedName)
          localStorage.setItem(STORAGE_KEY_CLIENT_NAME, detectedName)
        }
      }
    }

    const userMsg: ChatMessageItem = {
      id: 'usr_' + Date.now(),
      sender: 'client',
      content: text,
      created: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setLoading(true)

    try {
      const resp = await sendChatMessage({
        message: text,
        conversationId: conversationId || undefined,
        clientName: detectedName || 'Visitante',
        clientEmail: detectedEmail || undefined,
        clientPhone: detectedPhone || undefined,
      })

      if (resp?.conversation_id) {
        setConversationId(resp.conversation_id)
        localStorage.setItem(STORAGE_KEY_CONV_ID, resp.conversation_id)
      }

      const aiReply =
        resp?.response ||
        'Olá! Para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619'

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          content: aiReply,
          created: new Date().toISOString(),
        },
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          content:
            'Para confirmar esse ponto e orientar você de acordo com a sua operação, fale com nossa equipe pelo WhatsApp: https://wa.me/5531991297619',
          created: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Renderizador seguro de mensagem com link clicável do WhatsApp
  const renderMessageContent = (content: string) => {
    const waUrlRegex = /(https:\/\/wa\.me\/[0-9]+)/g
    const parts = content.split(waUrlRegex)

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('https://wa.me/')) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold underline text-[#005B2E] hover:text-[#01361D] bg-[#005B2E]/10 px-1.5 py-0.5 rounded my-0.5"
              >
                {part}
                <ExternalLink className="w-3 h-3 inline shrink-0" />
              </a>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Botão Flutuante Discreto da Jeh quando fechado */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="flex items-center gap-2.5 bg-[#005B2E] hover:bg-[#004724] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#C9A227] transition-all duration-300 hover:scale-105 cursor-pointer group"
          aria-label="Abrir chat institucional com a Jeh"
          title="Fale com a Jeh — Assistente Virtual do Jetro"
        >
          <div className="relative h-7 w-7 rounded-full bg-[#00381C] flex items-center justify-center text-[#C9A227] border border-[#C9A227]/70 shrink-0 font-black text-xs shadow-inner">
            J
          </div>
          <div className="text-left">
            <span className="block font-bold text-xs tracking-wide">Fale com a Jeh</span>
            <span className="block text-[10px] text-emerald-200">Assistente Jetro</span>
          </div>
          <Sparkles className="h-4 w-4 text-[#C9A227] animate-pulse" />
        </button>
      )}

      {/* Caixa de Diálogo da Jeh */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#005B2E] overflow-hidden flex flex-col w-[360px] sm:w-[410px] h-[530px] transition-all duration-200 select-text">
          {/* Cabeçalho Oficial Jeh (Verde escuro / Dourado) */}
          <div className="bg-gradient-to-r from-[#00381C] via-[#005B2E] to-[#00381C] text-white px-4 py-3 flex items-center justify-between border-b border-[#C9A227]/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-[#002613] flex items-center justify-center border-2 border-[#C9A227] shrink-0 text-[#C9A227] font-black text-sm shadow-md">
                J
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold tracking-wide">Jeh</h4>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C9A227]/25 text-[#FFD868] font-bold border border-[#C9A227]/40 uppercase tracking-wider">
                    IA Jetro
                  </span>
                </div>
                <span className="text-[10px] text-emerald-200/90 truncate block">
                  Plataforma Inteligente de Gestão Empresarial
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Fechar chat"
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'client'
              return (
                <div
                  key={msg.id}
                  className={cn('flex items-start gap-2', isUser ? 'justify-end' : 'justify-start')}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#005B2E] text-[#C9A227] flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A227]/50 shadow-2xs font-bold text-xs">
                      J
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-3 text-xs shadow-2xs leading-relaxed',
                      isUser
                        ? 'bg-[#005B2E] text-white rounded-tr-none font-medium'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none',
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs pl-1 py-1">
                <div className="w-6 h-6 rounded-full bg-[#005B2E] text-[#C9A227] flex items-center justify-center shrink-0 border border-[#C9A227]/40 font-bold text-[10px]">
                  J
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-2xl shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 text-[#005B2E] animate-spin" />
                  <span className="text-[11px] text-gray-600">Digitando resposta...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Rodapé com Input e Encaminhamento */}
          <div className="p-2.5 bg-white border-t border-gray-200 shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua dúvida ou contato..."
                disabled={loading}
                className="h-9 text-xs border-gray-300 focus-visible:ring-[#005B2E]"
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                size="sm"
                className="h-9 px-3 bg-[#005B2E] hover:bg-[#004724] text-white shrink-0 font-medium"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 px-1">
              <span>Atendimento Institucional Jeh</span>
              <a
                href="https://wa.me/5531991297619"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#005B2E] hover:underline font-semibold flex items-center gap-0.5"
              >
                WhatsApp Oficial
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
