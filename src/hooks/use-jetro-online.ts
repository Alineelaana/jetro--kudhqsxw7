import { useState, useRef, useEffect, useCallback } from 'react'
import {
  sendJetroOnlineMessage,
  getJetroOnlineConversations,
  getJetroOnlineMessages,
  type JetroOnlineMessage,
  type JetroOnlineConversation,
} from '@/services/jetro-online'
import { displayableMessages, type AgentMessage } from '@/lib/skipAi'

export function useJetroOnline() {
  const [messages, setMessages] = useState<JetroOnlineMessage[]>([])
  const [conversations, setConversations] = useState<JetroOnlineConversation[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
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
    scrollToBottom,
  }
}
