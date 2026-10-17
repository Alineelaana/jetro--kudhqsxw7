import pb from '@/lib/pocketbase/client'

export interface JetroOnlineCitation {
  n: number
  chunk_id: string
  source_id: string
  distance?: number
  excerpt: string
}

export interface JetroOnlineMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  citations?: JetroOnlineCitation[]
  created?: string
}

export interface JetroOnlineConversation {
  id: string
  title: string
  created: string
  updated: string
}

/**
 * Envia uma mensagem para o assistente Jetro On-line
 */
export async function sendJetroOnlineMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversation_id: string
  content: string
  citations?: JetroOnlineCitation[]
  message_id: string
}> {
  return pb.send('/backend/v1/jetro-online/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId || null }),
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Lista as conversas do usuário atual com o Jetro On-line
 */
export async function getJetroOnlineConversations(): Promise<JetroOnlineConversation[]> {
  return pb.send('/backend/v1/jetro-online/conversations', { method: 'GET' })
}

/**
 * Obtém o histórico de mensagens de uma conversa com o Jetro On-line
 */
export async function getJetroOnlineMessages(
  conversationId: string,
): Promise<{ messages: JetroOnlineMessage[] }> {
  return pb.send(`/backend/v1/jetro-online/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
}
