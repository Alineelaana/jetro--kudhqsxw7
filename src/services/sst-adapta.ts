import pb from '@/lib/pocketbase/client'

export interface SstAdaptaMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SstAdaptaConversation {
  id: string
  title: string
  created: string
  updated: string
}

export async function sendSstAdaptaMessage(
  message: string,
  conversationId: string | null,
): Promise<{ content: string; conversation_id: string }> {
  const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/sst-adapta/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Erro ao conectar com ADAPTA SST')
  return {
    content: data.content || 'Sem resposta',
    conversation_id: data.conversation_id || '',
  }
}

export async function getSstAdaptaConversations(): Promise<SstAdaptaConversation[]> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/sst-adapta/conversations`,
      { headers: { Authorization: pb.authStore.token } },
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.conversations || []
  } catch {
    return []
  }
}

export async function getSstAdaptaMessages(conversationId: string): Promise<SstAdaptaMessage[]> {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/sst-adapta/messages/${conversationId}`,
      { headers: { Authorization: pb.authStore.token } },
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.messages || [])
      .filter((m: any) => m.content && m.content.length > 0)
      .map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
  } catch {
    return []
  }
}
