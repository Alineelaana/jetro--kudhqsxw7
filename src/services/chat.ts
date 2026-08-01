import pb from '@/lib/pocketbase/client'

export interface ChatMessage {
  id: string
  conversation_id: string
  sender: 'client' | 'attendant' | 'ai'
  content: string
  author_name: string
  created: string
}

export interface ChatConversation {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  status: string
  last_message_at: string
  closed: boolean
  attendant_id: string
  created: string
  updated: string
}

export async function sendChatMessage(params: {
  conversation_id?: string
  client_name: string
  client_email: string
  client_phone: string
  message: string
}): Promise<{ conversation_id: string }> {
  return pb.send('/backend/v1/chat/send', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getChatMessages(conversationId: string): Promise<ChatMessage[]> {
  return pb.send(`/backend/v1/chat/messages/${conversationId}`, { method: 'GET' })
}

export async function getConversations(): Promise<ChatConversation[]> {
  return pb.collection('chat_conversations').getFullList({ sort: '-last_message_at' })
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  return pb.collection('chat_messages').getFullList({
    filter: `conversation_id = "${conversationId}"`,
    sort: 'created',
  })
}

export async function getAllChatMessages(): Promise<ChatMessage[]> {
  return pb.collection('chat_messages').getFullList({ sort: 'created' })
}

export async function replyToConversation(conversationId: string, content: string): Promise<void> {
  await pb.send('/backend/v1/chat/reply', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, content }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function closeConversation(conversationId: string): Promise<void> {
  await pb.send('/backend/v1/chat/close', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function spellCheck(text: string): Promise<string> {
  const result = await pb.send('/backend/v1/chat/spellcheck', {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' },
  })
  return result.corrected || text
}

export async function getConversationStatus(
  conversationId: string,
): Promise<{ closed: boolean; status: string }> {
  return pb.send(`/backend/v1/chat/status/${conversationId}`, { method: 'GET' })
}
