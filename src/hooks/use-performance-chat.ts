import { useState, useRef, useEffect, useCallback } from 'react'
import { sendMessage, getConversations, getMessages } from '@/services/performance-chat'
import type { PerformanceChatMessage, PerformanceConversation } from '@/lib/performance-types'
import { displayableMessages } from '@/lib/skipAi'

export function usePerformanceChat() {
  const [messages, setMessages] = useState<PerformanceChatMessage[]>([])
  const [conversations, setConversations] = useState<PerformanceConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await getConversations())
    } catch {
      setConversations([])
    }
  }, [])

  const loadHistory = useCallback(async (convId: string) => {
    try {
      const data = await getMessages(convId)
      const displayable = displayableMessages(data.messages as any[])
      setMessages(
        displayable.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          citations: m.citations as any,
        })),
      )
      setConversationId(convId)
    } catch {
      setMessages([])
    }
  }, [])

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setLoading(true)
      try {
        const result = await sendMessage(text, conversationId || undefined)
        setConversationId(result.conversation_id)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.content, citations: result.citations as any },
        ])
        loadConversations()
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erro ao conectar. Tente novamente.' },
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
    send,
    newConversation,
    loadHistory,
    endRef,
  }
}
