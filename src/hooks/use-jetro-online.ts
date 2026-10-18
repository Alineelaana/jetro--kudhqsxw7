import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import {
  sendJetroOnlineMessage,
  getJetroOnlineConversations,
  getJetroOnlineMessages,
  type JetroOnlineMessage,
  type JetroOnlineConversation,
} from '@/services/jetro-online'
import { displayableMessages, type AgentMessage } from '@/lib/skipAi'

interface JetroOnlineContextType {
  messages: JetroOnlineMessage[]
  conversations: JetroOnlineConversation[]
  conversationId: string | null
  serverUserContext: {
    role?: string
    departamento?: string
    perfil_acesso?: string
  } | null
  loading: boolean
  loadingHistory: boolean
  send: (text: string) => Promise<void>
  newConversation: () => void
  loadHistory: (convId: string) => Promise<void>
  loadConversations: () => Promise<void>
  endRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: (smooth?: boolean) => void
  // Controle de abertura sincronizada / navegação
  isFloatingOpen: boolean
  setIsFloatingOpen: (open: boolean) => void
}

const JetroOnlineContext = createContext<JetroOnlineContextType | null>(null)

export function JetroOnlineProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<JetroOnlineMessage[]>([])
  const [conversations, setConversations] = useState<JetroOnlineConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [serverUserContext, setServerUserContext] = useState<{
    role?: string
    departamento?: string
    perfil_acesso?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isFloatingOpen, setIsFloatingOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true)
    }
  }, [messages, scrollToBottom])

  const loadConversations = useCallback(async () => {
    try {
      const convs = await getJetroOnlineConversations()
      setConversations(convs || [])
    } catch {
      setConversations([])
    }
  }, [])

  const loadHistory = useCallback(async (convId: string) => {
    setLoadingHistory(true)
    try {
      const data = await getJetroOnlineMessages(convId)
      const displayable = displayableMessages((data.messages || []) as unknown as AgentMessage[])
      setMessages(
        displayable.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          citations: m.citations,
          created: m.created,
        })),
      )
      setConversationId(convId)
    } catch {
      setMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const send = useCallback(
    async (text: string) => {
      const cleanText = text.trim()
      if (!cleanText || loading) return

      const userMsg: JetroOnlineMessage = {
        role: 'user',
        content: cleanText,
        created: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setLoading(true)

      try {
        const result = await sendJetroOnlineMessage(cleanText, conversationId || undefined)
        setConversationId(result.conversation_id)
        if (result.user_context) {
          setServerUserContext(result.user_context)
        }

        const assistantMsg: JetroOnlineMessage = {
          id: result.message_id,
          role: 'assistant',
          content: result.content,
          citations: result.citations,
          created: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMsg])
        loadConversations()
      } catch (err: any) {
        const errMsg =
          err?.data?.error ||
          err?.message ||
          'Não foi possível consultar os dados no momento. Verifique sua conexão e tente novamente.'

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${errMsg}`,
            created: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [conversationId, loading, loadConversations],
  )

  const newConversation = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return (
    <JetroOnlineContext.Provider
      value={{
        messages,
        conversations,
        conversationId,
        serverUserContext,
        loading,
        loadingHistory,
        send,
        newConversation,
        loadHistory,
        loadConversations,
        endRef,
        scrollToBottom,
        isFloatingOpen,
        setIsFloatingOpen,
      }}
    >
      {children}
    </JetroOnlineContext.Provider>
  )
}

export function useJetroOnline() {
  const ctx = useContext(JetroOnlineContext)
  if (!ctx) {
    throw new Error('useJetroOnline deve ser utilizado dentro de um JetroOnlineProvider')
  }
  return ctx
}
