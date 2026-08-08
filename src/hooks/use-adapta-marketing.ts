import { useState, useRef, useEffect, useCallback } from 'react'
import {
  sendAdaptaMarketingMessage,
  getAdaptaMarketingConversations,
  getAdaptaMarketingMessages,
  type AdaptaMarketingMessage,
  type AdaptaMarketingConversation,
} from '@/services/adapta-marketing'
import { displayableMessages } from '@/lib/skipAi'

export function useAdaptaMarketing() {
  const [messages, setMessages] = useState<AdaptaMarketingMessage[]>([])
  const [conversations, setConversations] = useState<AdaptaMarketingConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await getAdaptaMarketingConversations())
    } catch {
      setConversations([])
    }
  }, [])

  const loadHistory = useCallback(async (convId: string) => {
    setLoadingHistory(true)
    try {
      const data = await getAdaptaMarketingMessages(convId)
      const displayable = displayableMessages(data.messages as any[])
      setMessages(
        displayable.map((m) => ({ role: m.role, content: m.content, citations: m.citations })),
      )
      setConversationId(convId)
    } catch {
      setMessages([])
    }
    setLoadingHistory(false)
  }, [])

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setLoading(true)
      try {
        const result = await sendAdaptaMarketingMessage(text, conversationId || undefined)
        setConversationId(result.conversation_id)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.content, citations: result.citations as any },
        ])
        loadConversations()
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Erro ao conectar com a ADAPTA Marketing. Tente novamente.',
          },
        ])
      }
      setLoading(false)
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

  return {
    messages,
    conversations,
    conversationId,
    loading,
    loadingHistory,
    send,
    newConversation,
    loadHistory,
    endRef,
  }
}
