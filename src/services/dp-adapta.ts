import pb from '@/lib/pocketbase/client'

export interface DpAdaptaMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ n: number; chunk_id: string; source_id: string; excerpt: string }>
}

export interface DpAdaptaConversation {
  id: string
  title: string
  created: string
  updated: string
}

export async function sendDpAdaptaMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversation_id: string
  content: string
  citations: unknown[]
  message_id: string
}> {
  return pb.send('/backend/v1/dp-adapta/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId || null }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getDpAdaptaConversations(): Promise<DpAdaptaConversation[]> {
  return pb.send('/backend/v1/dp-adapta/conversations', { method: 'GET' })
}

export async function getDpAdaptaMessages(
  conversationId: string,
): Promise<{ messages: DpAdaptaMessage[] }> {
  return pb.send(`/backend/v1/dp-adapta/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
}
