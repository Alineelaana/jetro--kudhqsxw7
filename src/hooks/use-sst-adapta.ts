import { useState, useRef, useEffect, useCallback } from 'react'
import {
  sendSstAdaptaMessage,
  getSstAdaptaConversations,
  getSstAdaptaMessages,
  type SstAdaptaMessage,
  type SstAdaptaConversation,
} from '@/services/sst-adapta'

export function useSstAdapta() {
  const [messages, setMessages] = useState<SstAdaptaMessage[]>([])
  const [conversations, setConversations] = useState<SstAdaptaConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getSstAdaptaConversations().then(setConversations)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(
    async (text: string) => {
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      setLoading(true)
      try {
        const result = await sendSstAdaptaMessage(text, conversationId)
        if (result.conversation_id) setConversationId(result.conversation_id)
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content }])
        getSstAdaptaConversations().then(setConversations)
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Erro ao conectar com ADAPTA SST. Tente novamente.' },
        ])
      }
      setLoading(false)
    },
    [conversationId],
  )

  const newConversation = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  const loadHistory = useCallback(async (id: string) => {
    setConversationId(id)
    const msgs = await getSstAdaptaMessages(id)
    setMessages(msgs)
  }, [])

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
