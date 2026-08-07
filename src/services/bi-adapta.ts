import pb from '@/lib/pocketbase/client'

export interface BiAdaptaMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ n: number; chunk_id: string; source_id: string; excerpt: string }>
}

export interface BiAdaptaConversation {
  id: string
  title: string
  created: string
  updated: string
}

export async function sendBiAdaptaMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversation_id: string
  content: string
  citations: unknown[]
  message_id: string
}> {
  return pb.send('/backend/v1/bi-adapta/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId || null }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getBiAdaptaConversations(): Promise<BiAdaptaConversation[]> {
  return pb.send('/backend/v1/bi-adapta/conversations', { method: 'GET' })
}

export async function getBiAdaptaMessages(
  conversationId: string,
): Promise<{ messages: BiAdaptaMessage[] }> {
  return pb.send(`/backend/v1/bi-adapta/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
}
