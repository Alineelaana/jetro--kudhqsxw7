import pb from '@/lib/pocketbase/client'

export interface VerbasMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ n: number; chunk_id: string; source_id: string; excerpt: string }>
}

export interface VerbasConversation {
  id: string
  title: string
  created: string
  updated: string
}

export async function sendVerbasMessage(
  message: string,
  conversationId?: string,
): Promise<{ conversation_id: string; content: string; citations: unknown[]; message_id: string }> {
  return pb.send('/backend/v1/adapta-verbas/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId || null }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getVerbasConversations(): Promise<VerbasConversation[]> {
  return pb.send('/backend/v1/adapta-verbas/conversations', { method: 'GET' })
}

export async function getVerbasMessages(
  conversationId: string,
): Promise<{ messages: VerbasMessage[] }> {
  return pb.send(`/backend/v1/adapta-verbas/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
}
