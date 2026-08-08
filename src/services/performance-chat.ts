import pb from '@/lib/pocketbase/client'
import type { PerformanceChatMessage, PerformanceConversation } from '@/lib/performance-types'

export function sendMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversation_id: string
  content: string
  citations: unknown[]
  message_id: string
}> {
  return pb.send('/backend/v1/performance/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getConversations(): Promise<PerformanceConversation[]> {
  return pb.send('/backend/v1/performance/conversations', { method: 'GET' })
}

export function getMessages(
  conversationId: string,
): Promise<{ messages: PerformanceChatMessage[] }> {
  return pb.send(`/backend/v1/performance/messages/${conversationId}`, { method: 'GET' })
}
