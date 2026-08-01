import pb from '@/lib/pocketbase/client'

export interface ChatRating {
  id: string
  conversation: string
  attendant: string
  rating: number
  comment: string
  created: string
  updated: string
  expand?: {
    attendant?: { id: string; name: string; email: string; avatar: string; role: string }
    conversation?: { id: string; client_name: string }
  }
}

export async function getChatRatings(): Promise<ChatRating[]> {
  return pb.collection('chat_ratings').getFullList({
    sort: '-created',
    expand: 'attendant,conversation',
  })
}

export async function submitRating(
  conversationId: string,
  rating: number,
  comment: string,
): Promise<void> {
  await pb.send('/backend/v1/chat/rate', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, rating, comment }),
    headers: { 'Content-Type': 'application/json' },
  })
}
