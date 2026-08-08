import pb from '@/lib/pocketbase/client'

export interface AdaptaMarketingMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: unknown[]
}

export interface AdaptaMarketingConversation {
  id: string
  title: string
  created: string
  updated: string
}

export async function sendAdaptaMarketingMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversation_id: string
  content: string
  citations: unknown[]
  message_id: string
}> {
  return pb.send('/backend/v1/adapta-marketing/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId || null }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getAdaptaMarketingConversations(): Promise<AdaptaMarketingConversation[]> {
  return pb.send('/backend/v1/adapta-marketing/conversations', { method: 'GET' })
}

export async function getAdaptaMarketingMessages(
  conversationId: string,
): Promise<{ messages: AdaptaMarketingMessage[] }> {
  return pb.send(`/backend/v1/adapta-marketing/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
}
