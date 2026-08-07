import { useState, useRef, useEffect, useCallback } from 'react'
import {
  sendVerbasMessage,
  getVerbasConversations,
  getVerbasMessages,
  type VerbasMessage,
  type VerbasConversation,
} from '@/services/adapta-verbas'
import { displayableMessages } from '@/lib/skipAi'

export function useAdaptaVerbas() {
  const [messages, setMessages] = useState<VerbasMessage[]>([])
  const [conversations, setConversations] = useState<VerbasConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await getVerbasConversations())
    } catch {
      setConversations([])
    }
  }, [])

  const loadHistory = useCallback(async (convId: string) => {
    try {
      const data = await getVerbasMessages(convId)
      const displayable = displayableMessages(data.messages as any[])
      setMessages(
        displayable.map((m) => ({
          role: m.role,
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
        const result = await sendVerbasMessage(text, conversationId || undefined)
        setConversationId(result.conversation_id)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.content, citations: result.citations as any },
        ])
        loadConversations()
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erro ao conectar com a ADAPTA. Tente novamente.' },
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
