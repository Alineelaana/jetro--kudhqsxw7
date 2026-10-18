import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import {
  sendJetroOnlineMessage,
  getJetroOnlineConversations,
  getJetroOnlineMessages,
  type JetroOnlineMessage,
  type JetroOnlineConversation,
  type JetroOnlineUserContext,
  type JetroOnlineCitation,
} from '@/services/jetro-online'
import { displayableMessages } from '@/lib/skipAi'

export type {
  JetroOnlineMessage,
  JetroOnlineConversation,
  JetroOnlineCitation,
  JetroOnlineUserContext,
}

interface JetroOnlineContextValue {
  messages: JetroOnlineMessage[]
  conversations: JetroOnlineConversation[]
  conversationId: string | null
  loading: boolean
  loadingHistory: boolean
  serverUserContext?: JetroOnlineUserContext
  isFloatingOpen: boolean
  setIsFloatingOpen: (open: boolean) => void
  send: (text: string, extra?: { modulo?: string; rota_origem?: string }) => Promise<void>
  newConversation: () => void
  loadHistory: (convId: string) => Promise<void>
  endRef: React.RefObject<HTMLDivElement | null>
}

const JetroOnlineContext = createContext<JetroOnlineContextValue | null>(null)

export function JetroOnlineProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<JetroOnlineMessage[]>([])
  const [conversations, setConversations] = useState<JetroOnlineConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [serverUserContext, setServerUserContext] = useState<JetroOnlineUserContext | undefined>(
    undefined,
  )
  const [isFloatingOpen, setIsFloatingOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      const raw = data.messages || []
      const displayable = displayableMessages(raw as any[])
      setMessages(
        displayable.map((m: any) => ({
          role: m.role,
          content: m.content,
          citations: m.citations,
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
    async (text: string, extra?: { modulo?: string; rota_origem?: string }) => {
      if (!text.trim() || loading) return
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setLoading(true)
      try {
        const result = await sendJetroOnlineMessage(text, conversationId || undefined, extra)
        if (result.conversation_id) {
          setConversationId(result.conversation_id)
        }
        if (result.user_context) {
          setServerUserContext(result.user_context)
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.content,
            citations: result.citations,
            recommended_videos: result.recommended_videos,
          },
        ])
        loadConversations()
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Desculpe, ocorreu um erro ao consultar o Jetro On-line. Por favor, tente novamente.',
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

  const value: JetroOnlineContextValue = {
    messages,
    conversations,
    conversationId,
    loading,
    loadingHistory,
    serverUserContext,
    isFloatingOpen,
    setIsFloatingOpen,
    send,
    newConversation,
    loadHistory,
    endRef,
  }

  return <JetroOnlineContext.Provider value={value}>{children}</JetroOnlineContext.Provider>
}

export function useJetroOnline() {
  const ctx = useContext(JetroOnlineContext)
  if (!ctx) {
    throw new Error('useJetroOnline must be used within a JetroOnlineProvider')
  }
  return ctx
}
