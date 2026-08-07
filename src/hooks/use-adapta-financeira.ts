import { useState, useRef, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { displayableMessages, type AgentMessage } from '@/lib/skipAi'

interface AdaptaMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: unknown[]
}
interface AdaptaConversation {
  id: string
  title: string
  created: string
  updated: string
}

export function useAdaptaFinanceira() {
  const [messages, setMessages] = useState<AdaptaMessage[]>([])
  const [conversations, setConversations] = useState<AdaptaConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = useCallback(async () => {
    try {
      setConversations(
        await pb.send('/backend/v1/adapta-financeira/conversations', { method: 'GET' }),
      )
    } catch {
      setConversations([])
    }
  }, [])

  const loadHistory = useCallback(async (convId: string) => {
    try {
      const data = await pb.send(`/backend/v1/adapta-financeira/conversations/${convId}/messages`, {
        method: 'GET',
      })
      const displayable = displayableMessages(data.messages as AgentMessage[])
      setMessages(
        displayable.map((m) => ({ role: m.role, content: m.content, citations: m.citations })),
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
        const result = await pb.send('/backend/v1/adapta-financeira/chat', {
          method: 'POST',
          body: JSON.stringify({ message: text, conversation_id: conversationId || null }),
          headers: { 'Content-Type': 'application/json' },
        })
        setConversationId(result.conversation_id)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.content, citations: result.citations },
        ])
        loadConversations()
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Erro ao conectar com a ADAPTA Financeira. Tente novamente.',
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

  return { messages, conversations, loading, send, newConversation, loadHistory, endRef }
}
